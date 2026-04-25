import { type NextRequest } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        notes?: { booking_id?: string };
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
        notes?: { booking_id?: string };
      };
    };
  };
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables not configured");
  return createClient(url, key);
}

function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!WEBHOOK_SECRET || WEBHOOK_SECRET === "placeholder_webhook_secret") {
    return true; // Skip verification in mock/dev mode
  }
  const expected = createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest): Promise<Response> {
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const supabase = getSupabase();

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment?.entity;
      if (payment) {
        const bookingId = payment.notes?.booking_id;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({
              advance_payment_status: "paid",
              advance_payment_id: payment.id,
              status: "confirmed",
            })
            .eq("id", bookingId);
        }
      }
      break;
    }

    case "payment.failed": {
      const payment = event.payload.payment?.entity;
      if (payment) {
        const bookingId = payment.notes?.booking_id;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ advance_payment_status: "pending" })
            .eq("id", bookingId);
        }
      }
      break;
    }

    case "refund.created": {
      const refund = event.payload.refund?.entity;
      if (refund) {
        const bookingId = refund.notes?.booking_id;
        if (bookingId) {
          await supabase
            .from("bookings")
            .update({ advance_payment_status: "refunded" })
            .eq("id", bookingId);
        }
      }
      break;
    }

    default:
      // Unhandled event types are silently acknowledged
      break;
  }

  return Response.json({ received: true });
}
