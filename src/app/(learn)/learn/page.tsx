import { RouteShell } from "@/components/shared/route-shell";

export default function LearnPage() {
  return (
    <RouteShell
      eyebrow="Learn"
      title="RTI, without the portal maze"
      description="Right to Information lets you request existing records from a public authority. This prototype is for Central public authorities only — not State RTI portals."
    >
      <div className="space-y-4 text-sm leading-6 text-slate-700">
        <p>
          You can ask for records that already exist: sanctions, work orders, expenditure
          statements, completion certificates, inspection reports, appointment lists.
        </p>
        <p>
          You cannot use RTI to demand an opinion, an investigation, or a new document to
          be created. Ask India helps you turn a question into a records list. It does not
          give legal advice.
        </p>
        <p>
          This demo never files with Government of India. Registration numbers use a DEMO
          prefix. Nothing here is the official RTI Online service, and any AI draft or
          summary is assistive only.
        </p>
      </div>
    </RouteShell>
  );
}
