"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import DriverCard, { type DriverInfo, type VehicleInfo } from "@/components/DriverCard";

const CATEGORY_TAGS = [
  "Punctual",
  "Clean Car",
  "Polite Driver",
  "Comfortable",
  "Good AC",
  "Safe Driving",
] as const;

type Category = (typeof CATEGORY_TAGS)[number];

interface Props {
  bookingId: string;
  customerId: string | null;
  driverId: string | null;
  routeKey: string;
  driver?: DriverInfo | null;
  vehicle?: VehicleInfo | null;
}

export default function ReviewFormClient({
  bookingId,
  customerId,
  driverId,
  routeKey,
  driver,
  vehicle,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Category[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function toggleTag(tag: Category) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      customer_id: customerId,
      driver_id: driverId,
      rating,
      review_text: reviewText.trim() || null,
      ai_categories: selectedTags.length > 0 ? selectedTags : null,
      route_key: routeKey,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Could not submit your review. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-12 space-y-4">
        <div className="checkmark-circle" aria-hidden="true">
          <Check size={36} strokeWidth={3} className="text-white" />
        </div>
        <h2 className="font-heading font-bold text-xl text-foreground">
          Thank you for your feedback!
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your review helps us improve and rewards great drivers.
        </p>
        <style>{`
          .checkmark-circle {
            width: 80px;
            height: 80px;
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
        `}</style>
      </div>
    );
  }

  const displayRating = hovered || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Driver card (read-only) */}
      {driver && vehicle && (
        <div className="space-y-2">
          <p className="font-heading font-semibold text-foreground text-sm">
            Rate your driver
          </p>
          <DriverCard driver={driver} vehicle={vehicle} hideCallButton />
        </div>
      )}

      {/* Star rating */}
      <div className="space-y-2">
        <p className="font-heading font-semibold text-foreground">
          How was your trip?
        </p>
        <div
          className="flex items-center gap-2"
          role="radiogroup"
          aria-label="Star rating"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <Star
                size={36}
                className={
                  star <= displayRating
                    ? "text-[#F59E0B] fill-[#F59E0B]"
                    : "text-[#E2E8F0] fill-[#E2E8F0]"
                }
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-muted-foreground">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </p>
        )}
      </div>

      {/* Category tags */}
      <div className="space-y-3">
        <p className="font-heading font-semibold text-foreground">
          What went well?{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (optional)
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[44px] ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Text review */}
      <div className="space-y-2">
        <label
          htmlFor="review-text"
          className="font-heading font-semibold text-foreground"
        >
          Anything else?{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <textarea
          id="review-text"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Tell us about your experience..."
          rows={4}
          maxLength={500}
          className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-background resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground text-right">
          {reviewText.length}/500
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-12 bg-primary text-white font-semibold text-sm rounded-[40px] hover:bg-primary/90 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
