"use server";

import "server-only";

import { db } from "@/lib/db";
import { companySettings, crewMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { getSubscriptionStatus } from "./billing";

const companySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100)
    .trim()
    .refine((val) => !/<[^>]*>/.test(val), {
      message: "Name cannot contain HTML",
    }),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  email: z
    .string()
    .email()
    .toLowerCase()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  addressLine1: z
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
  licenseHvac: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  licensePlumbing: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  licenseElectrical: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  defaultTaxRate: z.coerce.number().min(0).max(25).optional(),
  defaultTerms: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export async function updateCompanySettings(formData: FormData) {
  const requestHeaders = await headers();
  const ip = getClientIP(requestHeaders);

  // Rate limit sensitive company settings changes
  const rateLimit = await checkRateLimit({
    key: `company-settings:${ip}`,
    limit: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
  });

  if (!rateLimit.success) {
    throw new Error("Too many updates. Please try again later.");
  }

  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    licenseHvac: formData.get("licenseHvac"),
    licensePlumbing: formData.get("licensePlumbing"),
    licenseElectrical: formData.get("licenseElectrical"),
    defaultTaxRate: formData.get("defaultTaxRate"),
    defaultTerms: formData.get("defaultTerms"),
  });

  if (!parsed.success) {
    throw new Error("Invalid company data");
  }

  const data = parsed.data;

  // Get existing or create new
  const existing = (await db.select().from(companySettings).limit(1))[0];

  if (existing) {
    await db
      .update(companySettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(companySettings.id, existing.id));
  } else {
    await db.insert(companySettings).values(data);
  }

  revalidatePath("/settings");
  revalidatePath("/jobs"); // in case PDFs use company info
}

export async function getCompanySettings() {
  return (await db.select().from(companySettings).limit(1))[0] ?? null;
}

// Crew Management
const crewSchema = z.object({
  name: z.string().min(2),
  title: z.string().optional(),
  phone: z.string().optional(),
  color: z.string().default("#3b82f6"),
  defaultStartTime: z.string().default("07:00"),
  defaultEndTime: z.string().default("17:00"),
});

export async function createCrewMember(formData: FormData) {
  const parsed = crewSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    color: formData.get("color"),
    defaultStartTime: formData.get("defaultStartTime"),
    defaultEndTime: formData.get("defaultEndTime"),
  });

  if (!parsed.success) {
    throw new Error("Invalid crew data");
  }

  // Enforce Team tier for multi-crew: Free/Pro limited to 1 active crew
  const sub = await getSubscriptionStatus();
  const plan = (sub.plan || "free").toLowerCase();
  if (plan !== "team") {
    const activeCrews = await db
      .select()
      .from(crewMembers)
      .where(eq(crewMembers.active, true));
    if (activeCrews.length >= 1) {
      throw new Error("Multi-crew support is a Team plan feature only. Upgrade to Team to add more crew members.");
    }
  }

  await db.insert(crewMembers).values({
    ...parsed.data,
    active: true,
  });

  revalidatePath("/settings");
}

export async function updateCrewMember(id: string, formData: FormData) {
  const parsed = crewSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    phone: formData.get("phone"),
    color: formData.get("color"),
    defaultStartTime: formData.get("defaultStartTime"),
    defaultEndTime: formData.get("defaultEndTime"),
  });

  if (!parsed.success) {
    throw new Error("Invalid data");
  }

  await db
    .update(crewMembers)
    .set(parsed.data)
    .where(eq(crewMembers.id, id));

  revalidatePath("/settings");
  revalidatePath("/schedule");
}

export async function toggleCrewActive(id: string, active: boolean) {
  await db
    .update(crewMembers)
    .set({ active })
    .where(eq(crewMembers.id, id));

  revalidatePath("/settings");
  revalidatePath("/schedule");
}

export async function getActiveCrew() {
  return await db
    .select()
    .from(crewMembers)
    .where(eq(crewMembers.active, true))
    .orderBy(crewMembers.name);
}