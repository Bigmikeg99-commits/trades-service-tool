# Trades Service Tool

**A practical, fast, and reliable field service management tool for HVAC, plumbing, electrical, and general contractors.**

Runs with a single command (`npm run dev`). Uses Postgres (local Postgres or hosted like Neon via DATABASE_URL). Your data stays under your control.

---

## Quick Start (Under 60 Seconds)

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open **http://localhost:3000**

You're ready to use it.

### First-Time Setup

```bash
# Optional but recommended
cp .env.example .env.local
```

The Postgres database (Neon via DATABASE_URL) is used; run `npm run db:seed` after `db:push` for demo data. See .env.example.

---

## What You Get

- **Plain-English Quote Generation** — Type what the customer told you. Get professional line items, pricing from your price book, and labor estimates instantly.
- **Full Job & Customer Management** — CRUD for customers and jobs with history.
- **Intelligent Local Estimator** — No LLM required. Works completely offline.
- **Scheduling Calendar** — Week view with crew availability, travel buffers, and conflict detection.
- **Professional Proposals** — One-click "Print / Save as PDF" with your company branding, terms, and signature areas.
- **Price Book** — Manage all your rates and materials.
- **Crew Management** — Define technicians with custom colors and availability.
- **Settings & Future-Proofing** — Company profile, Stripe billing placeholder, extensible architecture.

Everything is designed to work great on a phone in a truck.

---

## Architecture Overview

- **Next.js 16** (App Router) + TypeScript + Tailwind
- **Postgres + Drizzle ORM** — Neon (or any Postgres) via DATABASE_URL env (see .env.example)
- **Lucia** — Lightweight authentication
- **Pure local intelligence** — `lib/quotes/estimator.ts` and `lib/scheduling/availability.ts` (no external APIs needed)
- **Professional PDFs** — Ready-to-use `@react-pdf/renderer` components + excellent printable HTML fallback
- **Strong extensibility** — `AGENTS.md` + `.grok/skills/` for future AI assistance or custom logic

The app is deliberately simple and self-contained. It works fully with a local Postgres or hosted (Neon) via a single env var. Future features (Stripe, optional AI, etc.) are designed to never break the core experience.

---

## How to Extend This Project

This project was built to be easy to extend.

### Adding New Features
- Server-only database access (`import "server-only"` + `lib/db`)
- All mutations go through Server Actions in `app/actions/`
- Zod schemas for everything that crosses a boundary

### Extending the Quote Estimator
See `lib/quotes/estimator.ts` and `lib/quotes/templates.ts`.

The estimator is 100% deterministic and local. To add new job patterns:

1. Add entries to the `job_templates` table (or seed data)
2. Update keyword matching logic in `estimator.ts` if needed
3. The QuoteEditor component will automatically support the new suggestions

### Customizing Proposals
- Edit `components/pdf/ProposalDocument.tsx` and `styles.ts`
- The printable HTML preview lives in the job detail page
- Company data comes from `company_settings` table

### Adding AI Assistance Later (Optional)
A `.grok/skills/trades-estimator/` skill already exists as a starting point.

When you're ready for optional LLM assistance:
- Add Vercel AI SDK + structured outputs
- Keep the existing local estimator as the default/offline path
- Gate the AI features behind an environment variable

### Project Rules
See `AGENTS.md` for strict coding conventions used throughout the build.

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:push      # Push schema changes (dev)
npm run db:seed      # Reset to fresh realistic demo data
npm run db:studio    # Open Drizzle Studio
```

---

## Project Structure

```
app/
├── (auth)/              # Login & signup
├── (app)/               # Protected routes
│   ├── dashboard/
│   ├── jobs/            # Full CRUD + quote builder + PDF export
│   ├── customers/
│   ├── schedule/        # Week calendar + availability
│   ├── pricebook/
│   └── settings/        # Company + crew + Stripe placeholder
├── actions/             # Server Actions (customers, jobs, quotes, etc.)

lib/
├── db/                  # Drizzle schema + connection (server-only)
├── quotes/              # Estimator + types (core intelligence)
├── scheduling/          # Availability engine
└── auth/                # Lucia setup

components/
├── pdf/                 # Professional proposal components
└── job/                 # QuoteEditor

.grok/skills/            # Extensibility hooks for AI coding tools
AGENTS.md                # Strict rules for future agents/humans
```

---

## Troubleshooting

**Database issues**
- The database is Postgres (Neon recommended); use `npm run db:push` then `npm run db:seed` to (re)initialize schema + demo data.
- To reset: use Neon dashboard or `db:push` again (destructive).
- Backup/restore via your Postgres provider (e.g. Neon branches or pg_dump). The legacy `data/trades.db` is no longer used.

**"Cannot find module 'server-only'" when running seeds**
- This is expected. The seed script (`lib/db/seed.ts`) has the import stripped for CLI use.

**PDF / Print quality**
- Use the "Print / Save as PDF" button on job detail pages
- The printable preview section is styled specifically for this

**Port already in use**
- `npm run dev` uses the default Next.js port. Kill the process or use `PORT=3001 npm run dev`

---

## Philosophy

- Boring is better than flashy for people who work in the field.
- The local-first guarantee is sacred.
- Future features must never break the "clone + run" experience.
- Make it easy for future versions of Grok (or other tools) to understand and extend the codebase (`AGENTS.md` + skills).

---

## Next Steps / Future Ideas

- Real Stripe subscription enforcement
- Optional LLM-assisted quoting (behind env var)
- Mobile PWA + basic offline support
- Multi-user roles with better permissions
- Export to QuickBooks / Xero
- Photo attachments on jobs

---

## First 10 Minutes Demo (Great for New Users)

1. Start the app (`npm run dev`)
2. Create an account
3. Go to **Customers** → Add 1–2 real or fictional customers
4. Go to **Jobs** → Create a job with a plain-English description:
   - "frozen pipe in basement, 2-story house"
   - "no heat furnace making clicking noise"
5. Open the job → Click **"Generate from description"**
6. Edit the quote if desired → Click **"Print / Save as PDF"**
7. Go to **Schedule** → See the job appear with travel buffer
8. Go to **Price Book** → Change a price → Generate a new quote and see it reflected
9. Go to **Settings** → Update your company name or add a crew member
10. Log out and log back in — everything persists locally

This flow demonstrates the core value of the entire system.

---

Built for contractors who actually work in the field.

If you extend this project, please consider contributing back improvements to the estimator, scheduling logic, or documentation.