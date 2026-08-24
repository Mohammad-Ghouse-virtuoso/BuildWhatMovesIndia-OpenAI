"use client";

import { Button } from "@/components/ui/button";

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
        <p className="text-xs text-slate-500">
          Using deterministic fallback guidance so the demo keeps moving even if the
          model is unavailable.
        </p>
      ) : null}
      <p className="text-sm leading-6 text-slate-600">
        I can help turn this into a records request. Suggested focus:{" "}
        <span className="font-medium text-civic-900">{clarifiedQuestion}</span>
      </p>
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-civic-900">
          Only if you know — skip anything you do not
        </legend>
        <label className="block text-sm font-medium text-slate-700">
          {missing[0] ?? "Which road or project?"}
          <input
            className="mt-2 w-full rounded-2xl border border-civic-200 px-4 py-3 text-base"
            name="project"
            placeholder="Optional"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          {missing[1] ?? "Which year or period?"}
          <input
            className="mt-2 w-full rounded-2xl border border-civic-200 px-4 py-3 text-base"
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
