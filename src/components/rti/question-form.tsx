"use client";

import { Button } from "@/components/ui/button";

import { startClarify } from "@/app/(ask)/ask/actions";
import { EXAMPLE_PROMPTS } from "./copy";

interface QuestionFormProps {
  defaultQuestion?: string;
}

export function QuestionForm({ defaultQuestion = "" }: QuestionFormProps) {
  return (
    <form action={startClarify} className="space-y-4">
      <label className="block text-sm font-semibold text-ink" htmlFor="question">
        Your question
      </label>
      <textarea
        className="min-h-32 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-700"
        defaultValue={defaultQuestion}
        id="question"
        name="question"
        placeholder="Tell us what you are trying to find out..."
        required
      />
      <Button className="w-full sm:w-auto" type="submit">
        Continue
      </Button>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Example prompts
        </p>
        <ul className="flex flex-col gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <li key={prompt}>
              <a
                className="block rounded-2xl border border-civic-100 bg-civic-50 px-4 py-3 text-sm text-ink transition-colors hover:bg-civic-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-700"
                href={`/ask?q=${encodeURIComponent(prompt)}`}
              >
                {prompt}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
