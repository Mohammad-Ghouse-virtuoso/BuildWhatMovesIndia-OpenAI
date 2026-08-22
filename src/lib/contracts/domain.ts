export const PERSONAS = ["citizen", "officer", "admin"] as const;
export type Persona = (typeof PERSONAS)[number];

export const PERSONA_LABELS: Record<Persona, string> = {
  citizen: "Citizen",
  officer: "Officer",
  admin: "Administrator",
};

export const COMPLAINT_CATEGORIES = [
  "ROADS",
  "DRAINAGE",
  "WATER_SUPPLY",
  "WASTE_SANITATION",
  "STREET_LIGHTING",
  "PARKS_GREENERY",
] as const;
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  ROADS: "Roads",
  DRAINAGE: "Drainage",
  WATER_SUPPLY: "Water supply",
  WASTE_SANITATION: "Waste and sanitation",
  STREET_LIGHTING: "Street lighting",
  PARKS_GREENERY: "Parks and greenery",
};

export const COMPLAINT_SEVERITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type ComplaintSeverity = (typeof COMPLAINT_SEVERITIES)[number];

export const COMPLAINT_STATUSES = [
  "SUBMITTED",
  "CATEGORIZED",
  "ASSIGNED",
  "IN_PROGRESS",
  "AWAITING_VERIFICATION",
  "CLOSED",
  "REOPENED",
] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: "Submitted",
  CATEGORIZED: "Categorized",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  AWAITING_VERIFICATION: "Awaiting citizen verification",
  CLOSED: "Closed",
  REOPENED: "Reopened",
};

export const COMPLAINT_STATUS_TRANSITIONS = {
  SUBMITTED: ["CATEGORIZED"],
  CATEGORIZED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["AWAITING_VERIFICATION"],
  AWAITING_VERIFICATION: ["CLOSED", "REOPENED"],
  CLOSED: [],
  REOPENED: ["ASSIGNED", "IN_PROGRESS"],
} as const satisfies Record<ComplaintStatus, readonly ComplaintStatus[]>;

export const COMPLAINT_EVENT_TYPES = [
  "SUBMITTED",
  "CATEGORIZED",
  "ASSIGNED",
  "REASSIGNED",
  "INSPECTION_STARTED",
  "RESOLUTION_SUBMITTED",
  "CITIZEN_VERIFIED",
  "REOPENED",
  "ESCALATED",
] as const;
export type ComplaintEventType = (typeof COMPLAINT_EVENT_TYPES)[number];

export const SLA_STATES = ["WITHIN_SLA", "AT_RISK", "BREACHED"] as const;
export type SlaState = (typeof SLA_STATES)[number];

export const SLA_STATE_LABELS: Record<SlaState, string> = {
  WITHIN_SLA: "Within SLA",
  AT_RISK: "At risk",
  BREACHED: "SLA breached",
};
