import { ClarifyForm } from "@/components/rti/clarify-form";
import { QuestionForm } from "@/components/rti/question-form";
import { WizardSteps } from "@/components/rti/wizard-steps";
import { RouteShell } from "@/components/shared/route-shell";
import { rti } from "@/lib/rti/server";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const question = q?.trim() ?? "";

  if (!question) {
    return (
      <RouteShell
        eyebrow="Step 1 · Question"
        title="What do you want to know?"
        description="Start with the claim or the records you need. We will turn it into a precise request."
      >
        <WizardSteps current="Question" />
        <QuestionForm defaultQuestion={question} />
      </RouteShell>
    );
  }

  const classified = await rti().classifyQuestion(question);

  return (
    <RouteShell
      eyebrow="Step 2 · Clarify"
      title="A few details will make this request precise"
      description="Skip anything you do not know. We still keep the request records-based."
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
