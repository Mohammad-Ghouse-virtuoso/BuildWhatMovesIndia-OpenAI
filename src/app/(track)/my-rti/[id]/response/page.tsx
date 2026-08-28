import Link from "next/link";
import { notFound } from "next/navigation";

import { AiNotice } from "@/components/rti/ai-notice";
import { UNANSWERED_COPY, unansweredItems } from "@/components/rti/copy";
import { RouteShell } from "@/components/shared/route-shell";
import { Button } from "@/components/ui/button";
import { summarizeDocuments } from "@/lib/rti/ai/service";
import { rti } from "@/lib/rti/server";

export default async function RtiResponsePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await rti().getResponse(id);
  if (!response) {
    notFound();
  }

  const { request, documents, unansweredItems: adapterUnanswered } = response;
  const missing = adapterUnanswered.length
    ? adapterUnanswered
    : unansweredItems(request.requestedItems);
  const hasResponse = documents.length > 0;
  const summary = hasResponse
    ? await summarizeDocuments({
        documents,
        unansweredItems: missing,
      })
    : null;

  return (
    <RouteShell
      eyebrow="Response"
      title={hasResponse ? "What the records show" : "No response yet"}
      description={
        hasResponse
          ? "Facts below are quoted from synthetic documents. Unanswered items are gaps in those files, not extra facts."
          : "This demo request has no response documents yet. The seeded road project does."
      }
    >
      {!hasResponse ? (
        <p className="text-sm text-ink-muted">
          Status stays on the timeline until a synthetic response is attached.
        </p>
      ) : (
        <>
          <AiNotice />
          {summary ? (
            <section className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-4">
              <div>
                <h2 className="text-sm font-bold text-ink">Summary</h2>
                <p className="mt-2 text-sm leading-6 text-ink">{summary.summary}</p>
              </div>
              {summary.facts.length > 0 ? (
                <ul className="space-y-3">
                  {summary.facts.map((fact) => (
                    <li
                      className="rounded-2xl border border-civic-100 bg-civic-50 p-4 text-sm"
                      key={`${fact.label}-${fact.citation.documentName}-${fact.value}`}
                    >
                      <p className="font-semibold text-ink">
                        {fact.label}: {fact.value}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {fact.citation.documentName}
                      </p>
                      <p className="mt-2 text-ink">"{fact.citation.excerpt}"</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
          <h2 className="mt-6 text-sm font-bold text-ink">Documents</h2>
          <ul className="mt-3 space-y-3">
            {documents.map((document) => (
              <li
                className="rounded-2xl border border-civic-100 bg-civic-50 p-4 text-sm"
                key={document.id}
              >
                <p className="font-semibold text-ink">{document.name}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {document.synthetic ? "Synthetic demo file" : document.type}
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-ink overflow-x-auto">
                  {document.content}
                </pre>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-sm font-bold text-ink">Unanswered</h2>
          {missing.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Every requested item is marked answered.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {missing.map((item) => (
                <li
                  className="rounded-2xl border border-amber-200 bg-sun-100 p-4 text-sm"
                  key={item.id}
                >
                  <p className="font-semibold text-ink">{item.label}</p>
                  <p className="mt-1 text-ink">{UNANSWERED_COPY}</p>
                </li>
              ))}
            </ul>
          )}
          {missing.length > 0 ? (
            <Button asChild className="mt-8 w-full sm:w-auto">
              <Link href={`/my-rti/${request.id}/appeal`}>Prepare first appeal</Link>
            </Button>
          ) : null}
        </>
      )}
    </RouteShell>
  );
}
