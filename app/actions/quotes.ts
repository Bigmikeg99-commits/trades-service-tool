"use server";

import { generateQuoteDraft } from "@/lib/quotes/estimator";
import { db } from "@/lib/db";
import { jobs, jobLineItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { QuoteDraft } from "@/lib/quotes/types";

export async function generateAndSaveQuote(jobId: string, rawDescription: string) {
  const job = await db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) throw new Error("Job not found");

  const draft = await generateQuoteDraft({
    rawDescription: rawDescription || job.rawDescription || "",
    serviceType: job.serviceType,
    city: job.city || undefined,
    zip: job.zip || undefined,
  });

  // Delete existing line items for this job
  await db.delete(jobLineItems).where(eq(jobLineItems.jobId, jobId));

  // Insert new line items
  if (draft.lineItems.length > 0) {
    await db.insert(jobLineItems).values(
      draft.lineItems.map((item, index) => ({
        jobId,
        sortOrder: index,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        source: item.source,
      }))
    );
  }

  // Update job totals and labor estimate
  const subtotal = draft.lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const tax = subtotal * 0.08875; // TODO: use company settings

  await db
    .update(jobs)
    .set({
      estimatedLaborHours: draft.estimatedLaborHours,
      quoteSubtotal: subtotal,
      quoteTax: tax,
      quoteTotal: subtotal + tax,
      travelTimeMin: draft.suggestedTravelMin,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  revalidatePath(`/jobs/${jobId}`);
  return draft;
}

export async function saveQuoteDraft(jobId: string, draft: QuoteDraft) {
  await db.delete(jobLineItems).where(eq(jobLineItems.jobId, jobId));

  if (draft.lineItems.length > 0) {
    await db.insert(jobLineItems).values(
      draft.lineItems.map((item, index) => ({
        jobId,
        sortOrder: index,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        source: item.source,
      }))
    );
  }

  const subtotal = draft.lineItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const tax = subtotal * 0.08875;

  await db
    .update(jobs)
    .set({
      estimatedLaborHours: draft.estimatedLaborHours,
      quoteSubtotal: subtotal,
      quoteTax: tax,
      quoteTotal: subtotal + tax,
      travelTimeMin: draft.suggestedTravelMin,
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  revalidatePath(`/jobs/${jobId}`);
}