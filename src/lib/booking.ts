import { supabase } from "./supabase";

// --- Types ---

export interface FareEstimate {
  baseFare: number;
  driverAllowance: number;
  toll: number;
  gst: number;
  totalFare: number;
  advanceAmount: number;
}

export interface BookingData {
  customer_id?: string | null;
  trip_type: string;
  pickup_location: { address: string; city: string };
  drop_location: { address: string; city: string };
  pickup_datetime: string;
  vehicle_category_id: string;
  route_id?: string | null;
  distance_km: number;
  duration_minutes?: number | null;
  base_fare: number;
  toll_estimate: number;
  driver_allowance: number;
  gst: number;
  total_fare: number;
  advance_percent: number;
  advance_amount: number;
  balance_amount: number;
  special_requests?: string | null;
  passenger_name: string;
  passenger_phone: string;
  passenger_email?: string | null;
}

// Per-km rates by vehicle slug
const KM_RATES: Record<string, number> = {
  sedan: 11,
  ertiga: 14,
  innova: 16,
  crysta: 18,
  "12-seater": 22,
  "16-seater": 28,
};

const DRIVER_ALLOWANCE = 300;
const GST_RATE = 0.05;
const ADVANCE_PERCENT = 20;

/**
 * Calculates the full fare breakdown for a trip.
 * distance_km: total distance of the trip
 * vehicleSlug: slug of the vehicle category (e.g. "sedan", "ertiga")
 * tollEstimate: toll charges in rupees
 */
export function generateFareEstimate(
  distance_km: number,
  vehicleSlug: string,
  tollEstimate: number
): FareEstimate {
  const rate = KM_RATES[vehicleSlug] ?? 11;
  const baseFare = Math.round(distance_km * rate);
  const driverAllowance = DRIVER_ALLOWANCE;
  const toll = Math.round(tollEstimate);
  const subtotal = baseFare + driverAllowance + toll;
  const gst = Math.round(subtotal * GST_RATE);
  const totalFare = subtotal + gst;
  const advanceAmount = Math.round((totalFare * ADVANCE_PERCENT) / 100);

  return {
    baseFare,
    driverAllowance,
    toll,
    gst,
    totalFare,
    advanceAmount,
  };
}

/**
 * Inserts a new booking record into Supabase.
 * Returns the created booking or throws an error.
 */
export async function createBooking(bookingData: BookingData) {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: bookingData.customer_id ?? null,
      trip_type: bookingData.trip_type,
      pickup_location: bookingData.pickup_location,
      drop_location: bookingData.drop_location,
      pickup_datetime: bookingData.pickup_datetime,
      vehicle_category_id: bookingData.vehicle_category_id,
      route_id: bookingData.route_id ?? null,
      distance_km: bookingData.distance_km,
      duration_minutes: bookingData.duration_minutes ?? null,
      base_fare: bookingData.base_fare,
      toll_estimate: bookingData.toll_estimate,
      driver_allowance: bookingData.driver_allowance,
      gst: bookingData.gst,
      total_fare: bookingData.total_fare,
      advance_percent: bookingData.advance_percent,
      advance_amount: bookingData.advance_amount,
      balance_amount: bookingData.balance_amount,
      advance_payment_status: "pending",
      status: "pending",
      special_requests: bookingData.special_requests ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create booking: ${error.message}`);
  }

  return data;
}

/**
 * Fetches a single booking by its ID from Supabase.
 */
export async function getBooking(id: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }

  return data;
}

/**
 * Fetches all bookings for a given customer.
 */
export async function getCustomerBookings(customerId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Fetches all bookings (for demo purposes when no customer is logged in).
 */
export async function getAllBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Updates a booking's status to 'cancelled' in Supabase.
 */
export async function cancelBooking(id: string, _reason?: string) {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }
}

/**
 * Formats a date string (ISO or YYYY-MM-DD) into a readable label.
 * e.g. "2026-05-05" → "May 5, 2026"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Returns a human-readable label for a booking status.
 */
export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    driver_assigned: "Driver Assigned",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

/**
 * Updates a booking's payment details after a successful Razorpay transaction.
 * paymentId: the Razorpay payment_id from the checkout callback
 * status: 'paid' once verified, 'pending' if failed
 */
export async function updateBookingPayment(
  bookingId: string,
  paymentId: string,
  status: "paid" | "pending"
) {
  const { error } = await supabase
    .from("bookings")
    .update({
      advance_payment_id: paymentId,
      advance_payment_status: status,
      status: status === "paid" ? "confirmed" : "pending",
    })
    .eq("id", bookingId);

  if (error) {
    throw new Error(`Failed to update booking payment: ${error.message}`);
  }
}

/**
 * Returns a Tailwind color class for a given booking status badge.
 */
export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    driver_assigned: "bg-teal-100 text-teal-800",
    in_progress: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800";
}
