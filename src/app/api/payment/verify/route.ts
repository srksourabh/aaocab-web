import { type NextRequest } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const IS_MOCK_MODE =
  !KEY_SECRET || KEY_SECRET === "placeholder_secret";

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id: string;
}

interface VerifyResponse {
  verified: boolean;
  booking_id: string;
}

interface ErrorResponse {
  error: string;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables not configured");
  return createClient(url, key);
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    const err: ErrorResponse = { error: "Invalid request body" };
    return Response.json(err, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !booking_id) {
    const err: ErrorResponse = { error: "Missing required fields" };
    return Response.json(err, { status: 400 });
  }

  if (IS_MOCK_MODE) {
    // Auto-verify in mock mode so the app works without real keys
    const supabase = getSupabase();
    await supabase
      .from("bookings")
      .update({
        advance_payment_status: "paid",
        advance_payment_id: razorpay_payment_id,
        status: "confirmed",
      })
      .eq("id", booking_id);

    const resp: VerifyResponse = { verified: true, booking_id };
    return Response.json(resp);
  }

  // Verify HMAC signature: SHA256 of "order_id|payment_id" using key secret
  const expectedSignature = createHmac("sha256", KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    const err: ErrorResponse = { error: "Payment signature verification failed" };
    return Response.json(err, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        advance_payment_status: "paid",
        advance_payment_id: razorpay_payment_id,
        status: "confirmed",
      })
      .eq("id", booking_id);

    if (updateError) {
      const err: ErrorResponse = { error: "Failed to update booking after payment" };
      return Response.json(err, { status: 500 });
    }

    const resp: VerifyResponse = { verified: true, booking_id };
    return Response.json(resp);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment verification failed";
    const body: ErrorResponse = { error: message };
    return Response.json(body, { status: 500 });
  }
}
