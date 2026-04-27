import { supabase } from "./supabase";
import { type FareEstimate } from "./booking";

// Fallback per-km rates when no DB pricing exists for the route
const FALLBACK_KM_RATES: Record<string, number> = {
  sedan: 11,
  ertiga: 14,
  innova: 16,
  crysta: 18,
  "12-seater": 22,
  "16-seater": 28,
};

const FALLBACK_DRIVER_ALLOWANCE = 300;
const GST_RATE = 0.05;
const ADVANCE_PERCENT = 20;

// Night hours: 10 PM (22) to 6 AM (6)
const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;

export interface RoutePricing {
  id: string;
  route_id: string;
  vehicle_category_id: string;
  base_price: number;
  per_km_rate: number | null;
  driver_allowance: number;
  gst_percent: number;
  competitor_savaari: number | null;
  competitor_ola: number | null;
  competitor_makemytrip: number | null;
}

/**
 * Fetches route-specific pricing from the route_pricing table.
 * Returns null if no pricing record exists for the given route + vehicle combo.
 */
export async function getRoutePricing(
  routeId: string,
  vehicleCategoryId: string
): Promise<RoutePricing | null> {
  const { data, error } = await supabase
    .from("route_pricing")
    .select("*")
    .eq("route_id", routeId)
    .eq("vehicle_category_id", vehicleCategoryId)
    .single();

  if (error || !data) return null;
  return data as RoutePricing;
}

/**
 * Returns true if the given ISO datetime string falls within night hours (10 PM – 6 AM).
 */
function isNightTime(isoDatetime: string | undefined): boolean {
  if (!isoDatetime) return false;
  const hour = new Date(isoDatetime).getHours();
  return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;
}

/**
 * Calculates fare using DB pricing if available, falling back to hardcoded rates.
 *
 * @param distanceKm - Total trip distance in kilometres
 * @param vehicleSlug - Vehicle category slug (e.g. "sedan", "ertiga")
 * @param routeId - Optional Supabase route ID for DB pricing lookup
 * @param vehicleCategoryId - Optional Supabase vehicle_category ID for DB pricing lookup
 * @param tollEstimate - Toll charges in rupees (default 0)
 * @param departureIso - ISO datetime of pickup, used for night charge calculation
 */
export async function calculateFare(
  distanceKm: number,
  vehicleSlug: string,
  routeId?: string,
  vehicleCategoryId?: string,
  tollEstimate = 0,
  departureIso?: string
): Promise<FareEstimate> {
  let baseFare: number;
  let driverAllowance: number;
  let nightCharge = 0;

  if (routeId && vehicleCategoryId) {
    const pricing = await getRoutePricing(routeId, vehicleCategoryId);
    if (pricing) {
      // DB pricing: base_price is the fixed base, per_km_rate applied on top if set
      const kmCharge = pricing.per_km_rate
        ? Math.round(distanceKm * pricing.per_km_rate)
        : 0;
      baseFare = Math.round(pricing.base_price) + kmCharge;
      driverAllowance = Math.round(pricing.driver_allowance);

      if (isNightTime(departureIso)) {
        nightCharge = Math.round(baseFare * 0.1); // 10% night surcharge
      }
    } else {
      // Fall back to hardcoded rates
      const rate = FALLBACK_KM_RATES[vehicleSlug] ?? FALLBACK_KM_RATES.sedan;
      baseFare = Math.round(distanceKm * rate);
      driverAllowance = FALLBACK_DRIVER_ALLOWANCE;
    }
  } else {
    const rate = FALLBACK_KM_RATES[vehicleSlug] ?? FALLBACK_KM_RATES.sedan;
    baseFare = Math.round(distanceKm * rate);
    driverAllowance = FALLBACK_DRIVER_ALLOWANCE;
  }

  const toll = Math.round(tollEstimate);
  const subtotal = baseFare + driverAllowance + toll + nightCharge;
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
