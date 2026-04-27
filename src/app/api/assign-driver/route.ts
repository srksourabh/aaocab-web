import { type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification } from "@/lib/notifications";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }
  return createClient(url, key);
}

interface AssignDriverRequest {
  booking_id: string;
}

interface AssignDriverResponse {
  assigned: boolean;
  driver_id?: string;
  vehicle_id?: string;
  driver_name?: string;
  reason?: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: AssignDriverRequest;
  try {
    body = await request.json();
  } catch {
    const err: ErrorResponse = { error: "Invalid JSON body" };
    return Response.json(err, { status: 400 });
  }

  const { booking_id } = body;
  if (!booking_id) {
    const err: ErrorResponse = { error: "booking_id is required" };
    return Response.json(err, { status: 400 });
  }

  const supabase = getSupabaseClient();

  // Step 1: Fetch the booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, pickup_location, pickup_datetime, vehicle_category_id, status, total_fare"
    )
    .eq("id", booking_id)
    .single();

  if (bookingError || !booking) {
    const err: ErrorResponse = { error: "Booking not found" };
    return Response.json(err, { status: 404 });
  }

  // Parse pickup date and city from booking
  const pickupDate = new Date(booking.pickup_datetime)
    .toISOString()
    .split("T")[0];

  const pickupCity: string =
    (booking.pickup_location as { city?: string })?.city ?? "";

  // Step 2: Find the city ID for the pickup city (fuzzy match)
  let operatingCityId: string | null = null;
  if (pickupCity) {
    const { data: cityRow } = await supabase
      .from("cities")
      .select("id")
      .ilike("name", `%${pickupCity}%`)
      .limit(1)
      .single();
    operatingCityId = cityRow?.id ?? null;
  }

  // Step 3: Query available drivers matching the booking requirements
  // Find drivers who:
  //   - have an availability record for the pickup date
  //   - have a vehicle in the right category
  //   - are active
  //   - are available in the pickup city (if city could be resolved)
  const availabilityQuery = supabase
    .from("driver_availability")
    .select(
      `
      driver_id,
      vehicle_id,
      drivers!inner(
        id,
        vendor_id,
        name,
        phone,
        overall_rating,
        total_trips,
        on_time_percentage,
        status
      ),
      vehicles!inner(
        id,
        vehicle_category_id,
        status,
        registration_number,
        make,
        model
      )
    `
    )
    .eq("available_date", pickupDate)
    .eq("is_available", true)
    .eq("drivers.status", "active")
    .eq("vehicles.status", "active");

  if (booking.vehicle_category_id) {
    availabilityQuery.eq(
      "vehicles.vehicle_category_id",
      booking.vehicle_category_id
    );
  }

  if (operatingCityId) {
    availabilityQuery.eq("operating_city_id", operatingCityId);
  }

  const { data: availableDrivers } = await availabilityQuery;

  // Step 4: Log no-driver scenario and return early if none available
  if (!availableDrivers || availableDrivers.length === 0) {
    await supabase.from("booking_status_log").insert({
      booking_id,
      old_status: booking.status,
      new_status: booking.status,
      changed_by: "system",
      notes: "No matching drivers available for auto-assignment",
    });

    const result: AssignDriverResponse = {
      assigned: false,
      reason: "No matching drivers available",
    };
    return Response.json(result);
  }

  // Step 5: Score and rank candidates
  // Priority: overall_rating (desc) → total_trips (desc) → on_time_percentage (desc)
  const scored = availableDrivers
    .map((row) => {
      const driver = (row.drivers as unknown) as {
        id: string;
        vendor_id: string;
        name: string;
        phone: string;
        overall_rating: number;
        total_trips: number;
        on_time_percentage: number;
        status: string;
      };
      const vehicle = (row.vehicles as unknown) as {
        id: string;
        vehicle_category_id: string;
        status: string;
        registration_number: string;
        make: string;
        model: string;
      };
      return {
        driver_id: row.driver_id as string,
        vehicle_id: row.vehicle_id as string,
        vendor_id: driver.vendor_id,
        driver_name: driver.name,
        driver_phone: driver.phone,
        overall_rating: driver.overall_rating ?? 0,
        total_trips: driver.total_trips ?? 0,
        on_time_percentage: driver.on_time_percentage ?? 0,
        vehicle_registration: vehicle.registration_number,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
      };
    })
    .sort((a, b) => {
      if (b.overall_rating !== a.overall_rating) {
        return b.overall_rating - a.overall_rating;
      }
      if (b.total_trips !== a.total_trips) {
        return b.total_trips - a.total_trips;
      }
      return b.on_time_percentage - a.on_time_percentage;
    });

  const best = scored[0];

  // Step 6: Assign the top candidate and update booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      assigned_driver_id: best.driver_id,
      assigned_vehicle_id: best.vehicle_id,
      assigned_vendor_id: best.vendor_id,
      status: "driver_assigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking_id);

  if (updateError) {
    const err: ErrorResponse = { error: "Failed to assign driver" };
    return Response.json(err, { status: 500 });
  }

  // Step 7: Log the status change
  await supabase.from("booking_status_log").insert({
    booking_id,
    old_status: booking.status,
    new_status: "driver_assigned",
    changed_by: "system",
    notes: `Auto-assigned driver ${best.driver_name} (${best.driver_id})`,
  });

  // Step 8: Send driver_assigned notification
  const bookingNum: string = booking.booking_number ?? booking_id.slice(0, 8).toUpperCase();
  const vehicleInfo = `${best.vehicle_make} ${best.vehicle_model}`.trim();

  // Fetch the customer phone for notification
  const { data: customerData } = await supabase
    .from("bookings")
    .select("customers!inner(phone)")
    .eq("id", booking_id)
    .single();

  const customerPhone: string =
    (customerData?.customers as { phone?: string } | null)?.phone ?? "";

  if (customerPhone) {
    await sendNotification({
      booking_id,
      recipient_phone: customerPhone,
      template_name: "driver_assigned",
      template_data: {
        booking_number: bookingNum,
        driver_name: best.driver_name,
        driver_phone: best.driver_phone,
        vehicle_info: vehicleInfo,
        registration_number: best.vehicle_registration,
      },
    });
  }

  const result: AssignDriverResponse = {
    assigned: true,
    driver_id: best.driver_id,
    vehicle_id: best.vehicle_id,
    driver_name: best.driver_name,
  };
  return Response.json(result);
}
