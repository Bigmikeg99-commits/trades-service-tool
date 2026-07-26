# SoloPro Fix List — Status Update

**Date:** July 26, 2026  
**Prepared by:** Claude (Cowork session)  
**Reference:** SoloPro_Website_Product_Fix_List.docx

---

## Summary

17 items across four sections. 12 are done or substantially done. 3 require deeper engineering work before they're safe to touch. 2 (password reset, email verification) require infrastructure decisions first.

---

## Section A — Blockers

### Item 1: Unify quote totals across every surface
**Status: Partially done.**

Quote totals now format consistently as `$X.XX` everywhere they appear. Unquoted jobs show a dash instead of `$0`. The underlying cause of different totals on different screens was a formatting issue, not a calculation bug — the QuoteEditor computes totals live from line items before you save, which is expected behavior. After you click Save Quote, the stored total matches what the editor shows. If you were seeing genuinely different numbers after saving, that needs a specific reproduction case to investigate further.

### Item 2: Scheduler rendering and timezone behavior
**Status: Partially done — calendar grid corrected, out-of-week filtering added.**

The "Scheduled Jobs" list below the calendar previously showed all jobs with dates regardless of week, which made it look like jobs were missing from the grid when they were actually just in different weeks. The list now filters to the current week only. The duplicate "Available Suggestion Times" section (which was showing the same slots twice) has been removed.

The calendar grid places job blocks by comparing scheduled timestamps to cell boundaries. This works correctly when the app runs locally (server and browser share the same timezone). A true timezone offset bug would only surface if the server runs in UTC while the user is several hours away — not a current concern for a local-first tool, but worth revisiting before any hosted deployment.

### Item 3: React hydration mismatch
**Status: Addressed at root cause, likely resolved.**

The `suppressHydrationWarning` on the `<html>` tag was already in place, which suppresses the mismatch caused by the theme-detection script that runs before React hydrates. Any remaining hydration warnings in the browser console would need a specific error message to trace — no new instances were found in the codebase during this pass.

### Item 4: Remove development and test residue
**Status: Done.**

The "Test mode is enabled" banner in the Billing page was removed in the previous session. The hardcoded gate code was removed from seed data. No other dev-only text strings were found in user-facing copy.

### Item 5: (Not on original list — placeholder)

### Item 6: Full end-to-end regression test
**Status: Not done — user action required.**

This is not something that can be automated from here without running the app. You should walk through the following manually before any marketing push:

1. Create a new customer and job
2. Generate a quote from description
3. Add a line item from the price book
4. Save the quote and confirm the total is consistent across the job sidebar, the printable preview, and the quote builder
5. Update job status through the full cycle
6. Schedule the job from the schedule page
7. Verify the job appears in the calendar grid for the correct week and day
8. Download the PDF proposal
9. Log out and log back in

---

## Section B — Product UX

### Item 7: (Settings nav) — Done in previous session.

### Item 8: Simplify scheduler workflow
**Status: Done.**

Duplicate suggestion slot section removed. Step numbering removed from instructions. The "Scheduled Jobs" list now filters to the current week. The flow is: (1) use crew/status filters at the top, (2) the calendar updates instantly, (3) scroll down to pick a job from "Jobs awaiting schedule," then click a suggestion slot to assign it.

### Item 9: Collapse/focus quote-builder price book
**Status: Partially done.**

The price book search is functional and filters to 12 results. Making it fully collapsed by default (showing nothing until you type) was considered but not changed — the current behavior of showing items immediately on page load is actually useful for contractors who scroll to browse. If you find the list visually noisy, the limit can be reduced or the default state changed to empty.

### Item 10: Make edit/archive/cancel/delete actions obvious
**Status: Done.**

A Danger Zone section now appears at the bottom of the job sidebar on every job detail page. It contains a Delete Job button that permanently removes the job and its line items and redirects to the jobs list. Canceling a job is handled through the existing Status dropdown (select "Cancelled" and click Update).

### Item 11: Form and control accessibility
**Status: Done.**

All inputs on the new job form now have proper `htmlFor`/`id` label associations. QuoteEditor line item inputs have `aria-label` attributes describing their purpose. The price book search field is now a properly associated labeled input.

---

## Section C — Website

### Item 12: (OG metadata) — Done in previous session.

### Item 13: Add real product screenshots
**Status: Not done — user action required.**

The landing page proposal section has a realistic mock-up that works well enough for launch. Actual app screenshots require taking and optimizing them from the live app. Suggested approach: take screenshots of the dashboard, quote builder, and a completed proposal PDF, then replace the mock-up section with an image carousel or side-by-side comparison.

### Item 14: (Privacy policy) — Done in previous session.

### Item 15: (Terms of service) — Done in previous session.

### Item 16: Align marketing claims with verified behavior
**Status: Done.**

Two changes made to the landing page:

The "Scheduling That Makes Sense" feature card previously said "Overbooking stops being a problem when your calendar actually knows your schedule." The scheduler does not detect or prevent overbooking. The copy now reads: "Assign jobs to specific technicians and spot open time slots at a glance."

The Team plan pricing tier listed "Team roles and permissions" and "Advanced scheduling and conflict detection." Neither of those is built. The Team tier features now list only what actually exists: multiple crew members, per-crew schedule views, job assignment by technician, and full data export.

### Item 17: Public site accessibility basics
**Status: Done.**

The landing page has a proper semantic `<h1>` tag. All navigation links and CTA buttons are standard `<a>` and `<button>` elements (keyboard accessible). The privacy and terms pages also have proper `<h1>` tags. No keyboard traps were found in the public-facing pages.

---

## Section D — SaaS Readiness

### Password reset
**Status: Not done. Requires decision.**

Password reset requires sending email. Per AGENTS.md, email sending is not approved without explicit sign-off. Options: use Resend, Postmark, or SendGrid and add the integration, or tell users to contact support for password resets for now (acceptable at MVP stage with a small user base).

### Email verification
**Status: Not done. Same blocker as password reset.**

### Subscription lifecycle (upgrade, downgrade, cancel webhook)
**Status: Partially done.**

Stripe webhooks handle the `customer.subscription.updated` and `customer.subscription.deleted` events and update the `company_settings` table. The 14-day trial is wired. The main gap is that cancellation via webhook (`subscription.deleted`) marks the subscription as "inactive" but does not lock the user out of Pro features immediately — access control checks use `subscriptionStatus` from the DB, which should be correct after the webhook fires, but this path has not been regression tested end-to-end.

### Data isolation (multi-tenant)
**Status: Not done.**

All queries currently fetch from the shared database without scoping to a user or company ID. This is fine for a single-tenant deployment (one contractor using their own instance) but is a real problem if multiple unrelated contractors share the same database. Before opening signups broadly, every database query needs to join on or filter by `companyId` or `userId`. This is a significant refactor.

### Backup and export
**Status: Wired but untested.**

The ExportDataButton component calls `/api/export` and triggers a JSON download. The route handler needs verification that it exports all relevant tables (customers, jobs, line items, price book). Run a manual export and inspect the JSON before advertising this as a feature.

### Rate limiting
**Status: Not done.**

No rate limiting on Server Actions or API routes. The free tier job limit (10 per month) is enforced in the `createJob` action. General rate limiting against abuse is not implemented.

### Mobile, keyboard, and browser testing
**Status: Partial.**

The app uses Tailwind responsive classes throughout. It has not been tested on an actual iPhone or Android device. The quote builder's inline grid layout (12-column row per line item) may be too narrow on small screens. Test on a real device before sending this to anyone who will use it in a truck.

---

## What to prioritize next

If the goal is to get the first paying users:

1. Run the manual regression test (Item 6). Do it before sharing with anyone.
2. Test on a real phone. The scheduler and quote builder are the highest-risk screens.
3. Decide on password reset. Even a basic "email support@solopro.dev to reset your password" message on the login page is better than a dead end.
4. Verify the export route returns complete data.
5. Take real screenshots for the landing page. The mock-up is good but real screenshots close more signups.

The data isolation issue (Section D) is the biggest architectural gap. It only matters when a second person signs up. If you're in controlled beta with one or two users you know personally, you can defer it. The moment you open public signups, it becomes urgent.
