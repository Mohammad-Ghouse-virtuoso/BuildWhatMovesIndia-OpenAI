import type { ApiResponse } from "./api";
import type {
  ClassificationResult,
  ComplaintDTO,
  CreateComplaintInput,
  EscalateComplaintInput,
  TransitionComplaintInput,
  VerifyResolutionInput,
} from "./complaints";
import type {
  AttentionQueueItemDTO,
  CivicBriefDTO,
  CivicBriefFactsDTO,
  CityPulseDTO,
  HotspotDTO,
  RecurringIssueDTO,
} from "./intelligence";

export interface CitizenDataAdapter {
  classifyComplaint(description: string): Promise<ApiResponse<ClassificationResult>>;
  createComplaint(input: CreateComplaintInput): Promise<ApiResponse<ComplaintDTO>>;
  listCitizenComplaints(citizenId: string): Promise<ApiResponse<ComplaintDTO[]>>;
  getComplaint(complaintId: string): Promise<ApiResponse<ComplaintDTO>>;
  escalateComplaint(input: EscalateComplaintInput): Promise<ApiResponse<ComplaintDTO>>;
  verifyComplaintResolution(
    input: VerifyResolutionInput,
  ): Promise<ApiResponse<ComplaintDTO>>;
}

export interface MunicipalDataAdapter {
  getMunicipalAttentionQueue(): Promise<ApiResponse<AttentionQueueItemDTO[]>>;
  getCityPulse(): Promise<ApiResponse<CityPulseDTO>>;
  getHotspots(wardId?: string): Promise<ApiResponse<HotspotDTO[]>>;
  getRecurringIssue(issueId: string): Promise<ApiResponse<RecurringIssueDTO>>;
  getCivicBriefFacts(issueId: string): Promise<ApiResponse<CivicBriefFactsDTO>>;
  generateCivicBrief(issueId: string): Promise<ApiResponse<CivicBriefDTO>>;
  transitionComplaint(
    input: TransitionComplaintInput,
  ): Promise<ApiResponse<ComplaintDTO>>;
}

export interface CivicIntelligenceAdapter
  extends CitizenDataAdapter,
    MunicipalDataAdapter {}
