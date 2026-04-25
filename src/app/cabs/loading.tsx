// Cabs / cities listing loading skeleton
export default function CabsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 animate-pulse" aria-hidden="true">
      {/* Heading */}
      <div className="mb-10">
        <div className="h-9 w-64 rounded bg-muted mb-3" />
        <div className="h-5 w-96 rounded bg-muted" />
      </div>

      {/* City grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
