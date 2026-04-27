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

/**
 * Logs a notification intent to notification_log.
 * WhatsApp delivery will be wired up when a provider is selected.
 */
export async function sendNotification(params: NotificationParams): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase.from("notification_log").insert({
    booking_id: params.booking_id,
    recipient_phone: params.recipient_phone,
    channel: "whatsapp",
    template_name: params.template_name,
    message_body: JSON.stringify(params.template_data),
    status: "queued",
  });
}
