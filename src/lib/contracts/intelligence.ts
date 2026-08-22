import type { ComplaintCategory, SlaState } from "./domain";
import type { ComplaintDTO, CoordinatesDTO } from "./complaints";

export interface CategoryPulseDTO {
  category: ComplaintCategory;
  openCount: number;
  currentPeriodCount: number;
  previousPeriodCount: number;
  percentageChange: number | null;
}

export interface CityPulseDTO {
  generatedAt: string;
  periodDays: number;
  openCount: number;
  slaAtRiskCount: number;
  slaBreachedCount: number;
  reopenedCount: number;
  emergingIssueCount: number;
  categories: CategoryPulseDTO[];
}

export interface HotspotDTO {
  id: string;
  gridCellKey: string;
  center: CoordinatesDTO;
  wardId: string;
  wardNumber: number;
  category: ComplaintCategory;
  complaintCount: number;
  affectedLocationCount: number;
  reopenedCount: number;
  slaBreachedCount: number;
  percentageChange: number | null;
}

export interface RecurringIssueDTO {
  id: string;
  wardId: string;
  wardNumber: number;
  wardName: string;
  category: ComplaintCategory;
  title: string;
  complaintCount: number;
  distinctLocationCount: number;
  hotspotCount: number;
  percentageChange: number | null;
  slaBreachedCount: number;
  reopenedCount: number;
  repeatAfterResolutionLocationCount: number;
  periodDays: number;
  hotspotIds: string[];
}

export interface CivicBriefFactsDTO {
  generatedAt: string;
  issue: RecurringIssueDTO;
  sourceComplaintIds: string[];
}

export interface CivicBriefDTO {
  facts: CivicBriefFactsDTO;
  brief: string;
  source: "openai" | "deterministic-fallback";
}

export interface AttentionQueueItemDTO {
  complaint: ComplaintDTO;
  priority:
    | "SLA_BREACHED"
    | "HIGH_SEVERITY"
    | "RECURRING_ISSUE"
    | "SLA_AT_RISK"
    | "NORMAL";
  slaState: SlaState;
  recurringIssueId: string | null;
}
