// Route / city detail page loading skeleton
export default function CabSlugLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse" aria-hidden="true">
      {/* Breadcrumb */}
      <div className="h-4 w-48 rounded bg-muted mb-8" />

      {/* Page title */}
      <div className="h-9 w-72 rounded bg-muted mb-3" />
      <div className="h-5 w-96 rounded bg-muted mb-10" />

      {/* Route cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-5 w-16 rounded bg-muted" />
            </div>
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="flex gap-2 mt-1">
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-20 rounded-full bg-muted" />
            </div>
            <div className="h-11 w-full rounded-full bg-primary/20 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
