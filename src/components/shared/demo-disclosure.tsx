import { DEMO_BANNER } from "@/lib/brand";

export function DemoDisclosure() {
  return (
    <div
      className="border-b border-amber-200 bg-sun-100 px-4 py-2 text-center text-xs font-semibold text-amber-950"
      role="note"
    >
      {DEMO_BANNER}
    </div>
  );
}
