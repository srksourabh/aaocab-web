"use client";

import { User, Shield, Star, Phone } from "lucide-react";
import Image from "next/image";

export interface DriverInfo {
  name: string;
  phone: string;
  photo_url: string | null;
  overall_rating: number;
  total_trips: number;
  on_time_percentage: number;
}

export interface VehicleInfo {
  registration_number: string;
  make: string;
  model: string;
  year: number;
  color: string;
}

interface Props {
  driver: DriverInfo;
  vehicle: VehicleInfo;
  /** When true, hides the "Call Driver" button (e.g. review page) */
  hideCallButton?: boolean;
}

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`Rating: ${clamped} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < Math.round(clamped)
              ? "text-[#F59E0B] fill-[#F59E0B]"
              : "text-[#E2E8F0] fill-[#E2E8F0]"
          }
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function DriverCard({
  driver,
  vehicle,
  hideCallButton = false,
}: Props) {
  const onTimeWidth = Math.max(0, Math.min(100, driver.on_time_percentage));

  return (
    <div className="bg-white border border-border rounded-2xl shadow-sm p-4 space-y-4">
      {/* Top row: photo + info */}
      <div className="flex items-start gap-4">
        {/* Driver photo */}
        <div className="shrink-0">
          {driver.photo_url ? (
            <Image
              src={driver.photo_url}
              alt={`Photo of ${driver.name}`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-muted border-2 border-border flex items-center justify-center"
              aria-hidden="true"
            >
              <User size={28} className="text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Name + badge + rating */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-bold text-foreground text-base leading-tight">
              {driver.name}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#24B7A4] bg-[#E6F7F5] px-2 py-0.5 rounded-full">
              <Shield size={11} aria-hidden="true" />
              Verified
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={driver.overall_rating} />
            <span className="text-xs text-muted-foreground">
              {driver.total_trips.toLocaleString("en-IN")} trips
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle info */}
      <div className="space-y-1">
        <p className="text-sm text-foreground">
          {vehicle.color} {vehicle.make} {vehicle.model} ({vehicle.year})
        </p>
        <p className="font-mono text-sm font-semibold text-foreground tracking-widest bg-muted px-2 py-0.5 rounded w-fit">
          {vehicle.registration_number}
        </p>
      </div>

      {/* On-time rate */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">On-time rate</span>
          <span className="text-xs font-semibold text-foreground">
            {driver.on_time_percentage}% On Time
          </span>
        </div>
        <div
          className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={driver.on_time_percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`On-time rate: ${driver.on_time_percentage}%`}
        >
          <div
            className="h-full bg-[#24B7A4] rounded-full transition-all duration-500"
            style={{ width: `${onTimeWidth}%` }}
          />
        </div>
      </div>

      {/* Call button */}
      {!hideCallButton && (
        <a
          href={`tel:${driver.phone}`}
          className="flex items-center justify-center gap-2 h-11 w-full bg-primary text-white font-semibold text-sm rounded-[40px] hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Call driver ${driver.name}`}
        >
          <Phone size={16} aria-hidden="true" />
          Call Driver
        </a>
      )}
    </div>
  );
}
