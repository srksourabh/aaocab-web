import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getBooking } from "@/lib/booking";
import { getDriverById, getVehicleById } from "@/lib/drivers";
import ReviewFormClient from "./ReviewFormClient";

export const metadata: Metadata = {
  title: "Rate Your Trip — AaoCab",
  description: "Share your experience and help us improve AaoCab for everyone.",
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  let booking = null;
  try {
    booking = await getBooking(bookingId);
  } catch {
    notFound();
  }

  if (!booking) notFound();

  // Trip must be completed to review
  if (booking.status !== "completed") {
    const fromCity = booking.pickup_location?.city ?? "Pickup";
    const toCity = booking.drop_location?.city ?? "Drop";

    return (
      <ReviewPageShell>
        <div className="flex flex-col items-center text-center py-12 space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <CheckCircle2 size={32} className="text-muted-foreground" />
          </div>
          <h1 className="font-heading font-bold text-xl text-foreground">
            Trip not yet completed
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            You can leave a review for your {fromCity} → {toCity} trip once it
            is completed.
          </p>
          <Link
            href={`/track/${bookingId}`}
            className="mt-2 text-sm font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Track your trip
          </Link>
        </div>
      </ReviewPageShell>
    );
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id, rating, review_text, ai_categories, created_at")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (existingReview) {
    return (
      <ReviewPageShell>
        <ExistingReview review={existingReview} />
      </ReviewPageShell>
    );
  }

  // Fetch driver and vehicle for display
  let driver = null;
  let vehicle = null;

  if (booking.assigned_driver_id) {
    try {
      driver = await getDriverById(booking.assigned_driver_id);
    } catch {
      // Graceful fallback
    }
  }

  if (booking.assigned_vehicle_id) {
    try {
      vehicle = await getVehicleById(booking.assigned_vehicle_id);
    } catch {
      // Graceful fallback
    }
  }

  const fromCity = booking.pickup_location?.city ?? "Pickup";
  const toCity = booking.drop_location?.city ?? "Drop";
  const routeKey = `${fromCity.toLowerCase().replace(/\s+/g, "-")}-to-${toCity.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <ReviewPageShell>
      <div className="space-y-2 mb-6">
        <h1 className="font-heading font-bold text-2xl text-foreground">
          Rate your trip
        </h1>
        <p className="text-sm text-muted-foreground">
          {fromCity} → {toCity}
        </p>
      </div>
      <ReviewFormClient
        bookingId={bookingId}
        customerId={booking.customer_id ?? null}
        driverId={booking.assigned_driver_id ?? null}
        routeKey={routeKey}
        driver={driver}
        vehicle={vehicle}
      />
    </ReviewPageShell>
  );
}

// --- Shared shell with minimal header ---
function ReviewPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-2xl mx-auto px-4 flex items-center h-14">
          <Link
            href="/"
            className="font-heading font-bold text-xl text-primary tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            aria-label="AaoCab Home"
          >
            AaoCab
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      </main>

      <footer className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link
            href="/"
            className="font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            AaoCab
          </Link>
        </p>
      </footer>
    </div>
  );
}

// --- Already reviewed state ---
function ExistingReview({
  review,
}: {
  review: {
    rating: number;
    review_text: string | null;
    ai_categories: string[] | null;
    created_at: string;
  };
}) {
  const stars = Array.from({ length: 5 }).map((_, i) => i < review.rating);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-3 py-4">
        <CheckCircle2 size={48} className="text-[#059652]" />
        <h1 className="font-heading font-bold text-xl text-foreground">
          Thank you for your review!
        </h1>
        <p className="text-sm text-muted-foreground">
          You already submitted feedback for this trip.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-1">
          {stars.map((filled, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`text-lg ${filled ? "text-[#F59E0B]" : "text-[#E2E8F0]"}`}
            >
              ★
            </span>
          ))}
          <span className="ml-1 text-sm text-muted-foreground">
            {review.rating} / 5
          </span>
        </div>

        {review.ai_categories && review.ai_categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.ai_categories.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {review.review_text && (
          <p className="text-sm text-foreground">{review.review_text}</p>
        )}
      </div>
    </div>
  );
}
