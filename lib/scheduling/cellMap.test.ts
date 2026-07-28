/**
 * Tests for buildCellJobMap — run with:
 *   npx tsx --test lib/scheduling/cellMap.test.ts
 *
 * Uses Node 22's built-in test runner (no extra dependencies).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildCellJobMap } from "./cellMap";

// Helper: build a Date for a given ISO-like string using UTC math
// so tests are timezone-agnostic.
function utcDate(isoStr: string): Date {
  return new Date(isoStr);
}

// One week of days starting Mon 2026-07-27 (UTC midnight)
const monday = utcDate("2026-07-27T00:00:00.000Z");
const tuesday = utcDate("2026-07-28T00:00:00.000Z");
const days = [monday, tuesday]; // dayIndex 0 = Mon, dayIndex 1 = Tue

// ─────────────────────────────────────────────────────────────────────────────
// 1. Multi-hour appointment appears in exactly ONE cell (its start cell)
// ─────────────────────────────────────────────────────────────────────────────
describe("multi-hour appointment", () => {
  it("appears only in start cell, not in subsequent cells", () => {
    const job = {
      id: "job-1",
      scheduledStart: "2026-07-27T09:00:00.000Z", // 9 AM UTC Monday
      scheduledEnd:   "2026-07-27T11:30:00.000Z", // 11:30 AM UTC Monday
    };
    const map = buildCellJobMap([job], days);

    // Should appear in hour-9 cell on day 0
    assert.deepEqual(map["0-9"], ["job-1"], "job must be in its start cell (hour 9)");

    // Must NOT appear in any later cell
    assert.deepEqual(map["0-10"] ?? [], [], "job must not repeat in hour 10");
    assert.deepEqual(map["0-11"] ?? [], [], "job must not repeat in hour 11");
    assert.deepEqual(map["0-12"] ?? [], [], "job must not appear in hour 12");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Partial-hour start time (9:30 – 11:00)
// ─────────────────────────────────────────────────────────────────────────────
describe("partial-hour start", () => {
  it("9:30 start lands in the 9:00 cell", () => {
    const job = {
      id: "job-2",
      scheduledStart: "2026-07-27T09:30:00.000Z",
      scheduledEnd:   "2026-07-27T11:00:00.000Z",
    };
    const map = buildCellJobMap([job], days);

    assert.deepEqual(map["0-9"], ["job-2"], "9:30 start must land in hour-9 cell");
    assert.deepEqual(map["0-10"] ?? [], [], "must not appear in hour 10");
  });

  it("11:59 start lands in the 11:00 cell", () => {
    const job = {
      id: "job-3",
      scheduledStart: "2026-07-28T11:59:00.000Z",
      scheduledEnd:   "2026-07-28T13:00:00.000Z",
    };
    const map = buildCellJobMap([job], days);

    assert.deepEqual(map["1-11"], ["job-3"], "11:59 start must land in hour-11 cell on Tuesday");
    assert.deepEqual(map["1-12"] ?? [], [], "must not appear in hour 12");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Two separate appointments with the same title stay separate
// ─────────────────────────────────────────────────────────────────────────────
describe("same-title separate appointments", () => {
  it("two Furnace Inspection records on different days appear in separate cells", () => {
    const job1 = {
      id: "furnace-1",
      scheduledStart: "2026-07-27T08:00:00.000Z",
      scheduledEnd:   "2026-07-27T10:00:00.000Z",
    };
    const job2 = {
      id: "furnace-2",
      scheduledStart: "2026-07-28T08:00:00.000Z",
      scheduledEnd:   "2026-07-28T10:00:00.000Z",
    };
    const map = buildCellJobMap([job1, job2], days);

    assert.deepEqual(map["0-8"], ["furnace-1"], "Monday furnace in Mon cell");
    assert.deepEqual(map["1-8"], ["furnace-2"], "Tuesday furnace in Tue cell");
    // Confirm neither leaks across
    assert.deepEqual(map["0-9"] ?? [], [], "furnace-1 must not repeat in Mon hour 9");
    assert.deepEqual(map["1-9"] ?? [], [], "furnace-2 must not repeat in Tue hour 9");
  });

  it("two simultaneous same-title appointments both appear in the same cell", () => {
    const job1 = { id: "a", scheduledStart: "2026-07-27T10:00:00.000Z", scheduledEnd: "2026-07-27T11:00:00.000Z" };
    const job2 = { id: "b", scheduledStart: "2026-07-27T10:00:00.000Z", scheduledEnd: "2026-07-27T11:00:00.000Z" };
    const map = buildCellJobMap([job1, job2], days);

    const cell = map["0-10"] ?? [];
    assert.ok(cell.includes("a"), "job a must be in the cell");
    assert.ok(cell.includes("b"), "job b must be in the cell");
    assert.equal(cell.length, 2, "exactly two entries");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Appointments assigned to different technicians are not merged
// ─────────────────────────────────────────────────────────────────────────────
describe("different technicians", () => {
  it("two jobs at the same time for different technicians both appear (not merged)", () => {
    const mike = { id: "mike-job", scheduledStart: "2026-07-27T09:00:00.000Z", scheduledEnd: "2026-07-27T11:00:00.000Z" };
    const sarah = { id: "sarah-job", scheduledStart: "2026-07-27T09:00:00.000Z", scheduledEnd: "2026-07-27T11:00:00.000Z" };
    const map = buildCellJobMap([mike, sarah], days);

    const cell = map["0-9"] ?? [];
    assert.ok(cell.includes("mike-job"), "Mike's job must be present");
    assert.ok(cell.includes("sarah-job"), "Sarah's job must be present");
    assert.equal(cell.length, 2, "both records kept — NOT merged");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Jobs with no scheduled time are excluded
// ─────────────────────────────────────────────────────────────────────────────
describe("unscheduled jobs", () => {
  it("job with null scheduledStart is excluded from the map", () => {
    const job = { id: "lead-job", scheduledStart: null, scheduledEnd: null };
    const map = buildCellJobMap([job], days);
    const allValues = Object.values(map).flat();
    assert.ok(!allValues.includes("lead-job"), "unscheduled job must not appear anywhere");
  });
});
