"use client";

import { Button } from "@/components/ui/button";

interface RouteErrorProps {
  reset: () => void;
}

export function RouteError({ reset }: RouteErrorProps) {
  return (
    <section
      className="rounded-3xl border border-red-100 bg-white p-8"
      role="alert"
    >
      <p className="text-sm font-bold text-red-700">This view could not load.</p>
      <p className="mt-2 text-sm text-slate-600">
        Your demo data has not been changed. Retry the view to continue.
      </p>
      <Button className="mt-6" onClick={reset} variant="secondary">
        Try again
      </Button>
    </section>
  );
}
