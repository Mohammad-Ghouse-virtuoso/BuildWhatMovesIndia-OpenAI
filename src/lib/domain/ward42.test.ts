import { describe, expect, it } from "vitest";

import { WARD_42_EXPECTED, WARD_42_ID } from "@/lib/domain/constants";
import { gridCellKey, offsetFromOrigin } from "@/lib/domain/grid";
import { assertTransition, canTransition } from "@/lib/domain/lifecycle";
import { DomainError } from "@/lib/domain/errors";
import { isEscalationPermitted, nextEscalation, SUPERVISOR_QUEUE } from "@/lib/domain/escalation";
import { percentageChange } from "@/lib/domain/periods";
import { slaState } from "@/lib/domain/sla";
import { buildSyntheticDataset } from "@/lib/domain/synthetic-dataset";
import { classifyComplaintByKeywords } from "@/lib/domain/classification";
import { attentionPriority } from "@/lib/domain/priority";
import {
  assertWard42Facts,
  computeHotspots,
  ward42DrainageFacts,
} from "@/lib/intelligence/facts";
import { snapshotFromSeed } from "@/lib/intelligence/snapshots";

describe("lifecycle", () => {
  it("rejects illegal transitions", () => {
    expect(canTransition("IN_PROGRESS", "CLOSED")).toBe(false);
    expect(() => assertTransition("CLOSED", "ASSIGNED")).toThrow(DomainError);
    expect(() => assertTransition("IN_PROGRESS", "AWAITING_VERIFICATION")).not.toThrow();
  });
});

describe("sla", () => {
  it("classifies within, at-risk, and breached from stored deadlines", () => {
    const now = new Date("2026-08-22T12:00:00.000Z");
    expect(
      slaState({
        now,
        deadline: new Date("2026-08-23T12:00:00.000Z"),
        durationHours: 24,
        status: "IN_PROGRESS",
        closedAt: null,
      }),
    ).toBe("WITHIN_SLA");
    expect(
      slaState({
        now,
        deadline: new Date("2026-08-22T16:00:00.000Z"),
        durationHours: 24,
        status: "IN_PROGRESS",
        closedAt: null,
      }),
    ).toBe("AT_RISK");
    expect(
      slaState({
        now,
        deadline: new Date("2026-08-21T12:00:00.000Z"),
        durationHours: 24,
        status: "IN_PROGRESS",
        closedAt: null,
      }),
    ).toBe("BREACHED");
  });
});

describe("grid", () => {
  it("keeps nearby meter offsets in one cell without rounding lat/lng decimals", () => {
    const a = offsetFromOrigin(10, 10);
    const b = offsetFromOrigin(40, 35);
    const c = offsetFromOrigin(150, 15);
    expect(gridCellKey(a.latitude, a.longitude)).toBe(gridCellKey(b.latitude, b.longitude));
    expect(gridCellKey(a.latitude, a.longitude)).not.toBe(
      gridCellKey(c.latitude, c.longitude),
    );
    expect(a.latitude.toFixed(4)).not.toBe(String(a.latitude));
  });
});

describe("escalation and priority", () => {
  it("uses prototype queue labels and breached-first priority", () => {
    expect(nextEscalation(0)?.queueLabel).toBe(SUPERVISOR_QUEUE);
    expect(isEscalationPermitted({ status: "CLOSED", slaState: "BREACHED", escalationCount: 0 })).toBe(
      false,
    );
    expect(
      isEscalationPermitted({
        status: "IN_PROGRESS",
        slaState: "BREACHED",
        escalationCount: 0,
      }),
    ).toBe(true);
    expect(
      attentionPriority({ slaState: "BREACHED", severity: "LOW", recurringIssueId: null }),
    ).toBe("SLA_BREACHED");
  });
});

describe("keyword classification", () => {
  it("routes drain overflow text to drainage without claiming OpenAI", () => {
    const result = classifyComplaintByKeywords("Drain overflow near the culvert again");
    expect(result.category).toBe("DRAINAGE");
    expect(result.source).toBe("keyword-fallback");
    expect(result.needsCitizenConfirmation).toBe(true);
  });
});

describe("Ward 42 seed facts", () => {
  it("emerges from records, not UI constants", () => {
    const now = new Date("2026-08-22T12:00:00.000Z");
    const dataset = buildSyntheticDataset(now);
    const snapshots = dataset.complaints.map((complaint) =>
      snapshotFromSeed(complaint, dataset.wards),
    );
    const facts = ward42DrainageFacts(snapshots, now);
    expect(percentageChange(17, 12)).toBe(42);
    assertWard42Facts(facts);
    expect(facts).toEqual(WARD_42_EXPECTED);

    const drainage = snapshots.filter(
      (item) => item.wardId === WARD_42_ID && item.category === "DRAINAGE",
    );
    expect(computeHotspots(drainage, now)).toHaveLength(3);
    expect(new Set(dataset.wards.map((ward) => ward.number)).size).toBe(24);
  });

  it("rebuilds the same Ward 42 facts (idempotent generator)", () => {
    const now = new Date("2026-08-22T12:00:00.000Z");
    const first = ward42DrainageFacts(
      buildSyntheticDataset(now).complaints.map((complaint) =>
        snapshotFromSeed(complaint, buildSyntheticDataset(now).wards),
      ),
      now,
    );
    const second = ward42DrainageFacts(
      buildSyntheticDataset(now).complaints.map((complaint) =>
        snapshotFromSeed(complaint, buildSyntheticDataset(now).wards),
      ),
      now,
    );
    expect(first).toEqual(second);
  });
});
