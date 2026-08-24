export const INFORMATION_GROUPS = [
  "Funding",
  "Procurement",
  "Execution",
  "Payments",
  "Appointments",
] as const;

export type InformationGroup = (typeof INFORMATION_GROUPS)[number];

export const INFORMATION_CATEGORIES = [
  {
    id: "funding.sanctioned_amount",
    group: "Funding",
    label: "Sanctioned amount",
  },
  {
    id: "funding.revised_sanction",
    group: "Funding",
    label: "Revised sanctioned amount, if any",
  },
  {
    id: "funding.actual_expenditure",
    group: "Funding",
    label: "Actual expenditure",
  },
  {
    id: "procurement.work_order",
    group: "Procurement",
    label: "Work order",
  },
  {
    id: "procurement.contractor_name",
    group: "Procurement",
    label: "Contractor or agency name",
  },
  {
    id: "procurement.tender_details",
    group: "Procurement",
    label: "Tender details, where applicable",
  },
  {
    id: "execution.start_date",
    group: "Execution",
    label: "Recorded start date",
  },
  {
    id: "execution.completion_date",
    group: "Execution",
    label: "Recorded completion date",
  },
  {
    id: "execution.completion_certificate",
    group: "Execution",
    label: "Completion certificate, if issued",
  },
  {
    id: "execution.inspection_report",
    group: "Execution",
    label: "Inspection report(s), if available",
  },
  {
    id: "payments.payment_records",
    group: "Payments",
    label: "Relevant payment records",
  },
  {
    id: "appointments.vacancies_notified",
    group: "Appointments",
    label: "Vacancies notified",
  },
  {
    id: "appointments.persons_appointed",
    group: "Appointments",
    label: "Persons appointed",
  },
] as const;

export type InformationCategoryId =
  (typeof INFORMATION_CATEGORIES)[number]["id"];

export type InformationCategory =
  (typeof INFORMATION_CATEGORIES)[number];

const CATEGORY_BY_ID = new Map(
  INFORMATION_CATEGORIES.map((category) => [category.id, category]),
);

export function isInformationCategoryId(
  value: string,
): value is InformationCategoryId {
  return CATEGORY_BY_ID.has(value as InformationCategoryId);
}

export function getInformationCategory(
  id: string,
): InformationCategory | undefined {
  return CATEGORY_BY_ID.get(id as InformationCategoryId);
}

export const ROAD_PROJECT_CATEGORY_IDS = [
  "funding.sanctioned_amount",
  "funding.revised_sanction",
  "funding.actual_expenditure",
  "procurement.work_order",
  "procurement.contractor_name",
  "execution.start_date",
  "execution.completion_date",
  "execution.completion_certificate",
  "execution.inspection_report",
  "payments.payment_records",
] as const satisfies readonly InformationCategoryId[];
