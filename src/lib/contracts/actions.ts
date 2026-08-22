/**
 * Stable names reserved for Phase 1A/2 server actions or route handlers.
 * UI tracks should call these operations through the adapter contracts.
 */
export const ACTION_NAMES = {
  classifyComplaint: "classifyComplaint",
  createComplaint: "createComplaint",
  listCitizenComplaints: "listCitizenComplaints",
  getComplaint: "getComplaint",
  escalateComplaint: "escalateComplaint",
  verifyComplaintResolution: "verifyComplaintResolution",
  transitionComplaint: "transitionComplaint",
  getMunicipalAttentionQueue: "getMunicipalAttentionQueue",
  getCityPulse: "getCityPulse",
  getHotspots: "getHotspots",
  getRecurringIssue: "getRecurringIssue",
  getCivicBriefFacts: "getCivicBriefFacts",
  generateCivicBrief: "generateCivicBrief",
} as const;

export type ActionName = (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES];
