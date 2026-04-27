"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, ArrowRight, CalendarDays } from "lucide-react";
import { statusLabel, statusColor } from "@/lib/booking";

type FilterTab = "upcoming" | "completed" | "cancelled";

interface Booking {
  id: string;
  booking_number?: string;
  pickup_location: { city?: string };
  drop_location: { city?: string };
  pickup_datetime: string;
  total_fare: number;
  status: string;
}

interface Props {
  bookings: Record<string, unknown>[];
}

function formatDate(isoStr: string): string {
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

function isUpcoming(booking: Booking): boolean {
  const status = booking.status;
  return (
    status === "pending" || status === "confirmed" || status === "driver_assigned" || status === "in_progress"
  );
}

function isCompleted(booking: Booking): boolean {
  return booking.status === "completed";
}

function isCancelled(booking: Booking): boolean {
  return booking.status === "cancelled";
}

function BookingCard({ booking }: { booking: Booking }) {
  const fromCity = booking.pickup_location?.city ?? "Pickup";
  const toCity = booking.drop_location?.city ?? "Drop";
  const bookingNum = booking.booking_number ?? booking.id.slice(0, 8).toUpperCase();

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="block bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Booking ${bookingNum}: ${fromCity} to ${toCity}`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            #{bookingNum}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor(booking.status)}`}
          >
            {statusLabel(booking.status)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <p className="font-heading font-semibold text-foreground">
            {fromCity}
          </p>
          <ArrowRight size={14} className="text-muted-foreground shrink-0" aria-hidden="true" />
          <p className="font-heading font-semibold text-foreground">{toCity}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays size={13} aria-hidden="true" />
            {formatDate(booking.pickup_datetime)}
          </div>
          <p className="font-heading font-bold text-primary">
            ₹{booking.total_fare?.toLocaleString("en-IN") ?? "—"}
          </p>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 space-y-4">
      <div
        className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center"
        aria-hidden="true"
      >
        <Car size={48} className="text-muted-foreground opacity-40" />
      </div>
      <div>
        <p className="font-heading font-semibold text-xl text-foreground">
          No bookings yet
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Your trip history will appear here.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-primary text-white font-heading font-semibold text-sm rounded-[40px] hover:bg-primary/90 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Book Your First Trip
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

const TAB_LABELS: { key: FilterTab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingsListClient({ bookings }: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");

  // Cast to typed list
  const typedBookings = bookings as unknown as Booking[];

  const filtered = typedBookings.filter((b) => {
    if (activeTab === "upcoming") return isUpcoming(b);
    if (activeTab === "completed") return isCompleted(b);
    if (activeTab === "cancelled") return isCancelled(b);
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          My Bookings
        </h1>

        {/* Filter tabs */}
        <div
          role="tablist"
          aria-label="Booking filter"
          className="flex gap-1 bg-muted rounded-xl p-1"
        >
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px] ${
                activeTab === key
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bookings or empty state */}
        {filtered.length === 0 ? (
          typedBookings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No {activeTab} bookings found.</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
