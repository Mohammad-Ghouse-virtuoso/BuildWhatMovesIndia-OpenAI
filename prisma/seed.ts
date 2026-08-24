import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";
import { CATEGORY_LABELS } from "../src/lib/contracts/domain";
import {
  DEPARTMENT_IDS,
  WARD_42_ID,
} from "../src/lib/domain/constants";
import { SUPERVISOR_QUEUE } from "../src/lib/domain/escalation";
import { eventsForSeedComplaint } from "../src/lib/domain/seed-events";
import { SUBCATEGORIES } from "../src/lib/domain/subcategories";
import { buildSyntheticDataset } from "../src/lib/domain/synthetic-dataset";
import {
  assertWard42Facts,
  ward42DrainageFacts,
} from "../src/lib/intelligence/facts";
import { snapshotFromSeed } from "../src/lib/intelligence/snapshots";

function createClient() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL or DIRECT_URL is required to seed.");
  }

  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString: url }),
  });
}

async function reset(db: PrismaClient) {
  await db.citizenFeedback.deleteMany();
  await db.resolution.deleteMany();
  await db.escalation.deleteMany();
  await db.complaintEvent.deleteMany();
  await db.complaint.deleteMany();
  await db.subcategory.deleteMany();
  await db.category.deleteMany();
  await db.department.deleteMany();
  await db.ward.deleteMany();
  await db.ulb.deleteMany();
  await db.user.deleteMany();
}

async function main() {
  const db = createClient();
  const dataset = buildSyntheticDataset(new Date());

  try {
    await reset(db);

    await db.ulb.create({
      data: {
        id: dataset.ulb.id,
        name: dataset.ulb.name,
        originLatitude: dataset.ulb.originLatitude,
        originLongitude: dataset.ulb.originLongitude,
      },
    });

    await db.user.createMany({
      data: dataset.users.map((user) => ({
        id: user.id,
        persona: user.persona,
        name: user.name,
      })),
    });

    await db.ward.createMany({
      data: dataset.wards.map((ward) => ({
        id: ward.id,
        ulbId: dataset.ulb.id,
        number: ward.number,
        name: ward.name,
      })),
    });

    await db.department.createMany({
      data: [
        { id: DEPARTMENT_IDS.engineering, ulbId: dataset.ulb.id, name: "Municipal Engineering" },
        { id: DEPARTMENT_IDS.sanitation, ulbId: dataset.ulb.id, name: "Sanitation" },
        { id: DEPARTMENT_IDS.water, ulbId: dataset.ulb.id, name: "Water Supply" },
        { id: DEPARTMENT_IDS.lighting, ulbId: dataset.ulb.id, name: "Street Lighting" },
        { id: DEPARTMENT_IDS.roads, ulbId: dataset.ulb.id, name: "Roads and Buildings" },
        { id: DEPARTMENT_IDS.parks, ulbId: dataset.ulb.id, name: "Parks" },
      ],
    });

    await db.category.createMany({
      data: SUBCATEGORIES.map((item) => ({
        code: item.category,
        label: CATEGORY_LABELS[item.category],
        departmentId: dataset.complaints.find((row) => row.category === item.category)
          ?.departmentId ?? DEPARTMENT_IDS.engineering,
      })),
    });

    await db.subcategory.createMany({
      data: SUBCATEGORIES.map((item) => ({
        id: item.id,
        category: item.category,
        label: item.label,
        slaHours: item.slaHours,
      })),
    });

    for (const complaint of dataset.complaints) {
      await db.complaint.create({
        data: {
          id: complaint.seedKey,
          publicId: complaint.publicId,
          seedKey: complaint.seedKey,
          citizenId: complaint.citizenId,
          description: complaint.description,
          summary: complaint.summary,
          category: complaint.category,
          subcategoryId: complaint.subcategoryId,
          severity: complaint.severity,
          status: complaint.status,
          wardId: complaint.wardId,
          latitude: complaint.latitude,
          longitude: complaint.longitude,
          locationLabel: complaint.locationLabel,
          gridCellKey: complaint.gridCellKey,
          departmentId: complaint.departmentId,
          assignedOfficerId: complaint.assignedOfficerId,
          slaDeadline: complaint.slaDeadline,
          slaDurationHours: complaint.slaDurationHours,
          isEscalated: complaint.isEscalated,
          createdAt: complaint.createdAt,
          updatedAt: complaint.updatedAt,
          closedAt: complaint.closedAt,
        },
      });

      const events = eventsForSeedComplaint(complaint, dataset.users);
      await db.complaintEvent.createMany({
        data: events.map((event) => ({
          ...event,
          complaintId: complaint.seedKey,
        })),
      });

      if (
        complaint.status === "AWAITING_VERIFICATION" ||
        complaint.status === "CLOSED" ||
        complaint.status === "REOPENED"
      ) {
        await db.resolution.create({
          data: {
            id: `${complaint.seedKey}-resolution`,
            complaintId: complaint.seedKey,
            officerId: complaint.assignedOfficerId ?? dataset.users[2].id,
            submittedAt: complaint.resolvedAt ?? complaint.updatedAt,
          },
        });
      }

      if (complaint.status === "REOPENED") {
        await db.citizenFeedback.create({
          data: {
            id: `${complaint.seedKey}-feedback`,
            complaintId: complaint.seedKey,
            citizenId: complaint.citizenId,
            accepted: false,
            reason: "Water returned within two days.",
            createdAt: complaint.reopenedAt ?? complaint.updatedAt,
          },
        });
      }

      if (complaint.isEscalated) {
        await db.escalation.create({
          data: {
            id: `${complaint.seedKey}-escalation`,
            complaintId: complaint.seedKey,
            level: 1,
            queueLabel: SUPERVISOR_QUEUE,
            reason: "Standing water remains after the reported repair window.",
            actorId: complaint.citizenId,
            createdAt: complaint.createdAt,
          },
        });
      }
    }

    const snapshots = dataset.complaints.map((complaint) =>
      snapshotFromSeed(complaint, dataset.wards),
    );
    const facts = ward42DrainageFacts(snapshots, dataset.now);
    assertWard42Facts(facts);

    const persisted = await db.complaint.count({
      where: { wardId: WARD_42_ID, category: "DRAINAGE" },
    });
    if (persisted !== facts.drainageComplaintCount) {
      throw new Error(
        `Persisted Ward 42 drainage count ${persisted} !== ${facts.drainageComplaintCount}`,
      );
    }

    console.info(
      `Seeded ${dataset.complaints.length} synthetic complaints across ${dataset.wards.length} wards.`,
    );
    console.info("Ward 42 drainage assertions passed:", facts);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
