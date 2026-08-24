import {
  DEMO_USER_ID,
  PRIMARY_AUTHORITY_ID,
  PRIMARY_REGISTRATION_NUMBER,
  PRIMARY_REQUEST_ID,
} from "@/lib/rti/domain/constants";
import { EVENT_COPY, statusPathTo, type RtiStatus } from "@/lib/rti/domain/lifecycle";
import { ROAD_PROJECT_CATEGORY_IDS } from "@/lib/rti/contracts/taxonomy";
import type { RequestedItemDto } from "@/lib/rti/contracts/dtos";

const SYNTHETIC_HEADER =
  "SYNTHETIC DEMO DOCUMENT — not a Government of India record.\n\n";

export const DEMO_CITIZEN = {
  id: DEMO_USER_ID,
  name: "Asha Mehra",
  email: "asha.mehra@askindia.example",
  phone: "+91 90000 00001",
  role: "citizen" as const,
};

export const PUBLIC_AUTHORITIES = [
  {
    id: PRIMARY_AUTHORITY_ID,
    name: "National Highways Demonstration Authority",
    description:
      "Fictional central public authority used in this prototype for road-project records.",
    category: "roads",
    isDemo: true as const,
  },
  {
    id: "pa_employment_demo",
    name: "Central Employment Records Bureau (Demo)",
    description: "Fictional central cell for recruitment and appointment records.",
    category: "appointments",
    isDemo: true as const,
  },
  {
    id: "pa_grants_demo",
    name: "Union Grants Documentation Cell (Demo)",
    description: "Fictional central cell for grant sanction and utilisation records.",
    category: "grants",
    isDemo: true as const,
  },
  {
    id: "pa_procurement_demo",
    name: "National Procurement Records Office (Demo)",
    description: "Fictional central office for tender and work-order records.",
    category: "procurement",
    isDemo: true as const,
  },
  {
    id: "pa_education_works_demo",
    name: "Central Education Works Desk (Demo)",
    description: "Fictional central desk for school infrastructure records.",
    category: "education",
    isDemo: true as const,
  },
] as const;

export const PRIMARY_REQUESTED_ITEMS: RequestedItemDto[] = [
  {
    id: "item_sanction",
    categoryId: "funding.sanctioned_amount",
    label: "Certified copy of the administrative sanction for the project",
    answered: true,
  },
  {
    id: "item_revised",
    categoryId: "funding.revised_sanction",
    label: "The sanctioned amount and any revised sanctioned amount",
    answered: true,
  },
  {
    id: "item_expenditure",
    categoryId: "funding.actual_expenditure",
    label: "The actual expenditure incurred against the project",
    answered: true,
  },
  {
    id: "item_work_order",
    categoryId: "procurement.work_order",
    label: "Copy of the relevant work order",
    answered: true,
  },
  {
    id: "item_contractor",
    categoryId: "procurement.contractor_name",
    label: "Name of the contractor/agency awarded the work",
    answered: true,
  },
  {
    id: "item_dates",
    categoryId: "execution.completion_date",
    label: "Recorded start and completion dates",
    answered: true,
  },
  {
    id: "item_completion",
    categoryId: "execution.completion_certificate",
    label: "Copy of the completion certificate, if issued",
    answered: true,
  },
  {
    id: "item_inspection",
    categoryId: "execution.inspection_report",
    label: "Copy of the inspection report(s), if available",
    answered: false,
  },
];

export const PRIMARY_UNANSWERED_COUNT = PRIMARY_REQUESTED_ITEMS.filter(
  (item) => !item.answered,
).length;

type SeedEvent = {
  id: string;
  type: RtiStatus;
  description: string;
  timestamp: Date;
};

type SeedDocument = {
  id: string;
  name: string;
  type: string;
  content: string;
  synthetic: true;
};

type SeedAppeal = {
  id: string;
  reason: string;
  draftText: string;
  status: "prepared" | "submitted";
  createdAt: Date;
};

export type SeedRequest = {
  id: string;
  registrationNumber: string | null;
  authorityId: string;
  originalQuestion: string;
  clarifiedQuestion: string;
  draftText: string;
  status: RtiStatus;
  informationCategories: string[];
  requestedItems: RequestedItemDto[];
  createdAt: Date;
  submittedAt: Date | null;
  responseDueAt: Date | null;
  events: SeedEvent[];
  documents: SeedDocument[];
  appeals: SeedAppeal[];
};

const t = (iso: string) => new Date(iso);

function eventsFor(requestId: string, status: RtiStatus, start: Date): SeedEvent[] {
  return statusPathTo(status).map((type, index) => ({
    id: `evt_${requestId}_${type}`,
    type,
    description: EVENT_COPY[type],
    timestamp: new Date(start.getTime() + index * 86_400_000),
  }));
}

function dueDate(submittedAt: Date | null): Date | null {
  if (!submittedAt) {
    return null;
  }

  return new Date(submittedAt.getTime() + 30 * 86_400_000);
}

const PRIMARY_DRAFT = `Please provide certified copies / extracts of records relating to the fictional “Town Link Road – Demonstration Stretch” (financial year 2024–25):

1. Administrative sanction for the project.
2. Sanctioned amount and any revised sanctioned amount.
3. Actual expenditure incurred.
4. The work order.
5. Name of the contractor/agency awarded the work.
6. Recorded start and completion dates.
7. Completion certificate, if issued.
8. Inspection report(s), if available.

This is a records request in a synthetic demo. It is not filed with Government of India.`;

function doc(id: string, name: string, type: string, body: string): SeedDocument {
  return {
    id,
    name,
    type,
    synthetic: true,
    content: `${SYNTHETIC_HEADER}${body}`,
  };
}

function request(partial: Omit<SeedRequest, "events" | "documents" | "appeals" | "responseDueAt" | "submittedAt"> & {
  submittedAt?: Date | null;
  documents?: SeedDocument[];
  appeals?: SeedAppeal[];
}): SeedRequest {
  const submittedAt =
    partial.submittedAt ??
    (partial.status === "drafted" ? null : partial.createdAt);
  return {
    ...partial,
    submittedAt,
    responseDueAt: dueDate(submittedAt),
    events: eventsFor(partial.id, partial.status, partial.createdAt),
    documents: partial.documents ?? [],
    appeals: partial.appeals ?? [],
  };
}

export const SEED_REQUESTS: SeedRequest[] = [
  request({
    id: PRIMARY_REQUEST_ID,
    registrationNumber: PRIMARY_REGISTRATION_NUMBER,
    authorityId: PRIMARY_AUTHORITY_ID,
    originalQuestion:
      "They said the road near my town cost ₹2 crore. Where did the money go?",
    clarifiedQuestion:
      "How public funds allocated to the Town Link Road demonstration stretch were sanctioned, spent and documented.",
    draftText: PRIMARY_DRAFT,
    status: "appeal_prepared",
    informationCategories: [...ROAD_PROJECT_CATEGORY_IDS],
    requestedItems: PRIMARY_REQUESTED_ITEMS,
    createdAt: t("2026-03-02T04:30:00.000Z"),
    submittedAt: t("2026-03-03T04:30:00.000Z"),
    documents: [
      doc(
        "doc_road_sanction",
        "Administrative sanction (synthetic)",
        "sanction",
        "Project: Town Link Road – Demonstration Stretch\nSanctioned amount: ₹2,00,00,000\nFinancial year: 2024–25\nAuthority: National Highways Demonstration Authority (fictional).",
      ),
      doc(
        "doc_road_work_order",
        "Work order (synthetic)",
        "work_order",
        "Work order no. WO-DEMO-118\nAgency: Kaveri Bund Demo Contractors\nAwarded value: ₹1,94,00,000",
      ),
      doc(
        "doc_road_expenditure",
        "Expenditure statement (synthetic)",
        "expenditure",
        "Expenditure booked: ₹1,87,40,000\nUnspent vs sanction: ₹12,60,000\nFigures are invented for this prototype.",
      ),
      doc(
        "doc_road_completion",
        "Completion certificate (synthetic)",
        "completion_certificate",
        "Recorded start: 2024-06-01\nRecorded completion: 2025-01-18\nCertificate issued in this demo dataset only.",
      ),
    ],
    appeals: [
      {
        id: "appeal_road_004281",
        status: "prepared",
        createdAt: t("2026-04-20T04:30:00.000Z"),
        reason:
          "The inspection report(s) requested in item 8 were not supplied in the synthetic response.",
        draftText: `First appeal draft (synthetic, not filed).

Registration: ${PRIMARY_REGISTRATION_NUMBER}

The response provided sanction, work order, expenditure and completion records. It did not include inspection report(s), which were specifically requested.

I request that the missing inspection report(s) be supplied, or a record stating that none exist.

This draft is for the Ask India demo. It is not an appeal to a real First Appellate Authority.`,
      },
    ],
  }),
  request({
    id: "req_draft_school",
    registrationNumber: null,
    authorityId: "pa_education_works_demo",
    originalQuestion: "What was sanctioned for the school building?",
    clarifiedQuestion:
      "What administrative sanction and expenditure records exist for a school building project.",
    draftText: "Draft only. Not submitted.",
    status: "drafted",
    informationCategories: ["funding.sanctioned_amount", "funding.actual_expenditure"],
    requestedItems: [],
    createdAt: t("2026-06-01T04:30:00.000Z"),
    submittedAt: null,
  }),
  request({
    id: "req_submitted_grants",
    registrationNumber: "DEMO/RTI/2026/004270",
    authorityId: "pa_grants_demo",
    originalQuestion: "Who received the grant last year?",
    clarifiedQuestion: "Which records list grant recipients for the stated year.",
    draftText: "Request for the grant recipient list (synthetic draft).",
    status: "submitted",
    informationCategories: ["funding.sanctioned_amount", "payments.payment_records"],
    requestedItems: [],
    createdAt: t("2026-05-10T04:30:00.000Z"),
  }),
  request({
    id: "req_received_tender",
    registrationNumber: "DEMO/RTI/2026/004271",
    authorityId: "pa_procurement_demo",
    originalQuestion: "Who received the contract for this project?",
    clarifiedQuestion: "Which work order and tender records name the awarded agency.",
    draftText: "Request for work order and tender extract (synthetic draft).",
    status: "received",
    informationCategories: ["procurement.work_order", "procurement.tender_details"],
    requestedItems: [],
    createdAt: t("2026-05-12T04:30:00.000Z"),
  }),
  request({
    id: "req_processing_highway",
    registrationNumber: "DEMO/RTI/2026/004272",
    authorityId: PRIMARY_AUTHORITY_ID,
    originalQuestion: "When did the bypass work start?",
    clarifiedQuestion: "What recorded start date exists for the bypass work.",
    draftText: "Request for recorded start date (synthetic draft).",
    status: "processing",
    informationCategories: ["execution.start_date"],
    requestedItems: [],
    createdAt: t("2026-05-14T04:30:00.000Z"),
  }),
  request({
    id: "req_additional_info",
    registrationNumber: "DEMO/RTI/2026/004273",
    authorityId: "pa_grants_demo",
    originalQuestion: "How much was released in the second instalment?",
    clarifiedQuestion: "What payment records show the second instalment amount.",
    draftText: "Request for second-instalment payment records (synthetic draft).",
    status: "additional_information",
    informationCategories: ["payments.payment_records"],
    requestedItems: [],
    createdAt: t("2026-05-16T04:30:00.000Z"),
  }),
  request({
    id: "req_response_ready",
    registrationNumber: "DEMO/RTI/2026/004274",
    authorityId: "pa_education_works_demo",
    originalQuestion: "Is there a completion certificate for the classrooms?",
    clarifiedQuestion: "Whether a completion certificate was issued for the classroom works.",
    draftText: "Request for completion certificate, if issued (synthetic draft).",
    status: "response_ready",
    informationCategories: ["execution.completion_certificate"],
    requestedItems: [
      {
        id: "item_classrooms_cc",
        categoryId: "execution.completion_certificate",
        label: "Completion certificate, if issued",
        answered: true,
      },
    ],
    createdAt: t("2026-05-18T04:30:00.000Z"),
    documents: [
      doc(
        "doc_classrooms_cc",
        "Classroom completion note (synthetic)",
        "completion_certificate",
        "Four classrooms marked complete in this demo dataset.",
      ),
    ],
  }),
  request({
    id: "req_response_complete",
    registrationNumber: "DEMO/RTI/2026/004275",
    authorityId: "pa_procurement_demo",
    originalQuestion: "What was the tendered value?",
    clarifiedQuestion: "What tender record states the tendered value.",
    draftText: "Request for tendered value extract (synthetic draft).",
    status: "response_received",
    informationCategories: ["procurement.tender_details"],
    requestedItems: [
      {
        id: "item_tender_value",
        categoryId: "procurement.tender_details",
        label: "Tendered value",
        answered: true,
      },
    ],
    createdAt: t("2026-05-20T04:30:00.000Z"),
    documents: [
      doc(
        "doc_tender_value",
        "Tender extract (synthetic)",
        "other",
        "Tendered value in this demo: ₹48,00,000.",
      ),
    ],
  }),
  request({
    id: "req_appeal_submitted",
    registrationNumber: "DEMO/RTI/2026/004276",
    authorityId: "pa_grants_demo",
    originalQuestion: "Where is the utilisation certificate?",
    clarifiedQuestion: "Whether a utilisation certificate exists for the named grant.",
    draftText: "Request for utilisation certificate (synthetic draft).",
    status: "appeal_submitted",
    informationCategories: ["funding.actual_expenditure"],
    requestedItems: [
      {
        id: "item_uc",
        categoryId: "funding.actual_expenditure",
        label: "Utilisation certificate",
        answered: false,
      },
    ],
    createdAt: t("2026-04-01T04:30:00.000Z"),
    documents: [
      doc(
        "doc_grant_ack",
        "Acknowledgement (synthetic)",
        "other",
        "This demo response does not attach a utilisation certificate.",
      ),
    ],
    appeals: [
      {
        id: "appeal_uc_004276",
        status: "submitted",
        createdAt: t("2026-05-01T04:30:00.000Z"),
        reason: "Utilisation certificate was not supplied.",
        draftText:
          "Mock first appeal recorded for missing utilisation certificate. Not filed with Government of India.",
      },
    ],
  }),
  request({
    id: "req_hiring",
    registrationNumber: "DEMO/RTI/2026/004277",
    authorityId: "pa_employment_demo",
    originalQuestion: "They said 500 people were hired. How many were actually hired?",
    clarifiedQuestion:
      "How many persons were appointed against notified vacancies in the stated drive.",
    draftText:
      "Please provide the number of vacancies notified and the number of persons appointed.",
    status: "response_received",
    informationCategories: [
      "appointments.vacancies_notified",
      "appointments.persons_appointed",
    ],
    requestedItems: [
      {
        id: "item_vacancies",
        categoryId: "appointments.vacancies_notified",
        label: "Vacancies notified",
        answered: true,
      },
      {
        id: "item_appointed",
        categoryId: "appointments.persons_appointed",
        label: "Persons appointed",
        answered: true,
      },
    ],
    createdAt: t("2026-05-22T04:30:00.000Z"),
    documents: [
      doc(
        "doc_hiring",
        "Appointment tally (synthetic)",
        "other",
        "Vacancies notified: 500\nPersons appointed: 412\nDemo figures only.",
      ),
    ],
  }),
  request({
    id: "req_processing_payments",
    registrationNumber: "DEMO/RTI/2026/004278",
    authorityId: PRIMARY_AUTHORITY_ID,
    originalQuestion: "Were running-account bills paid?",
    clarifiedQuestion: "What payment records exist for running-account bills.",
    draftText: "Request for running-account bill payment records (synthetic draft).",
    status: "processing",
    informationCategories: ["payments.payment_records"],
    requestedItems: [],
    createdAt: t("2026-05-24T04:30:00.000Z"),
  }),
  request({
    id: "req_submitted_bridge",
    registrationNumber: "DEMO/RTI/2026/004279",
    authorityId: PRIMARY_AUTHORITY_ID,
    originalQuestion: "How much was spent on the new highway?",
    clarifiedQuestion: "What expenditure was booked against the named highway stretch.",
    draftText: "Request for actual expenditure (synthetic draft).",
    status: "submitted",
    informationCategories: ["funding.actual_expenditure"],
    requestedItems: [],
    createdAt: t("2026-05-26T04:30:00.000Z"),
  }),
];

export function unansweredCount(items: readonly RequestedItemDto[]): number {
  return items.filter((item) => !item.answered).length;
}

export function assertPrimarySeedInvariants(): void {
  const primary = SEED_REQUESTS.find((row) => row.id === PRIMARY_REQUEST_ID);
  if (!primary) {
    throw new Error("Primary demo request missing from seed dataset.");
  }

  if (primary.registrationNumber !== PRIMARY_REGISTRATION_NUMBER) {
    throw new Error(
      `Primary registration drifted: ${primary.registrationNumber}`,
    );
  }

  const unanswered = unansweredCount(primary.requestedItems);
  if (unanswered !== 1) {
    throw new Error(`Primary unanswered count drifted: ${unanswered}`);
  }

  if (SEED_REQUESTS.length < 10 || SEED_REQUESTS.length > 20) {
    throw new Error(`Seed request count out of range: ${SEED_REQUESTS.length}`);
  }
}
