import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }
  return createClient(url, key);
}

export type TemplateName =
  | "booking_confirmed"
  | "driver_assigned"
  | "driver_en_route"
  | "trip_started"
  | "trip_completed"
  | "reminder_2hr";

export interface NotificationParams {
  booking_id: string;
  recipient_phone: string;
  template_name: TemplateName;
  template_data: Record<string, string>;
}

const TEMPLATE_MESSAGES: Record<TemplateName, (data: Record<string, string>) => string> = {
  booking_confirmed: (d) =>
    `AaoCab: Your booking ${d.booking_id ?? ""} is confirmed! Driver will be assigned shortly.`,
  driver_assigned: (d) =>
    `AaoCab: Driver ${d.driver_name ?? ""} (${d.vehicle_number ?? ""}) has been assigned. Contact: ${d.driver_phone ?? ""}.`,
  driver_en_route: (d) =>
    `AaoCab: Your driver is on the way. ETA: ${d.eta ?? "soon"}.`,
  trip_started: (d) =>
    `AaoCab: Your trip has started. Safe travels! Trip ID: ${d.booking_id ?? ""}.`,
  trip_completed: (d) =>
    `AaoCab: Trip completed. Total fare: ₹${d.fare ?? ""}. Thank you for riding with AaoCab!`,
  reminder_2hr: (d) =>
    `AaoCab: Reminder — your cab departs in 2 hours. Booking ID: ${d.booking_id ?? ""}.`,
};

/**
 * Sends a WhatsApp notification via Twilio and logs the attempt in notification_log.
 */
export async function sendNotification(params: NotificationParams): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  const supabase = getSupabaseClient();

  const { data: logEntry } = await supabase
    .from("notification_log")
    .insert({
      booking_id: params.booking_id,
      recipient_phone: params.recipient_phone,
      channel: "whatsapp",
      template_name: params.template_name,
      message_body: JSON.stringify(params.template_data),
      status: "queued",
    })
    .select("id")
    .single();

  const logId = logEntry?.id ?? null;

  if (!accountSid || !authToken || !fromNumber) {
    // No Twilio configured — log and skip (dev/CI environment)
    if (logId) {
      await supabase
        .from("notification_log")
        .update({ status: "failed" })
        .eq("id", logId);
    }
    return;
  }

  const messageBody = TEMPLATE_MESSAGES[params.template_name](params.template_data);
  const toNumber = `whatsapp:+91${params.recipient_phone.replace(/\D/g, "").slice(-10)}`;

  const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const formData = new URLSearchParams({
    From: fromNumber,
    To: toNumber,
    Body: messageBody,
  });

  try {
    const response = await fetch(twilioEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio ${response.status}: ${errorText}`);
    }

    if (logId) {
      await supabase
        .from("notification_log")
        .update({ status: "sent" })
        .eq("id", logId);
    }
  } catch {
    if (logId) {
      await supabase
        .from("notification_log")
        .update({ status: "failed" })
        .eq("id", logId);
    }
  }
}
