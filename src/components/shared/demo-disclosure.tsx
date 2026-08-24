import { DEMO_DISCLOSURE_ITEMS } from "@/lib/brand";

export function DemoDisclosure() {
  return (
    <div
      className="border-b border-amber-200 bg-sun-100 px-4 py-2 text-xs font-semibold text-amber-950"
      role="note"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-2 gap-y-1 text-center">
        {DEMO_DISCLOSURE_ITEMS.map((item, index) => (
          <span key={item}>
            {index > 0 ? <span aria-hidden="true">· </span> : null}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
