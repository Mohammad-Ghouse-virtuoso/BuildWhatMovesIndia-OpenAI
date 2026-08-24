"use server";

import {
  ACTION_NAMES,
  type CreateComplaintInput,
  type EscalateComplaintInput,
  type TransitionComplaintInput,
  type VerifyResolutionInput,
} from "@/lib/contracts";
import { db } from "@/lib/db";
import { createCivicDataEngine } from "@/lib/engine/civic-data-engine";

function engine() {
  return createCivicDataEngine(db);
}

export async function classifyComplaint(description: string) {
  return engine().classifyComplaint(description);
}

export async function createComplaint(input: CreateComplaintInput) {
  return engine().createComplaint(input);
}

export async function listCitizenComplaints(citizenId: string) {
  return engine().listCitizenComplaints(citizenId);
}

export async function getComplaint(complaintId: string) {
  return engine().getComplaint(complaintId);
}

export async function escalateComplaint(input: EscalateComplaintInput) {
  return engine().escalateComplaint(input);
}

export async function verifyComplaintResolution(input: VerifyResolutionInput) {
  return engine().verifyComplaintResolution(input);
}

export async function transitionComplaint(input: TransitionComplaintInput) {
  return engine().transitionComplaint(input);
}

export async function getMunicipalAttentionQueue() {
  return engine().getMunicipalAttentionQueue();
}

export async function getCityPulse() {
  return engine().getCityPulse();
}

export async function getHotspots(wardId?: string) {
  return engine().getHotspots(wardId);
}

export async function getRecurringIssue(issueId: string) {
  return engine().getRecurringIssue(issueId);
}

export async function getCivicBriefFacts(issueId: string) {
  return engine().getCivicBriefFacts(issueId);
}

export async function generateCivicBrief(issueId: string) {
  return engine().generateCivicBrief(issueId);
}

export const civicActions = {
  [ACTION_NAMES.classifyComplaint]: classifyComplaint,
  [ACTION_NAMES.createComplaint]: createComplaint,
  [ACTION_NAMES.listCitizenComplaints]: listCitizenComplaints,
  [ACTION_NAMES.getComplaint]: getComplaint,
  [ACTION_NAMES.escalateComplaint]: escalateComplaint,
  [ACTION_NAMES.verifyComplaintResolution]: verifyComplaintResolution,
  [ACTION_NAMES.transitionComplaint]: transitionComplaint,
  [ACTION_NAMES.getMunicipalAttentionQueue]: getMunicipalAttentionQueue,
  [ACTION_NAMES.getCityPulse]: getCityPulse,
  [ACTION_NAMES.getHotspots]: getHotspots,
  [ACTION_NAMES.getRecurringIssue]: getRecurringIssue,
  [ACTION_NAMES.getCivicBriefFacts]: getCivicBriefFacts,
  [ACTION_NAMES.generateCivicBrief]: generateCivicBrief,
};
