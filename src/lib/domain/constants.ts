export const SYNTHETIC_ULB_ID = "ulb-nagar-demo";
export const SYNTHETIC_ULB_NAME = "Nagar Demo ULB";

export const WARD_42_ID = "ward-42";
export const WARD_42_NUMBER = 42;
export const WARD_42_NAME = "Ward 42 — Canal Road";
export const WARD_42_RECURRING_ISSUE_ID = "ri:ward-42:DRAINAGE";

export const DEMO_CITIZEN_ID = "user-citizen-demo";
export const DEMO_OFFICER_ID = "user-officer-demo";
export const DEMO_ADMIN_ID = "user-admin-demo";

export const HOTSPOT_MIN_COMPLAINTS = 4;
export const RECURRING_MIN_COMPLAINTS = 8;
export const RECURRING_MIN_LOCATIONS = 3;
export const RECURRING_MIN_HOTSPOTS = 1;

export const WARD_42_EXPECTED = {
  drainageComplaintCount: 37,
  distinctLocationCount: 11,
  hotspotCount: 3,
  percentageChange: 42,
  slaBreachedCount: 2,
  reopenedCount: 4,
  repeatAfterResolutionLocationCount: 2,
} as const;

export const DEPARTMENT_IDS = {
  engineering: "dept-engineering",
  sanitation: "dept-sanitation",
  water: "dept-water",
  lighting: "dept-lighting",
  roads: "dept-roads",
  parks: "dept-parks",
} as const;
