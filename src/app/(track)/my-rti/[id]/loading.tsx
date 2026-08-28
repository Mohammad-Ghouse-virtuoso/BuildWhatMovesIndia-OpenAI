export default function TrackSegmentLoading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="rounded-3xl border border-border bg-surface p-6 sm:p-10"
    >
      <p className="text-sm font-semibold text-civic-700">Loading…</p>
      <p className="mt-2 text-sm text-ink-muted">Fetching the demo records.</p>
    </section>
  );
}
