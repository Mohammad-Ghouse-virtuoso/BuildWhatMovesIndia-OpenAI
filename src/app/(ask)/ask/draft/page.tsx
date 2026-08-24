import { notFound, redirect } from "next/navigation";

import { DraftForm } from "@/components/rti/draft-form";
import { WizardSteps } from "@/components/rti/wizard-steps";
import { RouteShell } from "@/components/shared/route-shell";
import { rti } from "@/lib/rti/server";

export default async function DraftPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) {
    redirect("/ask");
  }

  const request = await rti().getRequest(id);
  if (!request) {
    notFound();
  }

  return (
    <RouteShell
      eyebrow="Step 4 · Draft"
      title="Your RTI request, in records language"
      description="Edit freely. Ask for documents, not opinions."
    >
      <WizardSteps current="Draft" />
      <DraftForm draftText={request.draftText} id={request.id} />
    </RouteShell>
  );
}
