import type { AttentionQueueItemDTO, ComplaintSeverity, SlaState } from "@/lib/contracts";

export type AttentionPriority = AttentionQueueItemDTO["priority"];

const PRIORITY_RANK: Record<AttentionPriority, number> = {
  SLA_BREACHED: 0,
  HIGH_SEVERITY: 1,
  RECURRING_ISSUE: 2,
  SLA_AT_RISK: 3,
  NORMAL: 4,
};

export function attentionPriority(input: {
  slaState: SlaState;
  severity: ComplaintSeverity;
  recurringIssueId: string | null;
}): AttentionPriority {
  if (input.slaState === "BREACHED") return "SLA_BREACHED";
  if (input.severity === "HIGH") return "HIGH_SEVERITY";
  if (input.recurringIssueId) return "RECURRING_ISSUE";
  if (input.slaState === "AT_RISK") return "SLA_AT_RISK";
  return "NORMAL";
}

export function compareAttentionPriority(
  a: AttentionPriority,
  b: AttentionPriority,
): number {
  return PRIORITY_RANK[a] - PRIORITY_RANK[b];
}
