import { redirect } from "next/navigation";

import { ClarifyForm } from "@/components/rti/clarify-form";
import { WizardSteps } from "@/components/rti/wizard-steps";
import { RouteShell } from "@/components/shared/route-shell";
import { rti } from "@/lib/rti/server";

export default async function ClarifyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const question = q?.trim() ?? "";
  if (!question) {
    redirect("/ask");
  }

  const classified = await rti().classifyQuestion(question);

  return (
    <RouteShell
      eyebrow="Step 2 · Clarify"
      title="A few details will make this request precise"
      description="Only the questions that change which records we can ask for."
    >
      <WizardSteps current="Clarify" />
      <ClarifyForm
        clarifiedQuestion={classified.clarifiedQuestion}
        missing={classified.missing}
        question={question}
        usedFallback={classified.usedFallback}
      />
    </RouteShell>
  );
}
