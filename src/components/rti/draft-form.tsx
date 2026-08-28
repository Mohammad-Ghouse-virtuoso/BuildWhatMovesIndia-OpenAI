"use client";

import { Button } from "@/components/ui/button";
import { cardMuted, label, sectionTitle, textareaBase } from "@/components/ui/styles";

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
      <label className={label} htmlFor="draftText">
        Information requested
      </label>
      <textarea
        className={textareaBase + " min-h-64 text-sm leading-6"}
        defaultValue={draftText}
        id="draftText"
        name="draftText"
        required
      />
      <section className={cardMuted}>
        <h2 className={sectionTitle}>Why this request is stronger</h2>
        <p className="mt-2 text-sm leading-6 text-ink">{whyStronger}</p>
      </section>
      <Button className="w-full sm:w-auto" type="submit">
        Continue to review
      </Button>
    </form>
  );
}
