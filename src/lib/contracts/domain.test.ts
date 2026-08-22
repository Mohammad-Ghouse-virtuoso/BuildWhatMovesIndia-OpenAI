import { describe, expect, it } from "vitest";

import {
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_STATUS_TRANSITIONS,
} from "./domain";

describe("complaint status contract", () => {
  it("publishes a label and transition list for every status", () => {
    for (const status of COMPLAINT_STATUSES) {
      expect(COMPLAINT_STATUS_LABELS[status]).toBeTruthy();
      expect(COMPLAINT_STATUS_TRANSITIONS[status]).toBeDefined();
    }
  });

  it("requires citizen verification before closure", () => {
    expect(COMPLAINT_STATUS_TRANSITIONS.IN_PROGRESS).toEqual([
      "AWAITING_VERIFICATION",
    ]);
    expect(COMPLAINT_STATUS_TRANSITIONS.AWAITING_VERIFICATION).toContain("CLOSED");
    expect(COMPLAINT_STATUS_TRANSITIONS.AWAITING_VERIFICATION).toContain("REOPENED");
  });
});
