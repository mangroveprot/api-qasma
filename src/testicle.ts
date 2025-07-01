export type TimeRange = { start: string; end: string };
export type UnavailableTimes = Record<string, TimeRange[]>;

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function mergeAllUnavailableTimes(
  allUnavailable: UnavailableTimes[],
): Record<string, TimeRange[]> {
  const result: UnavailableTimes = {};

  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    const allRanges: { start: number; end: number }[] = [];

    for (const counselor of Object.values(allUnavailable)) {
      if (counselor[day]) {
        for (const range of counselor[day]) {
          allRanges.push({
            start: timeToMinutes(range.start),
            end: timeToMinutes(range.end),
          });
        }
      }
    }

    if (allRanges.length > 0) {
      const sorted = allRanges.sort((a, b) => a.start - b.start);
      const merged: { start: number; end: number }[] = [];

      for (const range of sorted) {
        const last = merged[merged.length - 1];
        if (!last || range.start > last.end) {
          merged.push({ ...range });
        } else {
          last.end = Math.max(last.end, range.end);
        }
      }

      result[day] = merged.map((r) => ({
        start: minutesToTime(r.start),
        end: minutesToTime(r.end),
      }));
    }
  }

  return result;
}
