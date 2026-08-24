"use client";

import { Button } from "@/components/ui/button";

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
      <label className="block text-sm font-semibold text-slate-700">
        Public authority
        <select
          className="mt-2 w-full rounded-2xl border border-civic-200 px-4 py-3 text-sm"
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
      <label className="block text-sm font-semibold text-slate-700">
        Information requested
        <textarea
          className="mt-2 min-h-48 w-full rounded-2xl border border-civic-200 px-4 py-3 text-sm leading-6"
          defaultValue={draftText}
          name="draftText"
        />
      </label>
      <section className="rounded-2xl border border-civic-100 p-4 text-sm">
        <h2 className="font-bold text-civic-900">Applicant (mocked)</h2>
        <p className="mt-2 text-slate-700">{DEMO_CITIZEN.name}</p>
        <p className="text-slate-600">{DEMO_CITIZEN.email}</p>
        <p className="text-slate-600">{DEMO_CITIZEN.phone}</p>
      </section>
      <section className="rounded-2xl border border-civic-100 p-4 text-sm">
        <h2 className="font-bold text-civic-900">Fee (mocked)</h2>
        <p className="mt-2 text-slate-700">₹{RTI_APPLICATION_FEE_INR} application fee</p>
        <p className="mt-1 text-xs text-slate-500">No payment is collected in this prototype.</p>
      </section>
      <p className="text-xs leading-5 text-slate-500">
        Central public authorities only. Filing here is simulated. Nothing is sent to
        Government of India.
      </p>
      <Button className="w-full sm:w-auto" type="submit">
        File this demo RTI
      </Button>
    </form>
  );
}
