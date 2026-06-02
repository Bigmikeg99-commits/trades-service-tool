# Trades Service Tool — Implementation Plan (Approved)

**Project:** Practical year-round field service management tool for HVAC, plumbing, electrical, and general contractors.  
**Workspace:** `/Users/seeleyfam5/trades-service-tool`  
**Status:** User approved on 2026-06-01. Building Phase 0 → Phase 9 iteratively.

---

## Summary of Approved Plan

**Core Promise:** One command (`npm run dev`) → fully working professional tool for contractors. Clean, fast, mobile-friendly, local-first with SQLite.

**Key Decisions (Approved):**
- No LLM required for MVP (air-gapped simplicity)
- shadcn/ui for professional components
- Lucia + email/password auth
- @react-pdf/renderer for proposals
- Custom lightweight scheduler (no FullCalendar)
- Strong focus on extensibility via `AGENTS.md` + `.grok/skills/`

**Build Approach:** Strict phase-by-phase. User reviews after each phase before proceeding.

---

## Phases (High Level)

**Phase 0 (Current)** — Bootstrap & Project Hygiene  
**Phase 1** — Database + Drizzle + Seed  
**Phase 2** — Authentication (Lucia)  
**Phase 3** — Customers + Jobs CRUD  
**Phase 4** — Quote Builder + Local Estimator  
**Phase 5** — Price Book  
**Phase 6** — Scheduling + Availability Engine  
**Phase 7** — Professional PDF Proposals  
**Phase 8** — Settings, Crew, Polish, Stripe skeleton, Mobile  
**Phase 9** — Documentation, README, Extensibility handoff

Full details of every phase, data model, file structure, trade-offs, and extensibility strategy are in the original approved plan document in the conversation history.

---

## How to Continue Development

1. Refer to the detailed plan in the chat history (the long version presented before approval).
2. Update this file or create phase-specific notes as we build.
3. Always respect `AGENTS.md`.
4. After completing a phase, run the app and show the user before starting the next.

**Current Phase:** Phase 0 complete (as of 2026-06-01).

---

**This file is a living reference.** The authoritative detailed plan was reviewed and approved by the user.