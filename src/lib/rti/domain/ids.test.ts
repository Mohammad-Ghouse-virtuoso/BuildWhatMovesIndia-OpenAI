import { describe, expect, it } from "vitest";

import { PRIMARY_REGISTRATION_NUMBER } from "./constants";
import {
  formatRegistrationNumber,
  nextRegistrationNumber,
  parseRegistrationSerial,
} from "./ids";

describe("DEMO registration numbers", () => {
  it("formats the locked 2026 prefix", () => {
    expect(formatRegistrationNumber(4281)).toBe(PRIMARY_REGISTRATION_NUMBER);
    expect(parseRegistrationSerial(PRIMARY_REGISTRATION_NUMBER)).toBe(4281);
  });

  it("issues the next serial after existing DEMO numbers", () => {
    expect(
      nextRegistrationNumber(["DEMO/RTI/2026/004281", "DEMO/RTI/2026/004279"]),
    ).toBe("DEMO/RTI/2026/004282");
  });
});
