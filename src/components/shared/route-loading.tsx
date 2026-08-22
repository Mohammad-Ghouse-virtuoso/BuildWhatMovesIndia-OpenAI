export function RouteLoading() {
  return (
    <div
      aria-label="Loading view"
      className="animate-pulse rounded-3xl border border-civic-100 bg-white p-8"
      role="status"
    >
      <div className="h-3 w-28 rounded bg-civic-100" />
      <div className="mt-6 h-10 max-w-xl rounded bg-civic-100" />
      <div className="mt-4 h-5 max-w-2xl rounded bg-slate-100" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
