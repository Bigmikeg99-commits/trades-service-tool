import "server-only";

import { db } from "@/lib/db";
import { jobTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveTemplates() {
  return await db
    .select()
    .from(jobTemplates)
    .where(eq(jobTemplates.active, true));
}

export const COMMON_KEYWORDS = {
  "frozen pipe": "plumbing",
  "no heat": "hvac",
  "furnace": "hvac",
  "ac not cooling": "hvac",
  "water leak": "plumbing",
  "outlet not working": "electrical",
} as const;