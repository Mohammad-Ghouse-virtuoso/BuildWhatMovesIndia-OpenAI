import type { PrismaClient } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

import { getInformationCategory } from "@/lib/rti/contracts/taxonomy";
import type { RequestedItemDto } from "@/lib/rti/contracts/dtos";
import { RESPONSE_DUE_DAYS } from "@/lib/rti/domain/constants";
import { RtiDomainError } from "@/lib/rti/domain/errors";
import { nextRegistrationNumber } from "@/lib/rti/domain/ids";
import {
  EVENT_COPY,
  assertTransition,
  type RtiStatus,
} from "@/lib/rti/domain/lifecycle";
import { classifyQuestion } from "@/lib/rti/domain/classify";

import { toAppealDto, toAuthorityDto, toDocumentDto, toRequestDto, parseRequestedItems } from "./mappers";

type Db = PrismaClient;

function jsonItems(items: RequestedItemDto[]): Prisma.InputJsonValue {
  return items as unknown as Prisma.InputJsonValue;
}

export async function listAuthorities(db: Db) {
  const rows = await db.publicAuthority.findMany({
    where: { isDemo: true },
    orderBy: { name: "asc" },
  });
  return rows.map(toAuthorityDto);
}

export async function getRequest(db: Db, id: string) {
  const row = await db.rtiRequest.findUnique({ where: { id } });
  return row ? toRequestDto(row) : null;
}

export async function listMyRequests(db: Db, userId: string) {
  const rows = await db.rtiRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRequestDto);
}

export async function getDocuments(db: Db, requestId: string) {
  const rows = await db.document.findMany({ where: { requestId } });
  return rows.map(toDocumentDto);
}

export async function getResponse(db: Db, id: string) {
  const row = await db.rtiRequest.findUnique({
    where: { id },
    include: { documents: true, appeals: true },
  });
  if (!row) {
    return null;
  }

  const request = toRequestDto(row);
  const unansweredItems = request.requestedItems.filter((item) => !item.answered);

  return {
    request,
    documents: row.documents.map(toDocumentDto),
    unansweredItems,
    appeals: row.appeals.map(toAppealDto),
  };
}

export async function transitionRequest(
  db: Db,
  id: string,
  to: RtiStatus,
  extra: Prisma.RtiRequestUpdateInput = {},
) {
  return db.$transaction(async (tx) => {
    const current = await tx.rtiRequest.findUnique({ where: { id } });
    if (!current) {
      throw new RtiDomainError("REQUEST_NOT_FOUND", `Request ${id} was not found.`);
    }

    assertTransition(current.status as RtiStatus, to);

    const updated = await tx.rtiRequest.update({
      where: { id },
      data: {
        ...extra,
        status: to,
      },
    });

    await tx.rtiEvent.create({
      data: {
        id: crypto.randomUUID(),
        requestId: id,
        type: to,
        description: EVENT_COPY[to],
        timestamp: new Date(),
      },
    });

    return toRequestDto(updated);
  });
}

export async function createDraft(
  db: Db,
  input: {
    userId: string;
    authorityId: string;
    originalQuestion: string;
    clarifiedQuestion?: string;
    informationCategories?: string[];
  },
) {
  const classified = classifyQuestion(input.originalQuestion);
  const informationCategories =
    input.informationCategories ?? classified.suggestedCategoryIds;
  const clarifiedQuestion = input.clarifiedQuestion ?? classified.clarifiedQuestion;
  const now = new Date();
  const id = crypto.randomUUID();

  const created = await db.$transaction(async (tx) => {
    const row = await tx.rtiRequest.create({
      data: {
        id,
        userId: input.userId,
        authorityId: input.authorityId,
        originalQuestion: input.originalQuestion,
        clarifiedQuestion,
        draftText: draftFromCategories(informationCategories),
        status: "drafted",
        informationCategories,
        requestedItems: jsonItems(itemsFromCategories(informationCategories)),
      },
    });

    await tx.rtiEvent.create({
      data: {
        id: crypto.randomUUID(),
        requestId: id,
        type: "drafted",
        description: EVENT_COPY.drafted,
        timestamp: now,
      },
    });

    return row;
  });

  return toRequestDto(created);
}

export async function updateDraft(
  db: Db,
  input: {
    id: string;
    authorityId?: string;
    clarifiedQuestion?: string;
    draftText?: string;
    informationCategories?: string[];
  },
) {
  const current = await db.rtiRequest.findUnique({ where: { id: input.id } });
  if (!current) {
    throw new RtiDomainError("REQUEST_NOT_FOUND", `Request ${input.id} was not found.`);
  }
  if (current.status !== "drafted") {
    throw new RtiDomainError(
      "DRAFT_LOCKED",
      "Only drafted requests can be edited.",
    );
  }

  const informationCategories =
    input.informationCategories ?? current.informationCategories;
  const requestedItems = input.informationCategories
    ? itemsFromCategories(informationCategories)
    : parseRequestedItems(current.requestedItems);

  const updated = await db.rtiRequest.update({
    where: { id: input.id },
    data: {
      authorityId: input.authorityId,
      clarifiedQuestion: input.clarifiedQuestion,
      draftText: input.draftText,
      informationCategories,
      requestedItems: jsonItems(requestedItems),
    },
  });

  return toRequestDto(updated);
}

export async function submitRequest(db: Db, id: string) {
  const current = await db.rtiRequest.findUnique({ where: { id } });
  if (!current) {
    throw new RtiDomainError("REQUEST_NOT_FOUND", `Request ${id} was not found.`);
  }

  const existing = await db.rtiRequest.findMany({
    where: { registrationNumber: { not: null } },
    select: { registrationNumber: true },
  });
  const registrationNumber = nextRegistrationNumber(
    existing.map((row) => row.registrationNumber).filter((value): value is string => Boolean(value)),
  );
  const submittedAt = new Date();
  const responseDueAt = new Date(
    submittedAt.getTime() + RESPONSE_DUE_DAYS * 86_400_000,
  );

  return transitionRequest(db, id, "submitted", {
    registrationNumber,
    submittedAt,
    responseDueAt,
  });
}

export async function prepareAppeal(db: Db, requestId: string) {
  const existing = await db.appeal.findFirst({
    where: { requestId },
    orderBy: { createdAt: "desc" },
  });
  const request = await db.rtiRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    throw new RtiDomainError("REQUEST_NOT_FOUND", `Request ${requestId} was not found.`);
  }

  if (request.status === "appeal_prepared" || request.status === "appeal_submitted") {
    if (existing) {
      return toAppealDto(existing);
    }
  }

  const unanswered = parseRequestedItems(request.requestedItems).filter(
    (item) => !item.answered,
  );
  if (unanswered.length === 0) {
    throw new RtiDomainError(
      "NOTHING_TO_APPEAL",
      "Every requested item is marked answered in this demo.",
    );
  }

  const reason = unanswered.map((item) => item.label).join("; ");
  const draftText = `First appeal draft (synthetic, not filed).

Registration: ${request.registrationNumber ?? "not issued"}

The following requested item(s) were not supplied:
${unanswered.map((item) => `- ${item.label}`).join("\n")}

I request that the missing record(s) be supplied, or a record stating that none exist.

This draft is for the Ask India demo. It is not an appeal to a real First Appellate Authority.`;

  return db.$transaction(async (tx) => {
    const current = await tx.rtiRequest.findUniqueOrThrow({ where: { id: requestId } });
    assertTransition(current.status as RtiStatus, "appeal_prepared");

    await tx.rtiRequest.update({
      where: { id: requestId },
      data: { status: "appeal_prepared" },
    });
    await tx.rtiEvent.create({
      data: {
        id: crypto.randomUUID(),
        requestId,
        type: "appeal_prepared",
        description: EVENT_COPY.appeal_prepared,
        timestamp: new Date(),
      },
    });

    const appeal = await tx.appeal.create({
      data: {
        id: crypto.randomUUID(),
        requestId,
        reason,
        draftText,
        status: "prepared",
      },
    });

    return toAppealDto(appeal);
  });
}

function itemsFromCategories(categoryIds: string[]): RequestedItemDto[] {
  return categoryIds.map((categoryId) => {
    const category = getInformationCategory(categoryId);
    return {
      id: `item_${categoryId}`,
      categoryId,
      label: category?.label ?? categoryId,
      answered: false,
    };
  });
}

function draftFromCategories(categoryIds: string[]): string {
  const lines = categoryIds.map((categoryId, index) => {
    const category = getInformationCategory(categoryId);
    return `${index + 1}. ${category?.label ?? categoryId}.`;
  });

  return `Please provide certified copies / extracts of the following records:\n\n${lines.join("\n")}\n\nThis is a records request in a synthetic demo. It is not filed with Government of India.`;
}
