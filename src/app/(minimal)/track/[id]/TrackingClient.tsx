"use client";

import Link from "next/link";
import { Phone, Share2, Navigation, MapPin } from "lucide-react";
import StatusTimeline from "@/components/StatusTimeline";
import DriverCard, { type DriverInfo, type VehicleInfo } from "@/components/DriverCard";
import { tripTrackingMessage } from "@/lib/whatsapp";
import { statusLabel, statusColor } from "@/lib/booking";

interface Booking {
  id: string;
  booking_number?: string;
  pickup_location: { address?: string; city?: string };
  drop_location: { address?: string; city?: string };
  pickup_datetime: string;
  status: string;
}

interface Props {
  booking: Booking;
  driver?: DriverInfo | null;
  vehicle?: VehicleInfo | null;
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

export default function TrackingClient({ booking, driver, vehicle }: Props) {
  const bookingNum =
    booking.booking_number ?? booking.id.slice(0, 8).toUpperCase();
  const fromCity = booking.pickup_location?.city ?? "Pickup";
  const toCity = booking.drop_location?.city ?? "Drop";

  function shareTrip() {
    const message = tripTrackingMessage(booking.id, fromCity, toCity);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 flex items-center h-14">
          <Link
            href="/"
            className="font-heading font-bold text-xl text-primary tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            aria-label="AaoCab Home"
          >
            AaoCab
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Route header */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono">
              #{bookingNum}
            </p>
            <h1 className="font-heading font-bold text-2xl text-foreground">
              {fromCity} → {toCity}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(booking.status)}`}
              >
                {statusLabel(booking.status)}
              </span>
            </div>
          </div>

          {/* Trip info card */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="font-heading font-semibold text-foreground">
              Trip Details
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-muted-foreground shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <span className="text-muted-foreground">From: </span>
                  <span className="text-foreground font-medium">
                    {booking.pickup_location?.address || fromCity}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <span className="text-muted-foreground">To: </span>
                  <span className="text-foreground font-medium">{toCity}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup time</span>
                <span className="text-foreground font-medium">
                  {formatDatetime(booking.pickup_datetime)}
                </span>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          {booking.status !== "cancelled" && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
              <p className="font-heading font-semibold text-foreground">
                Trip Progress
              </p>
              <StatusTimeline status={booking.status} />
            </div>
          )}

          {/* Driver card */}
          {driver && vehicle && (
            <div className="space-y-2">
              <p className="font-heading font-semibold text-foreground px-0.5">
                Your Driver
              </p>
              <DriverCard driver={driver} vehicle={vehicle} />
            </div>
          )}

          {/* Live tracking placeholder */}
          <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Navigation size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Live tracking coming soon
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Real-time GPS tracking will be available here. You will be able
                to see your driver&apos;s live location on a map.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={shareTrip}
              className="w-full flex items-center justify-center gap-2.5 h-12 bg-[#25D366] text-white font-semibold text-sm rounded-[40px] hover:bg-[#22c35d] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Share2 size={18} aria-hidden="true" />
              Share Trip
            </button>

            <a
              href="tel:7890302302"
              className="flex items-center justify-center gap-2.5 h-12 border-2 border-destructive text-destructive font-semibold text-sm rounded-[40px] hover:bg-red-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Phone size={18} aria-hidden="true" />
              Emergency? Call Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link
            href="/"
            className="font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            AaoCab
          </Link>
        </p>
      </footer>
    </div>
  );
}
