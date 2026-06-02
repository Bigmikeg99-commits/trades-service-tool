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
import { getSubscriptionStatus } from "@/app/actions/billing";

export async function GET() {
  try {
    const sub = await getSubscriptionStatus();
    const plan = (sub.plan || "free").toLowerCase();
    if (plan === "free") {
      return new NextResponse("Data export is a Pro/Team feature. Please upgrade your plan.", { status: 403 });
    }

    const [settings, allCustomers, allJobs, allLineItems, allPriceBook] = await Promise.all([
      db.select().from(companySettings).get(),
      db.select().from(customers),
      db.select().from(jobs),
      db.select().from(jobLineItems),
      db.select().from(priceBookItems),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      companySettings: settings || null,
      customers: allCustomers,
      jobs: allJobs,
      jobLineItems: allLineItems,
      priceBookItems: allPriceBook,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="trades-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export failed:", error);
    return new NextResponse("Failed to export data", { status: 500 });
  }
}