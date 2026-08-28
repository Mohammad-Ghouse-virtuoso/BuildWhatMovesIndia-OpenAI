"use client";

import { Button } from "@/components/ui/button";
import { card, helpText, label, selectBase, textareaBase, sectionTitle } from "@/components/ui/styles";

import { fileRequest } from "@/app/(ask)/ask/actions";
import type { PublicAuthorityDto } from "@/lib/rti/contracts/dtos";
import { RTI_APPLICATION_FEE_INR } from "@/lib/rti/domain/constants";
import { DEMO_CITIZEN } from "@/lib/rti/seed/dataset";

interface ReviewFormProps {
  id: string;
  draftText: string;
  authorityId: string;
  authorities: PublicAuthorityDto[];
}

export function ReviewForm({
  id,
  draftText,
  authorityId,
  authorities,
}: ReviewFormProps) {
  return (
    <form action={fileRequest} className="space-y-5">
      <input name="id" type="hidden" value={id} />
      <label className={label}>
        Public authority
        <select
          className={"mt-2 " + selectBase}
          defaultValue={authorityId}
          name="authorityId"
        >
          {authorities.map((authority) => (
            <option key={authority.id} value={authority.id}>
              {authority.name}
              {authority.isDemo ? " (demo)" : ""}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Information requested
        <textarea
          className={"mt-2 min-h-48 " + textareaBase + " text-sm leading-6"}
          defaultValue={draftText}
          name="draftText"
        />
      </label>
      <section className={card + " text-sm"}>
        <h2 className={sectionTitle}>Applicant (mocked)</h2>
        <p className="mt-2 text-ink">{DEMO_CITIZEN.name}</p>
        <p className="text-ink-muted">{DEMO_CITIZEN.email}</p>
        <p className="text-ink-muted">{DEMO_CITIZEN.phone}</p>
      </section>
      <section className={card + " text-sm"}>
        <h2 className={sectionTitle}>Fee (mocked)</h2>
        <p className="mt-2 text-ink">₹{RTI_APPLICATION_FEE_INR} application fee</p>
        <p className="mt-1 text-xs text-ink-muted">No payment is collected in this prototype.</p>
      </section>
      <p className={"text-xs leading-5 " + helpText}>
        Central public authorities only. Filing here is simulated. Nothing is sent to
        Government of India.
      </p>
      <Button className="w-full sm:w-auto" type="submit">
        File this demo RTI
      </Button>
    </form>
  );
}
