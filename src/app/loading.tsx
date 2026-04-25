// Homepage loading skeleton — shown while the server renders the page
export default function HomeLoading() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-b from-[var(--primary-light)] to-background px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="h-10 w-2/3 rounded-lg bg-muted" />
          <div className="h-6 w-1/2 rounded-lg bg-muted" />
          <div className="h-14 w-full max-w-xl rounded-2xl bg-muted mt-4" />
          <div className="h-12 w-40 rounded-full bg-primary/20" />
        </div>
      </div>

      {/* Trust strip skeleton */}
      <div className="bg-muted py-4 px-4">
        <div className="max-w-7xl mx-auto flex justify-center gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-32 rounded bg-background" />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
