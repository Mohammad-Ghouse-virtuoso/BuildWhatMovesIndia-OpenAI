import Link from "next/link";
import { notFound } from "next/navigation";

import { prepareFirstAppeal } from "@/app/(ask)/ask/actions";
import { AiNotice } from "@/components/rti/ai-notice";
import { UNANSWERED_COPY, unansweredItems } from "@/components/rti/copy";
import { RouteShell } from "@/components/shared/route-shell";
import { Button } from "@/components/ui/button";
import { rti } from "@/lib/rti/server";

export default async function RtiAppealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await rti().getResponse(id);
  if (!response) {
    notFound();
  }

  const missing = response.unansweredItems.length
    ? response.unansweredItems
    : unansweredItems(response.request.requestedItems);
  const appeal = response.appeals[0];
  const canPrepare =
    !appeal &&
    missing.length > 0 &&
    (response.request.status === "response_received" ||
      response.request.status === "response_ready");

  return (
    <RouteShell
      eyebrow="First appeal"
      title="Ask again for what was not answered"
      description="This draft is assembled from unanswered items. It is not legal advice and is not filed with a First Appellate Authority."
    >
      <p className="text-sm text-slate-600">
        Original question: {response.request.originalQuestion}
      </p>
      <Link
        className="mt-2 inline-block text-sm font-semibold text-civic-700"
        href={`/my-rti/${id}/response`}
      >
        View response
      </Link>
      <h2 className="mt-6 text-sm font-bold text-civic-900">Still missing</h2>
      {missing.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">
          Nothing is marked unanswered, so a first appeal is not prepared.
        </p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {missing.map((item) => (
            <li key={item.id}>
              {item.label} — {UNANSWERED_COPY}
            </li>
          ))}
        </ul>
      )}
      {appeal ? (
        <section className="mt-6 space-y-3">
          <AiNotice />
          <h2 className="text-sm font-bold text-civic-900">Appeal draft</h2>
          <p className="text-sm text-slate-600">{appeal.reason}</p>
          <pre className="whitespace-pre-wrap rounded-2xl border border-civic-100 bg-civic-50 p-4 font-sans text-sm leading-6 text-slate-700">
            {appeal.draftText}
          </pre>
        </section>
      ) : canPrepare ? (
        <form action={prepareFirstAppeal} className="mt-6">
          <input name="id" type="hidden" value={id} />
          <Button className="w-full sm:w-auto" type="submit">
            Prepare first appeal
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-slate-600">
          A first-appeal draft is available after a response leaves something unanswered.
        </p>
      )}
    </RouteShell>
  );
}
