import type { ComplaintCategory } from "@/lib/contracts";

export interface SubcategoryDefinition {
  id: string;
  category: ComplaintCategory;
  label: string;
  slaHours: number;
}

/**
 * Prototype SLA hours from publicly documented AP CDMA grievance examples.
 * Synthetic records only — not a live government mapping.
 */
export const SUBCATEGORIES: readonly SubcategoryDefinition[] = [
  {
    id: "drain-blockage-overflow",
    category: "DRAINAGE",
    label: "Drain blockage/overflow",
    slaHours: 24,
  },
  {
    id: "garbage-not-lifted",
    category: "WASTE_SANITATION",
    label: "Garbage not lifted",
    slaHours: 24,
  },
  {
    id: "water-pipeline-leakage",
    category: "WATER_SUPPLY",
    label: "Water/pipeline leakage",
    slaHours: 24,
  },
  {
    id: "street-light-not-working",
    category: "STREET_LIGHTING",
    label: "Street light not working",
    slaHours: 48,
  },
  {
    id: "road-patch-repair",
    category: "ROADS",
    label: "Road patch repair",
    slaHours: 72,
  },
  {
    id: "park-tree-maintenance",
    category: "PARKS_GREENERY",
    label: "Park/tree maintenance",
    slaHours: 72,
  },
] as const;

export const SUBCATEGORY_BY_ID: Record<string, SubcategoryDefinition> =
  Object.fromEntries(SUBCATEGORIES.map((item) => [item.id, item]));

export const DEFAULT_SUBCATEGORY_BY_CATEGORY: Record<
  ComplaintCategory,
  SubcategoryDefinition
> = {
  DRAINAGE: SUBCATEGORY_BY_ID["drain-blockage-overflow"],
  WASTE_SANITATION: SUBCATEGORY_BY_ID["garbage-not-lifted"],
  WATER_SUPPLY: SUBCATEGORY_BY_ID["water-pipeline-leakage"],
  STREET_LIGHTING: SUBCATEGORY_BY_ID["street-light-not-working"],
  ROADS: SUBCATEGORY_BY_ID["road-patch-repair"],
  PARKS_GREENERY: SUBCATEGORY_BY_ID["park-tree-maintenance"],
};

export function slaHoursForSubcategory(subcategoryId: string): number {
  const definition = SUBCATEGORY_BY_ID[subcategoryId];
  if (!definition) {
    throw new Error(`Unknown subcategory: ${subcategoryId}`);
  }
  return definition.slaHours;
}
