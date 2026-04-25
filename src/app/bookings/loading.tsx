// Bookings list loading skeleton
export default function BookingsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse" aria-hidden="true">
      {/* Page heading */}
      <div className="h-8 w-40 rounded bg-muted mb-8" />

      {/* Booking cards */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
