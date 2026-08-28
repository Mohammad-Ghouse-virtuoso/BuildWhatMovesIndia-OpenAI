import Link from "next/link";

import { DEMO_RESPONSE_HREF, STATUS_LABEL, formatIst } from "@/components/rti/copy";
import { RouteShell } from "@/components/shared/route-shell";
import { Button } from "@/components/ui/button";
import { DEMO_USER_ID } from "@/lib/rti/domain/constants";
import { rti } from "@/lib/rti/server";

export default async function MyRtiPage() {
  const requests = await rti().listMyRequests(DEMO_USER_ID);

  return (
    <RouteShell
      eyebrow="My RTIs"
      title="Track synthetic requests"
      description="Continue as the demo citizen. There is no real login. Refresh keeps these rows — they live in the database."
    >
      <Button asChild className="mb-6 w-full sm:w-auto" variant="secondary">
        <Link href={DEMO_RESPONSE_HREF}>Open demo: road project</Link>
      </Button>
      {requests.length === 0 ? (
        <p className="text-sm text-ink-muted">No requests yet. Start from Ask.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                className="block rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-civic-50"
                href={`/my-rti/${request.id}`}
              >
                <p className="font-mono text-sm font-semibold text-ink">
                  {request.registrationNumber ?? "Draft · no DEMO number yet"}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{request.originalQuestion}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  {STATUS_LABEL[request.status]}
                  {request.submittedAt ? ` · ${formatIst(request.submittedAt)}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </RouteShell>
  );
}
