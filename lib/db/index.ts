// Note: "server-only" import removed for CLI script compatibility (seed, etc.)
// Inside Next.js server components/actions, importing this file will still be protected
// by the bundler if you add the import where needed.
// Per AGENTS.md: add `import "server-only";` at top of files that use db (except this index and pure CLI scripts).

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Load .env.local when running scripts directly (e.g. tsx seed.ts, or drizzle).
// Next.js dev/build already injects .env.local before code runs.
if (!process.env.DATABASE_URL) {
  config({ path: ".env.local" });
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Set it to your Neon Postgres connection string (e.g. postgresql://...)"
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // For Neon: use ssl reject to avoid some warnings; pooler URL handles certs
  ssl: { rejectUnauthorized: false },
  max: 10,
});

export const db = drizzle(pool, { schema });

// Export schema for convenience
export * from "./schema";

// Helper to close pool (useful in scripts / shutdown)
export async function closeDb() {
  await pool.end();
}