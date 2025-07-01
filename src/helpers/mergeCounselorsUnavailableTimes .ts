import {
  minutesToTime,
  timeStringToMinutes,
  WorkingSession,
  Day,
} from './date-and-time';

export type UnavailableTimes = Record<string, WorkingSession[]>;

export const Days: Day[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function mergedCounselorsUnavailableTimes(
  allUnavailable: UnavailableTimes[],
): Record<string, WorkingSession[]> {
  const result: Record<string, WorkingSession[]> = {};

  for (const day of Days) {
    const allRanges: { start: number; end: number }[] = [];

    for (const counselorUnavailable of allUnavailable) {
      const sessions = counselorUnavailable[day] ?? [];

      for (const range of sessions) {
        allRanges.push({
          start: timeStringToMinutes(range.start),
          end: timeStringToMinutes(range.end),
        });
      }
    }

    const merged: WorkingSession[] = [];

    if (allRanges.length > 0) {
      const sorted = allRanges.sort((a, b) => a.start - b.start);

      for (const range of sorted) {
        const last = merged[merged.length - 1];
        if (!last || range.start > timeStringToMinutes(last.end)) {
          merged.push({
            start: minutesToTime(range.start),
            end: minutesToTime(range.end),
          });
        } else {
          last.end = minutesToTime(
            Math.max(timeStringToMinutes(last.end), range.end),
          );
        }
      }

      result[day] = merged;
    }
  }

  return result;
}
