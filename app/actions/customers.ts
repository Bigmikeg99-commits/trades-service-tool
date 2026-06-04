"use server";

import "server-only";

import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq, like, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const customerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim()
    .refine((val) => !/<[^>]*>/.test(val), {
      message: "Name cannot contain HTML",
    }),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .max(255)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  addressLine1: z
    .string()
    .trim()
    .max(200, "Address is too long")
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
    .max(2000, "Notes are too long")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export async function createCustomer(formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error("Invalid customer data");
  }

  const data = parsed.data;

  await db.insert(customers).values({
    name: data.name,
    phone: data.phone || null,
    email: data.email || null,
    addressLine1: data.addressLine1 || null,
    city: data.city || null,
    state: data.state || "MN",
    zip: data.zip || null,
    notes: data.notes || null,
  });

  revalidatePath("/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error("Invalid customer data");
  }

  await db
    .update(customers)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, id));

  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return { success: true };
}

export async function getCustomers(search?: string) {
  let query = db.select().from(customers).orderBy(desc(customers.createdAt));

  if (search) {
    query = query.where(
      like(customers.name, `%${search}%`)
    ) as typeof query;
  }

  return await query;
}

export async function getCustomer(id: string) {
  return (await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1))[0] ?? null;
}