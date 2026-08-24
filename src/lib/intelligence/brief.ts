import type { CivicBriefFactsDTO, RecurringIssueDTO } from "@/lib/contracts";
import type { RecurringIssueFact } from "@/lib/intelligence/facts";

export function toRecurringIssueDto(issue: RecurringIssueFact): RecurringIssueDTO {
  return {
    id: issue.id,
    wardId: issue.wardId,
    wardNumber: issue.wardNumber,
    wardName: issue.wardName,
    category: issue.category,
    title: issue.title,
    complaintCount: issue.complaintCount,
    distinctLocationCount: issue.distinctLocationCount,
    hotspotCount: issue.hotspotCount,
    percentageChange: issue.percentageChange,
    slaBreachedCount: issue.slaBreachedCount,
    reopenedCount: issue.reopenedCount,
    repeatAfterResolutionLocationCount: issue.repeatAfterResolutionLocationCount,
    periodDays: issue.periodDays,
    hotspotIds: issue.hotspotIds,
  };
}

export function civicBriefFacts(
  issue: RecurringIssueFact,
  now: Date,
): CivicBriefFactsDTO {
  return {
    generatedAt: now.toISOString(),
    issue: toRecurringIssueDto(issue),
    sourceComplaintIds: issue.complaintIds,
  };
}

export function deterministicBrief(facts: CivicBriefFactsDTO): string {
  const issue = facts.issue;
  const change =
    issue.percentageChange === null
      ? "not comparable to the previous period"
      : `${issue.percentageChange}% versus the previous ${issue.periodDays} days`;

  return [
    `${issue.wardName} has a recurring ${issue.category.toLowerCase().replaceAll("_", " ")} pattern.`,
    `${issue.complaintCount} complaints across ${issue.distinctLocationCount} locations and ${issue.hotspotCount} hotspot cells.`,
    `Volume is ${change}.`,
    `${issue.slaBreachedCount} SLA breaches, ${issue.reopenedCount} reopened complaints, and ${issue.repeatAfterResolutionLocationCount} locations saw a new complaint within 14 days after resolution.`,
    "These figures are calculated from synthetic complaint records, not estimated by a model.",
  ].join(" ");
}
