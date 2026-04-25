import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { estimateFareForVehicle } from "@/lib/seo";

// Fallback multipliers used when DB has no competitor prices for a route
const COMPETITOR_FALLBACK_MULTIPLIERS: Array<{
  name: string;
  multiplier: number;
}> = [
  { name: "Savaari", multiplier: 1.1 },
  { name: "Ola Outstation", multiplier: 1.2 },
  { name: "MakeMyTrip", multiplier: 1.15 },
];

interface PricingResponse {
  aaocab: number;
  competitors: Array<{
    name: string;
    price: number;
    lastUpdated: string;
  }>;
}

interface ErrorResponse {
  error: string;
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const vehicleSlug = searchParams.get("vehicle") ?? "sedan";

  if (!from || !to) {
    const body: ErrorResponse = {
      error: "Query params 'from' and 'to' are required",
    };
    return Response.json(body, { status: 400 });
  }

  // Resolve city IDs by name (case-insensitive)
  const [{ data: fromCity }, { data: toCity }] = await Promise.all([
    supabase.from("cities").select("id").ilike("name", from).single(),
    supabase.from("cities").select("id").ilike("name", to).single(),
  ]);

  if (!fromCity || !toCity) {
    const body: ErrorResponse = { error: "One or both cities not found" };
    return Response.json(body, { status: 404 });
  }

  // Look up route by resolved city IDs
  const { data: route } = await supabase
    .from("routes")
    .select("id, distance_km")
    .eq("from_city_id", fromCity.id)
    .eq("to_city_id", toCity.id)
    .single();

  if (!route) {
    const body: ErrorResponse = { error: "Route not found" };
    return Response.json(body, { status: 404 });
  }

  const aaocabPrice = estimateFareForVehicle(route.distance_km, vehicleSlug);
  const today = new Date().toISOString().split("T")[0];

  // Attempt to load competitor prices from route_pricing table
  const { data: vehicleCategory } = await supabase
    .from("vehicle_categories")
    .select("id")
    .eq("slug", vehicleSlug)
    .single();

  let competitors: Array<{ name: string; price: number; lastUpdated: string }>;

  if (vehicleCategory) {
    const { data: routePricing } = await supabase
      .from("route_pricing")
      .select("competitor_savaari, competitor_ola, competitor_makemytrip, last_scraped_at")
      .eq("route_id", route.id)
      .eq("vehicle_category_id", vehicleCategory.id)
      .single();

    if (
      routePricing &&
      (routePricing.competitor_savaari ||
        routePricing.competitor_ola ||
        routePricing.competitor_makemytrip)
    ) {
      // Use real DB competitor prices
      const scraped = routePricing.last_scraped_at
        ? new Date(routePricing.last_scraped_at).toISOString().split("T")[0]
        : today;

      competitors = [
        {
          name: "Savaari",
          price: routePricing.competitor_savaari ?? Math.round(aaocabPrice * 1.1),
          lastUpdated: scraped,
        },
        {
          name: "Ola Outstation",
          price: routePricing.competitor_ola ?? Math.round(aaocabPrice * 1.2),
          lastUpdated: scraped,
        },
        {
          name: "MakeMyTrip",
          price: routePricing.competitor_makemytrip ?? Math.round(aaocabPrice * 1.15),
          lastUpdated: scraped,
        },
      ];
    } else {
      // Fall back to multiplier approach
      competitors = COMPETITOR_FALLBACK_MULTIPLIERS.map(({ name, multiplier }) => ({
        name,
        price: Math.round(aaocabPrice * multiplier),
        lastUpdated: today,
      }));
    }
  } else {
    // No vehicle category found — use multipliers
    competitors = COMPETITOR_FALLBACK_MULTIPLIERS.map(({ name, multiplier }) => ({
      name,
      price: Math.round(aaocabPrice * multiplier),
      lastUpdated: today,
    }));
  }

  const body: PricingResponse = {
    aaocab: aaocabPrice,
    competitors,
  };

  return Response.json(body);
}
