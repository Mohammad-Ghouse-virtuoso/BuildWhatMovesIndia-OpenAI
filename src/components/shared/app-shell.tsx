import Link from "next/link";
import type { ReactNode } from "react";

import { DemoDisclosure } from "./demo-disclosure";
import { SiteNav } from "./site-nav";
import { PRODUCT_NAME, TAGLINE } from "@/lib/brand";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <DemoDisclosure />
      <header className="border-b border-civic-100 bg-white/90 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              className="text-lg font-bold tracking-tight text-civic-900"
              href="/"
            >
              {PRODUCT_NAME}
            </Link>
            <p className="text-xs font-medium text-slate-500">{TAGLINE}</p>
          </div>
          <SiteNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
