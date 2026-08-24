import type { PrismaClient } from "@/generated/prisma/client";
import {
  apiError,
  apiSuccess,
  type ApiResponse,
  type CivicIntelligenceAdapter,
  type ClassificationResult,
  type ComplaintDTO,
  type CreateComplaintInput,
  type EscalateComplaintInput,
  type TransitionComplaintInput,
  type VerifyResolutionInput,
} from "@/lib/contracts";
import { classifyComplaintByKeywords } from "@/lib/domain/classification";
import { DEMO_OFFICER_ID } from "@/lib/domain/constants";
import { DomainError } from "@/lib/domain/errors";
import { isEscalationPermitted, nextEscalation } from "@/lib/domain/escalation";
import { gridCellKey } from "@/lib/domain/grid";
import { createId, createPublicId } from "@/lib/domain/ids";
import {
  assertTransition,
  descriptionForTransition,
  eventTypeForTransition,
} from "@/lib/domain/lifecycle";
import { attentionPriority, compareAttentionPriority } from "@/lib/domain/priority";
import { slaDeadline, slaState } from "@/lib/domain/sla";
import {
  DEFAULT_SUBCATEGORY_BY_CATEGORY,
  slaHoursForSubcategory,
  SUBCATEGORIES,
  SUBCATEGORY_BY_ID,
} from "@/lib/domain/subcategories";
import { civicBriefFacts, deterministicBrief, toRecurringIssueDto } from "@/lib/intelligence/brief";
import {
  computeHotspots,
  computeRecurringIssues,
  hotspotCenter,
  type ComplaintSnapshot,
} from "@/lib/intelligence/facts";
import { computeCityPulse } from "@/lib/intelligence/pulse";
import {
  complaintDetailInclude,
  getComplaintDetail,
  type ComplaintDetail,
} from "@/lib/repositories/complaints";
import { toComplaintDto, toComplaintSnapshot } from "@/lib/repositories/mappers";

function fail(error: unknown): ApiResponse<never> {
  if (error instanceof DomainError) {
    return apiError(error.code, error.message, error.retryable);
  }
  throw error;
}

function subcategoryIdFromLabel(
  category: CreateComplaintInput["category"],
  label: string,
): string {
  const exact = SUBCATEGORIES.find(
    (item) => item.category === category && item.label === label,
  );
  return (exact ?? DEFAULT_SUBCATEGORY_BY_CATEGORY[category]).id;
}

function latestResolvedAt(complaint: ComplaintDetail): Date | null {
  return complaint.resolutions[0]?.submittedAt ?? null;
}

function toSnapshot(complaint: ComplaintDetail): ComplaintSnapshot {
  return toComplaintSnapshot(complaint, latestResolvedAt(complaint));
}

function escalationAvailability(complaint: ComplaintDetail, now: Date): boolean {
  return isEscalationPermitted({
    status: complaint.status,
    slaState: slaState({
      now,
      deadline: complaint.slaDeadline,
      durationHours: complaint.slaDurationHours,
      status: complaint.status,
      closedAt: complaint.closedAt,
    }),
    escalationCount: complaint.escalations.length,
  });
}

function toDto(complaint: ComplaintDetail, now: Date): ComplaintDTO {
  return toComplaintDto(complaint, now, {
    isEscalationAvailable: escalationAvailability(complaint, now),
  });
}

export function createCivicDataEngine(db: PrismaClient): CivicIntelligenceAdapter {
  async function loadRequired(complaintId: string): Promise<ComplaintDetail> {
    const complaint = await getComplaintDetail(db, complaintId);
    if (!complaint) {
      throw new DomainError("NOT_FOUND", "Complaint not found.");
    }
    return complaint;
  }

  async function loadSnapshots(): Promise<{ now: Date; snapshots: ComplaintSnapshot[] }> {
    const now = new Date();
    const rows = await db.complaint.findMany({
      include: complaintDetailInclude,
    });
    return { now, snapshots: rows.map(toSnapshot) };
  }

  return {
    async classifyComplaint(description: string): Promise<ApiResponse<ClassificationResult>> {
      try {
        if (!description.trim()) {
          throw new DomainError("VALIDATION_ERROR", "Description is required.");
        }
        return apiSuccess(classifyComplaintByKeywords(description));
      } catch (error) {
        return fail(error);
      }
    },

    async createComplaint(input: CreateComplaintInput): Promise<ApiResponse<ComplaintDTO>> {
      try {
        const now = new Date();
        const subcategoryId = subcategoryIdFromLabel(input.category, input.subcategory);
        const durationHours = slaHoursForSubcategory(subcategoryId);
        const subcategory = SUBCATEGORY_BY_ID[subcategoryId];
        const ward = await db.ward.findUnique({
          where: { id: input.wardId },
          include: { ulb: true },
        });
        if (!ward) {
          throw new DomainError("VALIDATION_ERROR", "Unknown ward.");
        }

        const citizen = await db.user.findUnique({ where: { id: input.citizenId } });
        if (!citizen) {
          throw new DomainError("VALIDATION_ERROR", "Unknown citizen.");
        }

        const category = await db.category.findUnique({
          where: { code: input.category },
        });
        const id = createId("cmp");
        const created = await db.$transaction(async (tx) => {
          await tx.complaint.create({
            data: {
              id,
              publicId: createPublicId(),
              citizenId: input.citizenId,
              description: input.description,
              summary: input.description.replaceAll(/\s+/g, " ").trim().slice(0, 160),
              category: input.category,
              subcategoryId,
              severity: input.severity,
              status: "CATEGORIZED",
              wardId: input.wardId,
              latitude: input.location.latitude,
              longitude: input.location.longitude,
              locationLabel: input.location.label,
              gridCellKey: gridCellKey(input.location.latitude, input.location.longitude),
              departmentId: category?.departmentId ?? null,
              slaDeadline: slaDeadline(now, durationHours),
              slaDurationHours: durationHours,
              photoReference: input.photoReference,
              createdAt: now,
              updatedAt: now,
            },
          });

          await tx.complaintEvent.createMany({
            data: [
              {
                id: createId("evt"),
                complaintId: id,
                type: "SUBMITTED",
                occurredAt: now,
                actorId: input.citizenId,
                actorPersona: "citizen",
                actorName: citizen.name,
                description: "Complaint submitted.",
              },
              {
                id: createId("evt"),
                complaintId: id,
                type: "CATEGORIZED",
                occurredAt: now,
                actorId: input.citizenId,
                actorPersona: "citizen",
                actorName: citizen.name,
                description: `Categorized as ${subcategory.label}.`,
              },
            ],
          });

          return getComplaintDetail(tx, id);
        });

        if (!created) {
          throw new DomainError("INTERNAL_ERROR", "Complaint create failed.");
        }
        return apiSuccess(toDto(created, now));
      } catch (error) {
        return fail(error);
      }
    },

    async listCitizenComplaints(citizenId: string): Promise<ApiResponse<ComplaintDTO[]>> {
      try {
        const now = new Date();
        const rows = await db.complaint.findMany({
          where: { citizenId },
          include: complaintDetailInclude,
          orderBy: { createdAt: "desc" },
        });
        return apiSuccess(rows.map((row) => toDto(row, now)));
      } catch (error) {
        return fail(error);
      }
    },

    async getComplaint(complaintId: string): Promise<ApiResponse<ComplaintDTO>> {
      try {
        const now = new Date();
        const complaint = await loadRequired(complaintId);
        return apiSuccess(toDto(complaint, now));
      } catch (error) {
        return fail(error);
      }
    },

    async escalateComplaint(
      input: EscalateComplaintInput,
    ): Promise<ApiResponse<ComplaintDTO>> {
      try {
        const now = new Date();
        const result = await db.$transaction(async (tx) => {
          const complaint = await getComplaintDetail(tx, input.complaintId);
          if (!complaint) {
            throw new DomainError("NOT_FOUND", "Complaint not found.");
          }

          const actor = await tx.user.findUnique({ where: { id: input.actorId } });
          if (!actor) {
            throw new DomainError("VALIDATION_ERROR", "Unknown actor.");
          }

          const permitted = isEscalationPermitted({
            status: complaint.status,
            slaState: slaState({
              now,
              deadline: complaint.slaDeadline,
              durationHours: complaint.slaDurationHours,
              status: complaint.status,
              closedAt: complaint.closedAt,
            }),
            escalationCount: complaint.escalations.length,
          });
          const next = nextEscalation(complaint.escalations.length);
          if (!permitted || !next) {
            throw new DomainError(
              "ESCALATION_NOT_AVAILABLE",
              "Prototype escalation is not available for this complaint.",
            );
          }

          await tx.escalation.create({
            data: {
              id: createId("esc"),
              complaintId: complaint.id,
              level: next.level,
              queueLabel: next.queueLabel,
              pathLabel: next.pathLabel,
              reason: input.reason,
              actorId: input.actorId,
              createdAt: now,
            },
          });

          await tx.complaint.update({
            where: { id: complaint.id },
            data: { isEscalated: true, updatedAt: now },
          });

          await tx.complaintEvent.create({
            data: {
              id: createId("evt"),
              complaintId: complaint.id,
              type: "ESCALATED",
              occurredAt: now,
              actorId: actor.id,
              actorPersona: actor.persona,
              actorName: actor.name,
              description: next.pathLabel
                ? `Moved to ${next.queueLabel} (${next.pathLabel}). ${input.reason}`
                : `Moved to ${next.queueLabel}. ${input.reason}`,
              metadata: {
                queueLabel: next.queueLabel,
                pathLabel: next.pathLabel,
                level: next.level,
              },
            },
          });

          const updated = await getComplaintDetail(tx, complaint.id);
          if (!updated) {
            throw new DomainError("INTERNAL_ERROR", "Escalation failed.");
          }
          return updated;
        });

        return apiSuccess(toDto(result, now));
      } catch (error) {
        return fail(error);
      }
    },

    async verifyComplaintResolution(
      input: VerifyResolutionInput,
    ): Promise<ApiResponse<ComplaintDTO>> {
      try {
        const toStatus = input.resolved ? "CLOSED" : "REOPENED";
        if (!input.resolved && !input.reason?.trim()) {
          throw new DomainError(
            "VALIDATION_ERROR",
            "A reason is required to reopen a complaint.",
          );
        }

        return this.transitionComplaint({
          complaintId: input.complaintId,
          toStatus,
          actorId: input.citizenId,
          note: input.reason,
        });
      } catch (error) {
        return fail(error);
      }
    },

    async transitionComplaint(
      input: TransitionComplaintInput,
    ): Promise<ApiResponse<ComplaintDTO>> {
      try {
        const now = new Date();
        const result = await db.$transaction(async (tx) => {
          const complaint = await getComplaintDetail(tx, input.complaintId);
          if (!complaint) {
            throw new DomainError("NOT_FOUND", "Complaint not found.");
          }

          assertTransition(complaint.status, input.toStatus);

          const actor = await tx.user.findUnique({ where: { id: input.actorId } });
          if (!actor) {
            throw new DomainError("VALIDATION_ERROR", "Unknown actor.");
          }

          if (
            (input.toStatus === "CLOSED" || input.toStatus === "REOPENED") &&
            actor.persona === "citizen" &&
            actor.id !== complaint.citizenId
          ) {
            throw new DomainError("UNAUTHORIZED", "Only the reporting citizen can verify.");
          }

          const eventType = eventTypeForTransition(complaint.status, input.toStatus);
          const data: {
            status: typeof input.toStatus;
            updatedAt: Date;
            assignedOfficerId?: string | null;
            closedAt?: Date | null;
            slaDeadline?: Date;
          } = {
            status: input.toStatus,
            updatedAt: now,
          };

          if (input.toStatus === "ASSIGNED" && !complaint.assignedOfficerId) {
            data.assignedOfficerId = DEMO_OFFICER_ID;
          }
          if (input.toStatus === "CLOSED") {
            data.closedAt = now;
          }
          if (input.toStatus === "REOPENED") {
            data.closedAt = null;
            data.slaDeadline = slaDeadline(now, complaint.slaDurationHours);
          }

          const moved = await tx.complaint.updateMany({
            where: { id: complaint.id, status: complaint.status },
            data,
          });
          if (moved.count !== 1) {
            throw new DomainError(
              "CONFLICT",
              "The complaint was updated by another action. Retry.",
              true,
            );
          }

          await tx.complaintEvent.create({
            data: {
              id: createId("evt"),
              complaintId: complaint.id,
              type: eventType,
              occurredAt: now,
              actorId: actor.id,
              actorPersona: actor.persona,
              actorName: actor.name,
              description: descriptionForTransition(input.toStatus, input.note),
            },
          });

          if (input.toStatus === "AWAITING_VERIFICATION") {
            await tx.resolution.create({
              data: {
                id: createId("res"),
                complaintId: complaint.id,
                officerId: actor.id,
                note: input.note,
                submittedAt: now,
              },
            });
          }

          if (input.toStatus === "CLOSED" || input.toStatus === "REOPENED") {
            await tx.citizenFeedback.create({
              data: {
                id: createId("fb"),
                complaintId: complaint.id,
                citizenId: actor.id,
                accepted: input.toStatus === "CLOSED",
                reason: input.note,
                createdAt: now,
              },
            });
          }

          const updated = await getComplaintDetail(tx, complaint.id);
          if (!updated) {
            throw new DomainError("INTERNAL_ERROR", "Transition failed.");
          }
          return updated;
        });

        return apiSuccess(toDto(result, now));
      } catch (error) {
        return fail(error);
      }
    },

    async getMunicipalAttentionQueue() {
      try {
        const { now, snapshots } = await loadSnapshots();
        const issues = computeRecurringIssues(snapshots, now);
        const issueByComplaint = new Map<string, string>();
        for (const issue of issues) {
          for (const id of issue.complaintIds) {
            issueByComplaint.set(id, issue.id);
          }
        }

        const rows = await db.complaint.findMany({
          where: { status: { not: "CLOSED" } },
          include: complaintDetailInclude,
        });

        const items = rows
          .map((row) => {
            const dto = toDto(row, now);
            const recurringIssueId = issueByComplaint.get(row.id) ?? null;
            const priority = attentionPriority({
              slaState: dto.sla.state,
              severity: row.severity,
              recurringIssueId,
            });
            return {
              complaint: dto,
              priority,
              slaState: dto.sla.state,
              recurringIssueId,
            };
          })
          .sort((a, b) => {
            const rank = compareAttentionPriority(a.priority, b.priority);
            if (rank !== 0) return rank;
            return (
              new Date(a.complaint.sla.deadline).getTime() -
              new Date(b.complaint.sla.deadline).getTime()
            );
          });

        return apiSuccess(items);
      } catch (error) {
        return fail(error);
      }
    },

    async getCityPulse() {
      try {
        const { now, snapshots } = await loadSnapshots();
        return apiSuccess(computeCityPulse(snapshots, now));
      } catch (error) {
        return fail(error);
      }
    },

    async getHotspots(wardId?: string) {
      try {
        const { now, snapshots } = await loadSnapshots();
        const scoped = wardId
          ? snapshots.filter((item) => item.wardId === wardId)
          : snapshots;
        return apiSuccess(
          computeHotspots(scoped, now).map((hotspot) => ({
            id: hotspot.id,
            gridCellKey: hotspot.gridCellKey,
            center: hotspotCenter(hotspot.gridCellKey),
            wardId: hotspot.wardId,
            wardNumber: hotspot.wardNumber,
            category: hotspot.category,
            complaintCount: hotspot.complaintCount,
            affectedLocationCount: hotspot.affectedLocationCount,
            reopenedCount: hotspot.reopenedCount,
            slaBreachedCount: hotspot.slaBreachedCount,
            percentageChange: hotspot.percentageChange,
          })),
        );
      } catch (error) {
        return fail(error);
      }
    },

    async getRecurringIssue(issueId: string) {
      try {
        const { now, snapshots } = await loadSnapshots();
        const issue = computeRecurringIssues(snapshots, now).find(
          (item) => item.id === issueId,
        );
        if (!issue) {
          throw new DomainError("NOT_FOUND", "Recurring issue not found.");
        }
        return apiSuccess(toRecurringIssueDto(issue));
      } catch (error) {
        return fail(error);
      }
    },

    async getCivicBriefFacts(issueId: string) {
      try {
        const { now, snapshots } = await loadSnapshots();
        const issue = computeRecurringIssues(snapshots, now).find(
          (item) => item.id === issueId,
        );
        if (!issue) {
          throw new DomainError("NOT_FOUND", "Recurring issue not found.");
        }
        return apiSuccess(civicBriefFacts(issue, now));
      } catch (error) {
        return fail(error);
      }
    },

    async generateCivicBrief(issueId: string) {
      try {
        const facts = await this.getCivicBriefFacts(issueId);
        if (!facts.ok) return facts;
        return apiSuccess({
          facts: facts.data,
          brief: deterministicBrief(facts.data),
          source: "deterministic-fallback" as const,
        });
      } catch (error) {
        return fail(error);
      }
    },
  };
}
