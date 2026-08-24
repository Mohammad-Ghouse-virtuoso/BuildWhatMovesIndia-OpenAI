import type { ComplaintEventType, Persona } from "@/lib/contracts";
import { SUPERVISOR_QUEUE } from "@/lib/domain/escalation";
import type { SeedComplaint, SeedUser } from "@/lib/domain/synthetic-dataset";

export interface SeedEvent {
  id: string;
  type: ComplaintEventType;
  occurredAt: Date;
  actorId: string | null;
  actorPersona: Persona | null;
  actorName: string | null;
  description: string;
}

function minutesAfter(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function eventsForSeedComplaint(
  complaint: SeedComplaint,
  users: SeedUser[],
): SeedEvent[] {
  const citizen = users.find((user) => user.id === complaint.citizenId);
  const officer = users.find((user) => user.id === complaint.assignedOfficerId);
  const events: SeedEvent[] = [
    {
      id: `${complaint.seedKey}-evt-submitted`,
      type: "SUBMITTED",
      occurredAt: complaint.createdAt,
      actorId: citizen?.id ?? null,
      actorPersona: "citizen",
      actorName: citizen?.name ?? null,
      description: "Complaint submitted.",
    },
    {
      id: `${complaint.seedKey}-evt-categorized`,
      type: "CATEGORIZED",
      occurredAt: minutesAfter(complaint.createdAt, 1),
      actorId: citizen?.id ?? null,
      actorPersona: "citizen",
      actorName: citizen?.name ?? null,
      description: "Complaint categorized.",
    },
  ];

  const rank: Record<SeedComplaint["status"], number> = {
    SUBMITTED: 0,
    CATEGORIZED: 1,
    ASSIGNED: 2,
    IN_PROGRESS: 3,
    AWAITING_VERIFICATION: 4,
    CLOSED: 5,
    REOPENED: 4,
  };

  if (rank[complaint.status] >= 2) {
    events.push({
      id: `${complaint.seedKey}-evt-assigned`,
      type: "ASSIGNED",
      occurredAt: minutesAfter(complaint.createdAt, 20),
      actorId: officer?.id ?? null,
      actorPersona: "officer",
      actorName: officer?.name ?? null,
      description: "Complaint assigned to an officer.",
    });
  }

  if (rank[complaint.status] >= 3) {
    events.push({
      id: `${complaint.seedKey}-evt-inspection`,
      type: "INSPECTION_STARTED",
      occurredAt: minutesAfter(complaint.createdAt, 40),
      actorId: officer?.id ?? null,
      actorPersona: "officer",
      actorName: officer?.name ?? null,
      description: "Inspection or work started.",
    });
  }

  if (
    complaint.status === "AWAITING_VERIFICATION" ||
    complaint.status === "CLOSED" ||
    complaint.status === "REOPENED"
  ) {
    events.push({
      id: `${complaint.seedKey}-evt-resolution`,
      type: "RESOLUTION_SUBMITTED",
      occurredAt: complaint.resolvedAt ?? minutesAfter(complaint.createdAt, 90),
      actorId: officer?.id ?? null,
      actorPersona: "officer",
      actorName: officer?.name ?? null,
      description: "Officer submitted a resolution for citizen verification.",
    });
  }

  if (complaint.status === "CLOSED") {
    events.push({
      id: `${complaint.seedKey}-evt-closed`,
      type: "CITIZEN_VERIFIED",
      occurredAt: complaint.closedAt ?? minutesAfter(complaint.createdAt, 120),
      actorId: citizen?.id ?? null,
      actorPersona: "citizen",
      actorName: citizen?.name ?? null,
      description: "Citizen confirmed the issue is resolved. Complaint closed.",
    });
  }

  if (complaint.status === "REOPENED" && complaint.reopenedAt) {
    events.push({
      id: `${complaint.seedKey}-evt-reopened`,
      type: "REOPENED",
      occurredAt: complaint.reopenedAt,
      actorId: citizen?.id ?? null,
      actorPersona: "citizen",
      actorName: citizen?.name ?? null,
      description: "Citizen reported the issue is not resolved. Complaint reopened.",
    });
  }

  if (complaint.isEscalated) {
    events.push({
      id: `${complaint.seedKey}-evt-escalated`,
      type: "ESCALATED",
      occurredAt: minutesAfter(complaint.createdAt, 50),
      actorId: citizen?.id ?? null,
      actorPersona: "citizen",
      actorName: citizen?.name ?? null,
      description: `Moved to ${SUPERVISOR_QUEUE}.`,
    });
  }

  return events;
}
