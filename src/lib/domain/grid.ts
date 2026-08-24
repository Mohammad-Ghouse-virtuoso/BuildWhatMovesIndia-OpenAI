/**
 * Deterministic ~100m grid using a meter projection at a fixed ULB origin latitude.
 * Cell identity is never derived by rounding raw lat/lng decimals.
 */
export const GRID_METERS = 100;
export const METERS_PER_DEGREE_LATITUDE = 111_320;
export const ULB_ORIGIN_LATITUDE = 16.5062;
export const ULB_ORIGIN_LONGITUDE = 80.648;

export function metersPerDegreeLongitude(originLatitude = ULB_ORIGIN_LATITUDE): number {
  return METERS_PER_DEGREE_LATITUDE * Math.cos((originLatitude * Math.PI) / 180);
}

export function projectToMeters(
  latitude: number,
  longitude: number,
  originLatitude = ULB_ORIGIN_LATITUDE,
  originLongitude = ULB_ORIGIN_LONGITUDE,
): { east: number; north: number } {
  const mLng = metersPerDegreeLongitude(originLatitude);
  return {
    east: (longitude - originLongitude) * mLng,
    north: (latitude - originLatitude) * METERS_PER_DEGREE_LATITUDE,
  };
}

export function offsetFromOrigin(
  eastMeters: number,
  northMeters: number,
  originLatitude = ULB_ORIGIN_LATITUDE,
  originLongitude = ULB_ORIGIN_LONGITUDE,
): { latitude: number; longitude: number } {
  const mLng = metersPerDegreeLongitude(originLatitude);
  return {
    latitude: originLatitude + northMeters / METERS_PER_DEGREE_LATITUDE,
    longitude: originLongitude + eastMeters / mLng,
  };
}

export function gridCellKey(
  latitude: number,
  longitude: number,
  originLatitude = ULB_ORIGIN_LATITUDE,
  originLongitude = ULB_ORIGIN_LONGITUDE,
): string {
  const { east, north } = projectToMeters(
    latitude,
    longitude,
    originLatitude,
    originLongitude,
  );
  return `${Math.floor(east / GRID_METERS)}:${Math.floor(north / GRID_METERS)}`;
}

export function gridCellCenter(
  key: string,
  originLatitude = ULB_ORIGIN_LATITUDE,
  originLongitude = ULB_ORIGIN_LONGITUDE,
): { latitude: number; longitude: number } {
  const [cellEast, cellNorth] = key.split(":").map(Number);
  if (!Number.isFinite(cellEast) || !Number.isFinite(cellNorth)) {
    throw new Error(`Invalid grid cell key: ${key}`);
  }
  return offsetFromOrigin(
    (cellEast + 0.5) * GRID_METERS,
    (cellNorth + 0.5) * GRID_METERS,
    originLatitude,
    originLongitude,
  );
}

export function sameLocation(a: { latitude: number; longitude: number }, b: {
  latitude: number;
  longitude: number;
}): boolean {
  return a.latitude === b.latitude && a.longitude === b.longitude;
}
