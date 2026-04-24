"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Car,
  Users,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Leaf,
} from "lucide-react";
import { generateFareEstimate } from "@/lib/booking";

// --- Types ---
interface VehicleCategory {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  description: string;
  seating_capacity: number;
  sort_order: number;
}

interface Props {
  from: string;
  to: string;
  date: string;
  time: string;
  type: string;
  roundTrip: string;
  distanceKm: number;
  categories: VehicleCategory[];
}

// Gradient and color config per vehicle slug
const VEHICLE_GRADIENTS: Record<string, string> = {
  sedan: "from-blue-400 to-indigo-500",
  ertiga: "from-teal-400 to-emerald-500",
  innova: "from-violet-400 to-purple-500",
  crysta: "from-orange-400 to-red-500",
  "12-seater": "from-pink-400 to-rose-500",
  "16-seater": "from-amber-400 to-yellow-500",
};

// Badges per slug
const VEHICLE_BADGES: Record<string, { label: string; color: string } | null> =
  {
    sedan: { label: "Most Popular", color: "bg-primary text-white" },
    ertiga: { label: "Best Value", color: "bg-[#24B7A4] text-white" },
    innova: null,
    crysta: null,
    "12-seater": null,
    "16-seater": null,
  };

// What's included per vehicle slug
function getIncludes(slug: string, distanceKm: number) {
  const extraKmRate: Record<string, number> = {
    sedan: 11,
    ertiga: 14,
    innova: 16,
    crysta: 18,
    "12-seater": 22,
    "16-seater": 28,
  };
  return [
    "Fuel included",
    "AC included",
    "Professional driver",
    `${distanceKm} km allowance`,
    `Extra km: ₹${extraKmRate[slug] ?? 11}/km`,
  ];
}

// --- Vehicle Card ---
function VehicleCard({
  category,
  distanceKm,
  onSelect,
}: {
  category: VehicleCategory;
  distanceKm: number;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fare = generateFareEstimate(distanceKm, category.slug, 0);
  const badge = VEHICLE_BADGES[category.slug] ?? null;
  const gradient =
    VEHICLE_GRADIENTS[category.slug] ?? "from-gray-400 to-gray-500";
  const includes = getIncludes(category.slug, distanceKm);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Top gradient + icon */}
      <div
        className={`relative bg-gradient-to-br ${gradient} h-36 flex items-center justify-center`}
      >
        <Car size={64} className="text-white/80" aria-hidden="true" />
        {badge && (
          <span
            className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground leading-tight">
              {category.display_name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {category.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-heading font-bold text-2xl text-primary leading-none">
              ₹{fare.totalFare.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">all-inclusive</p>
          </div>
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users size={15} aria-hidden="true" />
          <span>{category.seating_capacity} passengers</span>
        </div>

        {/* What's included expandable */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-primary cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-expanded={expanded}
        >
          What&apos;s included?
          {expanded ? (
            <ChevronUp size={14} aria-hidden="true" />
          ) : (
            <ChevronDown size={14} aria-hidden="true" />
          )}
        </button>

        {expanded && (
          <ul className="space-y-1.5 pt-1">
            {includes.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Leaf size={13} className="text-[#24B7A4] shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Select button */}
        <button
          type="button"
          onClick={onSelect}
          className="w-full h-12 bg-primary text-white font-heading font-semibold rounded-[40px] hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
        >
          Select
        </button>
      </div>
    </div>
  );
}

// --- Route Summary Banner ---
function RouteBanner({
  from,
  to,
  date,
  time,
  roundTrip,
}: {
  from: string;
  to: string;
  date: string;
  time: string;
  roundTrip: string;
}) {
  const isRound = roundTrip === "true";
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
      <p className="font-heading font-semibold text-foreground text-base">
        {from || "Pickup"} → {to || "Drop"}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">
        {formattedDate}
        {time ? `, ${time}` : ""}
        {" · "}
        {isRound ? "Round Trip" : "One-way"}
      </p>
    </div>
  );
}

// --- Main Client Component ---
export default function CarSelectionClient({
  from,
  to,
  date,
  time,
  type,
  roundTrip,
  distanceKm,
  categories,
}: Props) {
  const router = useRouter();

  // Sort categories by price (lowest fare first)
  const sorted = [...categories].sort((a, b) => {
    const fareA = generateFareEstimate(distanceKm, a.slug, 0).totalFare;
    const fareB = generateFareEstimate(distanceKm, b.slug, 0).totalFare;
    return fareA - fareB;
  });

  function handleSelect(category: VehicleCategory) {
    const fare = generateFareEstimate(distanceKm, category.slug, 0);
    const qs = new URLSearchParams({
      from,
      to,
      date,
      time,
      type,
      roundTrip,
      distance: String(distanceKm),
      vehicleCategoryId: category.id,
      vehicleSlug: category.slug,
      vehicleName: category.display_name,
      totalFare: String(fare.totalFare),
      baseFare: String(fare.baseFare),
      driverAllowance: String(fare.driverAllowance),
      toll: String(fare.toll),
      gst: String(fare.gst),
      advanceAmount: String(fare.advanceAmount),
    });
    router.push(`/book/details?${qs.toString()}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Back to home"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back
        </button>

        {/* Page title */}
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">
            Choose Your Car
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All prices are all-inclusive. No hidden charges.
          </p>
        </div>

        {/* Route banner */}
        <RouteBanner
          from={from}
          to={to}
          date={date}
          time={time}
          roundTrip={roundTrip}
        />

        {/* Distance note */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BadgeCheck size={15} className="text-[#24B7A4]" aria-hidden="true" />
          <span>Estimated distance: {distanceKm} km</span>
        </div>

        {/* Vehicle cards */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Car size={48} className="mx-auto mb-4 opacity-30" aria-hidden="true" />
            <p className="font-heading font-semibold text-lg">
              No vehicles available
            </p>
            <p className="text-sm mt-1">Please try again later.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sorted.map((cat) => (
              <VehicleCard
                key={cat.id}
                category={cat}
                distanceKm={distanceKm}
                onSelect={() => handleSelect(cat)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
