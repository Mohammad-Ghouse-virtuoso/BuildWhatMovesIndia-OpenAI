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
        <p className="text-sm text-slate-600">No requests yet. Start from Ask.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                className="block rounded-2xl border border-civic-100 bg-white p-4"
                href={`/my-rti/${request.id}`}
              >
                <p className="font-mono text-sm font-semibold text-civic-900">
                  {request.registrationNumber ?? "Draft · no DEMO number yet"}
                </p>
                <p className="mt-1 text-sm text-slate-600">{request.originalQuestion}</p>
                <p className="mt-2 text-xs text-slate-500">
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
