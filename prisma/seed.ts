import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

import {
  DEMO_CITIZEN,
  PUBLIC_AUTHORITIES,
  SEED_REQUESTS,
  assertPrimarySeedInvariants,
} from "../src/lib/rti/seed/dataset";
import { DEMO_USER_ID } from "../src/lib/rti/domain/constants";

assertPrimarySeedInvariants();

function createSeedClient() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL (or DIRECT_URL) is required to seed.");
  }

  // Seed runs in Node over TCP. The Neon WebSocket adapter fails in this WSL
  // environment; runtime (`src/lib/db.ts`) still uses PrismaNeon.
  return new PrismaClient({
    adapter: new PrismaPg(url),
  });
}

async function main() {
  const db = createSeedClient();

  try {
    await db.$transaction(async (tx) => {
      await tx.appeal.deleteMany();
      await tx.document.deleteMany();
      await tx.rtiEvent.deleteMany();
      await tx.rtiRequest.deleteMany();
      await tx.publicAuthority.deleteMany();
      await tx.demoUser.deleteMany();

      await tx.demoUser.create({ data: DEMO_CITIZEN });
      await tx.publicAuthority.createMany({
        data: PUBLIC_AUTHORITIES.map((authority) => ({ ...authority })),
      });

      for (const request of SEED_REQUESTS) {
        await tx.rtiRequest.create({
          data: {
            id: request.id,
            registrationNumber: request.registrationNumber,
            userId: DEMO_USER_ID,
            authorityId: request.authorityId,
            originalQuestion: request.originalQuestion,
            clarifiedQuestion: request.clarifiedQuestion,
            draftText: request.draftText,
            status: request.status,
            informationCategories: request.informationCategories,
            requestedItems: request.requestedItems,
            submittedAt: request.submittedAt,
            responseDueAt: request.responseDueAt,
            createdAt: request.createdAt,
            events: {
              create: request.events.map((event) => ({
                id: event.id,
                type: event.type,
                description: event.description,
                timestamp: event.timestamp,
              })),
            },
            documents: {
              create: request.documents.map((document) => ({
                id: document.id,
                name: document.name,
                type: document.type,
                content: document.content,
                synthetic: true,
              })),
            },
            appeals: {
              create: request.appeals.map((appeal) => ({
                id: appeal.id,
                reason: appeal.reason,
                draftText: appeal.draftText,
                status: appeal.status,
                createdAt: appeal.createdAt,
              })),
            },
          },
        });
      }
    });

    const primary = await db.rtiRequest.findUniqueOrThrow({
      where: { registrationNumber: "DEMO/RTI/2026/004281" },
    });
    const unanswered = (primary.requestedItems as { answered: boolean }[]).filter(
      (item) => !item.answered,
    ).length;
    if (unanswered !== 1) {
      throw new Error(`Seed invariant failed: unanswered=${unanswered}`);
    }

    console.info(
      `Seeded ${SEED_REQUESTS.length} RTIs for ${DEMO_CITIZEN.email}; primary DEMO/RTI/2026/004281 unanswered=${unanswered}.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
