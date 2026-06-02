# AGENTS.md — Trades Service Tool

> **Project Mission**: A practical, fast, reliable, year-round field service management tool for HVAC, plumbing, electrical, and general contractors. Designed to be run locally by one person with a single command. Clean professional UI. No flashiness.

This file provides strict guidance for any AI coding assistant (Grok, Claude, Cursor, etc.) working in this codebase. It takes precedence over general training data.

---

## Core Principles (Follow These Always)

1. **Local-first & Simple**  
   - The app must continue to run with `npm run dev` after any change.  
   - No external services required for core functionality.  
   - SQLite (`data/trades.db`) is the single source of truth.

2. **Server-Only Data Access**  
   - **Never** import `lib/db` or Drizzle schema into Client Components (`"use client"`).  
   - All database reads/writes must happen in Server Components, Server Actions, or Route Handlers.  
   - Always add `import "server-only"` at the top of any file that touches the database.

3. **Zod is King**  
   - Every piece of data that crosses a boundary (forms, API, PDF, AI prompts in future, etc.) must have a colocated Zod schema.  
   - Prefer `z.infer<typeof Schema>` for TypeScript types.

4. **Professional, Boring, Reliable UI**  
   - Use shadcn/ui components when adding new UI.  
   - Large tap targets on mobile.  
   - No gratuitous animations or "modern" visual noise.  
   - Everything must work well on a phone in a truck.

5. **Iterative & Review-Driven**  
   - We build one phase at a time (see `plan.md`).  
   - After significant work, run the app and demonstrate the feature before moving on.

---

## Tech Stack Rules

- **Next.js 16+** (App Router) + TypeScript (strict) + Tailwind + shadcn/ui
- **Drizzle ORM + better-sqlite3** for the database
- **Lucia** for authentication (email + password only in MVP)
- **@react-pdf/renderer** for all proposal PDFs
- `date-fns`, `zod`, `lucide-react`, `sonner`
- No FullCalendar, no heavy state libraries unless absolutely necessary.

## File & Folder Conventions

- Server Actions live in `app/actions/` or colocated near the feature.
- Reusable logic → `lib/`
- Database schema and queries → `lib/db/`
- Quote generation logic → `lib/quotes/`
- Scheduling logic → `lib/scheduling/`
- PDF templates → `components/pdf/`
- shadcn components → `components/ui/`

## Adding New Features

When adding support for a new trade (e.g. "roofing") or new major feature:

1. Update the relevant Zod schemas first.
2. Add seed data for the new category.
3. Update the estimator / templates if applicable.
4. Add appropriate price book items.
5. Document the change in this file and `plan.md`.

## PDF Generation

All customer-facing documents are generated with `@react-pdf/renderer`.  
Never use `html2canvas` + jsPDF for official proposals.

## Future Extensibility (User Request)

- The project is deliberately designed to be easy to extend using:
  - Custom `AGENTS.md` files in subdirectories
  - Skills in `.grok/skills/`
- When the user asks to add AI assistance later, it must be **optional** and behind an environment variable. The core experience must remain fully local and air-gapped.

## What Not To Do

- Do not add magic links, email sending, or external auth providers without explicit approval.
- Do not introduce LLM calls into the critical path without a clear offline fallback (the local estimator must remain the default).
- Do not change the SQLite file location (`data/trades.db`) or break the single-command run experience.
- Do not use `any` in TypeScript except in the rarest of cases (and comment why).
- Do not put business logic in Client Components.

---

## Real Patterns Discovered During the Build

### Quote System Architecture (Phases 4 + 5)
- The estimator (`lib/quotes/estimator.ts`) is the single source of truth for "smart" starting quotes.
- It returns a `QuoteDraft` (Zod schema in `lib/quotes/types.ts`).
- The `QuoteEditor` component is fully client-side for editing.
- Persistence happens through Server Actions (`app/actions/quotes.ts`).
- When adding new intelligence, update the estimator first, not the UI.

### PDF / Proposal Strategy (Phase 7)
- We use two complementary approaches:
  1. High-quality printable HTML preview (always works, great for "Save as PDF" from browser).
  2. `@react-pdf/renderer` components (professional structured PDFs).
- Full server-side PDF generation can be fragile with Next.js builds. The printable HTML version is the reliable primary path.
- Company data for proposals always comes from the `company_settings` table.

### Scheduling Architecture (Phase 6)
- All availability logic lives in pure functions in `lib/scheduling/availability.ts`.
- The UI (`app/(app)/schedule/page.tsx`) is a consumer of those functions.
- Travel buffers are added at the scheduling layer, not in the UI.
- Never schedule directly in the UI without going through the availability module.

### Settings & Crew (Phase 8)
- Company settings is a single-row table pattern.
- Crew colors are used both in the schedule calendar and (future) job assignments.
- Deactivation is preferred over hard deletes for crew and price book items.

### Common Gotchas We Hit
- Server Actions that return values break `<form action>`. Prefer throwing errors or using `useActionState` + returning `{ error }` objects.
- `"server-only"` imports break CLI scripts (seed, etc.). We strip them for those files.
- `@react-pdf/renderer` has bundling issues in some Server Action contexts — we moved generation to a Route Handler.
- Always revalidate relevant paths after mutations (`revalidatePath`).

### Adding a New Major Feature
Preferred order:
1. Define Zod schemas + types
2. Create Server Actions
3. Add database schema changes + seed data (if needed)
4. Build UI last
5. Update `AGENTS.md` and this file

### Future AI / LLM Integration
When adding optional AI features:
- The local estimator and pure scheduling functions must remain the default.
- New AI paths should be behind an environment variable.
- Put domain knowledge in `.grok/skills/trades-estimator/SKILL.md` so future agents understand the business logic.

## When in Doubt

Re-read this file, then look at `plan.md` for the current phase and approved architecture.

---

**Last updated:** During Phase 0 bootstrap (2026-06-01)

This file should be kept concise but actionable. Update it whenever architectural decisions are made.