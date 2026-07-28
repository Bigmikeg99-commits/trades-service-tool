/**
 * Pure cell-map builder — extracted from schedule/page.tsx so it can be
 * unit-tested without a database or Next.js runtime.
 *
 * A job belongs to exactly ONE cell: the cell whose hour contains the job's
 * start time. Rendering is responsible for drawing a block whose height
 * reflects the full duration (overflowing into cells below).
 *
 * Key format: "dayIndex-hour"  (hour is 0-23, UTC hour).
 * All arithmetic uses UTC epoch math so results are identical in any timezone.
 */

export interface JobForCell {
  id: string;
  scheduledStart: Date | string | null | undefined;
  scheduledEnd: Date | string | null | undefined;
}

/**
 * Build a map of day-hour cells → job IDs that START in that cell.
 *
 * @param jobs        List of jobs (Drizzle rows or plain objects with the same shape)
 * @param days        Array of Date objects, one per day in the displayed week (Mon–Sun)
 */
export function buildCellJobMap(
  jobs: JobForCell[],
  days: Date[]
): Record<string, string[]> {
  const map: Record<string, string[]> = {};

  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    // UTC midnight of this day — timezone-agnostic baseline.
    // Using setUTCHours avoids the same local-timezone pitfall that caused #418
    // (setHours produces different epoch values in UTC vs CDT).
    const dayMidnightMs = new Date(day).setUTCHours(0, 0, 0, 0);

    for (let hour = 0; hour < 24; hour++) {
      const cellStartMs = dayMidnightMs + hour * 3_600_000;
      const cellEndMs   = cellStartMs + 3_600_000;
      const key = `${dayIndex}-${hour}`;

      map[key] = jobs
        .filter((job) => {
          if (!job.scheduledStart) return false;
          const startMs = new Date(job.scheduledStart as string).getTime();
          // Job belongs ONLY to the cell where it starts, never to later cells.
          return startMs >= cellStartMs && startMs < cellEndMs;
        })
        .map((job) => job.id);
    }
  }

  return map;
}
