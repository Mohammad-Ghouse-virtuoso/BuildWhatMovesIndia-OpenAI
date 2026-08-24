import "server-only";

import { db } from "@/lib/db";
import { createRtiAdapter } from "@/lib/rti/repositories";
import { toEventDto } from "@/lib/rti/repositories/mappers";

export function rti() {
  return createRtiAdapter(db);
}

export async function loadEvents(requestId: string) {
  const rows = await db.rtiEvent.findMany({
    where: { requestId },
    orderBy: { timestamp: "asc" },
  });
  return rows.map(toEventDto);
}
