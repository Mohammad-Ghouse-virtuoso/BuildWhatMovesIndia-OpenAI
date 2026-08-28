"use client";

import { Button } from "@/components/ui/button";
import { cardMuted, fieldBase, label } from "@/components/ui/styles";

import { saveClarification } from "@/app/(ask)/ask/actions";
import { AiNotice } from "./ai-notice";

interface ClarifyFormProps {
  question: string;
  clarifiedQuestion: string;
  missing: string[];
  usedFallback: boolean;
}

export function ClarifyForm({
  question,
  clarifiedQuestion,
  missing,
  usedFallback,
}: ClarifyFormProps) {
  return (
    <form action={saveClarification} className="space-y-5">
      <input name="question" type="hidden" value={question} />
      <AiNotice />
      {usedFallback ? (
        <p className="text-xs text-ink-muted">
          Using deterministic fallback guidance so the demo keeps moving even if the
          model is unavailable.
        </p>
      ) : null}
      <section className={cardMuted}>
        <p className="text-sm leading-6 text-ink">
          Suggested focus{" "}
          <span className="font-semibold text-civic-800">{clarifiedQuestion}</span>
        </p>
        <p className="mt-2 text-xs leading-5 text-ink-muted">
          Skip anything you do not know — we keep the request records-based.
        </p>
      </section>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-ink">
          Only if you know — skip anything you do not
        </legend>
        <label className={label}>
          {missing[0] ?? "Which road or project?"}
          <input
            className={"mt-2 " + fieldBase}
            name="project"
            placeholder="Optional"
          />
        </label>
        <label className={label}>
          {missing[1] ?? "Which year or period?"}
          <input
            className={"mt-2 " + fieldBase}
            name="period"
            placeholder="Optional"
          />
        </label>
      </fieldset>
      <Button className="w-full sm:w-auto" type="submit">
        Continue to records
      </Button>
    </form>
  );
}
