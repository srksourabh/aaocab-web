import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { estimateFareForVehicle } from "@/lib/seo";

// TODO: Replace mock competitor multipliers with real scraping integration
const COMPETITOR_MULTIPLIERS: Array<{
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

  if (!from || !to) {
    const body: ErrorResponse = {
      error: "Query params 'from' and 'to' are required",
    };
    return Response.json(body, { status: 400 });
  }

  // Resolve city IDs by name (case-insensitive)
  const [{ data: fromCity }, { data: toCity }] = await Promise.all([
    supabase
      .from("cities")
      .select("id")
      .ilike("name", from)
      .single(),
    supabase
      .from("cities")
      .select("id")
      .ilike("name", to)
      .single(),
  ]);

  if (!fromCity || !toCity) {
    const body: ErrorResponse = { error: "One or both cities not found" };
    return Response.json(body, { status: 404 });
  }

  // Look up route by resolved city IDs
  const { data: route } = await supabase
    .from("routes")
    .select("distance_km")
    .eq("from_city_id", fromCity.id)
    .eq("to_city_id", toCity.id)
    .single();

  if (!route) {
    const body: ErrorResponse = { error: "Route not found" };
    return Response.json(body, { status: 404 });
  }

  const aaocabPrice = estimateFareForVehicle(route.distance_km, "sedan");
  const lastUpdated = new Date().toISOString().split("T")[0];

  const competitors = COMPETITOR_MULTIPLIERS.map(({ name, multiplier }) => ({
    name,
    price: Math.round(aaocabPrice * multiplier),
    lastUpdated,
  }));

  const body: PricingResponse = {
    aaocab: aaocabPrice,
    competitors,
  };

  return Response.json(body);
}
