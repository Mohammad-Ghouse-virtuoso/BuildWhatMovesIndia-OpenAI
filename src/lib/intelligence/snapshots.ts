import type { SeedComplaint, SeedWard } from "@/lib/domain/synthetic-dataset";
import type { ComplaintSnapshot } from "@/lib/intelligence/facts";

export function snapshotFromSeed(
  complaint: SeedComplaint,
  wards: SeedWard[],
): ComplaintSnapshot {
  const ward = wards.find((item) => item.id === complaint.wardId);
  if (!ward) {
    throw new Error(`Unknown ward ${complaint.wardId}`);
  }

  return {
    id: complaint.seedKey,
    wardId: complaint.wardId,
    wardNumber: ward.number,
    wardName: ward.name,
    category: complaint.category,
    status: complaint.status,
    severity: complaint.severity,
    createdAt: complaint.createdAt,
    closedAt: complaint.closedAt,
    resolvedAt: complaint.resolvedAt,
    latitude: complaint.latitude,
    longitude: complaint.longitude,
    gridCellKey: complaint.gridCellKey,
    slaDeadline: complaint.slaDeadline,
    slaDurationHours: complaint.slaDurationHours,
  };
}
