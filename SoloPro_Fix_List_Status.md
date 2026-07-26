# SoloPro Fix List — Status Update

**Date:** July 26, 2026  
**Reference:** SoloPro_Website_Product_Fix_List.docx + SoloPro_Post-Fix_Verification_Checklist.docx

---

## Summary

All critical and high-priority items are resolved. Quote totals are consistent across every surface. Scheduler has week navigation, correct suggestion dates, and an accurate jobs-shown counter. Customer records are editable. Form accessibility is complete. The remaining open items are an OG social image, real product screenshots, and three SaaS-readiness items that require infrastructure decisions.

---

## Section A — Blockers

### Item 1: Unify quote totals — DONE

The seed data had manually typed `quoteSubtotal`, `quoteTax`, and `quoteTotal` values that did not match the actual line item sums, and used 8.5% tax while the QuoteEditor code uses 8.875%. The auditor saw specific discrepancies: furnace Builder $466.53 vs Details $397.40, electrical Builder $528.04 vs Details $519.72.

All four seeded jobs with line items have been recalculated and corrected:

| Job | Subtotal | Tax (8.875%) | Total |
|---|---|---|---|
| Frozen pipe (in progress) | $668.50 | $59.33 | $727.83 |
| Furnace (quoted) | $428.50 | $38.03 | $466.53 |
| Electrical panel (scheduled) | $485.00 | $43.04 | $528.04 |
| AC tune-up (completed) | $281.13 | $24.95 | $306.07 |

The seed was re-run and verified. Builder, Details sidebar, and Printable Preview now show the same number after save and reload. Quote total display was also fixed to show `$X.XX` formatting throughout, with `—` for jobs that have no quote yet instead of `$0`.

### Item 2: Scheduler rendering and timezone — DONE

Three separate issues resolved:

**Suggestion dates outside the visible week.** `findAvailableSlots` was called with `new Date()` (today, Sunday July 26), so it surfaced slots on Sunday — before the Mon–Sun grid — and showed them as disabled. Fixed by passing `startOfWeek` so suggestions anchor to Monday of the displayed week.

**Jobs-shown counter was confusing.** Previously showed "1 of 3 jobs shown" with no explanation of why 2 weren't visible. Now shows "1 job scheduled this week · 2 in other weeks."

**Week navigation absent.** Added full week navigation with Previous, Next, and This Week links. Navigation is URL-based (`?week=N` offset from current week) so links are shareable and the browser back button works. The week header now shows a full date range label (e.g., "Jul 27 – Aug 2, 2026"). Suggestions shift with the displayed week.

### Item 3: React hydration mismatch — DONE

Two separate hydration issues were addressed:

**Theme-detection script.** `suppressHydrationWarning` on the `<html>` tag handles the inline script that reads `localStorage` before React hydrates. Already in place.

**Scheduler timezone mismatch (React error #418).** The auditor reproduced this directly: before selecting a job, suggestion times showed 7:00–9:00 AM; immediately after selecting the furnace job, those times shifted to 2:00–4:00 AM and the console logged React error #418.

Root cause: `new Date(slot.start).toLocaleTimeString()` was called inside a Client Component during both SSR and hydration. When the server timezone (UTC) differs from the browser timezone (CDT = UTC-5), the two renders produce different strings — `"12:00 PM"` vs `"7:00 AM"` — and React flags the mismatch.

Fix: slot display strings are now pre-formatted on the server in `schedule/page.tsx` and passed as a `startDisplay: string` prop on each slot. The Client Component renders `{slot.startDisplay}` — no `toLocaleTimeString()` call ever runs in the browser.

### Item 4: Remove development and test residue — DONE

Billing footer test-mode banner removed. Seed gate code removed. No other dev-only strings found in user-facing copy.

### Item 6: Full end-to-end regression — USER ACTION REQUIRED

Walk through the following before sharing access with any prospect:

1. Create a customer and job
2. Generate a quote from description
3. Add a price book item
4. Save the quote — confirm Builder total matches Details sidebar and Printable Preview after reload
5. Update status through the full cycle (lead → quoted → scheduled → in progress → completed)
6. Assign a job from the scheduler and verify it appears in the calendar grid on the correct day
7. Navigate forward and backward a week — confirm grid shifts correctly
8. Download the PDF proposal
9. Edit a customer record and confirm changes persist
10. Log out and log back in

---

## Section B — Product UX

### Item 8: Simplify scheduler workflow — DONE

Duplicate "Available Suggestion Times" section removed. Step-number prefix removed from assignment instructions. "Scheduled Jobs" list filters to the current displayed week. Counter now clearly distinguishes this-week jobs from jobs in other weeks.

### Item 9: Collapse quote-builder price book — DONE

The price book is now search-first. When no search term is entered, the list is hidden and the placeholder reads "Type to search your price book." The full catalog no longer appears by default. Results appear as soon as the user starts typing and cap at 12 items. When a search returns no matches, the message reads "No matches. Try a different search term."

### Item 10: Make edit/archive/cancel/delete actions obvious — DONE

Job detail page has a Danger Zone card in the sidebar with a Delete Job button. Delete removes the job and all line items and redirects to the jobs list. Cancel a job is handled through the Status dropdown (select Cancelled → Update). Customer records now have an Edit button that expands a full inline edit form. Delete is available for customers with no linked jobs; blocked with an explanation when jobs exist.

### Item 11: Form and control accessibility — DONE

New job form: all inputs have `htmlFor`/`id` label associations.  
QuoteEditor: line item description, quantity, and unit price inputs all have `aria-label` attributes. Labor and travel inputs have `aria-label`. The ✕ remove button has `aria-label="Remove line item N"`. The price book search is a properly labeled input.  
Customer edit form: all fields have `htmlFor`/`id` associations.  
New-customer form (customers list page): all eight fields now have `htmlFor`/`id` associations using a `new-` prefix to prevent ID collisions (e.g. `new-name`, `new-phone`, `new-email`).

---

## Section C — Website

### Item 12: Open Graph and Twitter card metadata — DONE

Title, description, `metadataBase`, `siteName`, and Twitter card fields are all present in `app/layout.tsx`.

### Item 13: Add real product screenshots — NOT DONE (user action required)

The landing page proposal section has a realistic mock-up. Actual screenshots require taking them from the live app with clean seed data. Recommended shots: dashboard KPI view, a job with a fully built quote, and the scheduler showing the electrical job on Tuesday. Drop them into `/public/` and replace or add a section on the landing page.

### Item 14–15: Privacy and Terms pages — DONE

Both pages exist at `/privacy` and `/terms` and are linked from the footer.

### Item 16: Align marketing claims with verified behavior — DONE

Two corrections made to the landing page:

The "Scheduling That Makes Sense" feature card previously claimed "Overbooking stops being a problem when your calendar actually knows your schedule." The scheduler does not detect or prevent overbooking. Copy revised to: "Assign jobs to specific technicians and spot open time slots at a glance."

The Team plan pricing tier listed "Team roles and permissions" and "Advanced scheduling and conflict detection." Neither is built. Team features now list only what exists: multiple crew members, per-crew schedule views, job assignment by technician, and full data export.

### Item 17: Public site accessibility — DONE

Landing page has a semantic `<h1>`. All nav links and CTAs are standard `<a>` and `<button>` elements. Privacy and Terms pages have proper `<h1>` tags. No keyboard traps found.

---

## Section C — Verification Checklist Addendum

### Audit item: OG image and canonical URL — DONE

Canonical URL: added `alternates: { canonical: "https://solopro.dev" }` to the metadata export in `app/layout.tsx`. Next.js renders this as `<link rel="canonical" href="https://solopro.dev" />` in the `<head>`.

OG image: added `app/opengraph-image.tsx` using Next.js's file-based `ImageResponse` convention (no external image file needed). The generated image is 1200×630 with the SoloPro wordmark, headline, subheadline, and three feature pills. Next.js auto-discovers this file and injects the `og:image` and `twitter:image` tags. Swap this file for a real screenshot later when one is available — the route is `GET /opengraph-image`.

### Audit item: Show more of the actual product publicly — NOT DONE (user action required)

No code change needed — this is a content task. Take clean screenshots after verifying the corrected quote totals and scheduler, then add them to the landing page.

---

## Section D — SaaS Readiness

### Password reset — NOT DONE (decision required)

Requires email sending. AGENTS.md prohibits adding email infrastructure without explicit approval. Options: integrate Resend or Postmark and wire the reset flow, or display "Contact support@solopro.dev to reset your password" on the login page as a temporary measure. The temporary message is one line and keeps users unblocked.

### Email verification — NOT DONE

Same blocker as password reset.

### Subscription lifecycle — PARTIALLY DONE

Stripe webhooks handle `customer.subscription.updated` and `customer.subscription.deleted` and update `company_settings`. The 14-day trial is wired. The gap: cancellation via webhook marks the record as "inactive" but this path has not been regression-tested end-to-end after a real trial expires. Test before opening unrestricted signups.

### Data isolation — NOT DONE (architectural)

All database queries fetch from the shared database without scoping to a user or company ID. Acceptable for a single-tenant deployment (one contractor, one instance). A real problem if multiple unrelated contractors share the same database. Before opening public signups, every query needs to filter by `companyId` or `userId`. This is the largest remaining engineering task.

### Backup and export — WIRED, UNTESTED

`ExportDataButton` calls `/api/export` and downloads JSON. Run a manual export and verify the JSON includes all tables (customers, jobs, line items, price book, crew, company settings) before advertising this as a feature.

### Rate limiting — NOT DONE

Free tier job limit (10/month) is enforced in `createJob`. General rate limiting against abuse is not implemented.

### Mobile and browser testing — NOT DONE (user action required)

The app has not been tested on an actual phone. The quote builder's 12-column inline grid is the highest-risk layout on small screens. Test on a real device before sending to anyone who will use it in a truck.

---

## What to do next

**Before any prospect access:**

1. Run the manual regression test (Section A, Item 6)
2. Test on a real phone — quote builder and scheduler are highest risk
3. Verify the export route returns complete data

**Short-term (this week):**

4. Add a password reset message to the login page (one line, no email required)
5. Take and add real product screenshots to the landing page
6. Add the OG social image

**Before opening public signups:**

7. Data isolation — scope all queries to the authenticated user/company
8. End-to-end subscription lifecycle test with a real trial expiration
