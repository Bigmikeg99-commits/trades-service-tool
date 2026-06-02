// Note: "server-only" import removed for CLI script compatibility (seed, etc.)
// Inside Next.js server components/actions, importing this file will still be protected
// by the bundler if you add the import where needed.

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

// Ensure the data directory exists (creates it if missing on first run)
import { mkdirSync } from "fs";
import { dirname } from "path";

const dbPath = "./data/trades.db";
const dbDir = dirname(dbPath);

try {
  mkdirSync(dbDir, { recursive: true });
} catch (e) {
  // Directory may already exist
}

const sqlite = new Database(dbPath, {
  // Good defaults for local single-process use
  verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
});

export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from "./schema";

// Helper to close DB connection (useful in scripts)
export function closeDb() {
  sqlite.close();
}