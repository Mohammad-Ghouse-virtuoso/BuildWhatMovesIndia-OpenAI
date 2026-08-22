import Link from "next/link";
import type { ReactNode } from "react";

import { DemoDisclosure } from "./demo-disclosure";
import { PersonaSwitcher } from "./persona-switcher";

interface AppShellProps {
  experience: "Citizen" | "Municipal Operations";
  children: ReactNode;
}

export function AppShell({ experience, children }: AppShellProps) {
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
              Civic Intelligence
            </Link>
            <p className="text-xs font-medium text-slate-500">{experience}</p>
          </div>
          <PersonaSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
