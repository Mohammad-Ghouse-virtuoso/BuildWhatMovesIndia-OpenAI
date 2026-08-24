import type { ComplaintCategory, ComplaintStatus, SlaState } from "@/lib/contracts";
import {
  HOTSPOT_MIN_COMPLAINTS,
  RECURRING_MIN_COMPLAINTS,
  RECURRING_MIN_HOTSPOTS,
  RECURRING_MIN_LOCATIONS,
  WARD_42_EXPECTED,
  WARD_42_ID,
} from "@/lib/domain/constants";
import { gridCellCenter } from "@/lib/domain/grid";
import {
  inCurrentPeriod,
  inPreviousPeriod,
  percentageChange,
  periodWindows,
  REPEAT_AFTER_RESOLUTION_DAYS,
  type PeriodWindows,
} from "@/lib/domain/periods";
import { slaState } from "@/lib/domain/sla";

export interface ComplaintSnapshot {
  id: string;
  wardId: string;
  wardNumber: number;
  wardName: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  severity: "LOW" | "MEDIUM" | "HIGH";
  createdAt: Date;
  closedAt: Date | null;
  resolvedAt: Date | null;
  latitude: number;
  longitude: number;
  gridCellKey: string;
  slaDeadline: Date;
  slaDurationHours: number;
}

export interface HotspotFact {
  id: string;
  gridCellKey: string;
  wardId: string;
  wardNumber: number;
  category: ComplaintCategory;
  complaintIds: string[];
  complaintCount: number;
  affectedLocationCount: number;
  reopenedCount: number;
  slaBreachedCount: number;
  percentageChange: number | null;
}

export interface RecurringIssueFact {
  id: string;
  wardId: string;
  wardNumber: number;
  wardName: string;
  category: ComplaintCategory;
  title: string;
  complaintIds: string[];
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

export function locationKey(latitude: number, longitude: number): string {
  return `${latitude}:${longitude}`;
}

export function recurringIssueId(wardId: string, category: ComplaintCategory): string {
  return `ri:${wardId}:${category}`;
}

export function hotspotId(
  wardId: string,
  category: ComplaintCategory,
  gridCellKey: string,
): string {
  return `hs:${wardId}:${category}:${gridCellKey}`;
}

function snapshotSlaState(snapshot: ComplaintSnapshot, now: Date): SlaState {
  return slaState({
    now,
    deadline: snapshot.slaDeadline,
    durationHours: snapshot.slaDurationHours,
    status: snapshot.status,
    closedAt: snapshot.closedAt,
  });
}

export function repeatAfterResolutionLocationCount(
  complaints: ComplaintSnapshot[],
): number {
  const grouped = new Map<string, ComplaintSnapshot[]>();
  for (const complaint of complaints) {
    const key = locationKey(complaint.latitude, complaint.longitude);
    const list = grouped.get(key) ?? [];
    list.push(complaint);
    grouped.set(key, list);
  }

  const windowMs = REPEAT_AFTER_RESOLUTION_DAYS * 24 * 3_600_000;
  let count = 0;

  for (const list of grouped.values()) {
    const ordered = [...list].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const repeats = ordered.some((current, index) =>
      ordered.slice(0, index).some((prior) => {
        const resolvedAt = prior.closedAt ?? prior.resolvedAt;
        if (!resolvedAt) return false;
        const delta = current.createdAt.getTime() - resolvedAt.getTime();
        return delta > 0 && delta <= windowMs;
      }),
    );
    if (repeats) count += 1;
  }

  return count;
}

export function computeHotspots(
  complaints: ComplaintSnapshot[],
  now: Date,
  windows: PeriodWindows = periodWindows(now),
): HotspotFact[] {
  const groups = new Map<string, ComplaintSnapshot[]>();
  for (const complaint of complaints) {
    const key = `${complaint.wardId}:${complaint.category}:${complaint.gridCellKey}`;
    const list = groups.get(key) ?? [];
    list.push(complaint);
    groups.set(key, list);
  }

  const hotspots: HotspotFact[] = [];
  for (const group of groups.values()) {
    if (group.length < HOTSPOT_MIN_COMPLAINTS) continue;
    const sample = group[0];
    const current = group.filter((item) => inCurrentPeriod(item.createdAt, windows)).length;
    const previous = group.filter((item) => inPreviousPeriod(item.createdAt, windows)).length;
    const locations = new Set(group.map((item) => locationKey(item.latitude, item.longitude)));

    hotspots.push({
      id: hotspotId(sample.wardId, sample.category, sample.gridCellKey),
      gridCellKey: sample.gridCellKey,
      wardId: sample.wardId,
      wardNumber: sample.wardNumber,
      category: sample.category,
      complaintIds: group.map((item) => item.id),
      complaintCount: group.length,
      affectedLocationCount: locations.size,
      reopenedCount: group.filter((item) => item.status === "REOPENED").length,
      slaBreachedCount: group.filter(
        (item) =>
          item.status !== "CLOSED" && snapshotSlaState(item, now) === "BREACHED",
      ).length,
      percentageChange: percentageChange(current, previous),
    });
  }

  return hotspots.sort((a, b) => b.complaintCount - a.complaintCount);
}

export function computeRecurringIssues(
  complaints: ComplaintSnapshot[],
  now: Date,
  windows: PeriodWindows = periodWindows(now),
): RecurringIssueFact[] {
  const hotspots = computeHotspots(complaints, now, windows);
  const groups = new Map<string, ComplaintSnapshot[]>();
  for (const complaint of complaints) {
    const key = `${complaint.wardId}:${complaint.category}`;
    const list = groups.get(key) ?? [];
    list.push(complaint);
    groups.set(key, list);
  }

  const issues: RecurringIssueFact[] = [];
  for (const group of groups.values()) {
    const sample = group[0];
    const locations = new Set(group.map((item) => locationKey(item.latitude, item.longitude)));
    const relatedHotspots = hotspots.filter(
      (item) => item.wardId === sample.wardId && item.category === sample.category,
    );
    if (
      group.length < RECURRING_MIN_COMPLAINTS ||
      locations.size < RECURRING_MIN_LOCATIONS ||
      relatedHotspots.length < RECURRING_MIN_HOTSPOTS
    ) {
      continue;
    }

    const current = group.filter((item) => inCurrentPeriod(item.createdAt, windows)).length;
    const previous = group.filter((item) => inPreviousPeriod(item.createdAt, windows)).length;

    issues.push({
      id: recurringIssueId(sample.wardId, sample.category),
      wardId: sample.wardId,
      wardNumber: sample.wardNumber,
      wardName: sample.wardName,
      category: sample.category,
      title: `${sample.wardName} ${sample.category.toLowerCase().replaceAll("_", " ")}`,
      complaintIds: group.map((item) => item.id),
      complaintCount: group.length,
      distinctLocationCount: locations.size,
      hotspotCount: relatedHotspots.length,
      percentageChange: percentageChange(current, previous),
      slaBreachedCount: group.filter(
        (item) =>
          item.status !== "CLOSED" && snapshotSlaState(item, now) === "BREACHED",
      ).length,
      reopenedCount: group.filter((item) => item.status === "REOPENED").length,
      repeatAfterResolutionLocationCount: repeatAfterResolutionLocationCount(group),
      periodDays: windows.periodDays,
      hotspotIds: relatedHotspots.map((item) => item.id),
    });
  }

  return issues.sort((a, b) => b.complaintCount - a.complaintCount);
}

export interface Ward42Facts {
  drainageComplaintCount: number;
  distinctLocationCount: number;
  hotspotCount: number;
  percentageChange: number | null;
  slaBreachedCount: number;
  reopenedCount: number;
  repeatAfterResolutionLocationCount: number;
}

export function ward42DrainageFacts(
  complaints: ComplaintSnapshot[],
  now: Date,
): Ward42Facts {
  const drainage = complaints.filter(
    (item) => item.wardId === WARD_42_ID && item.category === "DRAINAGE",
  );
  const issue = computeRecurringIssues(drainage, now).find(
    (item) => item.wardId === WARD_42_ID && item.category === "DRAINAGE",
  );
  const windows = periodWindows(now);
  const current = drainage.filter((item) => inCurrentPeriod(item.createdAt, windows)).length;
  const previous = drainage.filter((item) => inPreviousPeriod(item.createdAt, windows)).length;
  const hotspots = computeHotspots(drainage, now);

  return {
    drainageComplaintCount: drainage.length,
    distinctLocationCount: new Set(
      drainage.map((item) => locationKey(item.latitude, item.longitude)),
    ).size,
    hotspotCount: hotspots.length,
    percentageChange: issue?.percentageChange ?? percentageChange(current, previous),
    slaBreachedCount: drainage.filter(
      (item) =>
        item.status !== "CLOSED" && snapshotSlaState(item, now) === "BREACHED",
    ).length,
    reopenedCount: drainage.filter((item) => item.status === "REOPENED").length,
    repeatAfterResolutionLocationCount: repeatAfterResolutionLocationCount(drainage),
  };
}

export function assertWard42Facts(facts: Ward42Facts): void {
  const expected = WARD_42_EXPECTED;
  const mismatches: string[] = [];

  if (facts.drainageComplaintCount !== expected.drainageComplaintCount) {
    mismatches.push(
      `drainage ${facts.drainageComplaintCount} !== ${expected.drainageComplaintCount}`,
    );
  }
  if (facts.distinctLocationCount !== expected.distinctLocationCount) {
    mismatches.push(
      `locations ${facts.distinctLocationCount} !== ${expected.distinctLocationCount}`,
    );
  }
  if (facts.hotspotCount !== expected.hotspotCount) {
    mismatches.push(`hotspots ${facts.hotspotCount} !== ${expected.hotspotCount}`);
  }
  if (facts.percentageChange !== expected.percentageChange) {
    mismatches.push(
      `percentageChange ${facts.percentageChange} !== ${expected.percentageChange}`,
    );
  }
  if (facts.slaBreachedCount !== expected.slaBreachedCount) {
    mismatches.push(
      `slaBreaches ${facts.slaBreachedCount} !== ${expected.slaBreachedCount}`,
    );
  }
  if (facts.reopenedCount !== expected.reopenedCount) {
    mismatches.push(`reopened ${facts.reopenedCount} !== ${expected.reopenedCount}`);
  }
  if (
    facts.repeatAfterResolutionLocationCount !==
    expected.repeatAfterResolutionLocationCount
  ) {
    mismatches.push(
      `repeat locations ${facts.repeatAfterResolutionLocationCount} !== ${expected.repeatAfterResolutionLocationCount}`,
    );
  }

  if (mismatches.length > 0) {
    throw new Error(`Ward 42 assertion failed: ${mismatches.join("; ")}`);
  }
}

export function hotspotCenter(gridCellKey: string) {
  return gridCellCenter(gridCellKey);
}
