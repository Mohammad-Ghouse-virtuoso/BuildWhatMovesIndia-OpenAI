import Link from "next/link";

import { AppShell } from "@/components/shared/app-shell";
import { QuestionForm } from "@/components/rti/question-form";
import { CLAIM_CARDS, DEMO_RESPONSE_HREF } from "@/components/rti/copy";
import { Button } from "@/components/ui/button";
import { PRODUCT_NAME, TAGLINE } from "@/lib/brand";

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-civic-700">
          {PRODUCT_NAME}
        </p>
        <h1 className="text-4xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">
          {TAGLINE}
        </h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">
          Ask about public spending, projects, decisions, records and services.
          Central public authorities only. This citizen demo uses synthetic data,
          does not file with Government of India, and is not the official RTI Online
          portal.
        </p>
        <div className="mt-8">
          <QuestionForm />
        </div>
        <p className="mt-10 text-sm font-semibold text-ink">Heard a claim?</p>
        <ul className="mt-3 grid gap-3">
          {CLAIM_CARDS.map((card) => (
            <li key={card.title}>
              <Link
                className="block rounded-2xl border border-border bg-surface p-4 text-sm leading-6 text-ink transition-colors hover:bg-civic-50"
                href={card.href}
              >
                {card.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <Button asChild className="w-full sm:w-auto" variant="secondary">
            <Link href={DEMO_RESPONSE_HREF}>Open demo: road project</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-ink-muted">
          Continue as demo citizen · No login · Track an existing RTI from My RTIs
        </p>
      </div>
    </AppShell>
  );
}
