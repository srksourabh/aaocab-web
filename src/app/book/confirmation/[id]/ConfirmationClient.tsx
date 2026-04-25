"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Share2,
  Phone,
  Download,
  Home,
  ListOrdered,
  Loader2,
  CheckCircle2,
  Clock,
  Car,
} from "lucide-react";
import { bookingConfirmationMessage } from "@/lib/whatsapp";
import { useBookingStatus } from "@/hooks/useBookingStatus";
import DriverCard from "@/components/DriverCard";

interface Booking {
  id: string;
  booking_number?: string;
  pickup_location: { address?: string; city?: string };
  drop_location: { address?: string; city?: string };
  pickup_datetime: string;
  total_fare: number;
  advance_amount: number;
  balance_amount: number;
  status: string;
  passenger_name?: string;
}

interface Props {
  booking: Booking;
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

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

// Progress steps for the human-touch journey indicator
const PROGRESS_STEPS = [
  { label: "Booking confirmed", icon: CheckCircle2 },
  { label: "Assigning driver", icon: Clock },
  { label: "Ready for pickup", icon: Car },
] as const;

function ProgressIndicator({ status }: { status: string }) {
  const stepIndex =
    status === "driver_assigned" ||
    status === "en_route" ||
    status === "in_progress" ||
    status === "completed"
      ? 2
      : status === "confirmed"
      ? 1
      : 0;

  return (
    <div
      className="flex items-center gap-0"
      role="progressbar"
      aria-label="Booking progress"
      aria-valuenow={stepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={3}
    >
      {PROGRESS_STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isDone = idx <= stepIndex;
        const isCurrent = idx === stepIndex;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  isDone
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                {isCurrent && !isDone ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <StepIcon size={16} />
                )}
              </div>
              <span
                className={`text-xs text-center w-20 leading-tight ${
                  isDone ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < PROGRESS_STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 mb-5 transition-colors duration-500 ${
                  idx < stepIndex ? "bg-primary" : "bg-border"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ConfirmationClient({ booking }: Props) {
  const [copied, setCopied] = useState(false);

  const { status, assignedDriver, assignedVehicle } = useBookingStatus(
    booking.id,
    booking.status
  );

  const bookingNum =
    booking.booking_number ?? booking.id.slice(0, 8).toUpperCase();
  const fromCity = booking.pickup_location?.city ?? "Pickup";
  const toCity = booking.drop_location?.city ?? "Drop";
  const pickupAddr = booking.pickup_location?.address ?? "";
  const passengerName = booking.passenger_name ?? "";

  const driverAssigned =
    status === "driver_assigned" ||
    status === "en_route" ||
    status === "in_progress" ||
    status === "completed";

  async function copyBookingNumber() {
    try {
      await navigator.clipboard.writeText(bookingNum);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silently ignore
    }
  }

  function shareOnWhatsApp() {
    const message = bookingConfirmationMessage(booking);
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Success animation */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="checkmark-circle" aria-hidden="true">
            <Check size={40} strokeWidth={3} className="text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-2xl text-foreground">
              {passengerName
                ? `Hi ${passengerName}, your trip is confirmed!`
                : "Your trip is confirmed!"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              We typically assign a driver within 30 minutes.
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center py-2">
          <ProgressIndicator status={status} />
        </div>

        {/* Booking number */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Booking Number
          </p>
          <button
            type="button"
            onClick={copyBookingNumber}
            className="inline-flex items-center gap-2 font-heading font-bold text-2xl text-primary cursor-pointer hover:text-primary/80 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label="Copy booking number"
          >
            {bookingNum}
            {copied ? (
              <Check size={18} className="text-green-500" aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
          </button>
          {copied && (
            <p className="text-xs text-green-600 font-medium">Copied!</p>
          )}
          <p className="text-xs text-muted-foreground">Tap to copy</p>
        </div>

        {/* Trip summary */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="font-heading font-semibold text-foreground">
            Trip Summary
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route</span>
              <span className="font-medium text-foreground">
                {fromCity} → {toCity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup</span>
              <span className="font-medium text-foreground text-right max-w-[60%]">
                {pickupAddr || fromCity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date &amp; Time</span>
              <span className="font-medium text-foreground">
                {formatDatetime(booking.pickup_datetime)}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-muted-foreground">Total Fare</span>
              <span className="font-heading font-bold text-primary">
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

        {/* Driver status — live updating */}
        <div
          className={`transition-all duration-500 ${
            driverAssigned
              ? "opacity-100 translate-y-0"
              : "opacity-100 translate-y-0"
          }`}
        >
          {driverAssigned && assignedDriver && assignedVehicle ? (
            <div
              className="space-y-2 animate-fade-in"
              role="region"
              aria-label="Your driver"
            >
              <p className="font-heading font-semibold text-foreground">
                Your Driver
              </p>
              <DriverCard driver={assignedDriver} vehicle={assignedVehicle} />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <Loader2
                size={20}
                className="text-blue-500 animate-spin shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Finding your driver...
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  You&apos;ll receive a WhatsApp message once your driver is
                  assigned.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="flex items-center justify-center gap-2.5 h-12 bg-[#25D366] text-white font-semibold text-sm rounded-[40px] hover:bg-[#22c35d] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Share booking on WhatsApp"
          >
            <Share2 size={18} aria-hidden="true" />
            Share on WhatsApp
          </button>

          <a
            href="tel:7890302302"
            className="flex items-center justify-center gap-2.5 h-12 border border-border text-foreground font-semibold text-sm rounded-[40px] hover:bg-muted transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Call AaoCab support"
          >
            <Phone size={18} aria-hidden="true" />
            Call Support: 7890 302 302
          </a>

          <div className="relative">
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2.5 h-12 border border-border text-muted-foreground font-semibold text-sm rounded-[40px] cursor-not-allowed opacity-50"
              aria-label="Download invoice — coming soon"
              aria-disabled="true"
            >
              <Download size={18} aria-hidden="true" />
              Download Invoice
            </button>
            <span className="absolute -top-2 right-4 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
              Coming soon
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex gap-4 justify-center pt-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Home size={15} aria-hidden="true" />
            Back to Home
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/bookings"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <ListOrdered size={15} aria-hidden="true" />
            View My Bookings
          </Link>
        </div>
      </div>

      {/* Checkmark animation and driver card fade-in styles */}
      <style>{`
        .checkmark-circle {
          width: 88px;
          height: 88px;
          background: #059652;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
