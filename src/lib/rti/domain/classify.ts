import {
  ROAD_PROJECT_CATEGORY_IDS,
  type InformationCategory,
  type InformationCategoryId,
  getInformationCategory,
} from "@/lib/rti/contracts/taxonomy";

const ROAD_HINTS = [
  "road",
  "highway",
  "crore",
  "spent",
  "money go",
  "sanction",
  "work order",
];
const HIRE_HINTS = ["hired", "recruit", "appoint", "vacanc"];

export type ClassifyQuestionResult = {
  categories: InformationCategory[];
  suggestedCategoryIds: InformationCategoryId[];
  clarifiedQuestion: string;
  missing: string[];
  usedFallback: boolean;
};

export function classifyQuestion(question: string): ClassifyQuestionResult {
  const text = question.trim().toLowerCase();
  const ids: InformationCategoryId[] = text && HIRE_HINTS.some((hint) => text.includes(hint))
    ? ["appointments.vacancies_notified", "appointments.persons_appointed"]
    : [...ROAD_PROJECT_CATEGORY_IDS];

  const looksLikeRoad = ROAD_HINTS.some((hint) => text.includes(hint));

  return {
    categories: ids.map((id) => getInformationCategory(id)!),
    suggestedCategoryIds: ids,
    clarifiedQuestion: looksLikeRoad
      ? "How public funds allocated to a road project were sanctioned, spent and documented."
      : question.trim() || "What records exist for this public decision?",
    missing: looksLikeRoad
      ? ["Which road or project?", "Which year or period?"]
      : ["Which public programme or record?", "Which year or period?"],
    usedFallback: true,
  };
}
