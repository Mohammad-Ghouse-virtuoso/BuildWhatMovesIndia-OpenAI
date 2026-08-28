import type { ReactNode } from "react";

interface RouteShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function RouteShell({
  eyebrow,
  title,
  description,
  children,
}: RouteShellProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-civic-700">
        {eyebrow}
      </p>
      <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">
        {description}
      </p>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}
