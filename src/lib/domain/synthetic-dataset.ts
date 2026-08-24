import type {
  ComplaintCategory,
  ComplaintSeverity,
  ComplaintStatus,
} from "@/lib/contracts";
import {
  DEMO_ADMIN_ID,
  DEMO_CITIZEN_ID,
  DEMO_OFFICER_ID,
  DEPARTMENT_IDS,
  SYNTHETIC_ULB_ID,
  SYNTHETIC_ULB_NAME,
  WARD_42_EXPECTED,
  WARD_42_ID,
  WARD_42_NAME,
  WARD_42_NUMBER,
} from "@/lib/domain/constants";
import { DomainError } from "@/lib/domain/errors";
import { gridCellKey, offsetFromOrigin } from "@/lib/domain/grid";
import { slaDeadline } from "@/lib/domain/sla";
import { SUBCATEGORY_BY_ID } from "@/lib/domain/subcategories";

export interface SeedUser {
  id: string;
  persona: "citizen" | "officer" | "admin";
  name: string;
}

export interface SeedWard {
  id: string;
  number: number;
  name: string;
}

export interface SeedLocation {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
}

export interface SeedComplaint {
  seedKey: string;
  publicId: string;
  citizenId: string;
  wardId: string;
  category: ComplaintCategory;
  subcategoryId: string;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  description: string;
  summary: string;
  latitude: number;
  longitude: number;
  locationLabel: string;
  gridCellKey: string;
  departmentId: string;
  assignedOfficerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
  resolvedAt: Date | null;
  reopenedAt: Date | null;
  slaDeadline: Date;
  slaDurationHours: number;
  isEscalated: boolean;
}

export interface SyntheticDataset {
  now: Date;
  ulb: { id: string; name: string; originLatitude: number; originLongitude: number };
  users: SeedUser[];
  wards: SeedWard[];
  complaints: SeedComplaint[];
}

const WARD_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 42,
];

const WARD_42_LOCATION_OFFSETS: { id: string; east: number; north: number; label: string }[] = [
  { id: "L01", east: 10, north: 10, label: "Canal Road north culvert" },
  { id: "L02", east: 40, north: 35, label: "Canal Road junction drain" },
  { id: "L03", east: 150, north: 15, label: "Service lane near bus stop" },
  { id: "L04", east: 175, north: 40, label: "Market outfall" },
  { id: "L05", east: 20, north: 150, label: "School compound drain" },
  { id: "L06", east: 45, north: 175, label: "Temple street overflow" },
  { id: "L07", east: 250, north: 20, label: "Housing colony lane 4" },
  { id: "L08", east: 20, north: 250, label: "Canal bend west" },
  { id: "L09", east: 250, north: 250, label: "Warehouse backyard" },
  { id: "L10", east: 360, north: 40, label: "Bridge underpass" },
  { id: "L11", east: 40, north: 360, label: "Park edge nala" },
];

function hoursAgo(now: Date, hours: number): Date {
  return new Date(now.getTime() - hours * 3_600_000);
}

function daysAgo(now: Date, days: number, hourOfDay = 9): Date {
  return hoursAgo(now, days * 24 + (24 - hourOfDay));
}

function categoryDepartment(category: ComplaintCategory): string {
  switch (category) {
    case "DRAINAGE":
      return DEPARTMENT_IDS.engineering;
    case "WASTE_SANITATION":
      return DEPARTMENT_IDS.sanitation;
    case "WATER_SUPPLY":
      return DEPARTMENT_IDS.water;
    case "STREET_LIGHTING":
      return DEPARTMENT_IDS.lighting;
    case "ROADS":
      return DEPARTMENT_IDS.roads;
    case "PARKS_GREENERY":
      return DEPARTMENT_IDS.parks;
  }
}

function drainageComplaint(
  now: Date,
  locations: SeedLocation[],
  spec: {
    key: string;
    locationId: string;
    daysAgo: number;
    status: ComplaintStatus;
    citizenId?: string;
    closedDaysAgo?: number;
    resolvedHoursAgo?: number;
    reopenedHoursAgo?: number;
    escalated?: boolean;
    hourOfDay?: number;
  },
): SeedComplaint {
  const location = locations.find((item) => item.id === spec.locationId);
  if (!location) {
    throw new Error(`Missing location ${spec.locationId}`);
  }

  const subcategory = SUBCATEGORY_BY_ID["drain-blockage-overflow"];
  const createdAt = daysAgo(now, spec.daysAgo, spec.hourOfDay ?? 9);
  const closedAt =
    spec.closedDaysAgo !== undefined ? daysAgo(now, spec.closedDaysAgo, 16) : spec.status === "CLOSED" ? hoursAgo(createdAt, -6) : null;
  const reopenedAt =
    spec.reopenedHoursAgo !== undefined ? hoursAgo(now, spec.reopenedHoursAgo) : null;
  const resolvedAt =
    spec.resolvedHoursAgo !== undefined
      ? hoursAgo(now, spec.resolvedHoursAgo)
      : spec.status === "AWAITING_VERIFICATION" || spec.status === "CLOSED"
        ? hoursAgo(closedAt ?? now, spec.status === "CLOSED" ? 2 : 0)
        : null;

  let deadline = slaDeadline(createdAt, subcategory.slaHours);
  if (reopenedAt) {
    deadline = slaDeadline(reopenedAt, subcategory.slaHours);
  }

  const description = `Drain blockage and overflow at ${location.label}. Standing water returns after every heavy shower.`;

  return {
    seedKey: spec.key,
    publicId: spec.key.replace("w42-d-", "CIV-W42-"),
    citizenId: spec.citizenId ?? DEMO_CITIZEN_ID,
    wardId: WARD_42_ID,
    category: "DRAINAGE",
    subcategoryId: subcategory.id,
    severity: "HIGH",
    status: spec.status,
    description,
    summary: description.slice(0, 140),
    latitude: location.latitude,
    longitude: location.longitude,
    locationLabel: location.label,
    gridCellKey: gridCellKey(location.latitude, location.longitude),
    departmentId: categoryDepartment("DRAINAGE"),
    assignedOfficerId: spec.status === "SUBMITTED" ? null : DEMO_OFFICER_ID,
    createdAt,
    updatedAt: reopenedAt ?? closedAt ?? createdAt,
    closedAt: spec.status === "CLOSED" ? closedAt : null,
    resolvedAt,
    reopenedAt,
    slaDeadline: deadline,
    slaDurationHours: subcategory.slaHours,
    isEscalated: Boolean(spec.escalated),
  };
}

function otherWardComplaint(
  now: Date,
  ward: SeedWard,
  index: number,
): SeedComplaint {
  const catalog: {
    category: ComplaintCategory;
    subcategoryId: string;
    severity: ComplaintSeverity;
  }[] = [
    { category: "ROADS", subcategoryId: "road-patch-repair", severity: "MEDIUM" },
    { category: "WASTE_SANITATION", subcategoryId: "garbage-not-lifted", severity: "MEDIUM" },
    { category: "WATER_SUPPLY", subcategoryId: "water-pipeline-leakage", severity: "HIGH" },
    { category: "STREET_LIGHTING", subcategoryId: "street-light-not-working", severity: "LOW" },
    { category: "PARKS_GREENERY", subcategoryId: "park-tree-maintenance", severity: "LOW" },
  ];
  const pick = catalog[index % catalog.length];
  const subcategory = SUBCATEGORY_BY_ID[pick.subcategoryId];
  const createdAt = daysAgo(now, 3 + ((ward.number * 5 + index * 7) % 70), 11);
  const point = offsetFromOrigin(80 + index * 35, 80 + ward.number * 12);
  const statusCycle: ComplaintStatus[] = ["CLOSED", "IN_PROGRESS", "ASSIGNED", "CLOSED"];
  const status = statusCycle[index % statusCycle.length];
  const closedAt = status === "CLOSED" ? hoursAgo(createdAt, -8) : null;

  return {
    seedKey: `w${ward.number}-c-${index}`,
    publicId: `CIV-W${ward.number}-${String(index + 1).padStart(2, "0")}`,
    citizenId: index % 3 === 0 ? DEMO_CITIZEN_ID : "user-citizen-2",
    wardId: ward.id,
    category: pick.category,
    subcategoryId: subcategory.id,
    severity: pick.severity,
    status,
    description: `${subcategory.label} reported in ${ward.name}. Synthetic demo record.`,
    summary: `${subcategory.label} in ${ward.name}`,
    latitude: point.latitude,
    longitude: point.longitude,
    locationLabel: `${ward.name} site ${index + 1}`,
    gridCellKey: gridCellKey(point.latitude, point.longitude),
    departmentId: categoryDepartment(pick.category),
    assignedOfficerId: DEMO_OFFICER_ID,
    createdAt,
    updatedAt: closedAt ?? createdAt,
    closedAt,
    resolvedAt: closedAt,
    reopenedAt: null,
    slaDeadline: slaDeadline(createdAt, subcategory.slaHours),
    slaDurationHours: subcategory.slaHours,
    isEscalated: false,
  };
}

export function ward42Locations(): SeedLocation[] {
  return WARD_42_LOCATION_OFFSETS.map((item) => {
    const point = offsetFromOrigin(item.east, item.north);
    return {
      id: item.id,
      latitude: point.latitude,
      longitude: point.longitude,
      label: item.label,
    };
  });
}

export function buildSyntheticDataset(now = new Date()): SyntheticDataset {
  const locations = ward42Locations();
  const wards: SeedWard[] = WARD_NUMBERS.map((number) => ({
    id: number === WARD_42_NUMBER ? WARD_42_ID : `ward-${number}`,
    number,
    name: number === WARD_42_NUMBER ? WARD_42_NAME : `Ward ${number}`,
  }));

  const users: SeedUser[] = [
    { id: DEMO_CITIZEN_ID, persona: "citizen", name: "Demo Citizen" },
    { id: "user-citizen-2", persona: "citizen", name: "Demo Neighbor" },
    { id: DEMO_OFFICER_ID, persona: "officer", name: "Demo Engineering Officer" },
    { id: DEMO_ADMIN_ID, persona: "admin", name: "Demo Administrator" },
  ];

  const drainage: SeedComplaint[] = [
    drainageComplaint(now, locations, { key: "w42-d-01", locationId: "L01", daysAgo: 45, status: "CLOSED", closedDaysAgo: 16, citizenId: DEMO_CITIZEN_ID }),
    drainageComplaint(now, locations, { key: "w42-d-02", locationId: "L01", daysAgo: 8, status: "CLOSED", closedDaysAgo: 7, citizenId: DEMO_CITIZEN_ID }),
    drainageComplaint(now, locations, { key: "w42-d-03", locationId: "L01", daysAgo: 2, status: "IN_PROGRESS", hourOfDay: 4, citizenId: DEMO_CITIZEN_ID, escalated: true }),
    drainageComplaint(now, locations, { key: "w42-d-04", locationId: "L01", daysAgo: 32, status: "REOPENED", reopenedHoursAgo: 10 }),
    drainageComplaint(now, locations, { key: "w42-d-05", locationId: "L01", daysAgo: 12, status: "CLOSED", closedDaysAgo: 11 }),
    drainageComplaint(now, locations, { key: "w42-d-06", locationId: "L01", daysAgo: 62, status: "CLOSED", closedDaysAgo: 61 }),
    drainageComplaint(now, locations, { key: "w42-d-07", locationId: "L02", daysAgo: 0, status: "IN_PROGRESS", hourOfDay: 16, citizenId: DEMO_CITIZEN_ID }),
    drainageComplaint(now, locations, { key: "w42-d-08", locationId: "L02", daysAgo: 0, status: "AWAITING_VERIFICATION", hourOfDay: 14, resolvedHoursAgo: 3, citizenId: DEMO_CITIZEN_ID }),
    drainageComplaint(now, locations, { key: "w42-d-09", locationId: "L02", daysAgo: 34, status: "CLOSED", closedDaysAgo: 33 }),
    drainageComplaint(now, locations, { key: "w42-d-10", locationId: "L02", daysAgo: 58, status: "CLOSED", closedDaysAgo: 58 }),
    drainageComplaint(now, locations, { key: "w42-d-11", locationId: "L02", daysAgo: 90, status: "CLOSED", closedDaysAgo: 90 }),
    drainageComplaint(now, locations, { key: "w42-d-12", locationId: "L03", daysAgo: 52, status: "CLOSED", closedDaysAgo: 19 }),
    drainageComplaint(now, locations, { key: "w42-d-13", locationId: "L03", daysAgo: 10, status: "CLOSED", closedDaysAgo: 9 }),
    drainageComplaint(now, locations, { key: "w42-d-14", locationId: "L03", daysAgo: 3, status: "IN_PROGRESS", hourOfDay: 6, citizenId: DEMO_CITIZEN_ID }),
    drainageComplaint(now, locations, { key: "w42-d-15", locationId: "L03", daysAgo: 14, status: "REOPENED", reopenedHoursAgo: 8 }),
    drainageComplaint(now, locations, { key: "w42-d-16", locationId: "L03", daysAgo: 68, status: "CLOSED", closedDaysAgo: 67 }),
    drainageComplaint(now, locations, { key: "w42-d-17", locationId: "L04", daysAgo: 1, status: "CLOSED", closedDaysAgo: 1 }),
    drainageComplaint(now, locations, { key: "w42-d-18", locationId: "L04", daysAgo: 22, status: "CLOSED", closedDaysAgo: 22 }),
    drainageComplaint(now, locations, { key: "w42-d-19", locationId: "L04", daysAgo: 40, status: "CLOSED", closedDaysAgo: 39 }),
    drainageComplaint(now, locations, { key: "w42-d-20", locationId: "L04", daysAgo: 72, status: "CLOSED", closedDaysAgo: 71 }),
    drainageComplaint(now, locations, { key: "w42-d-21", locationId: "L05", daysAgo: 6, status: "REOPENED", reopenedHoursAgo: 6 }),
    drainageComplaint(now, locations, { key: "w42-d-22", locationId: "L05", daysAgo: 24, status: "CLOSED", closedDaysAgo: 24 }),
    drainageComplaint(now, locations, { key: "w42-d-23", locationId: "L05", daysAgo: 42, status: "CLOSED", closedDaysAgo: 41 }),
    drainageComplaint(now, locations, { key: "w42-d-24", locationId: "L05", daysAgo: 75, status: "CLOSED", closedDaysAgo: 74 }),
    drainageComplaint(now, locations, { key: "w42-d-25", locationId: "L06", daysAgo: 9, status: "CLOSED", closedDaysAgo: 9 }),
    drainageComplaint(now, locations, { key: "w42-d-26", locationId: "L06", daysAgo: 28, status: "CLOSED", closedDaysAgo: 28 }),
    drainageComplaint(now, locations, { key: "w42-d-27", locationId: "L06", daysAgo: 48, status: "CLOSED", closedDaysAgo: 47 }),
    drainageComplaint(now, locations, { key: "w42-d-28", locationId: "L06", daysAgo: 80, status: "CLOSED", closedDaysAgo: 79 }),
    drainageComplaint(now, locations, { key: "w42-d-29", locationId: "L07", daysAgo: 16, status: "CLOSED", closedDaysAgo: 15 }),
    drainageComplaint(now, locations, { key: "w42-d-30", locationId: "L07", daysAgo: 50, status: "REOPENED", reopenedHoursAgo: 12 }),
    drainageComplaint(now, locations, { key: "w42-d-31", locationId: "L08", daysAgo: 25, status: "CLOSED", closedDaysAgo: 24 }),
    drainageComplaint(now, locations, { key: "w42-d-32", locationId: "L08", daysAgo: 55, status: "CLOSED", closedDaysAgo: 54 }),
    drainageComplaint(now, locations, { key: "w42-d-33", locationId: "L09", daysAgo: 28, status: "CLOSED", closedDaysAgo: 27 }),
    drainageComplaint(now, locations, { key: "w42-d-34", locationId: "L09", daysAgo: 58, status: "CLOSED", closedDaysAgo: 57 }),
    drainageComplaint(now, locations, { key: "w42-d-35", locationId: "L10", daysAgo: 36, status: "CLOSED", closedDaysAgo: 35 }),
    drainageComplaint(now, locations, { key: "w42-d-36", locationId: "L10", daysAgo: 85, status: "CLOSED", closedDaysAgo: 84 }),
    drainageComplaint(now, locations, { key: "w42-d-37", locationId: "L11", daysAgo: 88, status: "CLOSED", closedDaysAgo: 87 }),
  ];

  if (drainage.length !== WARD_42_EXPECTED.drainageComplaintCount) {
    throw new DomainError(
      "INTERNAL_ERROR",
      `Ward 42 drainage seed drifted to ${drainage.length} rows.`,
    );
  }

  const ward42 = wards.find((ward) => ward.id === WARD_42_ID)!;
  const extras: SeedComplaint[] = [
    otherWardComplaint(now, ward42, 0),
    otherWardComplaint(now, ward42, 1),
  ];
  const roadSub = SUBCATEGORY_BY_ID["road-patch-repair"];
  extras[0] = {
    ...extras[0],
    seedKey: "w42-roads-01",
    publicId: "CIV-W42-R01",
    category: "ROADS",
    subcategoryId: roadSub.id,
    departmentId: categoryDepartment("ROADS"),
    slaDurationHours: roadSub.slaHours,
    slaDeadline: slaDeadline(extras[0].createdAt, roadSub.slaHours),
  };

  const otherWards = wards.filter((ward) => ward.id !== WARD_42_ID);
  const scattered = otherWards.flatMap((ward) => {
    const count = 2 + (ward.number % 4);
    return Array.from({ length: count }, (_, index) => otherWardComplaint(now, ward, index));
  });

  return {
    now,
    ulb: {
      id: SYNTHETIC_ULB_ID,
      name: SYNTHETIC_ULB_NAME,
      originLatitude: 16.5062,
      originLongitude: 80.648,
    },
    users,
    wards,
    complaints: [...drainage, ...extras, ...scattered],
  };
}
