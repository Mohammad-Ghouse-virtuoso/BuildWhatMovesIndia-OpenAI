import { describe, expect, it } from "vitest";

import type { RequestedItemDto } from "@/lib/rti/contracts/dtos";
import { PRIMARY_REQUEST_ID } from "@/lib/rti/domain/constants";

import {
  AI_DRAFT_NOTICE,
  DEMO_RESPONSE_HREF,
  UNANSWERED_COPY,
  WHY_STRONGER,
  WIZARD_STEPS,
  draftTextFromCategories,
  unansweredItems,
} from "./copy";

describe("citizen presentation copy", () => {
  it("labels AI drafts even when the model is off", () => {
    expect(AI_DRAFT_NOTICE.toLowerCase()).toContain("ai");
    expect(AI_DRAFT_NOTICE.toLowerCase()).toContain("review");
  });

  it("explains why the draft is stronger without alleging wrongdoing", () => {
    expect(WHY_STRONGER.toLowerCase()).toContain("records");
    expect(WHY_STRONGER.toLowerCase()).not.toContain("corrupt");
  });

  it("marks unanswered items as missing from the documents, not as facts", () => {
    expect(UNANSWERED_COPY.toLowerCase()).toContain("not answered");
    const items: RequestedItemDto[] = [
      {
        id: "a",
        categoryId: "execution.inspection_report",
        label: "Inspection report(s)",
        answered: false,
      },
      {
        id: "b",
        categoryId: "funding.sanctioned_amount",
        label: "Sanctioned amount",
        answered: true,
      },
    ];
    expect(unansweredItems(items)).toHaveLength(1);
    expect(unansweredItems(items)[0]?.id).toBe("a");
  });

  it("deep-links the seeded road project response", () => {
    expect(DEMO_RESPONSE_HREF).toBe(`/my-rti/${PRIMARY_REQUEST_ID}/response`);
  });

  it("keeps the ask wizard in PRD order", () => {
    expect(WIZARD_STEPS.map((step) => step.label)).toEqual([
      "Question",
      "Clarify",
      "Records",
      "Draft",
      "Review",
    ]);
  });

  it("builds a records-only draft from selected categories", () => {
    const text = draftTextFromCategories(["funding.sanctioned_amount"]);
    expect(text).toContain("Sanctioned amount");
    expect(text.toLowerCase()).toContain("not filed");
  });
});
