import Link from "next/link";
import { notFound } from "next/navigation";

import { STATUS_LABEL, formatIst } from "@/components/rti/copy";
import { Timeline } from "@/components/rti/timeline";
import { RouteShell } from "@/components/shared/route-shell";
import { Button } from "@/components/ui/button";
import { loadEvents, rti } from "@/lib/rti/server";

export default async function RtiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await rti().getRequest(id);
  if (!request) {
    notFound();
  }
  const events = await loadEvents(id);
  const canOpenResponse = [
    "response_ready",
    "response_received",
    "appeal_prepared",
    "appeal_submitted",
  ].includes(request.status);

  return (
    <RouteShell
      eyebrow="Timeline"
      title={request.registrationNumber ?? "Draft request"}
      description={request.originalQuestion}
    >
      <p className="mb-6 text-sm text-ink-muted">
        {STATUS_LABEL[request.status]}
        {request.submittedAt ? ` · filed ${formatIst(request.submittedAt)}` : ""}
      </p>
      <Timeline current={request.status} events={events} />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {canOpenResponse ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/my-rti/${request.id}/response`}>View response</Link>
          </Button>
        ) : null}
        <Button asChild className="w-full sm:w-auto" variant="secondary">
          <Link href={`/my-rti/${request.id}/appeal`}>First appeal</Link>
        </Button>
      </div>
    </RouteShell>
  );
}
