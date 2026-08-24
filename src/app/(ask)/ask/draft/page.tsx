import { notFound, redirect } from "next/navigation";

import { DraftForm } from "@/components/rti/draft-form";
import { WizardSteps } from "@/components/rti/wizard-steps";
import { RouteShell } from "@/components/shared/route-shell";
import { explainWhyStronger } from "@/lib/rti/ai/service";
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

  const whyStronger = await explainWhyStronger({
    question: request.originalQuestion,
    clarifiedQuestion: request.clarifiedQuestion,
    clarifications: [],
    selectedCategoryIds: request.informationCategories,
    draftText: request.draftText,
  });

  return (
    <RouteShell
      eyebrow="Step 4 · Draft"
      title="Your RTI request, in records language"
      description="Edit freely. Ask for documents, not opinions."
    >
      <WizardSteps current="Draft" />
      <DraftForm
        draftText={request.draftText}
        id={request.id}
        whyStronger={whyStronger.explanation}
      />
    </RouteShell>
  );
}
