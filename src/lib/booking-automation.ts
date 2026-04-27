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

/**
 * Called after a booking is confirmed (payment successful).
 * Handles: status update → notification → auto-assign → reminder scheduling.
 */
export async function onBookingConfirmed(bookingId: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Step 1: Fetch the booking with customer phone
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
      advance_payment_status,
      customers!inner(phone, name)
    `
    )
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    throw new Error(`Booking not found: ${bookingId}`);
  }

  const currentStatus: string = booking.status;

  // Step 2: Update booking status from 'pending' to 'confirmed'
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("status", "pending"); // Only update if still pending (idempotency guard)

  if (updateError) {
    throw new Error(`Failed to confirm booking: ${updateError.message}`);
  }

  // Step 3: Log the status change
  await supabase.from("booking_status_log").insert({
    booking_id: bookingId,
    old_status: currentStatus,
    new_status: "confirmed",
    changed_by: "system",
    notes: "Booking confirmed after payment",
  });

  const customer = booking.customers as { phone?: string; name?: string } | null;
  const customerPhone: string = customer?.phone ?? "";
  const bookingNum: string =
    booking.booking_number ?? bookingId.slice(0, 8).toUpperCase();

  const pickupLocation = booking.pickup_location as {
    city?: string;
    address?: string;
  };
  const dropLocation = booking.drop_location as { city?: string } | null;

  const pickupDatetime = new Date(booking.pickup_datetime as string);
  const pickupTimeStr = pickupDatetime.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Step 4: Send booking_confirmed notification to customer
  if (customerPhone) {
    await sendNotification({
      booking_id: bookingId,
      recipient_phone: customerPhone,
      template_name: "booking_confirmed",
      template_data: {
        booking_number: bookingNum,
        from: pickupLocation?.city ?? "Pickup",
        to: dropLocation?.city ?? "Drop",
        date: pickupDatetime.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        time: pickupDatetime.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        total_fare: `₹${(booking.total_fare as number).toLocaleString("en-IN")}`,
      },
    });
  }

  // Step 5: Call the auto-assign API server-side
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? // Running server-side — derive base URL from env or use internal
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    : "http://localhost:3000";

  let driverAssigned = false;
  try {
    const assignResponse = await fetch(`${baseUrl}/api/assign-driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId }),
    });

    if (assignResponse.ok) {
      const assignResult = await assignResponse.json();
      driverAssigned = assignResult.assigned === true;
    }
  } catch {
    // Auto-assign failure should not block the confirmation flow
  }

  // Step 6: Log reminder scheduling for 2 hours before pickup
  const twoHoursBefore = new Date(
    pickupDatetime.getTime() - 2 * 60 * 60 * 1000
  );

  await supabase.from("notification_log").insert({
    booking_id: bookingId,
    recipient_phone: customerPhone || "unknown",
    channel: "whatsapp",
    template_name: "reminder_2hr",
    message_body: JSON.stringify({
      booking_number: bookingNum,
      from: pickupLocation?.city ?? "Pickup",
      to: dropLocation?.city ?? "Drop",
      pickup_time: pickupTimeStr,
      scheduled_send_at: twoHoursBefore.toISOString(),
    }),
    status: "queued",
  });

  // If driver was not immediately assigned, that is fine —
  // the booking stays in 'confirmed' status until a driver is available
  void driverAssigned;
}
