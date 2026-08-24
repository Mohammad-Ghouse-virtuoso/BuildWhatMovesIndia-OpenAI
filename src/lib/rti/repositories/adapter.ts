import type { PrismaClient } from "@/generated/prisma/client";

import type { RtiAdapter } from "@/lib/rti/contracts/adapter";
import { classifyQuestion as classifyQuestionWithAi } from "@/lib/rti/ai/service";

import * as repo from "./rti";

export function createRtiAdapter(db: PrismaClient): RtiAdapter {
  return {
    classifyQuestion: async (question) =>
      classifyQuestionWithAi({ question, clarifications: [] }),
    listAuthorities: () => repo.listAuthorities(db),
    createDraft: (input) => repo.createDraft(db, input),
    updateDraft: (input) => repo.updateDraft(db, input),
    submitRequest: (id) => repo.submitRequest(db, id),
    listMyRequests: (userId) => repo.listMyRequests(db, userId),
    getRequest: (id) => repo.getRequest(db, id),
    getResponse: (id) => repo.getResponse(db, id),
    getDocuments: (requestId) => repo.getDocuments(db, requestId),
    prepareAppeal: (requestId) => repo.prepareAppeal(db, requestId),
  };
}
