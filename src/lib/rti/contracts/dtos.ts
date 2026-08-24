import { z } from "zod";

import { APPEAL_STATUSES, RTI_STATUSES } from "@/lib/rti/domain/lifecycle";

export const rtiStatusSchema = z.enum(RTI_STATUSES);
export const appealStatusSchema = z.enum(APPEAL_STATUSES);

export const requestedItemSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  label: z.string().min(1),
  answered: z.boolean(),
});

export type RequestedItemDto = z.infer<typeof requestedItemSchema>;

export const rtiEventSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  type: rtiStatusSchema,
  timestamp: z.iso.datetime(),
  description: z.string(),
});

export type RtiEventDto = z.infer<typeof rtiEventSchema>;

export const documentSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  name: z.string(),
  type: z.string(),
  content: z.string(),
  synthetic: z.literal(true),
});

export type DocumentDto = z.infer<typeof documentSchema>;

export const appealSchema = z.object({
  id: z.string(),
  requestId: z.string(),
  reason: z.string(),
  draftText: z.string(),
  status: appealStatusSchema,
  createdAt: z.iso.datetime(),
});

export type AppealDto = z.infer<typeof appealSchema>;

export const publicAuthoritySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  isDemo: z.literal(true),
});

export type PublicAuthorityDto = z.infer<typeof publicAuthoritySchema>;

export const demoUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  role: z.literal("citizen"),
});

export type DemoUserDto = z.infer<typeof demoUserSchema>;

export const rtiRequestSchema = z.object({
  id: z.string(),
  registrationNumber: z.string().nullable(),
  userId: z.string(),
  authorityId: z.string(),
  originalQuestion: z.string(),
  clarifiedQuestion: z.string(),
  draftText: z.string(),
  status: rtiStatusSchema,
  informationCategories: z.array(z.string()),
  requestedItems: z.array(requestedItemSchema),
  submittedAt: z.iso.datetime().nullable(),
  responseDueAt: z.iso.datetime().nullable(),
  responseDueDisclaimer: z.string(),
  feeInr: z.number().int(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type RtiRequestDto = z.infer<typeof rtiRequestSchema>;

export const rtiResponseSchema = z.object({
  request: rtiRequestSchema,
  documents: z.array(documentSchema),
  unansweredItems: z.array(requestedItemSchema),
  appeals: z.array(appealSchema),
});

export type RtiResponseDto = z.infer<typeof rtiResponseSchema>;

export const createDraftInputSchema = z.object({
  userId: z.string().min(1),
  authorityId: z.string().min(1),
  originalQuestion: z.string().min(1),
  clarifiedQuestion: z.string().min(1).optional(),
  informationCategories: z.array(z.string()).optional(),
});

export type CreateDraftInput = z.infer<typeof createDraftInputSchema>;

export const updateDraftInputSchema = z.object({
  id: z.string().min(1),
  authorityId: z.string().min(1).optional(),
  clarifiedQuestion: z.string().min(1).optional(),
  draftText: z.string().min(1).optional(),
  informationCategories: z.array(z.string()).optional(),
});

export type UpdateDraftInput = z.infer<typeof updateDraftInputSchema>;
