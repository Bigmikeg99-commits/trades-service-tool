import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for CLI tools (drizzle-kit). Next.js loads it automatically for the app.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});