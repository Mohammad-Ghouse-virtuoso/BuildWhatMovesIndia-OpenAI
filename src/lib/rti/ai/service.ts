import "server-only";

import crypto from "node:crypto";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { getAiEnv } from "@/lib/env";
import type { DocumentDto, RequestedItemDto } from "@/lib/rti/contracts/dtos";
import {
  INFORMATION_CATEGORIES,
  ROAD_PROJECT_CATEGORY_IDS,
  getInformationCategory,
  isInformationCategoryId,
  type InformationCategory,
  type InformationCategoryId,
} from "@/lib/rti/contracts/taxonomy";
import {
  classifyQuestion as fallbackClassifyQuestion,
  type ClassifyQuestionResult,
} from "@/lib/rti/domain/classify";

const ROAD_DEMO_QUESTION =
  "They said the road near my town cost ₹2 crore. Where did the money go?";
const SYNTHETIC_DISCLAIMER =
  "This is a records request in a synthetic demo. It is not filed with Government of India.";
const FALLBACK_WHY_STRONGER =
  "This version asks for named records and figures instead of asking the authority for opinions, explanations or allegations.";
const OPENAI_TIMEOUT_MS = 4_000;
const ROAD_PROJECT_CATEGORY_ID_SET = new Set<string>(ROAD_PROJECT_CATEGORY_IDS);

const INFORMATION_CATEGORY_IDS = INFORMATION_CATEGORIES.map(
  (category) => category.id,
) as InformationCategoryId[];

const informationCategoryIdSchema = z.enum([
  INFORMATION_CATEGORY_IDS[0]!,
  ...INFORMATION_CATEGORY_IDS.slice(1),
]);

const questionInterpretationSchema = z.object({
  topic: z.string().min(1),
  goal: z.string().min(1),
  missingDetails: z.array(z.string().min(1)).max(3),
  clarifyingQuestions: z.array(z.string().min(1)).max(3),
  suggestedCategoryIds: z.array(informationCategoryIdSchema).min(1),
  clarifiedQuestion: z.string().min(1),
});

const draftResponseSchema = z.object({
  draftText: z.string().min(1),
});

const whyStrongerResponseSchema = z.object({
  explanation: z.string().min(1),
});

const summaryFactSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  citation: z.object({
    documentName: z.string().min(1),
    excerpt: z.string().min(1),
  }),
});

const summaryResponseSchema = z.object({
  summary: z.string().min(1),
  facts: z.array(summaryFactSchema).max(10),
  unanswered: z.array(z.string().min(1)),
});

type QuestionInput = {
  question: string;
  clarifications?: string[];
};

type DraftInput = {
  question: string;
  clarifiedQuestion: string;
  clarifications?: string[];
  selectedCategoryIds: string[];
};

type WhyStrongerInput = DraftInput & {
  draftText: string;
};

type SummaryInput = {
  documents: DocumentDto[];
  unansweredItems: RequestedItemDto[];
};

export type IntentResult = Pick<
  z.infer<typeof questionInterpretationSchema>,
  "topic" | "goal" | "missingDetails"
>;

export type ClarifyingQuestionsResult = Pick<
  z.infer<typeof questionInterpretationSchema>,
  "clarifyingQuestions"
>;

export type InformationMapResult = {
  categories: InformationCategory[];
  suggestedCategoryIds: InformationCategoryId[];
};

export type WhyStrongerResult = z.infer<typeof whyStrongerResponseSchema>;
export type SummaryResult = z.infer<typeof summaryResponseSchema>;

type CachedStructuredResult = {
  data: unknown;
  usedFallback: boolean;
};

const responseCache = new Map<string, CachedStructuredResult>();

let cachedClient: OpenAI | null = null;
let cachedApiKey = "";
let roadDemoCachePrimed = false;

const TAXONOMY_GUIDE = INFORMATION_CATEGORIES.map(
  (category) => `${category.id} | ${category.group} | ${category.label}`,
).join("\n");

function normalizeQuestion(question: string) {
  return question.trim().replace(/\s+/g, " ");
}

function normalizeClarifications(clarifications: string[] = []) {
  return clarifications.map((value) => value.trim()).filter(Boolean);
}

function normalizeCategoryIds(categoryIds: string[]) {
  const unique = new Set<InformationCategoryId>();
  for (const categoryId of categoryIds) {
    if (isInformationCategoryId(categoryId)) {
      unique.add(categoryId);
    }
  }
  return [...unique];
}

function buildCacheKey(
  kind: string,
  question: string,
  clarifications: string[],
  selectedCategoryIds: string[],
) {
  const hash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        question: normalizeQuestion(question),
        clarifications: normalizeClarifications(clarifications),
        selectedCategoryIds: normalizeCategoryIds(selectedCategoryIds),
      }),
    )
    .digest("hex");
  return `${kind}:${hash}`;
}

function readCached<T>(key: string, schema: z.ZodType<T>) {
  const cached = responseCache.get(key);
  if (!cached) {
    return null;
  }

  return {
    data: schema.parse(cached.data),
    usedFallback: cached.usedFallback,
  };
}

function writeCached<T>(key: string, data: T, usedFallback: boolean) {
  responseCache.set(key, { data, usedFallback });
  return { data, usedFallback };
}

function buildClarificationSuffix(clarifications: string[]) {
  return normalizeClarifications(clarifications).join(". ");
}

function buildQuestionInterpretationFallback(
  input: QuestionInput,
): z.infer<typeof questionInterpretationSchema> {
  const base = fallbackClassifyQuestion(input.question);
  const clarificationSuffix = buildClarificationSuffix(input.clarifications ?? []);

  return {
    topic: guessTopic(input.question),
    goal: base.clarifiedQuestion,
    missingDetails: base.missing.slice(0, 2),
    clarifyingQuestions: base.missing.slice(0, 2),
    suggestedCategoryIds: base.suggestedCategoryIds,
    clarifiedQuestion: clarificationSuffix
      ? `${base.clarifiedQuestion} ${clarificationSuffix}`
      : base.clarifiedQuestion,
  };
}

function guessTopic(question: string) {
  const text = normalizeQuestion(question).toLowerCase();
  if (text.includes("road") || text.includes("highway")) {
    return "road project spending";
  }
  if (text.includes("contract") || text.includes("tender")) {
    return "public procurement records";
  }
  if (
    text.includes("recruit") ||
    text.includes("appoint") ||
    text.includes("vacanc")
  ) {
    return "appointments and recruitment records";
  }
  return "public records request";
}

function fallbackDraftText(
  categoryIds: InformationCategoryId[],
  question: string,
  clarifiedQuestion: string,
) {
  if (
    normalizeQuestion(question) === ROAD_DEMO_QUESTION &&
    hasRoadProjectShape(categoryIds)
  ) {
    return buildRoadDemoDraft();
  }

  const lines = categoryIds.map((categoryId, index) => {
    const category = getInformationCategory(categoryId);
    return `${index + 1}. ${category?.label ?? categoryId}.`;
  });

  return `Please provide certified copies / extracts of the following records relevant to this question:

Question: ${normalizeQuestion(question)}
Records focus: ${clarifiedQuestion}

${lines.join("\n")}

${SYNTHETIC_DISCLAIMER}`;
}

function buildRoadDemoDraft() {
  return `Please provide certified copies / extracts of records relating to the fictional "Town Link Road - Demonstration Stretch" (financial year 2024-25):

1. Administrative sanction for the project.
2. Sanctioned amount and any revised sanctioned amount.
3. Actual expenditure incurred.
4. The work order.
5. Name of the contractor/agency awarded the work.
6. Recorded start and completion dates.
7. Completion certificate, if issued.
8. Inspection report(s), if available.
9. Relevant payment records.

${SYNTHETIC_DISCLAIMER}`;
}

function hasRoadProjectShape(categoryIds: InformationCategoryId[]) {
  return categoryIds.every((categoryId) => ROAD_PROJECT_CATEGORY_ID_SET.has(categoryId));
}

function ensureDraftDisclaimer(draftText: string) {
  if (draftText.includes(SYNTHETIC_DISCLAIMER)) {
    return draftText;
  }
  return `${draftText.trim()}\n\n${SYNTHETIC_DISCLAIMER}`;
}

function ensureWhyStrongerSafety(explanation: string) {
  const unsafe =
    /\b(corrupt|fraud|illegal|unlawful|guarantee|prove)\b/i.test(explanation);
  return unsafe ? FALLBACK_WHY_STRONGER : explanation.trim();
}

function fallbackSummary(input: SummaryInput): SummaryResult {
  const facts = extractFactsFromDocuments(input.documents);
  const preferredSummaryFacts = prioritizeSummaryFacts(facts);
  const summary = facts.length
    ? `Summary from supplied synthetic documents: ${preferredSummaryFacts
        .slice(0, 4)
        .map((fact) => `${fact.label}: ${fact.value}`)
        .join(". ")}.`
    : "No extractable facts were found in the supplied synthetic documents.";

  return {
    summary,
    facts,
    unanswered: input.unansweredItems.map((item) => item.label),
  };
}

function prioritizeSummaryFacts(facts: SummaryResult["facts"]) {
  const priority = new Map<string, number>([
    ["Sanctioned amount", 0],
    ["Awarded value", 1],
    ["Expenditure booked", 2],
    ["Unspent vs sanction", 3],
    ["Recorded completion", 4],
    ["Recorded start", 5],
    ["Agency", 6],
    ["Work order", 7],
    ["Financial year", 8],
  ]);

  return [...facts].sort(
    (left, right) =>
      (priority.get(left.label) ?? Number.MAX_SAFE_INTEGER) -
      (priority.get(right.label) ?? Number.MAX_SAFE_INTEGER),
  );
}

function extractFactsFromDocuments(documents: DocumentDto[]) {
  const facts: SummaryResult["facts"] = [];
  const patterns = [
    { label: "Sanctioned amount", regex: /sanctioned amount:/i },
    { label: "Financial year", regex: /financial year:/i },
    { label: "Work order", regex: /work order no\./i },
    { label: "Agency", regex: /agency:/i },
    { label: "Awarded value", regex: /awarded value:/i },
    { label: "Expenditure booked", regex: /expenditure booked:/i },
    { label: "Unspent vs sanction", regex: /unspent vs sanction:/i },
    { label: "Recorded start", regex: /recorded start:/i },
    { label: "Recorded completion", regex: /recorded completion:/i },
  ];

  for (const document of documents) {
    const lines = document.content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      const pattern = patterns.find((candidate) => candidate.regex.test(line));
      if (!pattern) {
        continue;
      }

      const value = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line;
      facts.push({
        label: pattern.label,
        value,
        citation: {
          documentName: document.name,
          excerpt: line,
        },
      });
    }
  }

  const seen = new Set<string>();
  return facts.filter((fact) => {
    const key = `${fact.label}:${fact.value}:${fact.citation.documentName}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function summaryMatchesDocuments(summary: SummaryResult, documents: DocumentDto[]) {
  const documentText = documents.map((document) => document.content).join("\n");
  const summaryNumbers = summary.summary.match(/₹?\d[\d,./-]*/g) ?? [];
  const factsAreGrounded = summary.facts.every((fact) => {
    const excerptExists = documentText.includes(fact.citation.excerpt);
    const valueExists = fact.citation.excerpt.includes(fact.value);
    return excerptExists && valueExists;
  });
  const summaryNumbersAreGrounded = summaryNumbers.every((token) =>
    documentText.includes(token),
  );
  return factsAreGrounded && summaryNumbersAreGrounded;
}

function primeRoadDemoCache() {
  if (roadDemoCachePrimed) {
    return;
  }
  roadDemoCachePrimed = true;

  const interpretation = buildQuestionInterpretationFallback({
    question: ROAD_DEMO_QUESTION,
    clarifications: [],
  });

  writeCached(
    buildCacheKey("question_interpretation", ROAD_DEMO_QUESTION, [], []),
    interpretation,
    true,
  );
  writeCached(
    buildCacheKey(
      "draft_request",
      ROAD_DEMO_QUESTION,
      [],
      [...ROAD_PROJECT_CATEGORY_IDS],
    ),
    { draftText: buildRoadDemoDraft() },
    true,
  );
  writeCached(
    buildCacheKey(
      "why_stronger",
      ROAD_DEMO_QUESTION,
      [],
      [...ROAD_PROJECT_CATEGORY_IDS],
    ),
    { explanation: FALLBACK_WHY_STRONGER },
    true,
  );
}

function getOpenAiClient() {
  const env = getAiEnv();
  if (!env.enabled) {
    return null;
  }

  if (!cachedClient || cachedApiKey !== env.apiKey) {
    cachedClient = new OpenAI({ apiKey: env.apiKey });
    cachedApiKey = env.apiKey;
  }

  return {
    client: cachedClient,
    model: env.model,
  };
}

async function resolveStructured<T>({
  kind,
  schema,
  question,
  clarifications,
  selectedCategoryIds,
  systemPrompt,
  userPrompt,
  fallback,
  validate,
}: {
  kind: string;
  schema: z.ZodType<T>;
  question: string;
  clarifications: string[];
  selectedCategoryIds: string[];
  systemPrompt: string;
  userPrompt: string;
  fallback: () => T;
  validate?: (value: T) => boolean;
}) {
  primeRoadDemoCache();

  const cacheKey = buildCacheKey(
    kind,
    question,
    clarifications,
    selectedCategoryIds,
  );
  const cached = readCached(cacheKey, schema);
  if (cached) {
    return cached;
  }

  const openai = getOpenAiClient();
  if (!openai) {
    return writeCached(cacheKey, fallback(), true);
  }

  try {
    const response = await openai.client.responses.parse({
      model: openai.model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: zodTextFormat(schema, kind),
      },
    }, {
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      throw new Error(`No parsed output returned for ${kind}.`);
    }

    if (validate && !validate(parsed)) {
      throw new Error(`Parsed ${kind} output failed post-validation.`);
    }

    return writeCached(cacheKey, parsed, false);
  } catch {
    return writeCached(cacheKey, fallback(), true);
  }
}

async function interpretQuestion(input: QuestionInput) {
  const question = normalizeQuestion(input.question);
  const clarifications = normalizeClarifications(input.clarifications);
  const fallback = () => buildQuestionInterpretationFallback({ question, clarifications });

  const result = await resolveStructured({
    kind: "question_interpretation",
    schema: questionInterpretationSchema,
    question,
    clarifications,
    selectedCategoryIds: [],
    systemPrompt:
      "You help users turn citizen questions into RTI record requests for the Ask India demo. " +
      "Never invent government APIs, filings, deadlines, legal advice, authorities, or facts. " +
      "Use only the controlled taxonomy ids provided. Ask only necessary clarifications.",
    userPrompt: [
      `Question: ${question}`,
      clarifications.length
        ? `Citizen clarifications:\n- ${clarifications.join("\n- ")}`
        : "Citizen clarifications: none supplied",
      "Controlled taxonomy:",
      TAXONOMY_GUIDE,
      "Return a records-oriented clarifiedQuestion, necessary missingDetails, necessary clarifyingQuestions, and suggestedCategoryIds only from the taxonomy.",
    ].join("\n\n"),
    fallback,
    validate: (value) =>
      value.suggestedCategoryIds.every((categoryId) =>
        isInformationCategoryId(categoryId),
      ),
  });

  const normalizedIds = normalizeCategoryIds(result.data.suggestedCategoryIds);
  return {
    ...result,
    data: {
      ...result.data,
      suggestedCategoryIds:
        normalizedIds.length > 0
          ? normalizedIds
          : fallback().suggestedCategoryIds,
      missingDetails: result.data.missingDetails.slice(0, 2),
      clarifyingQuestions: result.data.clarifyingQuestions.slice(0, 2),
    },
  };
}

export async function extractIntent(input: QuestionInput): Promise<IntentResult> {
  const result = await interpretQuestion(input);
  return {
    topic: result.data.topic,
    goal: result.data.goal,
    missingDetails: result.data.missingDetails,
  };
}

export async function suggestClarifyingQuestions(
  input: QuestionInput,
): Promise<ClarifyingQuestionsResult> {
  const result = await interpretQuestion(input);
  return {
    clarifyingQuestions: result.data.clarifyingQuestions,
  };
}

export async function mapInformationCategories(
  input: QuestionInput,
): Promise<InformationMapResult> {
  const result = await interpretQuestion(input);
  return {
    suggestedCategoryIds: result.data.suggestedCategoryIds,
    categories: result.data.suggestedCategoryIds
      .map((categoryId) => getInformationCategory(categoryId))
      .filter((category): category is InformationCategory => Boolean(category)),
  };
}

export async function classifyQuestion(input: QuestionInput): Promise<ClassifyQuestionResult> {
  const full = await interpretQuestion(input);
  const categories = full.data.suggestedCategoryIds
    .map((categoryId) => getInformationCategory(categoryId))
    .filter((category): category is InformationCategory => Boolean(category));

  return {
    categories,
    suggestedCategoryIds: full.data.suggestedCategoryIds,
    clarifiedQuestion: full.data.clarifiedQuestion,
    missing:
      full.data.missingDetails.length > 0
        ? full.data.missingDetails
        : full.data.clarifyingQuestions,
    usedFallback: full.usedFallback,
  };
}

export async function generateDraft(input: DraftInput) {
  const question = normalizeQuestion(input.question);
  const clarifications = normalizeClarifications(input.clarifications);
  const selectedCategoryIds = normalizeCategoryIds(input.selectedCategoryIds);
  const fallback = () => ({
    draftText: fallbackDraftText(
      selectedCategoryIds,
      question,
      input.clarifiedQuestion.trim(),
    ),
  });

  const result = await resolveStructured({
    kind: "draft_request",
    schema: draftResponseSchema,
    question,
    clarifications,
    selectedCategoryIds,
    systemPrompt:
      "Write a compact, editable RTI draft for the Ask India demo. " +
      "Ask for records, extracts, copies, dates, figures, and named files. " +
      "Do not ask for opinions, explanations, allegations, or legal conclusions. " +
      "Do not claim the request was filed. End with the synthetic-demo disclaimer.",
    userPrompt: [
      `Question: ${question}`,
      `Records focus: ${input.clarifiedQuestion.trim()}`,
      clarifications.length
        ? `Citizen clarifications:\n- ${clarifications.join("\n- ")}`
        : "Citizen clarifications: none supplied",
      "Selected categories:",
      selectedCategoryIds
        .map((categoryId) => {
          const category = getInformationCategory(categoryId);
          return `- ${categoryId}: ${category?.label ?? categoryId}`;
        })
        .join("\n"),
    ].join("\n\n"),
    fallback,
  });

  return {
    draftText: ensureDraftDisclaimer(result.data.draftText),
    usedFallback: result.usedFallback,
  };
}

export async function explainWhyStronger(input: WhyStrongerInput) {
  const question = normalizeQuestion(input.question);
  const clarifications = normalizeClarifications(input.clarifications);
  const selectedCategoryIds = normalizeCategoryIds(input.selectedCategoryIds);
  const fallback = () => ({
    explanation: FALLBACK_WHY_STRONGER,
  });

  const result = await resolveStructured({
    kind: "why_stronger",
    schema: whyStrongerResponseSchema,
    question,
    clarifications,
    selectedCategoryIds,
    systemPrompt:
      "Explain, in 1-2 short sentences, why an RTI draft is stronger when it asks for records instead of opinions. " +
      "Do not give legal advice or allege wrongdoing.",
    userPrompt: [
      `Question: ${question}`,
      `Records focus: ${input.clarifiedQuestion.trim()}`,
      "Selected categories:",
      selectedCategoryIds.join(", "),
      "Draft:",
      input.draftText.trim(),
    ].join("\n\n"),
    fallback,
  });

  return {
    explanation: ensureWhyStrongerSafety(result.data.explanation),
    usedFallback: result.usedFallback,
  };
}

export async function summarizeDocuments(input: SummaryInput) {
  const fallback = fallbackSummary(input);
  const joinedDocuments = input.documents
    .map((document) => `# ${document.name}\n${document.content}`)
    .join("\n\n");
  const unanswered = input.unansweredItems.map((item) => item.label);

  primeRoadDemoCache();
  const cacheKey = buildCacheKey(
    "document_summary",
    joinedDocuments,
    unanswered,
    [],
  );
  const cached = readCached(cacheKey, summaryResponseSchema);
  if (cached) {
    return {
      ...cached.data,
      usedFallback: cached.usedFallback,
    };
  }

  // Do not await OpenAI here. /response is a click-navigation; a 2–4s model
  // call made "Open demo" look frozen. Facts still come from the same docs.
  // Grounding check stays in-tree even though we no longer wait on the model.
  void summaryMatchesDocuments(fallback, input.documents);
  writeCached(cacheKey, fallback, true);
  return {
    ...fallback,
    usedFallback: true,
  };
}
