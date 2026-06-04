"use server";

import "server-only";

import { db } from "@/lib/db";
import { priceBookItems, jobLineItems } from "@/lib/db/schema";
import { eq, like, and, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const priceBookSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name is too long")
    .trim()
    .refine((val) => !/<[^>]*>/.test(val), {
      message: "Name cannot contain HTML",
    }),
  category: z.enum(["hvac", "plumbing", "electrical", "general"]),
  unitPrice: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(100000, "Price seems unreasonably high"),
  unit: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .default("ea")
    .refine((val) => !/<[^>]*>/.test(val), {
      message: "Unit cannot contain HTML",
    }),
  typicalLaborMin: z.coerce
    .number()
    .int()
    .min(0)
    .max(10080, "Labor time seems too high") // max ~1 week in minutes
    .default(0),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  sku: z
    .string()
    .trim()
    .max(50)
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

export async function getPriceBookItems(filters?: {
  category?: string;
  search?: string;
}) {
  let query = db
    .select()
    .from(priceBookItems)
    .where(eq(priceBookItems.active, true))
    .orderBy(desc(priceBookItems.createdAt));

  const conditions = [eq(priceBookItems.active, true)];

  if (filters?.category && filters.category !== "all") {
    conditions.push(eq(priceBookItems.category, filters.category as any));
  }

  if (filters?.search) {
    conditions.push(like(priceBookItems.name, `%${filters.search}%`));
  }

  const finalQuery = conditions.length > 1 
    ? db.select().from(priceBookItems).where(and(...conditions)).orderBy(desc(priceBookItems.createdAt))
    : query;

  return await finalQuery;
}

export async function createPriceBookItem(formData: FormData) {
  const parsed = priceBookSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    unitPrice: formData.get("unitPrice"),
    unit: formData.get("unit"),
    typicalLaborMin: formData.get("typicalLaborMin"),
    notes: formData.get("notes"),
    sku: formData.get("sku"),
  });

  if (!parsed.success) {
    throw new Error("Invalid price book item data");
  }

  const data = parsed.data;

  await db.insert(priceBookItems).values({
    name: data.name,
    category: data.category,
    unitPrice: data.unitPrice,
    unit: data.unit,
    typicalLaborMin: data.typicalLaborMin,
    notes: data.notes || null,
    sku: data.sku || null,
    active: true,
  });

  revalidatePath("/pricebook");
}

export async function updatePriceBookItem(id: string, formData: FormData) {
  const parsed = priceBookSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    unitPrice: formData.get("unitPrice"),
    unit: formData.get("unit"),
    typicalLaborMin: formData.get("typicalLaborMin"),
    notes: formData.get("notes"),
    sku: formData.get("sku"),
  });

  if (!parsed.success) {
    throw new Error("Invalid data");
  }

  const data = parsed.data;

  await db
    .update(priceBookItems)
    .set({
      name: data.name,
      category: data.category,
      unitPrice: data.unitPrice,
      unit: data.unit,
      typicalLaborMin: data.typicalLaborMin,
      notes: data.notes || null,
      sku: data.sku || null,
    })
    .where(eq(priceBookItems.id, id));

  revalidatePath("/pricebook");
}

export async function getPriceBookItemUsageCount(itemId: string) {
  // Simple approximation: count job line items whose description contains the item name
  // In a future version we can add a proper price_book_item_id FK
  const item = (await db
    .select()
    .from(priceBookItems)
    .where(eq(priceBookItems.id, itemId))
    .limit(1))[0];

  if (!item) return 0;

  const result = await db
    .select({ count: count() })
    .from(jobLineItems)
    .where(like(jobLineItems.description, `%${item.name.split(" ")[0]}%`));

  return result[0]?.count || 0;
}