import Link from "next/link";

import { DemoDisclosure } from "@/components/shared/demo-disclosure";
import { Button } from "@/components/ui/button";
import { PRODUCT_NAME, TAGLINE } from "@/lib/brand";

const claimCards = [
  "They said the road cost ₹2 crore. Where did the money go?",
  "Who won the contract for this project?",
  "How many people were actually hired?",
] as const;

export default function Home() {
  return (
    <div className="min-h-screen">
      <DemoDisclosure />
      <main className="mx-auto flex min-h-[calc(100vh-33px)] max-w-6xl flex-col justify-center px-4 py-16">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-civic-600">
          {PRODUCT_NAME}
        </p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.04em] text-civic-900 sm:text-6xl lg:text-7xl">
          {TAGLINE}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Start with a question. We help you turn it into a precise RTI records
          request for a Central public authority. This prototype uses synthetic
          data and does not file with the government.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/ask">Ask a question</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/my-rti">Track an RTI</Link>
          </Button>
        </div>
        <p className="mt-10 text-sm font-semibold text-slate-700">Heard a claim?</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {claimCards.map((claim) => (
            <li key={claim}>
              <Link
                className="block rounded-2xl border border-civic-100 bg-white p-4 text-sm leading-6 text-slate-700 hover:border-civic-200"
                href="/ask"
              >
                {claim}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-slate-500">
          Continue as demo citizen · No login · Central authorities only
        </p>
      </main>
    </div>
  );
}
