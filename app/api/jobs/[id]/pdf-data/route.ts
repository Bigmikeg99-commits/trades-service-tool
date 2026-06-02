export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, customers, companySettings, jobLineItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const job = await db.select().from(jobs).where(eq(jobs.id, id)).get();
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, job.customerId))
      .get();

    const settings = await db.select().from(companySettings).get();

    const lineItems = await db
      .select()
      .from(jobLineItems)
      .where(eq(jobLineItems.jobId, id))
      .orderBy(jobLineItems.sortOrder);

    const subtotal = job.quoteSubtotal || 0;
    const tax = job.quoteTax || 0;
    const total = job.quoteTotal || subtotal + tax;
    const taxRate = settings?.defaultTaxRate || 8.875;

    const data = {
      company: {
        name: settings?.name || "Your Company Name",
        addressLine1: settings?.addressLine1,
        city: settings?.city,
        state: settings?.state,
        zip: settings?.zip,
        phone: settings?.phone,
        email: settings?.email,
        licenseHvac: settings?.licenseHvac,
        licensePlumbing: settings?.licensePlumbing,
        licenseElectrical: settings?.licenseElectrical,
      },
      customer: {
        name: customer?.name || "Customer",
        addressLine1: customer?.addressLine1,
        city: customer?.city,
        state: customer?.state,
        zip: customer?.zip,
        phone: customer?.phone,
        email: customer?.email,
      },
      job: {
        title: job.title,
        serviceType: job.serviceType,
        address:
          job.addressOverride ||
          [customer?.addressLine1, customer?.city, customer?.state].filter(Boolean).join(", "),
        scheduledStart: job.scheduledStart,
        estimatedLaborHours: job.estimatedLaborHours,
        travelTimeMin: job.travelTimeMin,
      },
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        category: item.category,
      })),
      subtotal,
      tax,
      total,
      taxRate,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      terms: settings?.defaultTerms,
      jobId: job.id,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load PDF data:", error);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}