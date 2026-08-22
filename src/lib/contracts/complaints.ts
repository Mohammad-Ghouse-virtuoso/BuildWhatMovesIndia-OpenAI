import type {
  ComplaintCategory,
  ComplaintEventType,
  ComplaintSeverity,
  ComplaintStatus,
  Persona,
  SlaState,
} from "./domain";

export interface CoordinatesDTO {
  latitude: number;
  longitude: number;
}

export interface WardDTO {
  id: string;
  number: number;
  name: string;
  ulbName: string;
}

export interface DepartmentDTO {
  id: string;
  name: string;
}

export interface SlaDTO {
  state: SlaState;
  deadline: string;
  durationHours: number;
  remainingHours: number | null;
  overdueHours: number | null;
}

export interface ComplaintEventDTO {
  id: string;
  complaintId: string;
  type: ComplaintEventType;
  occurredAt: string;
  actorPersona: Persona | null;
  actorName: string | null;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ComplaintDTO {
  id: string;
  publicId: string;
  citizenId: string;
  description: string;
  summary: string;
  category: ComplaintCategory;
  subcategory: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  ward: WardDTO;
  location: CoordinatesDTO & {
    label: string;
    gridCellKey: string | null;
  };
  department: DepartmentDTO | null;
  assignedOfficerName: string | null;
  sla: SlaDTO;
  isEscalationAvailable: boolean;
  isEscalated: boolean;
  events: ComplaintEventDTO[];
}

export interface ClassificationResult {
  category: ComplaintCategory;
  subcategory: string;
  summary: string;
  severity: ComplaintSeverity;
  durationText: string | null;
  confidence: number;
  source: "openai" | "keyword-fallback";
  needsCitizenConfirmation: true;
}

export interface CreateComplaintInput {
  citizenId: string;
  description: string;
  category: ComplaintCategory;
  subcategory: string;
  severity: ComplaintSeverity;
  wardId: string;
  location: CoordinatesDTO & { label: string };
  photoReference?: string;
}

export interface TransitionComplaintInput {
  complaintId: string;
  toStatus: ComplaintStatus;
  actorId: string;
  note?: string;
}

export interface EscalateComplaintInput {
  complaintId: string;
  actorId: string;
  reason: string;
}

export interface VerifyResolutionInput {
  complaintId: string;
  citizenId: string;
  resolved: boolean;
  reason?: string;
}
