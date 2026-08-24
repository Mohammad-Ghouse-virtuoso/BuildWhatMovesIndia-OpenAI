import { describe, expect, it } from "vitest";

import { RtiDomainError } from "./errors";
import {
  assertTransition,
  canTransition,
  statusPathTo,
} from "./lifecycle";

describe("RTI lifecycle", () => {
  it("allows the filing hop and rejects a skip", () => {
    expect(canTransition("drafted", "submitted")).toBe(true);
    expect(() => assertTransition("drafted", "response_received")).toThrow(
      RtiDomainError,
    );
  });

  it("does not treat a no-op as a transition", () => {
    expect(() => assertTransition("submitted", "submitted")).toThrow(
      /already submitted/,
    );
  });

  it("builds a legal historical path for the primary demo status", () => {
    expect(statusPathTo("appeal_prepared")).toEqual([
      "drafted",
      "submitted",
      "received",
      "processing",
      "response_ready",
      "response_received",
      "appeal_prepared",
    ]);
  });
});
