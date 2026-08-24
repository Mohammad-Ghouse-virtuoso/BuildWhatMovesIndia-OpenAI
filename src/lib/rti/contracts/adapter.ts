import type { ClassifyQuestionResult } from "@/lib/rti/domain/classify";

import type {
  AppealDto,
  CreateDraftInput,
  DocumentDto,
  PublicAuthorityDto,
  RtiRequestDto,
  RtiResponseDto,
  UpdateDraftInput,
} from "./dtos";

export type RtiAdapter = {
  classifyQuestion(question: string): Promise<ClassifyQuestionResult>;
  listAuthorities(): Promise<PublicAuthorityDto[]>;
  createDraft(input: CreateDraftInput): Promise<RtiRequestDto>;
  updateDraft(input: UpdateDraftInput): Promise<RtiRequestDto>;
  submitRequest(id: string): Promise<RtiRequestDto>;
  listMyRequests(userId: string): Promise<RtiRequestDto[]>;
  getRequest(id: string): Promise<RtiRequestDto | null>;
  getResponse(id: string): Promise<RtiResponseDto | null>;
  getDocuments(requestId: string): Promise<DocumentDto[]>;
  prepareAppeal(requestId: string): Promise<AppealDto>;
};
