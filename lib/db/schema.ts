import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  serial,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  json,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Helper for CUID IDs (good for distributed safety)
const id = () => text("id").primaryKey().$defaultFn(() => createId());

// ============================================
// COMPANY SETTINGS (single row table pattern)
// ============================================
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Your Company Name"),
  phone: text("phone").default("(555) 123-4567"),
  email: text("email").default("office@yourcompany.com"),
  addressLine1: text("address_line1").default("123 Main St"),
  city: text("city").default("Your City"),
  state: text("state").default("MN"),
  zip: text("zip").default("55101"),
  licenseHvac: text("license_hvac"),
  licensePlumbing: text("license_plumbing"),
  licenseElectrical: text("license_electrical"),
  defaultTaxRate: doublePrecision("default_tax_rate").default(8.5),
  defaultTerms: text("default_terms").default(
    "Thank you for your business. Payment due within 30 days. This proposal is valid for 30 days."
  ),
  businessHours: json("business_hours").$type<{
    start: string;
    end: string;
    days: string[];
  }>().default({
    start: "07:00",
    end: "17:00",
    days: ["mon", "tue", "wed", "thu", "fri"],
  }),

  // Subscription fields (Stripe integration)
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, trialing, past_due, canceled, incomplete, inactive
  subscriptionPlan: text("subscription_plan"), // "free" | "pro" | "team"
  subscriptionId: text("subscription_id"), // Stripe subscription ID
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  // True once this account has ever started a trial (current_period_end doubles as
  // trial_end while status === "trialing"). Used to prevent re-using the 14-day
  // Pro trial after it has already been started once.
  hasUsedTrial: boolean("has_used_trial").notNull().default(false),

  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// USERS (for future auth)
// ============================================
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "office", "tech"] }).notNull().default("owner"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// SESSIONS (for Lucia auth - Phase 2)
// ============================================
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

// ============================================
// CREW MEMBERS
// ============================================
export const crewMembers = pgTable("crew_members", {
  id: id(),
  name: text("name").notNull(),
  title: text("title").default("Technician"),
  phone: text("phone"),
  color: text("color").notNull().default("#3b82f6"), // Tailwind blue-500 default
  defaultStartTime: text("default_start_time").notNull().default("07:00"),
  defaultEndTime: text("default_end_time").notNull().default("17:00"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================
// CUSTOMERS
// ============================================
export const customers = pgTable("customers", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  addressLine1: text("address_line1"),
  city: text("city"),
  state: text("state").default("MN"),
  zip: text("zip"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  nameIdx: index("customers_name_idx").on(table.name),
  zipIdx: index("customers_zip_idx").on(table.zip),
}));

// ============================================
// PRICE BOOK ITEMS
// ============================================
export const priceBookItems = pgTable("price_book_items", {
  id: id(),
  sku: text("sku"),
  name: text("name").notNull(),
  category: text("category", {
    enum: ["hvac", "plumbing", "electrical", "general"],
  }).notNull(),
  unitPrice: doublePrecision("unit_price").notNull(),
  unit: text("unit").notNull().default("ea"), // ea, hr, ft, lb, etc.
  typicalLaborMin: integer("typical_labor_min").default(0),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("price_book_category_idx").on(table.category),
  activeIdx: index("price_book_active_idx").on(table.active),
}));

// ============================================
// JOB TEMPLATES (for smart local estimator)
// ============================================
export const jobTemplates = pgTable("job_templates", {
  id: id(),
  name: text("name").notNull(),
  descriptionPattern: text("description_pattern").notNull(), // simple keywords for matching
  serviceType: text("service_type", {
    enum: ["hvac", "plumbing", "electrical", "general"],
  }).notNull(),
  defaultLineItems: json("default_line_items").$type<unknown[] | null>(), // JSON array of partial line items (unknown[] instead of any per AGENTS.md; validate at consumption)
  estimatedLaborHours: doublePrecision("estimated_labor_hours").default(2),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
});

// ============================================
// JOBS
// ============================================
export const jobs = pgTable("jobs", {
  id: id(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  rawDescription: text("raw_description"), // the plain English input from user
  serviceType: text("service_type", {
    enum: ["hvac", "plumbing", "electrical", "general"],
  }).notNull(),
  status: text("status", {
    enum: ["lead", "quoted", "scheduled", "in_progress", "completed", "cancelled"],
  }).notNull().default("lead"),
  addressOverride: text("address_override"),
  city: text("city"),
  state: text("state").default("MN"),
  zip: text("zip"),
  scheduledStart: timestamp("scheduled_start"),
  scheduledEnd: timestamp("scheduled_end"),
  travelTimeMin: integer("travel_time_min").default(30),
  estimatedLaborHours: doublePrecision("estimated_labor_hours"),
  assignedPrimaryCrewId: text("assigned_primary_crew_id").references(() => crewMembers.id),
  quoteSubtotal: doublePrecision("quote_subtotal").default(0),
  quoteTax: doublePrecision("quote_tax").default(0),
  quoteTotal: doublePrecision("quote_total").default(0),
  notes: text("notes"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  customerIdx: index("jobs_customer_idx").on(table.customerId),
  statusIdx: index("jobs_status_idx").on(table.status),
  scheduledIdx: index("jobs_scheduled_idx").on(table.scheduledStart),
}));

// ============================================
// JOB LINE ITEMS
// ============================================
export const jobLineItems = pgTable("job_line_items", {
  id: id(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  description: text("description").notNull(),
  category: text("category").notNull(),
  quantity: doublePrecision("quantity").notNull().default(1),
  unitPrice: doublePrecision("unit_price").notNull(),
  lineTotal: doublePrecision("line_total").notNull(),
  source: text("source", { enum: ["price_book", "manual", "template"] }).default("manual"),
});

// ============================================
// JOB ASSIGNMENTS (supports multi-crew jobs)
// ============================================
export const jobAssignments = pgTable("job_assignments", {
  id: id(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  crewId: text("crew_id")
    .notNull()
    .references(() => crewMembers.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["lead", "support"] }).notNull().default("lead"),
}, (table) => ({
  uniqueAssignment: uniqueIndex("unique_job_crew").on(table.jobId, table.crewId),
}));

// ============================================
// RELATIONS (for Drizzle query API)
// ============================================
export const jobsRelations = relations(jobs, ({ one, many }) => ({
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
  primaryCrew: one(crewMembers, {
    fields: [jobs.assignedPrimaryCrewId],
    references: [crewMembers.id],
  }),
  lineItems: many(jobLineItems),
  assignments: many(jobAssignments),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  jobs: many(jobs),
}));

export const crewMembersRelations = relations(crewMembers, ({ many }) => ({
  assignments: many(jobAssignments),
}));

export const jobLineItemsRelations = relations(jobLineItems, ({ one }) => ({
  job: one(jobs, {
    fields: [jobLineItems.jobId],
    references: [jobs.id],
  }),
}));

export const jobAssignmentsRelations = relations(jobAssignments, ({ one }) => ({
  job: one(jobs, {
    fields: [jobAssignments.jobId],
    references: [jobs.id],
  }),
  crew: one(crewMembers, {
    fields: [jobAssignments.crewId],
    references: [crewMembers.id],
  }),
}));

// Type exports for convenience
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type CrewMember = typeof crewMembers.$inferSelect;
export type PriceBookItem = typeof priceBookItems.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type JobLineItem = typeof jobLineItems.$inferSelect;
export type JobTemplate = typeof jobTemplates.$inferSelect;
export type CompanySettings = typeof companySettings.$inferSelect;