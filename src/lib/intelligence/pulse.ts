import type { CategoryPulseDTO, CityPulseDTO } from "@/lib/contracts";
import { COMPLAINT_CATEGORIES } from "@/lib/contracts";
import {
  inCurrentPeriod,
  inPreviousPeriod,
  percentageChange,
  periodWindows,
} from "@/lib/domain/periods";
import { slaState } from "@/lib/domain/sla";
import {
  computeRecurringIssues,
  type ComplaintSnapshot,
} from "@/lib/intelligence/facts";

export function computeCityPulse(
  complaints: ComplaintSnapshot[],
  now: Date,
): CityPulseDTO {
  const windows = periodWindows(now);
  const open = complaints.filter((item) => item.status !== "CLOSED");
  const slaAtRiskCount = open.filter(
    (item) =>
      slaState({
        now,
        deadline: item.slaDeadline,
        durationHours: item.slaDurationHours,
        status: item.status,
        closedAt: item.closedAt,
      }) === "AT_RISK",
  ).length;
  const slaBreachedCount = open.filter(
    (item) =>
      slaState({
        now,
        deadline: item.slaDeadline,
        durationHours: item.slaDurationHours,
        status: item.status,
        closedAt: item.closedAt,
      }) === "BREACHED",
  ).length;

  const categories: CategoryPulseDTO[] = COMPLAINT_CATEGORIES.map((category) => {
    const rows = complaints.filter((item) => item.category === category);
    const currentPeriodCount = rows.filter((item) =>
      inCurrentPeriod(item.createdAt, windows),
    ).length;
    const previousPeriodCount = rows.filter((item) =>
      inPreviousPeriod(item.createdAt, windows),
    ).length;
    return {
      category,
      openCount: rows.filter((item) => item.status !== "CLOSED").length,
      currentPeriodCount,
      previousPeriodCount,
      percentageChange: percentageChange(currentPeriodCount, previousPeriodCount),
    };
  });

  return {
    generatedAt: now.toISOString(),
    periodDays: windows.periodDays,
    openCount: open.length,
    slaAtRiskCount,
    slaBreachedCount,
    reopenedCount: complaints.filter((item) => item.status === "REOPENED").length,
    emergingIssueCount: computeRecurringIssues(complaints, now, windows).filter(
      (issue) => (issue.percentageChange ?? 0) > 0,
    ).length,
    categories,
  };
}
