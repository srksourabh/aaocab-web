import { createClient } from "@supabase/supabase-js";

// Use service-side client for notification logging (writes to notification_log)
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

/**
 * Sends a notification via the n8n webhook (which routes to WhatsApp/SMS).
 * Also logs the attempt in the notification_log table.
 */
export async function sendNotification(params: NotificationParams): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("NEXT_PUBLIC_N8N_WEBHOOK_URL is not configured");
  }

  const supabase = getSupabaseClient();

  // Log the notification as queued before sending
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

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: params.template_name,
        booking_id: params.booking_id,
        phone: params.recipient_phone,
        data: params.template_data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    // Update log to sent
    if (logId) {
      await supabase
        .from("notification_log")
        .update({ status: "sent" })
        .eq("id", logId);
    }
  } catch {
    // Update log to failed — do not rethrow so booking flow is not blocked
    if (logId) {
      await supabase
        .from("notification_log")
        .update({ status: "failed" })
        .eq("id", logId);
    }
  }
}
