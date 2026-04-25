"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { estimateFareForVehicle } from "@/lib/seo";

interface FarePreviewProps {
  from: string;
  to: string;
  /** Real distance from Google Distance Matrix — used as fallback when DB route is not found */
  distanceKm?: number;
}

interface FareEstimate {
  sedan: number;
  innova: number;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export default function FarePreview({ from, to, distanceKm: fallbackDistanceKm }: FarePreviewProps) {
  const debouncedFrom = useDebouncedValue(from, 500);
  const debouncedTo = useDebouncedValue(to, 500);

  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  // Track active fetch to avoid stale updates when city names change rapidly
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const trimmedFrom = debouncedFrom.trim();
    const trimmedTo = debouncedTo.trim();

    if (!trimmedFrom || !trimmedTo) {
      setEstimate(null);
      return;
    }

    const currentFetchId = ++fetchIdRef.current;
    setLoading(true);

    // Resolve both city IDs in parallel, then look up route distance
    Promise.all([
      supabase
        .from("cities")
        .select("id")
        .ilike("name", trimmedFrom)
        .single(),
      supabase
        .from("cities")
        .select("id")
        .ilike("name", trimmedTo)
        .single(),
    ])
      .then(([{ data: fromCity }, { data: toCity }]) => {
        if (currentFetchId !== fetchIdRef.current) return;
        if (!fromCity || !toCity) {
          setLoading(false);
          // Cities not in DB — use Google-calculated distance if provided
          if (fallbackDistanceKm) {
            setEstimate({
              sedan: estimateFareForVehicle(fallbackDistanceKm, "sedan"),
              innova: estimateFareForVehicle(fallbackDistanceKm, "innova"),
            });
          } else {
            setEstimate(null);
          }
          return;
        }

        return supabase
          .from("routes")
          .select("distance_km")
          .eq("from_city_id", fromCity.id)
          .eq("to_city_id", toCity.id)
          .single()
          .then(({ data: route }) => {
            if (currentFetchId !== fetchIdRef.current) return;
            setLoading(false);
            // Use DB distance or fall back to Google-calculated distance
            const km = route?.distance_km ?? fallbackDistanceKm;
            if (km) {
              setEstimate({
                sedan: estimateFareForVehicle(km, "sedan"),
                innova: estimateFareForVehicle(km, "innova"),
              });
            } else {
              setEstimate(null);
            }
          });
      })
      .catch(() => {
        if (currentFetchId !== fetchIdRef.current) return;
        setLoading(false);
        setEstimate(null);
      });
  }, [debouncedFrom, debouncedTo, fallbackDistanceKm]);

  // Don't render until both cities are typed
  if (!from.trim() || !to.trim()) return null;

  return (
    <div
      aria-live="polite"
      className="rounded-xl bg-muted/60 border border-border px-4 py-3 text-sm transition-all duration-300"
    >
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span
            className="inline-block w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span>Calculating estimate…</span>
        </div>
      ) : estimate ? (
        <p className="text-foreground">
          <span className="font-medium text-muted-foreground">Estimated:</span>{" "}
          <span className="font-semibold text-foreground">
            ₹{estimate.sedan.toLocaleString("en-IN")}
          </span>{" "}
          <span className="text-muted-foreground">(Sedan)</span>
          {" — "}
          <span className="font-semibold text-foreground">
            ₹{estimate.innova.toLocaleString("en-IN")}
          </span>{" "}
          <span className="text-muted-foreground">(Innova)</span>
        </p>
      ) : (
        <p className="text-muted-foreground">
          Enter both cities to see estimate
        </p>
      )}
    </div>
  );
}
