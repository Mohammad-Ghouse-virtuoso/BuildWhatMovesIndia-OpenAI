import { AI_DRAFT_NOTICE } from "./copy";

export function AiNotice() {
  return (
    <p
      className="rounded-xl border border-amber-200 bg-sun-100 px-3 py-2 text-xs font-semibold text-amber-950"
      role="note"
    >
      {AI_DRAFT_NOTICE}
    </p>
  );
}
