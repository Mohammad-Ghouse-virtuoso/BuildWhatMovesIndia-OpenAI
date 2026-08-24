"use client";

import { Button } from "@/components/ui/button";

import { saveDraft } from "@/app/(ask)/ask/actions";
import { AiNotice } from "./ai-notice";

interface DraftFormProps {
  id: string;
  draftText: string;
  whyStronger: string;
}

export function DraftForm({ id, draftText, whyStronger }: DraftFormProps) {
  return (
    <form action={saveDraft} className="space-y-5">
      <input name="id" type="hidden" value={id} />
      <AiNotice />
      <label className="block text-sm font-semibold text-slate-700" htmlFor="draftText">
        Information requested
      </label>
      <textarea
        className="min-h-64 w-full rounded-2xl border border-civic-200 px-4 py-3 text-sm leading-6"
        defaultValue={draftText}
        id="draftText"
        name="draftText"
        required
      />
      <section className="rounded-2xl bg-civic-50 p-4">
        <h2 className="text-sm font-bold text-civic-900">Why this request is stronger</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">{whyStronger}</p>
      </section>
      <Button className="w-full sm:w-auto" type="submit">
        Continue to review
      </Button>
    </form>
  );
}
