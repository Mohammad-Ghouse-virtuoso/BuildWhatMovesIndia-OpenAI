import type { ComplaintStatus, SlaState } from "@/lib/contracts";

export const SUPERVISOR_QUEUE = "Engineering Supervisor Queue";
export const MUNICIPAL_ESCALATION_QUEUE = "Municipal Engineering Escalation Queue";
export const PROTOTYPE_ESCALATION_PATH = "Prototype escalation path";
export const MAX_ESCALATION_LEVEL = 2;

export function nextEscalation(levelCount: number): {
  level: number;
  queueLabel: string;
  pathLabel: string | null;
} | null {
  if (levelCount >= MAX_ESCALATION_LEVEL) {
    return null;
  }

  if (levelCount === 0) {
    return { level: 1, queueLabel: SUPERVISOR_QUEUE, pathLabel: null };
  }

  return {
    level: 2,
    queueLabel: MUNICIPAL_ESCALATION_QUEUE,
    pathLabel: PROTOTYPE_ESCALATION_PATH,
  };
}

export function isEscalationPermitted(input: {
  status: ComplaintStatus;
  slaState: SlaState;
  escalationCount: number;
}): boolean {
  if (input.status === "CLOSED") {
    return false;
  }

  if (nextEscalation(input.escalationCount) === null) {
    return false;
  }

  return (
    input.slaState === "BREACHED" ||
    input.slaState === "AT_RISK" ||
    input.status === "REOPENED"
  );
}
