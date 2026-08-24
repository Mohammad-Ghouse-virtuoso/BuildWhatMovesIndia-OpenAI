import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROAD_PROJECT_CATEGORY_IDS } from "@/lib/rti/contracts/taxonomy";
import { PRIMARY_REQUEST_ID } from "@/lib/rti/domain/constants";
import { SEED_REQUESTS } from "@/lib/rti/seed/dataset";

vi.mock("server-only", () => ({}));

async function loadService() {
  return import("./service");
}

const ROAD_DEMO_QUESTION =
  "They said the road near my town cost ₹2 crore. Where did the money go?";

const previousOpenAiKey = process.env.OPENAI_API_KEY;
const previousOpenAiModel = process.env.OPENAI_MODEL;

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_MODEL;
});

afterEach(() => {
  if (previousOpenAiKey) {
    process.env.OPENAI_API_KEY = previousOpenAiKey;
  } else {
    delete process.env.OPENAI_API_KEY;
  }

  if (previousOpenAiModel) {
    process.env.OPENAI_MODEL = previousOpenAiModel;
  } else {
    delete process.env.OPENAI_MODEL;
  }
});

describe("rti ai service", () => {
  it("falls back to deterministic road classification when the model is disabled", async () => {
    const { classifyQuestion } = await loadService();
    const result = await classifyQuestion({
      question: ROAD_DEMO_QUESTION,
      clarifications: [],
    });

    expect(result.usedFallback).toBe(true);
    expect(result.suggestedCategoryIds).toContain("funding.actual_expenditure");
    expect(result.suggestedCategoryIds).toContain("execution.inspection_report");
  });

  it("builds the road-demo draft without a live model round-trip", async () => {
    const { generateDraft } = await loadService();
    const draft = await generateDraft({
      question: ROAD_DEMO_QUESTION,
      clarifiedQuestion:
        "How public funds allocated to a road project were sanctioned, spent and documented.",
      clarifications: [],
      selectedCategoryIds: [...ROAD_PROJECT_CATEGORY_IDS],
    });

    expect(draft.usedFallback).toBe(true);
    expect(draft.draftText).toContain("Town Link Road - Demonstration Stretch");
    expect(draft.draftText).toContain("Inspection report(s), if available.");
    expect(draft.draftText).toContain("not filed with Government of India");
  });

  it("keeps the why-stronger copy record-oriented", async () => {
    const { explainWhyStronger } = await loadService();
    const explanation = await explainWhyStronger({
      question: ROAD_DEMO_QUESTION,
      clarifiedQuestion:
        "How public funds allocated to a road project were sanctioned, spent and documented.",
      clarifications: [],
      selectedCategoryIds: [...ROAD_PROJECT_CATEGORY_IDS],
      draftText: "Draft placeholder",
    });

    expect(explanation.explanation.toLowerCase()).toContain("records");
    expect(explanation.explanation.toLowerCase()).not.toContain("corrupt");
    expect(explanation.explanation.toLowerCase()).not.toContain("legal");
  });

  it("summarizes only values that exist in the supplied synthetic documents", async () => {
    const { summarizeDocuments } = await loadService();
    const request = SEED_REQUESTS.find((candidate) => candidate.id === PRIMARY_REQUEST_ID);
    expect(request).toBeDefined();

    const summary = await summarizeDocuments({
      documents: request!.documents.map((document) => ({
        ...document,
        requestId: request!.id,
      })),
      unansweredItems: request!.requestedItems.filter((item) => !item.answered),
    });

    expect(summary.usedFallback).toBe(true);
    expect(summary.summary).toContain("₹2,00,00,000");
    expect(summary.summary).toContain("₹1,87,40,000");
    expect(summary.summary).not.toContain("₹3,00,00,000");
    expect(summary.unanswered[0]).toContain("inspection report");

    for (const fact of summary.facts) {
      expect(fact.citation.excerpt).toContain(fact.value);
    }
  });
});
