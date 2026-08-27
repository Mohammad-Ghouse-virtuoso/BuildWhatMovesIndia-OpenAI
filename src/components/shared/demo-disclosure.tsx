import { DEMO_DISCLOSURE_ITEMS } from "@/lib/brand";

const DISCLOSURE_LINE = DEMO_DISCLOSURE_ITEMS.join("  ·  ");

export function DemoDisclosure() {
  return (
    <div
      className="border-b border-amber-200 bg-sun-100 py-2 text-xs font-semibold text-amber-950"
      role="note"
    >
      <p className="sr-only">{DISCLOSURE_LINE}</p>
      <div className="overflow-hidden">
        <div className="flex w-max animate-disclosure-marquee hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:overflow-x-auto motion-reduce:justify-center">
          <span className="px-8 whitespace-nowrap" aria-hidden="true">
            {DISCLOSURE_LINE}
          </span>
          <span className="px-8 whitespace-nowrap motion-reduce:hidden" aria-hidden="true">
            {DISCLOSURE_LINE}
          </span>
        </div>
      </div>
    </div>
  );
}
