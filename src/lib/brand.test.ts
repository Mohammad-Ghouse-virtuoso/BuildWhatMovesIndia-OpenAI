import { describe, expect, it } from "vitest";

import { PRODUCT_NAME, TAGLINE } from "./brand";

describe("Ask India brand", () => {
  it("locks the product name and tagline", () => {
    expect(PRODUCT_NAME).toBe("Ask India");
    expect(TAGLINE).toBe("Turn questions into evidence.");
  });
});
