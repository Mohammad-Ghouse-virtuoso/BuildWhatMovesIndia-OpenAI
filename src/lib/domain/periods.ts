export const DEFAULT_PERIOD_DAYS = 30;
export const REPEAT_AFTER_RESOLUTION_DAYS = 14;

export interface PeriodWindows {
  now: Date;
  periodDays: number;
  currentStart: Date;
  previousStart: Date;
}

export function periodWindows(
  now: Date,
  periodDays = DEFAULT_PERIOD_DAYS,
): PeriodWindows {
  const ms = periodDays * 24 * 3_600_000;
  return {
    now,
    periodDays,
    currentStart: new Date(now.getTime() - ms),
    previousStart: new Date(now.getTime() - 2 * ms),
  };
}

export function inCurrentPeriod(createdAt: Date, windows: PeriodWindows): boolean {
  return createdAt > windows.currentStart && createdAt <= windows.now;
}

export function inPreviousPeriod(createdAt: Date, windows: PeriodWindows): boolean {
  return createdAt > windows.previousStart && createdAt <= windows.currentStart;
}

export function percentageChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 100);
}
