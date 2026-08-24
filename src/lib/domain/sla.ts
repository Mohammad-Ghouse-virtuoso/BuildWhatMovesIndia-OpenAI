import type { ComplaintStatus, SlaDTO, SlaState } from "@/lib/contracts";

export const AT_RISK_REMAINING_FRACTION = 0.25;

export function hoursBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / 3_600_000;
}

export function slaDeadline(createdAt: Date, durationHours: number): Date {
  return new Date(createdAt.getTime() + durationHours * 3_600_000);
}

export function slaState(input: {
  now: Date;
  deadline: Date;
  durationHours: number;
  status: ComplaintStatus;
  closedAt: Date | null;
}): SlaState {
  const reference =
    input.status === "CLOSED" && input.closedAt ? input.closedAt : input.now;
  const remainingHours = hoursBetween(reference, input.deadline);

  if (remainingHours < 0) {
    return "BREACHED";
  }

  if (
    input.status !== "CLOSED" &&
    remainingHours <= input.durationHours * AT_RISK_REMAINING_FRACTION
  ) {
    return "AT_RISK";
  }

  return "WITHIN_SLA";
}

export function toSlaDto(input: {
  now: Date;
  deadline: Date;
  durationHours: number;
  status: ComplaintStatus;
  closedAt: Date | null;
}): SlaDTO {
  const state = slaState(input);
  const remainingHours = hoursBetween(input.now, input.deadline);
  const overdueHours = remainingHours < 0 ? Math.abs(remainingHours) : null;

  return {
    state,
    deadline: input.deadline.toISOString(),
    durationHours: input.durationHours,
    remainingHours:
      input.status === "CLOSED" ? null : Number(remainingHours.toFixed(2)),
    overdueHours:
      overdueHours === null ? null : Number(overdueHours.toFixed(2)),
  };
}
