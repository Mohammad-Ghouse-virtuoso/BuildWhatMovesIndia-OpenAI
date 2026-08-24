import type { Appeal, Document, PublicAuthority, RtiEvent, RtiRequest } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

import type {
  AppealDto,
  DocumentDto,
  PublicAuthorityDto,
  RequestedItemDto,
  RtiEventDto,
  RtiRequestDto,
} from "@/lib/rti/contracts/dtos";
import { requestedItemSchema } from "@/lib/rti/contracts/dtos";
import {
  RESPONSE_DUE_DISCLAIMER,
  RTI_APPLICATION_FEE_INR,
} from "@/lib/rti/domain/constants";
import type { RtiStatus } from "@/lib/rti/domain/lifecycle";

function iso(value: Date): string {
  return value.toISOString();
}

export function parseRequestedItems(value: Prisma.JsonValue): RequestedItemDto[] {
  return zItems(value);
}

function zItems(value: Prisma.JsonValue): RequestedItemDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return requestedItemSchema.array().parse(value);
}

export function toAuthorityDto(row: PublicAuthority): PublicAuthorityDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    isDemo: true,
  };
}

export function toEventDto(row: RtiEvent): RtiEventDto {
  return {
    id: row.id,
    requestId: row.requestId,
    type: row.type as RtiStatus,
    timestamp: iso(row.timestamp),
    description: row.description,
  };
}

export function toDocumentDto(row: Document): DocumentDto {
  return {
    id: row.id,
    requestId: row.requestId,
    name: row.name,
    type: row.type,
    content: row.content,
    synthetic: true,
  };
}

export function toAppealDto(row: Appeal): AppealDto {
  return {
    id: row.id,
    requestId: row.requestId,
    reason: row.reason,
    draftText: row.draftText,
    status: row.status,
    createdAt: iso(row.createdAt),
  };
}

export function toRequestDto(row: RtiRequest): RtiRequestDto {
  return {
    id: row.id,
    registrationNumber: row.registrationNumber,
    userId: row.userId,
    authorityId: row.authorityId,
    originalQuestion: row.originalQuestion,
    clarifiedQuestion: row.clarifiedQuestion,
    draftText: row.draftText,
    status: row.status as RtiStatus,
    informationCategories: row.informationCategories,
    requestedItems: parseRequestedItems(row.requestedItems),
    submittedAt: row.submittedAt ? iso(row.submittedAt) : null,
    responseDueAt: row.responseDueAt ? iso(row.responseDueAt) : null,
    responseDueDisclaimer: RESPONSE_DUE_DISCLAIMER,
    feeInr: RTI_APPLICATION_FEE_INR,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}
