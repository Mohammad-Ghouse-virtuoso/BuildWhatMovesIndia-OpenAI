import { notFound, redirect } from "next/navigation";

import { InformationForm } from "@/components/rti/information-form";
import { WizardSteps } from "@/components/rti/wizard-steps";
import { RouteShell } from "@/components/shared/route-shell";
import { rti } from "@/lib/rti/server";

export default async function InformationPage({
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
      eyebrow="Step 3 · Records"
      title="To answer this, we can ask for"
      description="Remove anything you do not need. These are record types, not accusations."
    >
      <WizardSteps current="Records" />
      <InformationForm id={request.id} selected={request.informationCategories} />
    </RouteShell>
  );
}
