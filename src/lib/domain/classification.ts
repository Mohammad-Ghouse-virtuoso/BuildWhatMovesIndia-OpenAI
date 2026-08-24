import type { ClassificationResult, ComplaintCategory } from "@/lib/contracts";
import { DEFAULT_SUBCATEGORY_BY_CATEGORY } from "@/lib/domain/subcategories";

interface KeywordRule {
  category: ComplaintCategory;
  patterns: RegExp[];
}

const RULES: KeywordRule[] = [
  {
    category: "DRAINAGE",
    patterns: [/drain/i, /overflow/i, /culvert/i, /sewage/i, /stagnant/i, /manhole/i],
  },
  {
    category: "WASTE_SANITATION",
    patterns: [/garbage/i, /waste/i, /dump/i, /not lifted/i, /sanitation/i, /trash/i],
  },
  {
    category: "WATER_SUPPLY",
    patterns: [/water/i, /leak/i, /pipeline/i, /tap/i, /supply/i],
  },
  {
    category: "STREET_LIGHTING",
    patterns: [/street light/i, /streetlight/i, /lamp/i, /dark pole/i],
  },
  {
    category: "PARKS_GREENERY",
    patterns: [/park/i, /tree/i, /greenery/i, /garden/i],
  },
  {
    category: "ROADS",
    patterns: [/road/i, /pothole/i, /patch/i, /asphalt/i, /footpath/i],
  },
];

export function classifyComplaintByKeywords(description: string): ClassificationResult {
  const text = description.trim();
  const match = RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(text)));
  const category: ComplaintCategory = match?.category ?? "ROADS";
  const subcategory = DEFAULT_SUBCATEGORY_BY_CATEGORY[category];
  const matchedRules = RULES.filter((rule) =>
    rule.patterns.some((pattern) => pattern.test(text)),
  );

  return {
    category,
    subcategory: subcategory.label,
    summary: summarize(text, subcategory.label),
    severity: category === "DRAINAGE" || category === "WATER_SUPPLY" ? "HIGH" : "MEDIUM",
    durationText: `${subcategory.slaHours} hours`,
    confidence: match ? Math.min(0.86, 0.55 + matchedRules.length * 0.12) : 0.34,
    source: "keyword-fallback",
    needsCitizenConfirmation: true,
  };
}

function summarize(description: string, subcategory: string): string {
  const clipped = description.replaceAll(/\s+/g, " ").trim().slice(0, 140);
  return clipped.length > 0 ? clipped : subcategory;
}
