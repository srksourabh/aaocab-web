import { type NextRequest } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const IS_MOCK_MODE =
  !KEY_ID ||
  KEY_ID === "rzp_test_placeholder" ||
  !KEY_SECRET ||
  KEY_SECRET === "placeholder_secret";

interface CreateOrderBody {
  amount: number;
  currency: string;
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
}

interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  mock_mode: boolean;
}

interface ErrorResponse {
  error: string;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables not configured");
  return createClient(url, key);
}

export async function POST(
  request: NextRequest
): Promise<Response> {
  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    const err: ErrorResponse = { error: "Invalid request body" };
    return Response.json(err, { status: 400 });
  }

  const { amount, currency = "INR", booking_id, customer_name, customer_phone } = body;

  if (!amount || !booking_id || !customer_name || !customer_phone) {
    const err: ErrorResponse = { error: "Missing required fields: amount, booking_id, customer_name, customer_phone" };
    return Response.json(err, { status: 400 });
  }

  if (IS_MOCK_MODE) {
    // Mock mode: return a fake order so the app works without real Razorpay keys
    const mockOrderId = `mock_order_${Date.now()}`;
    const resp: CreateOrderResponse = {
      order_id: mockOrderId,
      amount: amount * 100,
      currency,
      key_id: "rzp_test_placeholder",
      mock_mode: true,
    };
    return Response.json(resp);
  }

  try {
    const razorpay = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects paise (1 INR = 100 paise)
      currency,
      receipt: `booking_${booking_id}`,
      notes: {
        booking_id,
        customer_name,
        customer_phone,
      },
    });

    // Store the Razorpay order ID on the booking
    const supabase = getSupabaseAdmin();
    await supabase
      .from("bookings")
      .update({ advance_payment_id: order.id })
      .eq("id", booking_id);

    const resp: CreateOrderResponse = {
      order_id: order.id,
      amount: order.amount as number,
      currency: order.currency,
      key_id: KEY_ID,
      mock_mode: false,
    };
    return Response.json(resp);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create payment order";
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status: 500 });
  }
}
