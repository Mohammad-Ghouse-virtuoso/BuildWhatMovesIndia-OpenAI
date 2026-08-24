import { describe, expect, it } from "vitest";

import { DEMO_DISCLOSURE_ITEMS, PRODUCT_NAME, TAGLINE } from "./brand";

describe("Ask India brand", () => {
  it("locks the product name and tagline", () => {
    expect(PRODUCT_NAME).toBe("Ask India");
    expect(TAGLINE).toBe("Turn questions into evidence.");
  });

  it("keeps the demo banner honesty guardrails", () => {
    expect(DEMO_DISCLOSURE_ITEMS).toEqual([
      "Demo environment",
      "Synthetic data",
      "Not official RTI Online",
      "Central public authorities only",
      "AI drafts and summaries are assistive, not official",
      "Not filed with Government of India",
    ]);
  });
});
