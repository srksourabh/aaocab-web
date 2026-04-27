import { type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }
  return createClient(url, key);
}

interface AggregateReviewsRequest {
  driver_id: string;
}

interface AggregateReviewsResponse {
  driver_id: string;
  average_rating: number;
  total_trips: number;
  top_categories: string[];
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: AggregateReviewsRequest;
  try {
    body = await request.json();
  } catch {
    const err: ErrorResponse = { error: "Invalid JSON body" };
    return Response.json(err, { status: 400 });
  }

  const { driver_id } = body;
  if (!driver_id) {
    const err: ErrorResponse = { error: "driver_id is required" };
    return Response.json(err, { status: 400 });
  }

  const supabase = getSupabaseClient();

  // Fetch all reviews for this driver
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("rating, ai_categories")
    .eq("driver_id", driver_id);

  if (reviewsError) {
    const err: ErrorResponse = { error: "Failed to fetch reviews" };
    return Response.json(err, { status: 500 });
  }

  const reviewList = reviews ?? [];
  const totalTrips = reviewList.length;

  // Calculate average rating
  const averageRating =
    totalTrips > 0
      ? Math.round(
          (reviewList.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
            totalTrips) *
            10
        ) / 10
      : 0;

  // Tally categories across all reviews to find the most common ones
  const categoryCount: Record<string, number> = {};
  for (const review of reviewList) {
    const cats = review.ai_categories;
    if (Array.isArray(cats)) {
      for (const cat of cats as string[]) {
        if (typeof cat === "string") {
          categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
        }
      }
    }
  }

  // Sort categories by frequency and take top 5
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([cat]) => cat);

  // Update driver record with aggregated stats
  const { error: updateError } = await supabase
    .from("drivers")
    .update({
      overall_rating: averageRating,
      total_trips: totalTrips,
      updated_at: new Date().toISOString(),
    })
    .eq("id", driver_id);

  if (updateError) {
    const err: ErrorResponse = { error: "Failed to update driver stats" };
    return Response.json(err, { status: 500 });
  }

  const result: AggregateReviewsResponse = {
    driver_id,
    average_rating: averageRating,
    total_trips: totalTrips,
    top_categories: topCategories,
  };
  return Response.json(result);
}
