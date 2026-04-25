// Car selection loading skeleton
export default function BookLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse" aria-hidden="true">
      {/* Route summary bar */}
      <div className="h-14 w-full rounded-xl bg-muted mb-8" />

      {/* Section heading */}
      <div className="h-7 w-48 rounded bg-muted mb-6" />

      {/* Vehicle cards */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex gap-4">
            {/* Vehicle image placeholder */}
            <div className="w-24 h-16 rounded-lg bg-muted flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-5 w-1/2 rounded bg-muted" />
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-6 w-20 rounded bg-muted" />
              <div className="h-10 w-24 rounded-full bg-primary/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
