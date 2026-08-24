import { describe, expect, it } from "vitest";

import { PRIMARY_REGISTRATION_NUMBER, PRIMARY_REQUEST_ID } from "@/lib/rti/domain/constants";
import {
  PRIMARY_UNANSWERED_COUNT,
  SEED_REQUESTS,
  assertPrimarySeedInvariants,
  unansweredCount,
} from "./dataset";

describe("Ask India seed dataset", () => {
  it("locks the road-project registration and a single unanswered item", () => {
    expect(() => assertPrimarySeedInvariants()).not.toThrow();

    const primary = SEED_REQUESTS.find((row) => row.id === PRIMARY_REQUEST_ID);
    expect(primary?.registrationNumber).toBe(PRIMARY_REGISTRATION_NUMBER);
    expect(PRIMARY_UNANSWERED_COUNT).toBe(1);
    expect(unansweredCount(primary?.requestedItems ?? [])).toBe(1);
    expect(SEED_REQUESTS.length).toBeGreaterThanOrEqual(10);
    expect(SEED_REQUESTS.length).toBeLessThanOrEqual(20);
  });

  it("labels every seeded document as synthetic", () => {
    for (const request of SEED_REQUESTS) {
      for (const document of request.documents) {
        expect(document.synthetic).toBe(true);
        expect(document.content.startsWith("SYNTHETIC DEMO DOCUMENT")).toBe(true);
      }
    }
  });
});
