import Link from "next/link";
import { notFound } from "next/navigation";

import { STATUS_LABEL, formatIst } from "@/components/rti/copy";
import { RouteShell } from "@/components/shared/route-shell";
import { Button } from "@/components/ui/button";
import { rti } from "@/lib/rti/server";

export default async function SubmittedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await rti().getRequest(id);
  if (!request) {
    notFound();
  }

  return (
    <RouteShell
      eyebrow="Demo filing"
      title="RTI submitted (simulated)"
      description="This registration exists only in the Ask India demo. It was not filed with Government of India."
    >
      <p className="text-sm font-semibold text-ink-muted">Registration number</p>
      <p className="mt-1 break-all font-mono text-lg font-bold text-ink">
        {request.registrationNumber ?? "Pending DEMO number"}
      </p>
      <p className="mt-4 text-sm text-ink-muted">
        Recorded {formatIst(request.submittedAt)} · {STATUS_LABEL[request.status]}
      </p>
      <p className="mt-2 text-xs text-ink-muted">{request.responseDueDisclaimer}</p>
      <Button asChild className="mt-8 w-full sm:w-auto">
        <Link href={`/my-rti/${request.id}`}>Track this request</Link>
      </Button>
    </RouteShell>
  );
}
