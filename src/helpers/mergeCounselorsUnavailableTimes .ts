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

  if (allUnavailable.length === 0) {
    return result;
  }

  if (allUnavailable.length === 1) {
    return allUnavailable[0];
  }

  for (const day of Days) {
    const hasFullyAvailableCounselor = allUnavailable.some(
      (counselor) => !counselor[day] || counselor[day].length === 0,
    );

    if (hasFullyAvailableCounselor) {
      continue;
    }

    const allCounselorRangesForDay = allUnavailable.map(
      (counselor) => counselor[day] || [],
    );

    const intersection = findIntersectionOfTimeRanges(allCounselorRangesForDay);

    if (intersection.length > 0) {
      result[day] = intersection;
    }
  }

  return result;
}

function findIntersectionOfTimeRanges(
  allRanges: WorkingSession[][],
): WorkingSession[] {
  if (
    allRanges.length === 0 ||
    allRanges.some((ranges) => ranges.length === 0)
  ) {
    return [];
  }

  let intersection = allRanges[0].map((range) => ({
    start: timeStringToMinutes(range.start),
    end: timeStringToMinutes(range.end),
  }));

  for (let i = 1; i < allRanges.length; i++) {
    const currentRanges = allRanges[i].map((range) => ({
      start: timeStringToMinutes(range.start),
      end: timeStringToMinutes(range.end),
    }));

    const overlaps: { start: number; end: number }[] = [];

    for (const r1 of intersection) {
      for (const r2 of currentRanges) {
        const overlapStart = Math.max(r1.start, r2.start);
        const overlapEnd = Math.min(r1.end, r2.end);

        if (overlapStart < overlapEnd) {
          overlaps.push({ start: overlapStart, end: overlapEnd });
        }
      }
    }

    intersection = overlaps;

    if (intersection.length === 0) break;
  }

  if (intersection.length === 0) return [];

  const sorted = intersection.sort((a, b) => a.start - b.start);
  const merged: WorkingSession[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start <= current.end) {
      current.end = Math.max(current.end, sorted[i].end);
    } else {
      merged.push({
        start: minutesToTime(current.start),
        end: minutesToTime(current.end),
      });
      current = sorted[i];
    }
  }

  merged.push({
    start: minutesToTime(current.start),
    end: minutesToTime(current.end),
  });

  return merged;
}
