import { cn } from "@/lib/utils";

export const label = "block text-sm font-semibold text-ink";
export const helpText = "text-sm leading-6 text-ink-muted";

export const fieldBase = cn(
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base text-ink",
  "outline-none placeholder:text-ink-muted/70",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-700",
  "disabled:cursor-not-allowed disabled:bg-bg disabled:text-ink-muted",
);

export const selectBase = cn(
  fieldBase,
  "appearance-none pr-10 text-sm",
);

export const textareaBase = cn(
  fieldBase,
  "min-h-32 resize-y",
);

export const card = cn(
  "rounded-2xl border border-border bg-surface p-4",
);

export const cardMuted = cn(
  "rounded-2xl border border-civic-100 bg-civic-50 p-4",
);

export const sectionTitle = "text-sm font-bold text-ink";

