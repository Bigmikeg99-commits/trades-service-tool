"use client";
import { formatStatus } from "@/lib/format";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignJobToSlot } from "@/app/actions/schedule";

// Loose types for simplicity (dates may arrive as string/number from serialization but new Date handles)
type Job = {
  id: string;
  title: string;
  status: string;
  assignedPrimaryCrewId?: string | null;
  scheduledStart?: string | number | Date | null;
  scheduledEnd?: string | number | Date | null;
  travelTimeMin?: number | null;
  estimatedLaborHours?: number | null;
};

type Crew = {
  id: string;
  name: string;
  color: string;
  title?: string | null;
};

type SuggestionSlot = {
  start: string | Date; // ISO or Date
  end: string | Date;
  crewId: string;
  crewName: string;
  startDisplay?: string; // Pre-formatted on server to avoid hydration mismatch
};

type PrecomputedSuggestion = {
  crew: Crew;
  slots: SuggestionSlot[];
};

interface ScheduleClientProps {
  allJobs: Job[];
  crews: Crew[];
  assignableJobs: Job[];
  precomputedSuggestions: PrecomputedSuggestion[];
  weekLabel: string; // e.g. start date string
  dayInfos: Array<{ iso: string; labelShort: string; dateNum: number }>;
  // Pre-computed server-side: maps "dayIndex-hourOffset" → job IDs in that cell.
  // Eliminates timezone-sensitive setHours() calls from the render path (source of #418).
  cellJobMap: Record<string, string[]>;
}

const timeSlots = Array.from({ length: 12 }, (_, i) => 7 + i); // 7am to 6pm

function formatHour(hour: number): string {
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function ScheduleClient({
  allJobs,
  crews,
  assignableJobs,
  precomputedSuggestions,
  weekLabel,
  dayInfos,
  cellJobMap,
}: ScheduleClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Client state for filters (crew + status) - these "respond" instantly without server roundtrip or handler passing from RSC
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>(crews.map((c) => c.id));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["scheduled", "in_progress", "quoted", "lead"]);

  // For calendar assignments: select a pending job, then click a suggestion slot to assign it
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [assignMessage, setAssignMessage] = useState<string | null>(null);

  const toggleCrew = (crewId: string) => {
    setSelectedCrewIds((prev) =>
      prev.includes(crewId) ? prev.filter((id) => id !== crewId) : [...prev, crewId]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const selectJobForAssign = (jobId: string) => {
    setSelectedJobId(jobId === selectedJobId ? null : jobId);
    setAssignMessage(null);
  };

  // Filter jobs for display in calendar using client state (instant response)
  const filteredJobs = allJobs.filter((job) => {
    const jobCrewId = job.assignedPrimaryCrewId;
    const crewMatch = !jobCrewId || selectedCrewIds.includes(jobCrewId);
    const statusMatch = selectedStatuses.includes(job.status);
    return crewMatch && statusMatch;
  });

  // Filter suggestions by selected crews
  const filteredSuggestions = precomputedSuggestions.filter((s) =>
    selectedCrewIds.includes(s.crew.id)
  );

  // Filter the assignable jobs list by status filters too (crew N/A since unassigned). This makes the "job list" respond to toggles.
  const filteredAssignableJobs = assignableJobs.filter((job) =>
    selectedStatuses.includes(job.status)
  );

  // Week boundary in epoch ms — pure arithmetic, no setHours(), no timezone dependency.
  // dayInfos[0].iso = midnight UTC on Monday; dayInfos[6].iso = midnight UTC on Sunday.
  // Adding 24h to Sunday midnight and subtracting 1ms = 23:59:59.999 UTC Sunday.
  const weekStartMs = dayInfos.length > 0 ? new Date(dayInfos[0].iso).getTime() : null;
  const weekEndMs = dayInfos.length > 0 ? new Date(dayInfos[dayInfos.length - 1].iso).getTime() + 24 * 3600 * 1000 - 1 : null;

  const filteredJobsThisWeek = filteredJobs.filter((job) => {
    if (!job.scheduledStart || weekStartMs === null || weekEndMs === null) return false;
    const jobStartMs = new Date(job.scheduledStart as string | number).getTime();
    return jobStartMs >= weekStartMs && jobStartMs <= weekEndMs;
  });

  // Handle assignment from a suggestion slot (proper client pattern: handler defined here, no prop passing from server)
  const handleAssignToSlot = async (slot: SuggestionSlot) => {
    if (!selectedJobId) {
      setAssignMessage("Select a job from 'Jobs awaiting schedule' first.");
      return;
    }

    const formData = new FormData();
    formData.set("jobId", selectedJobId);
    formData.set("crewId", slot.crewId);
    formData.set("startTime", new Date(slot.start).toISOString());

    startTransition(async () => {
      try {
        const result = await assignJobToSlot(formData);
        if (result?.error) {
          setAssignMessage(`Error: ${result.error}`);
        } else {
          setAssignMessage("Assigned! Refreshing schedule...");
          setSelectedJobId(null);
          // Revalidate data from server (action already calls revalidatePath, this ensures UI update)
          router.refresh();
          // Clear msg after a bit
          setTimeout(() => setAssignMessage(null), 2500);
        }
      } catch (e: any) {
        setAssignMessage(`Failed: ${e?.message || e}`);
      }
    });
  };

  const selectedJob = assignableJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      {/* View Toggles / Filters - all handlers + state inside this Client Component */}
      <div className="pro-card p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Crew filters */}
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-1.5">Show crew</div>
            <div className="flex flex-wrap gap-2">
              {crews.map((crew) => {
                const active = selectedCrewIds.includes(crew.id);
                return (
                  <button
                    key={crew.id}
                    type="button"
                    onClick={() => toggleCrew(crew.id)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors flex items-center gap-1.5 ${
                      active
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent"
                        : "bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: crew.color }} />
                    {crew.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedCrewIds(crews.map((c) => c.id))}
                className="text-xs px-2 py-1 text-zinc-500 hover:text-zinc-900"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedCrewIds([])}
                className="text-xs px-2 py-1 text-zinc-500 hover:text-zinc-900"
              >
                None
              </button>
            </div>
          </div>

          {/* Status filters */}
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-1.5">Filter by status</div>
            <div className="flex flex-wrap gap-2">
              {["scheduled", "in_progress", "quoted", "lead"].map((status) => {
                const active = selectedStatuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatus(status)}
                    className={`text-xs px-3 py-1 rounded-full transition-colors border ${
                      active
                        ? "bg-emerald-600 text-white border-transparent"
                        : "bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {formatStatus(status)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* The Calendar Grid - fully rendered in this client component so crew/status filters instantly affect which job blocks appear (live responding UI, no event handlers passed from server RSC) */}
      <div className="pro-card overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="grid grid-cols-8 border-b dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
            <div className="p-3 text-xs font-medium text-zinc-500">Time</div>
            {dayInfos.map((d, index) => (
              <div key={index} className="p-3 text-center border-l dark:border-zinc-800">
                <div className="text-xs text-zinc-500">{d.labelShort}</div>
                <div className="font-semibold text-lg">{d.dateNum}</div>
              </div>
            ))}
          </div>

          {/* Time Grid (client-side, filters applied to jobsInCell for instant updates) */}
          <div className="relative">
            {timeSlots.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b dark:border-zinc-800 h-12">
                <div className="p-2 text-xs text-zinc-500 border-r dark:border-zinc-800">
                  {formatHour(hour)}
                </div>
                {dayInfos.map((dInfo, dayIndex) => {
                  // Use pre-computed server-side cell map — no setHours() here.
                  const hourOffset = hour - 7;
                  const cellJobIds = cellJobMap[`${dayIndex}-${hourOffset}`] ?? [];
                  const jobsInCell = filteredJobs.filter((job) => cellJobIds.includes(job.id));

                  const crewForJob = (job: Job) => crews.find((c) => c.id === job.assignedPrimaryCrewId);

                  return (
                    <div
                      key={dayIndex}
                      className="border-l dark:border-zinc-800 p-1 text-[10px] relative hover:bg-zinc-50 dark:hover:bg-zinc-900 min-h-[3rem]"
                    >
                      {jobsInCell.map((job, idx) => {
                        const crew = crewForJob(job);
                        return (
                          <div
                            key={idx}
                            className="rounded px-1 py-0.5 text-white truncate mb-0.5 text-[9px] cursor-pointer"
                            style={{ backgroundColor: crew?.color || "#3b82f6" }}
                            title={`${job.title} (${job.status})`}
                            onClick={() => {
                              if (!job.assignedPrimaryCrewId) {
                                selectJobForAssign(job.id);
                              }
                            }}
                          >
                            <a href={`/jobs/${job.id}`} className="hover:underline block" onClick={(e) => e.stopPropagation()}>
                              {job.title}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        {filteredJobsThisWeek.length} job{filteredJobsThisWeek.length === 1 ? "" : "s"} scheduled this week
        {allJobs.length > filteredJobsThisWeek.length && ` · ${allJobs.length - filteredJobsThisWeek.length} in other weeks`}
      </div>

      <div className="pro-card p-4">
        <h4 className="font-semibold mb-2 text-sm">Jobs This Week</h4>
        {filteredJobsThisWeek.length === 0 ? (
          <p className="text-xs text-zinc-500">No scheduled jobs this week match the selected filters.</p>
        ) : (
          <div className="space-y-2 text-xs">
            {filteredJobsThisWeek.map((job) => {
              const crew = crews.find((c) => c.id === job.assignedPrimaryCrewId);
              return (
                <div key={job.id} className="flex items-center justify-between border-b pb-1 last:border-b-0 last:pb-0">
                  <div>
                    <span className="font-medium">{job.title}</span>
                    <span className="ml-2 text-zinc-500">({formatStatus(job.status)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {crew && (
                      <span style={{ color: crew.color }} className="font-mono text-[10px]">
                        ● {crew.name}
                      </span>
                    )}
                    <a href={`/jobs/${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">View →</a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calendar Assignments UI */}
      <div className="pro-card p-4">
        <h4 className="font-semibold mb-3">Calendar Assignments</h4>

        {filteredAssignableJobs.length === 0 ? (
          <p className="text-sm text-zinc-500">No unscheduled jobs match the current filters.</p>
        ) : (
          <>
            <p className="text-xs text-zinc-500 mb-2">Select a job to schedule:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {filteredAssignableJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => selectJobForAssign(job.id)}
                  className={`text-sm px-3 py-1 rounded border ${selectedJobId === job.id ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white dark:bg-zinc-950 hover:bg-zinc-50"}`}
                >
                  {job.title} <span className="text-[10px] opacity-60">({job.status})</span>
                </button>
              ))}
            </div>

            {selectedJob && (
              <p className="text-xs mb-2 text-emerald-600">Selected: {selectedJob.title}. Now click a suggestion time below to assign it.</p>
            )}

            {assignMessage && <p className="text-xs mb-2 text-amber-600">{assignMessage}</p>}

            <p className="text-xs text-zinc-500 mb-2">Click an available suggestion slot below (filtered by your crew toggles above):</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSuggestions.flatMap((sugg) =>
                sugg.slots.slice(0, 3).map((slot, i) => (
                  <button
                    key={`${sugg.crew.id}-${i}`}
                    type="button"
                    disabled={!selectedJobId || isPending}
                    onClick={() => handleAssignToSlot(slot)}
                    className="text-left pro-card p-3 text-sm disabled:opacity-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200"
                  >
                    <div className="font-medium">{sugg.crew.name}</div>
                    <div className="text-zinc-600 dark:text-zinc-400">
                      {slot.startDisplay ?? new Date(slot.start).toISOString().slice(0, 16).replace("T", " ")}
                    </div>
                    <div className="text-[10px] mt-1 text-emerald-600">Assign here →</div>
                  </button>
                ))
              )}
            </div>
            {isPending && <p className="text-xs mt-2">Assigning...</p>}
          </>
        )}
      </div>

    </div>
  );
}
