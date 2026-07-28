export const runtime = "nodejs";

import { getCrewAvailabilityForWeek, findAvailableSlots } from "@/lib/scheduling/availability";
import { EmptyState } from "@/components/EmptyState";
import "server-only";

import { db } from "@/lib/db";
import { crewMembers, jobs } from "@/lib/db/schema";
import { eq, and, isNotNull, isNull, or } from "drizzle-orm";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { ScheduleClient } from "@/components/schedule/ScheduleClient";

function getWeekDates(date: Date, weekOffset: number = 0) {
  const base = new Date(date);
  // Apply week offset before snapping to Monday
  base.setDate(base.getDate() + weekOffset * 7);

  const start = new Date(base);
  start.setDate(start.getDate() - start.getDay() + 1); // Monday
  start.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return { startOfWeek: start, days };
}

function formatWeekLabel(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endStr = start.getMonth() === end.getMonth()
    ? end.toLocaleDateString("en-US", { day: "numeric" })
    : end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${startMonth} – ${endStr}, ${end.getFullYear()}`;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekOffset = Math.max(-52, Math.min(52, parseInt(week ?? "0") || 0));

  const today = new Date();
  const { startOfWeek, days } = getWeekDates(today, weekOffset);
  const endOfWeek = days[6];

  const weekLabel = formatWeekLabel(startOfWeek, endOfWeek);
  const prevWeek = weekOffset - 1;
  const nextWeek = weekOffset + 1;

  // Serializable day info for passing to Client Component
  const dayInfos = days.map((d) => ({
    iso: d.toISOString(),
    labelShort: d.toLocaleDateString("en-US", { weekday: "short" }),
    dateNum: d.getDate(),
  }));

  await getCrewAvailabilityForWeek(startOfWeek, endOfWeek);

  // All jobs with scheduled times (for the calendar grid)
  const allJobs = await db
    .select()
    .from(jobs)
    .where(
      and(
        isNotNull(jobs.scheduledStart),
        isNotNull(jobs.scheduledEnd)
      )
    );

  const crews = await db.select().from(crewMembers).where(eq(crewMembers.active, true));

  const hasAnyScheduledJobs = allJobs.length > 0;
  const hasCrew = crews.length > 0;

  // Jobs eligible for scheduling (no crew or no start time)
  const assignableJobs = await db
    .select()
    .from(jobs)
    .where(
      or(
        isNull(jobs.assignedPrimaryCrewId),
        isNull(jobs.scheduledStart)
      )
    )
    .orderBy(jobs.createdAt);

  // Pre-compute which job IDs land in which calendar cells.
  // Done server-side so the client never calls setHours() during render.
  // setHours() is timezone-local — server (UTC) and browser (CDT) produce different
  // epoch values for the same "hour", which makes jobsInCell differ and triggers #418.
  // All 24 hours — no artificial cutoff. Key format: "dayIndex-hour" (absolute 0–23).
  const cellJobMap: Record<string, string[]> = {};
  for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
    const day = days[dayIndex];
    for (let hour = 0; hour < 24; hour++) {
      const cellStart = new Date(day);
      cellStart.setHours(hour, 0, 0, 0);
      const cellEnd = new Date(day);
      cellEnd.setHours(hour + 1, 0, 0, 0);
      const key = `${dayIndex}-${hour}`;
      const cellStartMs = cellStart.getTime();
      const cellEndMs = cellEnd.getTime();
      cellJobMap[key] = allJobs
        .filter((job) => {
          if (!job.scheduledStart || !job.scheduledEnd) return false;
          const jobStartMs = new Date(job.scheduledStart as unknown as string).getTime();
          const jobEndMs = new Date(job.scheduledEnd as unknown as string).getTime();
          return jobStartMs < cellEndMs && jobEndMs > cellStartMs;
        })
        .map((job) => job.id as string);
    }
  }

  // Suggestions anchored to the displayed week's start
  const crewsForSuggestions = crews.slice(0, 3);
  const precomputedSuggestions = await Promise.all(
    crewsForSuggestions.map(async (crew) => {
      const slots = await findAvailableSlots(crew.id, 120, startOfWeek, 30);
      return {
        crew,
        slots: slots.map((slot) => {
          // Pre-format display string on the server to prevent hydration mismatch.
          // toLocaleTimeString() is timezone-dependent — calling it client-side
          // produces a different string when the server timezone differs from the
          // browser timezone, which triggers React error #418.
          const slotDate = new Date(slot.start);
          const startDisplay =
            slotDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) +
            " @ " +
            slotDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
          return {
            ...slot,
            start: slotDate.toISOString(),
            end: new Date(slot.end).toISOString(),
            startDisplay,
          };
        }),
      };
    })
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Schedule</h1>
          <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">{weekLabel}</p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-3">
          <Link
            href={`/schedule?week=${prevWeek}`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            ← Prev
          </Link>
          {weekOffset !== 0 && (
            <Link
              href="/schedule"
              className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              This week
            </Link>
          )}
          <Link
            href={`/schedule?week=${nextWeek}`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Next →
          </Link>
          <Link href="/jobs" className="ml-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            All jobs →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Crew List */}
        <div className="pro-card p-6">
          <h3 className="font-semibold mb-4">Active Crew</h3>
          <div className="space-y-3">
            {crews.map((crew) => (
              <div key={crew.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: crew.color }}
                />
                <div>
                  <div className="font-medium">{crew.name}</div>
                  <div className="text-xs text-zinc-500">{crew.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t text-xs text-zinc-500">
            Travel buffers (30 min default) are shown before each job block.
          </div>
        </div>

        {/* Calendar + Filters + Assignments */}
        <div className="lg:col-span-3">
          {!hasAnyScheduledJobs && hasCrew && (
            <div className="mb-4">
              <EmptyState
                icon={Calendar}
                title="Nothing scheduled this week"
                description="Assign jobs from the Jobs page or use the suggestions below to fill the schedule."
              />
            </div>
          )}

          <div className="mt-1 mb-2 text-xs text-zinc-500">
            Each colored block is a scheduled job. Travel time is shown before each appointment. Use the filters above to focus on a specific crew member or job status.
          </div>

          <ScheduleClient
            allJobs={allJobs as any}
            crews={crews as any}
            assignableJobs={assignableJobs as any}
            precomputedSuggestions={precomputedSuggestions as any}
            weekLabel={weekLabel}
            dayInfos={dayInfos}
            cellJobMap={cellJobMap}
          />
        </div>
      </div>
    </div>
  );
}
