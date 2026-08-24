import {
  INFORMATION_CATEGORIES,
  getInformationCategory,
} from "@/lib/rti/contracts/taxonomy";
import type { RequestedItemDto } from "@/lib/rti/contracts/dtos";
import type { RtiStatus } from "@/lib/rti/domain/lifecycle";
import { PRIMARY_REQUEST_ID } from "@/lib/rti/domain/constants";

export const AI_DRAFT_NOTICE =
  "AI-generated draft · Review before filing · Not legal advice";

export const WHY_STRONGER =
  "This version asks for named records and figures (sanction, expenditure, work order, dates) instead of asking the authority to give an opinion or explain why something happened.";

export const UNANSWERED_COPY =
  "This item was not answered by the documents provided.";

export const ROAD_DEMO_QUESTION =
  "They said the road near my town cost ₹2 crore. Where did the money go?";

export const DEMO_RESPONSE_HREF = `/my-rti/${PRIMARY_REQUEST_ID}/response`;

export const EXAMPLE_PROMPTS = [
  ROAD_DEMO_QUESTION,
  "Who received the contract for this project?",
  "How many people were recruited?",
  "What was the sanctioned budget?",
  "When was this project completed?",
] as const;

export const CLAIM_CARDS = [
  {
    title: "How much did this project actually cost?",
    href: `/ask?q=${encodeURIComponent(ROAD_DEMO_QUESTION)}`,
  },
  {
    title: "Who received this contract?",
    href: `/ask?q=${encodeURIComponent("Who received the contract for this project?")}`,
  },
  {
    title: "How many people were hired?",
    href: `/ask?q=${encodeURIComponent("How many people were recruited?")}`,
  },
] as const;

export const STATUS_LABEL: Record<RtiStatus, string> = {
  drafted: "Draft",
  submitted: "Submitted (demo)",
  received: "Marked received",
  processing: "Under process",
  additional_information: "More information asked",
  response_ready: "Response ready",
  response_received: "Response available",
  appeal_prepared: "First appeal drafted",
  appeal_submitted: "Appeal recorded (demo)",
};

export const WIZARD_STEPS = [
  { href: "/ask", label: "Question" },
  { href: "/ask/clarify", label: "Clarify" },
  { href: "/ask/information", label: "Records" },
  { href: "/ask/draft", label: "Draft" },
  { href: "/ask/review", label: "Review" },
] as const;

export function unansweredItems(items: RequestedItemDto[]): RequestedItemDto[] {
  return items.filter((item) => !item.answered);
}

export function draftTextFromCategories(categoryIds: string[]): string {
  const lines = categoryIds.map((id, index) => {
    const category = getInformationCategory(id);
    return `${index + 1}. ${category?.label ?? id}.`;
  });

  return `Please provide certified copies / extracts of the following records:\n\n${lines.join("\n")}\n\nThis is a records request in a synthetic demo. It is not filed with Government of India.`;
}

export function formatIst(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function categoriesByGroup() {
  const groups: Record<string, { id: string; label: string }[]> = {};
  for (const category of INFORMATION_CATEGORIES) {
    const list = groups[category.group] ?? [];
    list.push({ id: category.id, label: category.label });
    groups[category.group] = list;
  }
  return groups;
}
