"use server";

import "server-only";

import { db } from "@/lib/db";
import {
  companySettings,
  customers,
  jobs,
  jobLineItems,
  priceBookItems,
} from "@/lib/db/schema";

export async function getExportData() {
  const [settingsArr, allCustomers, allJobs, allLineItems, allPriceBook] = await Promise.all([
    db.select().from(companySettings).limit(1),
    db.select().from(customers),
    db.select().from(jobs),
    db.select().from(jobLineItems),
    db.select().from(priceBookItems),
  ]);
  const settings = settingsArr[0] || null;

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    companySettings: settings || null,
    customers: allCustomers,
    jobs: allJobs,
    jobLineItems: allLineItems,
    priceBookItems: allPriceBook,
  };

  return exportData;
}