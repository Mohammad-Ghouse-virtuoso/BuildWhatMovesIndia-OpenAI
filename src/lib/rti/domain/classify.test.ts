import { describe, expect, it } from "vitest";

import { classifyQuestion } from "./classify";

describe("deterministic question classify", () => {
  it("maps the road-money question onto funding and execution records", () => {
    const result = classifyQuestion(
      "They said the road near my town cost ₹2 crore. Where did the money go?",
    );

    expect(result.usedFallback).toBe(true);
    expect(result.suggestedCategoryIds).toContain("funding.actual_expenditure");
    expect(result.suggestedCategoryIds).toContain("execution.inspection_report");
  });
});
