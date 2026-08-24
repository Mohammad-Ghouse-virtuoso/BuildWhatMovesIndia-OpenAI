import type { Prisma, PrismaClient } from "@/generated/prisma/client";

export const complaintDetailInclude = {
  subcategory: true,
  department: true,
  assignedOfficer: { select: { name: true } },
  ward: { include: { ulb: true } },
  events: { orderBy: { occurredAt: "asc" as const } },
  escalations: { orderBy: { level: "asc" as const } },
  resolutions: { orderBy: { submittedAt: "desc" as const } },
} satisfies Prisma.ComplaintInclude;

export type ComplaintDetail = Prisma.ComplaintGetPayload<{
  include: typeof complaintDetailInclude;
}>;

export type DbClient = PrismaClient | Prisma.TransactionClient;

export async function getComplaintDetail(
  db: DbClient,
  complaintId: string,
): Promise<ComplaintDetail | null> {
  return db.complaint.findUnique({
    where: { id: complaintId },
    include: complaintDetailInclude,
  });
}
