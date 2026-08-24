import { notFound, redirect } from "next/navigation";

import { ReviewForm } from "@/components/rti/review-form";
import { WizardSteps } from "@/components/rti/wizard-steps";
import { RouteShell } from "@/components/shared/route-shell";
import { rti } from "@/lib/rti/server";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) {
    redirect("/ask");
  }

  const [request, authorities] = await Promise.all([
    rti().getRequest(id),
    rti().listAuthorities(),
  ]);
  if (!request) {
    notFound();
  }

  return (
    <RouteShell
      eyebrow="Step 5 · Review"
      title="Review your RTI"
      description="Check the authority, the request, and the mocked fee. Filing is simulated."
    >
      <WizardSteps current="Review" />
      <ReviewForm
        authorities={authorities}
        authorityId={request.authorityId}
        draftText={request.draftText}
        id={request.id}
      />
    </RouteShell>
  );
}
