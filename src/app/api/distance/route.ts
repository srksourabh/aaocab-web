import { type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

interface DistanceResponse {
  distance_km: number;
  duration_minutes: number;
  traffic_duration_minutes: number | null;
}

interface ErrorResponse {
  error: string;
}

// Google Distance Matrix API shapes (subset we use)
interface GoogleDistanceMatrixResponse {
  status: string;
  rows: Array<{
    elements: Array<{
      status: string;
      distance: { value: number };
      duration: { value: number };
      duration_in_traffic?: { value: number };
    }>;
  }>;
}

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;

  const originPlaceId = searchParams.get("origin_place_id");
  const destinationPlaceId = searchParams.get("destination_place_id");
  const originLat = searchParams.get("origin_lat");
  const originLng = searchParams.get("origin_lng");
  const destinationLat = searchParams.get("destination_lat");
  const destinationLng = searchParams.get("destination_lng");
  const departureTime = searchParams.get("departure_time");

  // Build origin/destination strings for Google API
  let originParam: string;
  let destinationParam: string;

  if (originPlaceId && destinationPlaceId) {
    originParam = `place_id:${originPlaceId}`;
    destinationParam = `place_id:${destinationPlaceId}`;
  } else if (originLat && originLng && destinationLat && destinationLng) {
    originParam = `${originLat},${originLng}`;
    destinationParam = `${destinationLat},${destinationLng}`;
  } else {
    const body: ErrorResponse = {
      error:
        "Provide either origin_place_id + destination_place_id or lat/lng pairs",
    };
    return Response.json(body, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    const body: ErrorResponse = { error: "Maps API key not configured" };
    return Response.json(body, { status: 500 });
  }

  // Check Supabase routes cache first (match by place IDs when available)
  if (originPlaceId && destinationPlaceId) {
    const { data: cached } = await supabase
      .from("routes")
      .select("distance_km")
      .eq("origin_place_id", originPlaceId)
      .eq("destination_place_id", destinationPlaceId)
      .maybeSingle();

    if (cached) {
      const body: DistanceResponse = {
        distance_km: cached.distance_km,
        duration_minutes: Math.round((cached.distance_km / 60) * 60), // rough estimate
        traffic_duration_minutes: null,
      };
      return Response.json(body);
    }
  }

  // Build Google API URL
  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json"
  );
  url.searchParams.set("origins", originParam);
  url.searchParams.set("destinations", destinationParam);
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", apiKey);

  if (departureTime) {
    url.searchParams.set("departure_time", departureTime);
    url.searchParams.set("traffic_model", "best_guess");
  }

  let googleData: GoogleDistanceMatrixResponse;

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Google API returned ${response.status}`);
    }
    googleData = (await response.json()) as GoogleDistanceMatrixResponse;
  } catch {
    const body: ErrorResponse = { error: "Failed to reach Google Maps API" };
    return Response.json(body, { status: 500 });
  }

  if (googleData.status !== "OK") {
    const body: ErrorResponse = {
      error: `Google API error: ${googleData.status}`,
    };
    return Response.json(body, { status: 502 });
  }

  const element = googleData.rows[0]?.elements[0];
  if (!element || element.status !== "OK") {
    const body: ErrorResponse = {
      error: `Route element error: ${element?.status ?? "UNKNOWN"}`,
    };
    return Response.json(body, { status: 404 });
  }

  const distanceKm = Math.round(element.distance.value / 100) / 10; // metres → km with 1 decimal
  const durationMinutes = Math.round(element.duration.value / 60);
  const trafficDurationMinutes = element.duration_in_traffic
    ? Math.round(element.duration_in_traffic.value / 60)
    : null;

  const body: DistanceResponse = {
    distance_km: distanceKm,
    duration_minutes: durationMinutes,
    traffic_duration_minutes: trafficDurationMinutes,
  };

  return Response.json(body);
}
