export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  companySettings,
  customers,
  jobs,
  jobLineItems,
  priceBookItems,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSubscriptionStatus } from "@/app/actions/billing";
import { revalidatePath } from "next/cache";

// Basic date fields that come as ISO strings from JSON export
const DATE_FIELDS = ["createdAt", "updatedAt", "scheduledStart", "scheduledEnd", "subscriptionCurrentPeriodEnd"];

function normalizeDates(item: any): any {
  if (!item || typeof item !== "object") return item;
  const out = { ...item };
  for (const field of DATE_FIELDS) {
    if (typeof out[field] === "string") {
      out[field] = new Date(out[field]);
    }
  }
  return out;
}

export async function POST(request: Request) {
  try {
    const sub = await getSubscriptionStatus();
    const plan = (sub.plan || "free").toLowerCase();
    if (plan === "free") {
      return NextResponse.json(
        { error: "Data import is a Pro/Team feature. Please upgrade your plan." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const text = await file.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON file" }, { status: 400 });
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const errors: string[] = [];
    const imported = {
      companySettings: 0,
      customers: 0,
      jobs: 0,
      jobLineItems: 0,
      priceBookItems: 0,
    };

    // 1. Company settings (single row, upsert by updating existing)
    if (data.companySettings && typeof data.companySettings === "object") {
      try {
        const cs = normalizeDates(data.companySettings);
        const existing = await db.select({ id: companySettings.id }).from(companySettings).get();
        if (existing) {
          // Remove id from set to avoid PK issues; use imported fields
          const { id: _ignoredId, ...setData } = cs;
          await db
            .update(companySettings)
            .set({
              ...setData,
              updatedAt: new Date(),
            })
            .where(eq(companySettings.id, existing.id));
        } else {
          // Fresh DB, strip id if present so auto-increment works
          const { id: _ignoredId, ...insertData } = cs;
          await db.insert(companySettings).values(insertData);
        }
        imported.companySettings = 1;
      } catch (e: any) {
        errors.push(`Company settings: ${e.message || e}`);
      }
    }

    // 2. Customers (independent)
    if (Array.isArray(data.customers)) {
      for (const c of data.customers) {
        if (!c || !c.id) {
          errors.push("Customer missing id, skipped");
          continue;
        }
        const norm = normalizeDates(c);
        try {
          const exists = await db
            .select({ id: customers.id })
            .from(customers)
            .where(eq(customers.id, c.id))
            .get();
          if (exists) {
            // duplicate skipped
            continue;
          }
          await db.insert(customers).values(norm);
          imported.customers++;
        } catch (e: any) {
          errors.push(`Customer ${c.id}: ${e.message || e}`);
        }
      }
    }

    // 3. Price book items (independent)
    if (Array.isArray(data.priceBookItems)) {
      for (const p of data.priceBookItems) {
        if (!p || !p.id) {
          errors.push("Price book item missing id, skipped");
          continue;
        }
        const norm = normalizeDates(p);
        try {
          const exists = await db
            .select({ id: priceBookItems.id })
            .from(priceBookItems)
            .where(eq(priceBookItems.id, p.id))
            .get();
          if (exists) continue;
          await db.insert(priceBookItems).values(norm);
          imported.priceBookItems++;
        } catch (e: any) {
          errors.push(`Price book ${p.id}: ${e.message || e}`);
        }
      }
    }

    // 4. Jobs (depends on customers)
    if (Array.isArray(data.jobs)) {
      for (const j of data.jobs) {
        if (!j || !j.id) {
          errors.push("Job missing id, skipped");
          continue;
        }
        const norm = normalizeDates(j);
        try {
          const exists = await db
            .select({ id: jobs.id })
            .from(jobs)
            .where(eq(jobs.id, j.id))
            .get();
          if (exists) continue;
          await db.insert(jobs).values(norm);
          imported.jobs++;
        } catch (e: any) {
          errors.push(`Job ${j.id}: ${e.message || e}`);
        }
      }
    }

    // 5. Job line items (depends on jobs) - last
    if (Array.isArray(data.jobLineItems)) {
      for (const l of data.jobLineItems) {
        if (!l || !l.id) {
          errors.push("Job line item missing id, skipped");
          continue;
        }
        const norm = normalizeDates(l);
        try {
          const exists = await db
            .select({ id: jobLineItems.id })
            .from(jobLineItems)
            .where(eq(jobLineItems.id, l.id))
            .get();
          if (exists) continue;
          await db.insert(jobLineItems).values(norm);
          imported.jobLineItems++;
        } catch (e: any) {
          errors.push(`Line item ${l.id}: ${e.message || e}`);
        }
      }
    }

    // Revalidate relevant pages so UI reflects imported data
    revalidatePath("/settings");
    revalidatePath("/customers");
    revalidatePath("/customers/[id]");
    revalidatePath("/jobs");
    revalidatePath("/jobs/[id]");
    revalidatePath("/pricebook");

    return NextResponse.json({
      success: true,
      imported,
      errors,
      message: `Import complete. Added: ${imported.customers} customers, ${imported.jobs} jobs, ${imported.jobLineItems} line items, ${imported.priceBookItems} price items, ${imported.companySettings} settings. Duplicates were skipped.`,
    });
  } catch (error: any) {
    console.error("Import failed:", error);
    return NextResponse.json(
      { error: "Failed to import data: " + (error.message || error) },
      { status: 500 }
    );
  }
}
