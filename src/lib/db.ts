import "server-only";

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseEnv } from "@/lib/env";

// Node has no WebSocket global. Vercel Node + local `next start` need this.
// Seed still uses TCP (`PrismaPg`) because WSL often cannot open Neon WS.
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const { DATABASE_URL } = getDatabaseEnv();
  const adapter = new PrismaNeon({ connectionString: DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
