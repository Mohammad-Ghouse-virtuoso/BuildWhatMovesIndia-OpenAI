"use server";

import { redirect } from "next/navigation";

import {
  DEMO_USER_ID,
  PRIMARY_AUTHORITY_ID,
} from "@/lib/rti/domain/constants";
import { classifyQuestion, generateDraft } from "@/lib/rti/ai/service";
import { rti } from "@/lib/rti/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function startClarify(formData: FormData) {
  const question = text(formData, "question");
  if (!question) {
    redirect("/ask");
  }
  redirect(`/ask/clarify?q=${encodeURIComponent(question)}`);
}

export async function saveClarification(formData: FormData) {
  const question = text(formData, "question");
  const project = text(formData, "project");
  const period = text(formData, "period");
  if (!question) {
    redirect("/ask");
  }

  const clarifications = [
    project && `Project/road: ${project}`,
    period && `Period: ${period}`,
  ].filter(Boolean);
  const classified = await classifyQuestion({ question, clarifications });

  const draft = await rti().createDraft({
    userId: DEMO_USER_ID,
    authorityId: PRIMARY_AUTHORITY_ID,
    originalQuestion: question,
    clarifiedQuestion: classified.clarifiedQuestion,
    informationCategories: classified.suggestedCategoryIds,
  });

  redirect(`/ask/information?id=${draft.id}`);
}

export async function saveInformation(formData: FormData) {
  const id = text(formData, "id");
  const categories = formData
    .getAll("category")
    .map((value) => String(value))
    .filter(Boolean);

  if (!id || categories.length === 0) {
    redirect(id ? `/ask/information?id=${id}` : "/ask");
  }

  const request = await rti().getRequest(id);
  if (!request) {
    redirect("/ask");
  }

  const draft = await generateDraft({
    question: request.originalQuestion,
    clarifiedQuestion: request.clarifiedQuestion,
    clarifications: [],
    selectedCategoryIds: categories,
  });

  await rti().updateDraft({
    id,
    informationCategories: categories,
    draftText: draft.draftText,
  });

  redirect(`/ask/draft?id=${id}`);
}

export async function saveDraft(formData: FormData) {
  const id = text(formData, "id");
  const draftText = text(formData, "draftText");
  if (!id || !draftText) {
    redirect(id ? `/ask/draft?id=${id}` : "/ask");
  }

  await rti().updateDraft({ id, draftText });
  redirect(`/ask/review?id=${id}`);
}

export async function fileRequest(formData: FormData) {
  const id = text(formData, "id");
  const authorityId = text(formData, "authorityId");
  const draftText = text(formData, "draftText");
  if (!id) {
    redirect("/ask");
  }

  if (authorityId || draftText) {
    await rti().updateDraft({
      id,
      authorityId: authorityId || undefined,
      draftText: draftText || undefined,
    });
  }

  const submitted = await rti().submitRequest(id);
  redirect(`/submitted/${submitted.id}`);
}

export async function prepareFirstAppeal(formData: FormData) {
  const id = text(formData, "id");
  if (!id) {
    redirect("/my-rti");
  }

  await rti().prepareAppeal(id);
  redirect(`/my-rti/${id}/appeal`);
}
