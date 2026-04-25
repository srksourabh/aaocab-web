"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Share2,
  User,
  AlertTriangle,
} from "lucide-react";
import { cancelBooking, statusLabel, statusColor } from "@/lib/booking";
import StatusTimeline from "@/components/StatusTimeline";
import DriverCard, { type DriverInfo, type VehicleInfo } from "@/components/DriverCard";
import { tripTrackingMessage } from "@/lib/whatsapp";

interface Booking {
  id: string;
  booking_number?: string;
  pickup_location: { address?: string; city?: string };
  drop_location: { address?: string; city?: string };
  pickup_datetime: string;
  total_fare: number;
  base_fare: number;
  toll_estimate: number;
  driver_allowance: number;
  gst: number;
  advance_amount: number;
  balance_amount: number;
  status: string;
  special_requests?: string | null;
}

interface Props {
  booking: Booking;
  driver?: DriverInfo | null;
  vehicle?: VehicleInfo | null;
}

function fmt(n: number) {
  return (n ?? 0).toLocaleString("en-IN");
}

function formatDatetime(isoStr: string): string {
  if (!isoStr) return "";
  try {
    return new Date(isoStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoStr;
  }
}

// --- Cancel Confirmation Dialog ---
function CancelDialog({
  open,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50"
    >
      <div className="bg-background rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={22}
            className="text-destructive shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h2
              id="cancel-dialog-title"
              className="font-heading font-semibold text-foreground"
            >
              Cancel Booking?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone. Cancellation charges may apply if
              within 24 hours of pickup.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-11 border border-border rounded-[40px] text-sm font-semibold text-foreground hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 bg-destructive text-white rounded-[40px] text-sm font-semibold hover:bg-destructive/90 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---
export default function BookingDetailClient({ booking, driver, vehicle }: Props) {
  const router = useRouter();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(booking.status);

  const isCancellable =
    currentStatus !== "cancelled" && currentStatus !== "completed";
  const bookingNum =
    booking.booking_number ?? booking.id.slice(0, 8).toUpperCase();
  const fromCity = booking.pickup_location?.city ?? "Pickup";
  const toCity = booking.drop_location?.city ?? "Drop";

  async function handleCancelConfirm() {
    setCancelLoading(true);
    setCancelError(null);
    try {
      await cancelBooking(booking.id, "Customer requested cancellation");
      setCurrentStatus("cancelled");
      setShowCancel(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not cancel booking.";
      setCancelError(msg);
    } finally {
      setCancelLoading(false);
    }
  }

  function shareOnWhatsApp() {
    const message = tripTrackingMessage(booking.id, fromCity, toCity);
    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/?text=${encodedMessage}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const showDriverSection = currentStatus !== "cancelled";
  const hasDriver = driver && vehicle;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/bookings")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Back to my bookings"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          My Bookings
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground font-mono">
              #{bookingNum}
            </p>
            <h1 className="font-heading font-bold text-2xl text-foreground mt-0.5">
              {fromCity} → {toCity}
            </h1>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(currentStatus)}`}
          >
            {statusLabel(currentStatus)}
          </span>
        </div>

        {/* Trip details */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="font-heading font-semibold text-foreground">
            Trip Details
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup</span>
              <span className="text-foreground font-medium text-right max-w-[60%]">
                {booking.pickup_location?.address || fromCity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Drop</span>
              <span className="text-foreground font-medium">{toCity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date &amp; Time</span>
              <span className="text-foreground font-medium">
                {formatDatetime(booking.pickup_datetime)}
              </span>
            </div>
            {booking.special_requests && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requests</span>
                <span className="text-foreground text-right max-w-[60%]">
                  {booking.special_requests}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Fare breakdown */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="font-heading font-semibold text-foreground">
            Fare Breakdown
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base fare</span>
              <span className="text-foreground">₹{fmt(booking.base_fare)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Driver allowance</span>
              <span className="text-foreground">₹{fmt(booking.driver_allowance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toll estimate</span>
              <span className="text-foreground">₹{fmt(booking.toll_estimate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (5%)</span>
              <span className="text-foreground">₹{fmt(booking.gst)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-bold text-foreground">Total</span>
              <span className="font-heading font-bold text-primary text-lg">
                ₹{fmt(booking.total_fare)}
              </span>
            </div>
            {booking.balance_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance at pickup</span>
                <span className="font-semibold text-foreground">
                  ₹{fmt(booking.balance_amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status timeline */}
        {currentStatus !== "cancelled" && (
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            <p className="font-heading font-semibold text-foreground">
              Trip Progress
            </p>
            <StatusTimeline status={currentStatus} />
          </div>
        )}

        {/* Driver section */}
        {showDriverSection && (
          hasDriver ? (
            <div className="space-y-2">
              <p className="font-heading font-semibold text-foreground px-0.5">
                Your Driver
              </p>
              <DriverCard driver={driver} vehicle={vehicle} />
            </div>
          ) : (
            <div className="bg-muted border border-border rounded-2xl p-4 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-border flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                <User size={22} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Driver not yet assigned
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Driver will be assigned before your pickup time.
                </p>
              </div>
            </div>
          )
        )}

        {/* Cancel error */}
        {cancelError && (
          <div
            role="alert"
            className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          >
            {cancelError}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="w-full flex items-center justify-center gap-2.5 h-12 bg-[#25D366] text-white font-semibold text-sm rounded-[40px] hover:bg-[#22c35d] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Share2 size={18} aria-hidden="true" />
            Share on WhatsApp
          </button>

          <a
            href="tel:7890302302"
            className="flex items-center justify-center gap-2.5 h-12 border border-border text-foreground font-semibold text-sm rounded-[40px] hover:bg-muted transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone size={18} aria-hidden="true" />
            Call Support: 7890 302 302
          </a>

          {isCancellable && (
            <button
              type="button"
              onClick={() => setShowCancel(true)}
              className="w-full flex items-center justify-center h-12 border border-destructive text-destructive font-semibold text-sm rounded-[40px] hover:bg-red-50 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Cancel Booking
            </button>
          )}
        </div>

        <div className="pb-4">
          <Link
            href="/bookings"
            className="text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            ← Back to My Bookings
          </Link>
        </div>
      </div>

      {/* Cancel dialog */}
      <CancelDialog
        open={showCancel}
        onConfirm={handleCancelConfirm}
        onCancel={() => setShowCancel(false)}
        loading={cancelLoading}
      />
    </div>
  );
}
