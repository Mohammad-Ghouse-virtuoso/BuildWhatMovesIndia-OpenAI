import type {
  ComplaintEventDTO,
  ComplaintDTO,
  CoordinatesDTO,
  Persona,
} from "@/lib/contracts";
import { gridCellKey } from "@/lib/domain/grid";
import { toSlaDto } from "@/lib/domain/sla";
import type { ComplaintSnapshot } from "@/lib/intelligence/facts";

type ComplaintRecord = {
  id: string;
  publicId: string;
  citizenId: string;
  description: string;
  summary: string;
  category: ComplaintDTO["category"];
  subcategory: { id: string; label: string };
  severity: ComplaintDTO["severity"];
  status: ComplaintDTO["status"];
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
  latitude: number;
  longitude: number;
  locationLabel: string;
  gridCellKey: string;
  slaDeadline: Date;
  slaDurationHours: number;
  isEscalated: boolean;
  assignedOfficer: { name: string } | null;
  department: { id: string; name: string } | null;
  ward: { id: string; number: number; name: string; ulb: { name: string } };
  events: {
    id: string;
    complaintId: string;
    type: ComplaintEventDTO["type"];
    occurredAt: Date;
    actorPersona: Persona | null;
    actorName: string | null;
    description: string;
    metadata: unknown;
  }[];
};

export function toComplaintSnapshot(
  complaint: ComplaintRecord & { resolvedAt?: Date | null },
  resolvedAt: Date | null = complaint.resolvedAt ?? null,
): ComplaintSnapshot {
  return {
    id: complaint.id,
    wardId: complaint.ward.id,
    wardNumber: complaint.ward.number,
    wardName: complaint.ward.name,
    category: complaint.category,
    status: complaint.status,
    severity: complaint.severity,
    createdAt: complaint.createdAt,
    closedAt: complaint.closedAt,
    resolvedAt,
    latitude: complaint.latitude,
    longitude: complaint.longitude,
    gridCellKey: complaint.gridCellKey,
    slaDeadline: complaint.slaDeadline,
    slaDurationHours: complaint.slaDurationHours,
  };
}

export function toComplaintDto(
  complaint: ComplaintRecord,
  now: Date,
  extras?: { isEscalationAvailable?: boolean },
): ComplaintDTO {
  return {
    id: complaint.id,
    publicId: complaint.publicId,
    citizenId: complaint.citizenId,
    description: complaint.description,
    summary: complaint.summary,
    category: complaint.category,
    subcategory: complaint.subcategory.label,
    severity: complaint.severity,
    status: complaint.status,
    createdAt: complaint.createdAt.toISOString(),
    updatedAt: complaint.updatedAt.toISOString(),
    ward: {
      id: complaint.ward.id,
      number: complaint.ward.number,
      name: complaint.ward.name,
      ulbName: complaint.ward.ulb.name,
    },
    location: {
      latitude: complaint.latitude,
      longitude: complaint.longitude,
      label: complaint.locationLabel,
      gridCellKey: complaint.gridCellKey,
    },
    department: complaint.department,
    assignedOfficerName: complaint.assignedOfficer?.name ?? null,
    sla: toSlaDto({
      now,
      deadline: complaint.slaDeadline,
      durationHours: complaint.slaDurationHours,
      status: complaint.status,
      closedAt: complaint.closedAt,
    }),
    isEscalationAvailable: extras?.isEscalationAvailable ?? false,
    isEscalated: complaint.isEscalated,
    events: [...complaint.events]
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
      .map((event) => ({
        id: event.id,
        complaintId: event.complaintId,
        type: event.type,
        occurredAt: event.occurredAt.toISOString(),
        actorPersona: event.actorPersona,
        actorName: event.actorName,
        description: event.description,
        metadata:
          event.metadata && typeof event.metadata === "object"
            ? (event.metadata as Record<string, unknown>)
            : undefined,
      })),
  };
}

export function coordinatesGrid(location: CoordinatesDTO) {
  return gridCellKey(location.latitude, location.longitude);
}
