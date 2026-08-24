import {
  COMPLAINT_STATUS_TRANSITIONS,
  type ComplaintEventType,
  type ComplaintStatus,
} from "@/lib/contracts";
import { DomainError } from "@/lib/domain/errors";

export function canTransition(
  from: ComplaintStatus,
  to: ComplaintStatus,
): boolean {
  return (COMPLAINT_STATUS_TRANSITIONS[from] as readonly ComplaintStatus[]).includes(
    to,
  );
}

export function assertTransition(
  from: ComplaintStatus,
  to: ComplaintStatus,
): void {
  if (!canTransition(from, to)) {
    throw new DomainError(
      "INVALID_TRANSITION",
      `Cannot move a complaint from ${from} to ${to}.`,
    );
  }
}

export function eventTypeForTransition(
  from: ComplaintStatus,
  to: ComplaintStatus,
): ComplaintEventType {
  assertTransition(from, to);

  if (to === "CATEGORIZED") return "CATEGORIZED";
  if (to === "ASSIGNED") return from === "ASSIGNED" ? "REASSIGNED" : "ASSIGNED";
  if (to === "IN_PROGRESS") return "INSPECTION_STARTED";
  if (to === "AWAITING_VERIFICATION") return "RESOLUTION_SUBMITTED";
  if (to === "CLOSED") return "CITIZEN_VERIFIED";
  if (to === "REOPENED") return "REOPENED";
  return "SUBMITTED";
}

export function descriptionForTransition(
  to: ComplaintStatus,
  note?: string,
): string {
  const base: Record<ComplaintStatus, string> = {
    SUBMITTED: "Complaint submitted.",
    CATEGORIZED: "Complaint categorized.",
    ASSIGNED: "Complaint assigned to an officer.",
    IN_PROGRESS: "Inspection or work started.",
    AWAITING_VERIFICATION: "Officer submitted a resolution for citizen verification.",
    CLOSED: "Citizen confirmed the issue is resolved. Complaint closed.",
    REOPENED: "Citizen reported the issue is not resolved. Complaint reopened.",
  };

  return note ? `${base[to]} ${note}` : base[to];
}
