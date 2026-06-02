---
name: trades-estimator
description: Domain knowledge and patterns for building and extending the field service quote estimator, job templates, price book suggestions, and labor time calculations. Use when modifying anything in lib/quotes/ or when the user wants smarter job intake behavior.
---

# Trades Estimator Skill

This skill encodes practical field service knowledge for HVAC, plumbing, electrical, and general contractors.

## Core Responsibilities
- Help maintain and improve the deterministic quote generator in `lib/quotes/estimator.ts`
- Suggest realistic labor times and common part pairings
- Keep the system fully local and air-gapped (no LLM required for core functionality)
- Make it easy to add new trade categories or job templates later

## Key Domain Knowledge

### Common Job Patterns (Examples)
- **Frozen pipe** (Plumbing): 2.5–4 hrs labor, involves heat tape, pipe insulation, possibly valve replacement
- **No heat - furnace** (HVAC): 1.5–3 hrs, common parts: igniter, flame sensor, capacitor, pressure switch
- **AC not cooling** (HVAC): Capacitor, contactor, TXV, low refrigerant diagnostics
- **Electrical panel upgrade** (Electrical): Permit-heavy, 4–8 hrs + material markup

### Pricing Philosophy
- Always pull from the local price book first
- Labor is king — material markup is secondary
- Regional adjustments (MN vs national) should be simple multipliers in settings

## When Editing Estimator Logic (Real Patterns)
1. The core logic lives in `lib/quotes/estimator.ts` — keep it deterministic and fast.
2. Job templates (from the DB `job_templates` table + `lib/quotes/templates.ts`) are the preferred way to add new patterns.
3. Keyword matching should be simple and obvious — future developers (human or AI) must be able to understand it in 30 seconds.
4. Always ensure the user can completely override the generated quote in the `QuoteEditor`.
5. When adding new price book items that should be suggested, update both the seed data and any relevant keyword mappings.

## Real Gotchas From the Build
- The estimator is called from Server Actions (`app/actions/quotes.ts`), not directly in the UI.
- Line items are stored with snapshot prices in `job_line_items` — editing the price book never changes existing jobs.
- Labor estimates and travel time come from the estimator and are stored on the `jobs` table.

## Future AI Integration (When Requested)
If the user later wants optional LLM assistance:
- It must be toggleable via environment variable (`ENABLE_AI_QUOTES` or similar).
- The local estimator must remain the default and offline path.
- Use Vercel AI SDK + structured outputs with Zod (match the existing `QuoteDraft` schema).
- Store prompts and domain knowledge in this skill file.
- Never remove the ability to generate quotes without AI.

## Preferred Way to Add New Intelligence
1. Add or update entries in the `job_templates` table (via seed or UI later).
2. Extend keyword matching in `estimator.ts` only when templates aren't enough.
3. Update this skill file so future agents know the new pattern.
4. Test by using the "Generate from description" button on a job.

## Related Files (Know These)
- `lib/quotes/estimator.ts` — The heart of the quoting system
- `lib/quotes/types.ts` — `QuoteDraft` and `LineItemDraft` Zod schemas
- `lib/quotes/templates.ts` — Helpers and keyword constants
- `app/actions/quotes.ts` — Where generation + persistence happens
- `components/job/QuoteEditor.tsx` — The UI that consumes drafts
- `app/(app)/jobs/[id]/page.tsx` — Where the "Generate from description" button lives

## Testing the Estimator
When changing logic, manually test with real-world phrases:
- "frozen pipe in basement"
- "no heat furnace making clicking noise"
- "AC not cooling second floor"
- "water heater leaking"

The output should be sensible, editable, and use items from the price book when possible.

Keep changes boring, reliable, and fast. The estimator should feel magical but never mysterious.