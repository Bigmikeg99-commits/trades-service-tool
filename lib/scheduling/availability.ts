import "server-only";

import { db } from "@/lib/db";
import { crewMembers, jobs } from "@/lib/db/schema";
import { eq, and, gte, lte, isNotNull } from "drizzle-orm";

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface CrewAvailability {
  crewId: string;
  crewName: string;
  color: string;
  workingHours: TimeSlot[];
  blockedSlots: TimeSlot[]; // existing jobs + travel buffers
}

export interface AvailableSlot {
  start: Date;
  end: Date;
  crewId: string;
  crewName: string;
}

/**
 * Get working hours for a crew on a specific date.
 * Falls back to default 7am-5pm if not specified.
 */
function getWorkingHoursForDate(crew: any, date: Date): TimeSlot {
  const startTime = crew.defaultStartTime || "07:00";
  const endTime = crew.defaultEndTime || "17:00";

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const start = new Date(date);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMin, 0, 0);

  return { start, end };
}

/**
 * Check if two time slots overlap.
 */
function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Get all scheduled jobs for a crew in a date range.
 */
async function getScheduledJobsForCrew(crewId: string, startDate: Date, endDate: Date) {
  return await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.assignedPrimaryCrewId, crewId),
        isNotNull(jobs.scheduledStart),
        isNotNull(jobs.scheduledEnd),
        gte(jobs.scheduledStart, startDate),
        lte(jobs.scheduledEnd, endDate)
      )
    );
}

/**
 * Get crew availability for a specific week.
 */
export async function getCrewAvailabilityForWeek(
  startOfWeek: Date,
  endOfWeek: Date
): Promise<CrewAvailability[]> {
  const crews = await db.select().from(crewMembers).where(eq(crewMembers.active, true));

  const availability: CrewAvailability[] = [];

  for (const crew of crews) {
    const workingHours: TimeSlot[] = [];
    const blockedSlots: TimeSlot[] = [];

    // Generate working hours for each day in the week
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      const hours = getWorkingHoursForDate(crew, dayStart);
      workingHours.push(hours);
    }

    // Get existing jobs for this crew
    const scheduledJobs = await getScheduledJobsForCrew(crew.id, startOfWeek, endOfWeek);

    for (const job of scheduledJobs) {
      if (job.scheduledStart && job.scheduledEnd) {
        const jobStart = new Date(job.scheduledStart);
        const jobEnd = new Date(job.scheduledEnd);

        // Add travel buffer before
        const travelBuffer = job.travelTimeMin || 30;
        const bufferedStart = new Date(jobStart.getTime() - travelBuffer * 60 * 1000);

        blockedSlots.push({
          start: bufferedStart,
          end: jobEnd,
        });
      }
    }

    availability.push({
      crewId: crew.id,
      crewName: crew.name,
      color: crew.color,
      workingHours,
      blockedSlots,
    });
  }

  return availability;
}

/**
 * Find available time slots for a crew on or after a preferred date.
 */
export async function findAvailableSlots(
  crewId: string,
  durationMin: number,
  preferredDate: Date,
  travelMin: number = 30
): Promise<AvailableSlot[]> {
  const crew = (await db
    .select()
    .from(crewMembers)
    .where(eq(crewMembers.id, crewId))
    .limit(1))[0];

  if (!crew) return [];

  const endOfSearch = new Date(preferredDate);
  endOfSearch.setDate(endOfSearch.getDate() + 14); // Search up to 2 weeks ahead

  const availability = await getCrewAvailabilityForWeek(preferredDate, endOfSearch);
  const crewAvailability = availability.find((a) => a.crewId === crewId);
  if (!crewAvailability) return [];

  const availableSlots: AvailableSlot[] = [];
  const totalDuration = durationMin + travelMin;

  for (const workingDay of crewAvailability.workingHours) {
    let current = new Date(workingDay.start);

    while (current < workingDay.end) {
      const slotEnd = new Date(current.getTime() + totalDuration * 60 * 1000);

      if (slotEnd > workingDay.end) break;

      // Check for conflicts with blocked slots
      const hasConflict = crewAvailability.blockedSlots.some((blocked) =>
        slotsOverlap({ start: current, end: slotEnd }, blocked)
      );

      if (!hasConflict) {
        availableSlots.push({
          start: current,
          end: slotEnd,
          crewId: crew.id,
          crewName: crew.name,
        });
      }

      // Move forward by 30 minutes
      current = new Date(current.getTime() + 30 * 60 * 1000);
    }
  }

  return availableSlots.slice(0, 10); // Limit suggestions
}

/**
 * Check if scheduling a job at a specific time would cause a conflict.
 */
export async function wouldCauseConflict(
  crewId: string,
  proposedStart: Date,
  proposedEnd: Date,
  excludeJobId?: string
): Promise<boolean> {
  const crew = (await db
    .select()
    .from(crewMembers)
    .where(eq(crewMembers.id, crewId))
    .limit(1))[0];

  if (!crew) return true;

  const travelMin = 30; // default
  const bufferedStart = new Date(proposedStart.getTime() - travelMin * 60 * 1000);

  const existingJobs = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.assignedPrimaryCrewId, crewId),
        isNotNull(jobs.scheduledStart),
        isNotNull(jobs.scheduledEnd)
      )
    );

  for (const job of existingJobs) {
    if (excludeJobId && job.id === excludeJobId) continue;
    if (!job.scheduledStart || !job.scheduledEnd) continue;

    const jobTravel = job.travelTimeMin || 30;
    const jobBufferedStart = new Date(new Date(job.scheduledStart).getTime() - jobTravel * 60 * 1000);
    const jobEnd = new Date(job.scheduledEnd);

    if (
      slotsOverlap(
        { start: bufferedStart, end: proposedEnd },
        { start: jobBufferedStart, end: jobEnd }
      )
    ) {
      return true;
    }
  }

  return false;
}