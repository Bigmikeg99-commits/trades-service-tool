import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

// Helper for CUID IDs (good for distributed safety)
const id = () => text("id").primaryKey().$defaultFn(() => createId());

// ============================================
// COMPANY SETTINGS (single row table pattern)
// ============================================
export const companySettings = sqliteTable("company_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  defaultTaxRate: real("default_tax_rate").default(8.5),
  defaultTerms: text("default_terms").default(
    "Thank you for your business. Payment due within 30 days. This proposal is valid for 30 days."
  ),
  businessHours: text("business_hours", { mode: "json" }).default(
    JSON.stringify({ start: "07:00", end: "17:00", days: ["mon","tue","wed","thu","fri"] })
  ),

  // Subscription fields (Stripe integration)
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status").default("inactive"), // active, trialing, past_due, canceled, incomplete, inactive
  subscriptionPlan: text("subscription_plan"), // "free" | "pro" | "team"
  subscriptionId: text("subscription_id"), // Stripe subscription ID
  subscriptionCurrentPeriodEnd: integer("subscription_current_period_end", { mode: "timestamp" }),

  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================
// USERS (for future auth)
// ============================================
export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "office", "tech"] }).notNull().default("owner"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================
// SESSIONS (for Lucia auth - Phase 2)
// ============================================
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(), // Lucia expects unix timestamp (number)
});

// ============================================
// CREW MEMBERS
// ============================================
export const crewMembers = sqliteTable("crew_members", {
  id: id(),
  name: text("name").notNull(),
  title: text("title").default("Technician"),
  phone: text("phone"),
  color: text("color").notNull().default("#3b82f6"), // Tailwind blue-500 default
  defaultStartTime: text("default_start_time").notNull().default("07:00"),
  defaultEndTime: text("default_end_time").notNull().default("17:00"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================
// CUSTOMERS
// ============================================
export const customers = sqliteTable("customers", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  addressLine1: text("address_line1"),
  city: text("city"),
  state: text("state").default("MN"),
  zip: text("zip"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  nameIdx: index("customers_name_idx").on(table.name),
  zipIdx: index("customers_zip_idx").on(table.zip),
}));

// ============================================
// PRICE BOOK ITEMS
// ============================================
export const priceBookItems = sqliteTable("price_book_items", {
  id: id(),
  sku: text("sku"),
  name: text("name").notNull(),
  category: text("category", {
    enum: ["hvac", "plumbing", "electrical", "general"],
  }).notNull(),
  unitPrice: real("unit_price").notNull(),
  unit: text("unit").notNull().default("ea"), // ea, hr, ft, lb, etc.
  typicalLaborMin: integer("typical_labor_min").default(0),
  notes: text("notes"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  categoryIdx: index("price_book_category_idx").on(table.category),
  activeIdx: index("price_book_active_idx").on(table.active),
}));

// ============================================
// JOB TEMPLATES (for smart local estimator)
// ============================================
export const jobTemplates = sqliteTable("job_templates", {
  id: id(),
  name: text("name").notNull(),
  descriptionPattern: text("description_pattern").notNull(), // simple keywords for matching
  serviceType: text("service_type", {
    enum: ["hvac", "plumbing", "electrical", "general"],
  }).notNull(),
  defaultLineItems: text("default_line_items", { mode: "json" }), // JSON array of partial line items
  estimatedLaborHours: real("estimated_labor_hours").default(2),
  notes: text("notes"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// ============================================
// JOBS
// ============================================
export const jobs = sqliteTable("jobs", {
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
  scheduledStart: integer("scheduled_start", { mode: "timestamp" }),
  scheduledEnd: integer("scheduled_end", { mode: "timestamp" }),
  travelTimeMin: integer("travel_time_min").default(30),
  estimatedLaborHours: real("estimated_labor_hours"),
  assignedPrimaryCrewId: text("assigned_primary_crew_id").references(() => crewMembers.id),
  quoteSubtotal: real("quote_subtotal").default(0),
  quoteTax: real("quote_tax").default(0),
  quoteTotal: real("quote_total").default(0),
  notes: text("notes"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  customerIdx: index("jobs_customer_idx").on(table.customerId),
  statusIdx: index("jobs_status_idx").on(table.status),
  scheduledIdx: index("jobs_scheduled_idx").on(table.scheduledStart),
}));

// ============================================
// JOB LINE ITEMS
// ============================================
export const jobLineItems = sqliteTable("job_line_items", {
  id: id(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  description: text("description").notNull(),
  category: text("category").notNull(),
  quantity: real("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  lineTotal: real("line_total").notNull(),
  source: text("source", { enum: ["price_book", "manual", "template"] }).default("manual"),
});

// ============================================
// JOB ASSIGNMENTS (supports multi-crew jobs)
// ============================================
export const jobAssignments = sqliteTable("job_assignments", {
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