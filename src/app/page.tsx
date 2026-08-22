import Link from "next/link";

import { DemoDisclosure } from "@/components/shared/demo-disclosure";
import { PersonaSwitcher } from "@/components/shared/persona-switcher";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      <DemoDisclosure />
      <main className="mx-auto flex min-h-[calc(100vh-33px)] max-w-6xl flex-col justify-center px-4 py-16">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-civic-600">
          Civic Intelligence
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.04em] text-civic-900 sm:text-6xl lg:text-7xl">
          From individual complaints to a city that understands the pattern.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Two experiences, one codebase: a clearer citizen grievance journey and
          a focused municipal operations view, demonstrated with synthetic data.
        </p>
        <div className="mt-10">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Choose a demo persona
          </p>
          <PersonaSwitcher />
        </div>
        <div className="mt-8">
          <Button asChild variant="ghost">
            <Link href="/citizen">Start with the citizen journey →</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
