"use server";

import { db } from "@/lib/db";
import { jobs, customers, jobLineItems } from "@/lib/db/schema";
import { eq, like, desc, and, gte, lte, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSubscriptionStatus } from "./billing";

const jobSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title is too long")
    .trim()
    .refine((val) => !/<[^>]*>/.test(val), {
      message: "Title cannot contain HTML",
    }),
  rawDescription: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  serviceType: z.enum(["hvac", "plumbing", "electrical", "general"]),
  addressOverride: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  city: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  state: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  zip: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export async function createJob(formData: FormData) {
  const parsed = jobSchema.safeParse({
    customerId: formData.get("customerId"),
    title: formData.get("title"),
    rawDescription: formData.get("rawDescription"),
    serviceType: formData.get("serviceType"),
    addressOverride: formData.get("addressOverride"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error("Invalid job data");
  }

  const data = parsed.data;

  // Enforce Free tier limit: max 10 jobs created per calendar month
  const sub = await getSubscriptionStatus();
  const plan = (sub.plan || "free").toLowerCase();
  if (plan === "free") {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const result = await db
      .select({ count: count() })
      .from(jobs)
      .where(
        and(
          gte(jobs.createdAt, startOfMonth),
          lte(jobs.createdAt, endOfMonth)
        )
      );
    const jobCountThisMonth = result[0]?.count || 0;

    if (jobCountThisMonth >= 10) {
      throw new Error("Free tier limit reached: maximum of 10 jobs per month. Upgrade to Pro or Team for unlimited jobs.");
    }
  }

  const [newJob] = await db
    .insert(jobs)
    .values({
      ...data,
      status: "lead",
    })
    .returning();

  revalidatePath("/jobs");
  revalidatePath("/customers");
}

export async function updateJobStatus(jobId: string, newStatus: string) {
  const validStatuses = ["lead", "quoted", "scheduled", "in_progress", "completed", "cancelled"];

  if (!validStatuses.includes(newStatus)) {
    return { error: "Invalid status" };
  }

  await db
    .update(jobs)
    .set({ 
      status: newStatus as any,
      updatedAt: new Date() 
    })
    .where(eq(jobs.id, jobId));

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  return { success: true };
}

export async function getJobs(filters?: { 
  status?: string; 
  search?: string; 
}) {
  let query = db
    .select({
      id: jobs.id,
      title: jobs.title,
      serviceType: jobs.serviceType,
      status: jobs.status,
      createdAt: jobs.createdAt,
      customerName: customers.name,
    })
    .from(jobs)
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .orderBy(desc(jobs.createdAt));

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(jobs.status, filters.status as any));
  }

  if (filters?.search) {
    conditions.push(like(jobs.title, `%${filters.search}%`));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  return await query;
}

export async function getJob(id: string) {
  const job = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, id))
    .get();

  if (!job) return null;

  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.id, job.customerId))
    .get();

  const lineItems = await db
    .select()
    .from(jobLineItems)
    .where(eq(jobLineItems.jobId, id))
    .orderBy(jobLineItems.sortOrder);

  return {
    ...job,
    customer,
    lineItems,
  };
}

export async function getJobsForCustomer(customerId: string) {
  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.customerId, customerId))
    .orderBy(desc(jobs.createdAt));
}