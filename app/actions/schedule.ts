"use server";

import "server-only";

import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function assignJobToSlot(formData: FormData) {
  const jobId = formData.get("jobId") as string;
  const crewId = formData.get("crewId") as string;
  const startTime = formData.get("startTime") as string; // ISO string

  if (!jobId || !crewId || !startTime) {
    return { error: "Missing required fields" };
  }

  const job = (await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1))[0];
  if (!job) return { error: "Job not found" };

  const durationHours = job.estimatedLaborHours || 2;
  const travelMin = job.travelTimeMin || 30;

  const start = new Date(startTime);
  const end = new Date(start.getTime() + (durationHours * 60 + travelMin) * 60 * 1000);

  await db
    .update(jobs)
    .set({
      assignedPrimaryCrewId: crewId,
      scheduledStart: start,
      scheduledEnd: end,
      status: "scheduled",
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  revalidatePath("/schedule");
  revalidatePath("/jobs");

  return { success: true };
}