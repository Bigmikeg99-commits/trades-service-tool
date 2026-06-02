import { db } from "./index";
import {
  companySettings,
  customers,
  crewMembers,
  priceBookItems,
  jobTemplates,
  jobs,
  jobLineItems,
} from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding Trades Service Tool database...");

  // Clear existing data (for clean re-seeds during development)
  await db.delete(jobLineItems);
  await db.delete(jobs);
  await db.delete(jobTemplates);
  await db.delete(priceBookItems);
  await db.delete(crewMembers);
  await db.delete(customers);
  await db.delete(companySettings);

  // ============================================
  // COMPANY SETTINGS
  // ============================================
  await db.insert(companySettings).values({
    name: "North Star Mechanical",
    phone: "(651) 555-0192",
    email: "office@northstarmech.com",
    addressLine1: "1847 Vadnais Center Dr",
    city: "Vadnais Heights",
    state: "MN",
    zip: "55110",
    licenseHvac: "MN-HVAC-48291",
    licensePlumbing: "MN-PLMB-33917",
    licenseElectrical: "MN-ELEC-77104",
    defaultTaxRate: 8.875,
    defaultTerms: "Thank you for choosing North Star Mechanical. This proposal is valid for 30 days. Payment due within 30 days of invoice. 10% deposit required to schedule work.",
  });
  console.log("✓ Company settings created");

  // ============================================
  // CREW MEMBERS
  // ============================================
  const [mike, sarah, dave] = await db.insert(crewMembers).values([
    {
      name: "Mike Thompson",
      title: "Lead HVAC Tech",
      phone: "(651) 555-0142",
      color: "#2563eb", // blue
      defaultStartTime: "07:00",
      defaultEndTime: "16:30",
    },
    {
      name: "Sarah Patel",
      title: "Plumbing Specialist",
      phone: "(651) 555-0188",
      color: "#059669", // emerald
      defaultStartTime: "07:30",
      defaultEndTime: "17:00",
    },
    {
      name: "Dave Rodriguez",
      title: "Electrical & General",
      phone: "(651) 555-0123",
      color: "#7c3aed", // violet
      defaultStartTime: "08:00",
      defaultEndTime: "17:00",
    },
  ]).returning();
  console.log("✓ 3 crew members created");

  // ============================================
  // CUSTOMERS (realistic MN examples)
  // ============================================
  const customerData = [
    {
      name: "Johnson Residence",
      phone: "(651) 555-9821",
      email: "m.johnson@email.com",
      addressLine1: "1427 County Road E",
      city: "Vadnais Heights",
      state: "MN",
      zip: "55110",
      notes: "2-story colonial. Dog is friendly but loud. Gate code: 4821",
    },
    {
      name: "Riverside Apartments - Unit 3B",
      phone: "(651) 555-4410",
      email: "maintenance@riversideapts.com",
      addressLine1: "890 Lake Dr, Apt 3B",
      city: "White Bear Lake",
      state: "MN",
      zip: "55110",
      notes: "Property manager: Lisa Chen. Access through main office during business hours.",
    },
    {
      name: "The Miller Family",
      phone: "(651) 555-7634",
      email: "themillers.home@gmail.com",
      addressLine1: "312 Oak Street",
      city: "Shoreview",
      state: "MN",
      zip: "55126",
      notes: "Elderly couple. Prefer morning appointments. Call 30 min before arrival.",
    },
    {
      name: "Northview Office Park - Suite 200",
      phone: "(651) 555-2000",
      email: "facilities@northviewop.com",
      addressLine1: "2100 County Rd 96, Suite 200",
      city: "Arden Hills",
      state: "MN",
      zip: "55112",
      notes: "Commercial account. 24/7 access with keycard. Contact: Facilities Director Tom.",
    },
  ];

  const insertedCustomers = await db.insert(customers).values(customerData).returning();
  console.log(`✓ ${insertedCustomers.length} customers created`);

  // ============================================
  // PRICE BOOK - Realistic current pricing (2026 MN)
  // ============================================
  const priceBookData = [
    // HVAC
    { name: "Furnace Igniter (Nordyne)", category: "hvac" as const, unitPrice: 89, unit: "ea", typicalLaborMin: 45, notes: "Common on 80% furnaces" },
    { name: "Flame Sensor", category: "hvac" as const, unitPrice: 42, unit: "ea", typicalLaborMin: 30 },
    { name: "Capacitor - 45/5 MFD", category: "hvac" as const, unitPrice: 68, unit: "ea", typicalLaborMin: 25 },
    { name: "Blower Motor - 1/3 HP", category: "hvac" as const, unitPrice: 285, unit: "ea", typicalLaborMin: 90 },
    { name: "AC Contactor 40A", category: "hvac" as const, unitPrice: 52, unit: "ea", typicalLaborMin: 35 },
    { name: "Thermostat - Basic Digital", category: "hvac" as const, unitPrice: 125, unit: "ea", typicalLaborMin: 60 },
    { name: "Heat Pump Defrost Board", category: "hvac" as const, unitPrice: 195, unit: "ea", typicalLaborMin: 75 },
    { name: "Labor - HVAC Service Call", category: "hvac" as const, unitPrice: 135, unit: "hr", typicalLaborMin: 0 },

    // Plumbing
    { name: "1/2\" PEX Pipe (per 10ft)", category: "plumbing" as const, unitPrice: 28, unit: "ea", typicalLaborMin: 0 },
    { name: "SharkBite 1/2\" Coupling", category: "plumbing" as const, unitPrice: 14.5, unit: "ea", typicalLaborMin: 15 },
    { name: "Water Heater - 50 gal Electric", category: "plumbing" as const, unitPrice: 685, unit: "ea", typicalLaborMin: 180, notes: "Includes disposal of old unit" },
    { name: "Pressure Reducing Valve 3/4\"", category: "plumbing" as const, unitPrice: 95, unit: "ea", typicalLaborMin: 60 },
    { name: "Kitchen Faucet - Moen", category: "plumbing" as const, unitPrice: 165, unit: "ea", typicalLaborMin: 75 },
    { name: "Frozen Pipe Thaw + Repair (standard)", category: "plumbing" as const, unitPrice: 425, unit: "ea", typicalLaborMin: 150 },
    { name: "Labor - Plumbing Service", category: "plumbing" as const, unitPrice: 125, unit: "hr" },

    // Electrical
    { name: "20A GFCI Outlet - Tamper Resistant", category: "electrical" as const, unitPrice: 38, unit: "ea", typicalLaborMin: 25 },
    { name: "15A Single Pole Breaker", category: "electrical" as const, unitPrice: 19, unit: "ea", typicalLaborMin: 20 },
    { name: "LED Recessed Light Kit 6\"", category: "electrical" as const, unitPrice: 52, unit: "ea", typicalLaborMin: 40 },
    { name: "Whole House Surge Protector", category: "electrical" as const, unitPrice: 245, unit: "ea", typicalLaborMin: 90 },
    { name: "Labor - Electrical Service", category: "electrical" as const, unitPrice: 145, unit: "hr" },

    // General
    { name: "Service Call / Diagnostic Fee", category: "general" as const, unitPrice: 95, unit: "ea", notes: "Waived if repair completed same day" },
    { name: "Trip Charge (over 25 miles)", category: "general" as const, unitPrice: 65, unit: "ea" },
    { name: "After Hours / Emergency", category: "general" as const, unitPrice: 185, unit: "hr", notes: "Evenings, weekends, holidays" },
  ];

  const insertedPrices = await db.insert(priceBookItems).values(
    priceBookData.map((item) => ({
      ...item,
      sku: item.name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12),
    }))
  ).returning();
  console.log(`✓ ${insertedPrices.length} price book items created`);

  // ============================================
  // JOB TEMPLATES (for the local estimator)
  // ============================================
  await db.insert(jobTemplates).values([
    {
      name: "Frozen Pipe - Standard",
      descriptionPattern: "frozen pipe",
      serviceType: "plumbing",
      estimatedLaborHours: 3.5,
      defaultLineItems: JSON.stringify([
        { description: "Frozen pipe diagnostic & thaw", quantity: 1, unitPrice: 425, source: "template" },
        { description: "Pipe insulation (10 ft)", quantity: 2, unitPrice: 28, source: "template" },
        { description: "Heat tape installation", quantity: 1, unitPrice: 95, source: "template" },
      ]),
      notes: "Most common in Jan-Feb. Recommend annual inspection.",
    },
    {
      name: "No Heat - Furnace",
      descriptionPattern: "no heat furnace",
      serviceType: "hvac",
      estimatedLaborHours: 2.25,
      defaultLineItems: JSON.stringify([
        { description: "Furnace diagnostic", quantity: 1, unitPrice: 95, source: "template" },
        { description: "Furnace igniter", quantity: 1, unitPrice: 89, source: "template" },
        { description: "Flame sensor cleaning/replacement", quantity: 1, unitPrice: 42, source: "template" },
      ]),
    },
    {
      name: "AC Not Cooling",
      descriptionPattern: "ac not cooling",
      serviceType: "hvac",
      estimatedLaborHours: 2.0,
      defaultLineItems: JSON.stringify([
        { description: "AC diagnostic", quantity: 1, unitPrice: 95, source: "template" },
        { description: "Start/run capacitor", quantity: 1, unitPrice: 68, source: "template" },
        { description: "Contactor replacement", quantity: 1, unitPrice: 52, source: "template" },
      ]),
    },
  ]);
  console.log("✓ Job templates created");

  // ============================================
  // SAMPLE JOBS (mix of statuses for realistic demo)
  // ============================================
  const johnson = insertedCustomers[0];
  const riverside = insertedCustomers[1];

  // Job 1: In progress
  const [job1] = await db.insert(jobs).values({
    customerId: johnson.id,
    title: "Frozen pipe in basement",
    rawDescription: "frozen pipe in basement, 2-story house in Vadnais Heights",
    serviceType: "plumbing",
    status: "in_progress",
    scheduledStart: new Date("2026-06-02T08:00:00"),
    scheduledEnd: new Date("2026-06-02T11:30:00"),
    travelTimeMin: 25,
    estimatedLaborHours: 3.5,
    assignedPrimaryCrewId: sarah.id,
    quoteSubtotal: 580,
    quoteTax: 51.5,
    quoteTotal: 631.5,
    notes: "Customer reports water dripping from ceiling. Found burst pipe behind drywall.",
  }).returning();

  await db.insert(jobLineItems).values([
    { jobId: job1.id, sortOrder: 0, description: "Frozen pipe diagnostic & thaw", category: "plumbing", quantity: 1, unitPrice: 425, lineTotal: 425, source: "template" },
    { jobId: job1.id, sortOrder: 1, description: "Pipe insulation (10 ft)", category: "plumbing", quantity: 2, unitPrice: 28, lineTotal: 56, source: "price_book" },
    { jobId: job1.id, sortOrder: 2, description: "Labor - additional drywall repair", category: "general", quantity: 1.5, unitPrice: 125, lineTotal: 187.5, source: "manual" },
  ]);

  // Job 2: Quoted
  const [job2] = await db.insert(jobs).values({
    customerId: riverside.id,
    title: "No heat - common area furnace",
    rawDescription: "furnace not working in lobby area, building is cold",
    serviceType: "hvac",
    status: "quoted",
    estimatedLaborHours: 2.25,
    quoteSubtotal: 365,
    quoteTax: 32.4,
    quoteTotal: 397.4,
    notes: "Furnace making clicking noise but no heat. Likely igniter or sensor.",
  }).returning();

  await db.insert(jobLineItems).values([
    { jobId: job2.id, sortOrder: 0, description: "Furnace diagnostic", category: "hvac", quantity: 1, unitPrice: 95, lineTotal: 95, source: "template" },
    { jobId: job2.id, sortOrder: 1, description: "Furnace igniter", category: "hvac", quantity: 1, unitPrice: 89, lineTotal: 89, source: "price_book" },
    { jobId: job2.id, sortOrder: 2, description: "Flame sensor", category: "hvac", quantity: 1, unitPrice: 42, lineTotal: 42, source: "price_book" },
    { jobId: job2.id, sortOrder: 3, description: "Labor - HVAC service", category: "hvac", quantity: 1.5, unitPrice: 135, lineTotal: 202.5, source: "manual" },
  ]);

  console.log("✓ Sample jobs + line items created");

  console.log("\n✅ Database seeded successfully!");
  console.log("   - 1 company profile (North Star Mechanical, Vadnais Heights)");
  console.log("   - 3 crew members with realistic schedules");
  console.log("   - 4 customers (mostly local to the area)");
  console.log("   - 20+ price book items across all trades");
  console.log("   - 3 job templates for the estimator");
  console.log("   - 2 sample jobs in different stages");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => {
    // Close connection if running as script
    if (typeof process !== "undefined" && process.argv[1]?.includes("seed")) {
      process.exit(0);
    }
  });

export { seed };