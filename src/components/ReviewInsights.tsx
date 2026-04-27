// Positive keywords to scan for in reviews
const POSITIVE_KEYWORDS = [
  "punctual",
  "on time",
  "clean",
  "comfortable",
  "polite",
  "friendly",
  "professional",
  "safe",
  "smooth",
  "excellent",
  "great",
  "good",
] as const;

interface Review {
  rating: number;
  review_text: string;
}

interface ReviewInsightsProps {
  reviews: Review[];
}

function extractTopKeywords(reviews: Review[], maxKeywords = 3): string[] {
  const counts: Record<string, number> = {};

  for (const review of reviews) {
    const lower = review.review_text.toLowerCase();
    for (const kw of POSITIVE_KEYWORDS) {
      if (lower.includes(kw)) {
        counts[kw] = (counts[kw] ?? 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([kw]) => kw);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={i < Math.round(rating) ? "text-amber-400" : "text-muted"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewInsights({ reviews }: ReviewInsightsProps) {
  if (!reviews || reviews.length === 0) return null;

  const totalCount = reviews.length;
  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount;
  const topKeywords = extractTopKeywords(reviews);

  return (
    <div className="rounded-xl border border-border bg-card p-5 mb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Based on {totalCount} review{totalCount !== 1 ? "s" : ""}
      </p>

      <div className="flex flex-wrap items-center gap-4">
        {/* Average rating */}
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-2xl text-foreground">
            {averageRating.toFixed(1)}
          </span>
          <StarRating rating={averageRating} />
        </div>

        {/* Top keywords */}
        {topKeywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Travellers love:
            </span>
            {topKeywords.map((kw) => (
              <span
                key={kw}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#24B7A4]/10 text-[#24B7A4] border border-[#24B7A4]/20"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
