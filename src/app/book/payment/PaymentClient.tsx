"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  TestTube,
} from "lucide-react";
import { createBooking } from "@/lib/booking";

interface Props {
  from: string;
  to: string;
  date: string;
  time: string;
  type: string;
  roundTrip: string;
  distance: string;
  vehicleCategoryId: string;
  vehicleSlug: string;
  vehicleName: string;
  totalFare: string;
  baseFare: string;
  driverAllowance: string;
  toll: string;
  gst: string;
  advanceAmount: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  pickupAddress: string;
  specialRequests: string;
}

type PaymentOption = "advance" | "full";
type PaymentMethod = "upi" | "card" | "netbanking";

// Razorpay checkout.js attaches a global constructor to `window`
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    contact: string;
    email: string;
  };
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function FareRow({
  label,
  value,
  bold,
  large,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center ${large ? "pt-2" : ""}`}>
      <span
        className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"} ${large ? "text-base font-bold" : ""}`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${bold ? "font-bold text-foreground" : "text-foreground"} ${large ? "text-xl font-heading font-bold text-primary" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentClient({
  from,
  to,
  date,
  time,
  type,
  roundTrip,
  distance,
  vehicleCategoryId,
  vehicleSlug,
  vehicleName,
  totalFare,
  baseFare,
  driverAllowance,
  toll,
  gst,
  advanceAmount,
  passengerName,
  passengerPhone,
  passengerEmail,
  pickupAddress,
  specialRequests,
}: Props) {
  const router = useRouter();
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("advance");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);

  const total = parseInt(totalFare, 10) || 0;
  const advance = parseInt(advanceAmount, 10) || 0;
  const balance = total - advance;
  const payNow = paymentOption === "advance" ? advance : total;

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  // Preload the Razorpay checkout script on mount
  useEffect(() => {
    loadRazorpayScript().catch(() => undefined);
  }, []);

  function buildPickupDatetime(): string {
    if (!date || !time) return date;
    const [timePart, period] = time.split(" ");
    const [hStr, mStr] = timePart.split(":");
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  }

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const pickupDatetime = buildPickupDatetime();

      // 1. Create the booking in Supabase (status = 'pending')
      const booking = await createBooking({
        customer_id: null,
        trip_type: type,
        pickup_location: { address: pickupAddress, city: from },
        drop_location: { address: "", city: to },
        pickup_datetime: pickupDatetime,
        vehicle_category_id: vehicleCategoryId,
        route_id: null,
        distance_km: parseInt(distance, 10) || 0,
        base_fare: parseInt(baseFare, 10) || 0,
        toll_estimate: parseInt(toll, 10) || 0,
        driver_allowance: parseInt(driverAllowance, 10) || 300,
        gst: parseInt(gst, 10) || 0,
        total_fare: total,
        advance_percent: paymentOption === "advance" ? 20 : 100,
        advance_amount: payNow,
        balance_amount: paymentOption === "advance" ? balance : 0,
        special_requests: specialRequests || null,
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        passenger_email: passengerEmail || null,
      });

      // 2. Create a Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payNow,
          currency: "INR",
          booking_id: booking.id,
          customer_name: passengerName,
          customer_phone: passengerPhone,
          customer_email: passengerEmail || undefined,
        }),
      });

      if (!orderRes.ok) {
        const json = (await orderRes.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to initiate payment");
      }

      const orderData = (await orderRes.json()) as {
        order_id: string;
        amount: number;
        currency: string;
        key_id: string;
        mock_mode: boolean;
      };

      if (orderData.mock_mode) {
        setIsMockMode(true);
        // Simulate a 2-second mock payment flow then redirect
        await new Promise((r) => setTimeout(r, 2000));
        await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.order_id,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            razorpay_signature: "mock_signature",
            booking_id: booking.id,
          }),
        });
        router.push(`/book/confirmation/${booking.id}`);
        return;
      }

      // 3. Open Razorpay checkout modal
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Payment system could not be loaded. Please try again.");
      }

      const rzp = new window.Razorpay({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "AaoCab",
        description: `${from} to ${to} — ${vehicleName}`,
        prefill: {
          name: passengerName,
          contact: passengerPhone,
          email: passengerEmail || "",
        },
        theme: { color: "#4F4ED6" },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            // 4. Verify payment on our server
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: booking.id,
              }),
            });

            if (!verifyRes.ok) {
              const json = (await verifyRes.json()) as { error?: string };
              throw new Error(json.error ?? "Payment verification failed");
            }

            // 5. Redirect to confirmation page
            router.push(`/book/confirmation/${booking.id}`);
          } catch (verifyErr) {
            const msg =
              verifyErr instanceof Error
                ? verifyErr.message
                : "Payment verification failed. Please contact support.";
            setError(msg);
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. Your booking has not been confirmed.");
            setLoading(false);
          },
        },
      });

      rzp.open();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      setLoading(false);
    }
  }

  function handleBack() {
    const qs = new URLSearchParams({
      from,
      to,
      date,
      time,
      type,
      roundTrip,
      distance,
      vehicleCategoryId,
      vehicleSlug,
      vehicleName,
      totalFare,
      baseFare,
      driverAllowance,
      toll,
      gst,
      advanceAmount,
    });
    router.push(`/book/details?${qs.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Back to passenger details"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        <div className="flex items-center justify-between">
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Payment
          </h1>
          {isMockMode && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">
              <TestTube size={12} aria-hidden="true" />
              Test Mode
            </span>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-1.5">
          <p className="font-heading font-semibold text-foreground">
            {from} &rarr; {to}
          </p>
          <p className="text-sm text-muted-foreground">
            {formattedDate}
            {time ? `, ${time}` : ""} &middot; {vehicleName}
          </p>
          <p className="text-sm text-muted-foreground">{passengerName}</p>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="font-heading font-semibold text-foreground">
            Fare Breakdown
          </p>
          <div className="space-y-2">
            <FareRow
              label="Base fare"
              value={`₹${fmt(parseInt(baseFare, 10) || 0)}`}
            />
            <FareRow
              label="Driver allowance"
              value={`₹${fmt(parseInt(driverAllowance, 10) || 300)}`}
            />
            <FareRow
              label="Toll estimate"
              value={`₹${fmt(parseInt(toll, 10) || 0)}`}
            />
            <FareRow
              label="GST (5%)"
              value={`₹${fmt(parseInt(gst, 10) || 0)}`}
            />
            <div className="border-t border-border pt-2">
              <FareRow label="Total" value={`₹${fmt(total)}`} bold large />
            </div>
          </div>
        </div>

        {/* Advance Payment Selector */}
        <div className="space-y-3">
          <p className="font-heading font-semibold text-foreground">
            How much to pay now?
          </p>
          <div className="grid gap-3">
            {(
              [
                {
                  key: "advance" as PaymentOption,
                  label: `Pay 20% now \u2014 \u20b9${fmt(advance)}`,
                  sub: `Balance \u20b9${fmt(balance)} to be paid to driver at pickup`,
                },
                {
                  key: "full" as PaymentOption,
                  label: `Pay full amount \u2014 \u20b9${fmt(total)}`,
                  sub: "Nothing to pay at pickup",
                },
              ] as const
            ).map(({ key, label, sub }) => (
              <label
                key={key}
                className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  paymentOption === key
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="paymentOption"
                  value={key}
                  checked={paymentOption === key}
                  onChange={() => setPaymentOption(key)}
                  className="mt-0.5 accent-primary cursor-pointer"
                  aria-label={label}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <p className="font-heading font-semibold text-foreground">
            Payment Method
          </p>

          <div className="flex gap-2">
            {(
              [
                { key: "upi" as PaymentMethod, label: "UPI", Icon: Smartphone },
                { key: "card" as PaymentMethod, label: "Card", Icon: CreditCard },
                { key: "netbanking" as PaymentMethod, label: "Netbanking", Icon: Building2 },
              ] as const
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setPaymentMethod(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  paymentMethod === key
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
                aria-pressed={paymentMethod === key}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground px-1">
            Select UPI, Card, or Netbanking — all methods are available via the payment screen.
          </p>
        </div>

        {/* Cancellation Policy */}
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <ShieldCheck
            size={16}
            className="text-green-600 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-xs text-green-800 font-medium">
            Free cancellation up to 24 hours before pickup. No questions asked.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Pay CTA */}
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="w-full h-14 md:h-12 bg-primary text-white font-heading font-semibold text-base rounded-[40px] hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? isMockMode
              ? "Simulating payment..."
              : "Processing..."
            : `Pay \u20b9${fmt(payNow)} & Book`}
        </button>

        <p className="text-xs text-center text-muted-foreground pb-4">
          By booking you agree to AaoCab&apos;s terms and cancellation policy.
        </p>
      </div>
    </div>
  );
}
