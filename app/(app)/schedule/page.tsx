export const runtime = "nodejs";

import { getCrewAvailabilityForWeek, findAvailableSlots } from "@/lib/scheduling/availability";
import { EmptyState } from "@/components/EmptyState";
import { db } from "@/lib/db";
import { crewMembers, jobs } from "@/lib/db/schema";
import { eq, and, isNotNull, isNull, or } from "drizzle-orm";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { ScheduleClient } from "@/components/schedule/ScheduleClient";

function getWeekDates(date: Date) {
  const start = new Date(date);
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

export default async function SchedulePage() {
  const today = new Date();
  const { startOfWeek, days } = getWeekDates(today);

  // Serializable day info for passing to Client Component (for live filtered calendar grid)
  const dayInfos = days.map((d) => ({
    iso: d.toISOString(),
    labelShort: d.toLocaleDateString("en-US", { weekday: "short" }),
    dateNum: d.getDate(),
  }));

  const crewAvailability = await getCrewAvailabilityForWeek(startOfWeek, days[6]);
  
  // Fetch jobs that have scheduled times (show existing assigned/scheduled jobs regardless of status like "in_progress")
  // This fixes "Schedule page so it shows existing jobs"
  const allJobs = await db
    .select()
    .from(jobs)
    .where(
      and(
        isNotNull(jobs.scheduledStart),
        isNotNull(jobs.scheduledEnd)
      )
    );

  // Get crew list for assignment
  const crews = await db.select().from(crewMembers).where(eq(crewMembers.active, true));

  const hasAnyScheduledJobs = allJobs.length > 0;
  const hasCrew = crews.length > 0;

  // Jobs that can be assigned/scheduled (no crew or no scheduled time yet) - used for interactive assignment UI
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

  // Precompute suggestions outside JSX to avoid async-in-render (which breaks React rendering of promises)
  // Fixes "suggestions not showing"
  const crewsForSuggestions = crews.slice(0, 3);
  const precomputedSuggestions = await Promise.all(
    crewsForSuggestions.map(async (crew) => {
      const slots = await findAvailableSlots(crew.id, 120, new Date(), 30);
      return { crew, slots };
    })
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Schedule</h1>
          <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
            Week of {startOfWeek.toLocaleDateString()}
          </p>
        </div>
        <Link href="/jobs" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          View all jobs →
        </Link>
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

        {/* Week Calendar + Filters + Assignments (interactive parts in Client Component for proper event handler patterns, live responding filters, and working calendar assignments) */}
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

          {/* Legend for the (now interactive/filterable) calendar below */}
          <div className="mt-1 mb-2 text-xs text-zinc-500">
            Colored blocks show scheduled/assigned jobs + travel buffers. Use filters below to narrow. Click blocks or use suggestions to assign.
          </div>

          {/* Interactive Client Component: FULL live calendar grid (filtered), view toggles (crew/status filters), pending job selector, and working calendar assignment buttons.
             All event handlers, state, and onClick/onToggle logic live inside this Client Component. Server page passes ONLY serializable data props (no functions/handlers). */}
          <ScheduleClient
            allJobs={allJobs as any}
            crews={crews as any}
            assignableJobs={assignableJobs as any}
            precomputedSuggestions={precomputedSuggestions as any}
            weekLabel={startOfWeek.toLocaleDateString()}
            dayInfos={dayInfos}
          />
        </div>
      </div>
    </div>
  );
}