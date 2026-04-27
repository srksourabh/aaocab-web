import { type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotification, type TemplateName } from "@/lib/notifications";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }
  return createClient(url, key);
}

// Valid status transitions: maps each status to the statuses it can move to
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["driver_assigned", "cancelled"],
  driver_assigned: ["en_route", "cancelled"],
  en_route: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

// Maps new status to the notification template to send
const STATUS_NOTIFICATION_MAP: Partial<Record<string, TemplateName>> = {
  confirmed: "booking_confirmed",
  en_route: "driver_en_route",
  in_progress: "trip_started",
  completed: "trip_completed",
};

interface BookingStatusRequest {
  booking_id: string;
  new_status: string;
  notes?: string;
}

interface BookingStatusResponse {
  success: boolean;
  booking_id: string;
  old_status: string;
  new_status: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: BookingStatusRequest;
  try {
    body = await request.json();
  } catch {
    const err: ErrorResponse = { error: "Invalid JSON body" };
    return Response.json(err, { status: 400 });
  }

  const { booking_id, new_status, notes } = body;

  if (!booking_id || !new_status) {
    const err: ErrorResponse = {
      error: "booking_id and new_status are required",
    };
    return Response.json(err, { status: 400 });
  }

  const supabase = getSupabaseClient();

  // Fetch current booking with customer phone
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      booking_number,
      status,
      pickup_location,
      drop_location,
      pickup_datetime,
      total_fare,
      assigned_driver_id,
      assigned_vehicle_id,
      customers!inner(phone)
    `
    )
    .eq("id", booking_id)
    .single();

  if (bookingError || !booking) {
    const err: ErrorResponse = { error: "Booking not found" };
    return Response.json(err, { status: 404 });
  }

  const currentStatus: string = booking.status;

  // Validate the transition is allowed
  const allowedNext = VALID_TRANSITIONS[currentStatus] ?? [];
  if (!allowedNext.includes(new_status)) {
    const err: ErrorResponse = {
      error: `Cannot transition from '${currentStatus}' to '${new_status}'`,
    };
    return Response.json(err, { status: 422 });
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    status: new_status,
    updated_at: new Date().toISOString(),
  };
  if (new_status === "completed") {
    updatePayload.completed_at = new Date().toISOString();
  }
  if (new_status === "cancelled") {
    updatePayload.cancelled_at = new Date().toISOString();
    if (notes) {
      updatePayload.cancellation_reason = notes;
    }
  }

  // Update the booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("id", booking_id);

  if (updateError) {
    const err: ErrorResponse = { error: "Failed to update booking status" };
    return Response.json(err, { status: 500 });
  }

  // Log the status change
  await supabase.from("booking_status_log").insert({
    booking_id,
    old_status: currentStatus,
    new_status,
    changed_by: "system",
    notes: notes ?? null,
  });

  // Send notification for applicable status changes
  const templateName = STATUS_NOTIFICATION_MAP[new_status];
  const customerPhone: string =
    (booking.customers as { phone?: string } | null)?.phone ?? "";

  if (templateName && customerPhone) {
    const bookingNum: string =
      booking.booking_number ?? booking_id.slice(0, 8).toUpperCase();

    const pickupLocation = booking.pickup_location as {
      city?: string;
      address?: string;
    };
    const dropLocation = booking.drop_location as { city?: string } | null;

    const templateData: Record<string, string> = {
      booking_number: bookingNum,
      from: pickupLocation?.city ?? "Pickup",
      to: dropLocation?.city ?? "Drop",
      pickup_time: new Date(booking.pickup_datetime as string).toLocaleString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      ),
      total_fare: `₹${(booking.total_fare as number).toLocaleString("en-IN")}`,
      review_link: `https://aaocab.com/review/${booking_id}`,
    };

    await sendNotification({
      booking_id,
      recipient_phone: customerPhone,
      template_name: templateName,
      template_data: templateData,
    });
  }

  const result: BookingStatusResponse = {
    success: true,
    booking_id,
    old_status: currentStatus,
    new_status,
  };
  return Response.json(result);
}
