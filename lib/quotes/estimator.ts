import { db } from "@/lib/db";
import { priceBookItems, jobTemplates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EstimatorInput, QuoteDraft, LineItemDraft } from "./types";

/**
 * Deterministic, local-only quote estimator.
 * No LLM. Fast keyword + template + price book matching.
 */
export async function generateQuoteDraft(input: EstimatorInput): Promise<QuoteDraft> {
  const text = (input.rawDescription || "").toLowerCase();
  const serviceType = normalizeServiceType(input.serviceType, text);

  // 1. Try to find matching job templates
  const templates = await db
    .select()
    .from(jobTemplates)
    .where(eq(jobTemplates.active, true));

  let bestTemplate = templates.find((t) =>
    text.includes(t.descriptionPattern.toLowerCase())
  );

  // Fallback keyword matching if no template
  if (!bestTemplate) {
    bestTemplate = findBestTemplateByKeywords(text, templates);
  }

  // 2. Build line items
  let lineItems: LineItemDraft[] = [];

  if (bestTemplate?.defaultLineItems) {
    try {
      const templateItems = JSON.parse(bestTemplate.defaultLineItems as string);
      lineItems = templateItems.map((item: any) => ({
        description: item.description,
        category: serviceType,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        lineTotal: (item.quantity || 1) * item.unitPrice,
        source: "template" as const,
      }));
    } catch (e) {
      // fall through to price book matching
    }
  }

  // 3. If we still need items, do price book keyword matching
  if (lineItems.length === 0) {
    lineItems = await matchPriceBookItems(text, serviceType);
  }

  // 4. Estimate labor
  const estimatedLaborHours =
    bestTemplate?.estimatedLaborHours ||
    estimateLaborFromText(text, serviceType, lineItems);

  // 5. Travel time heuristic (simple for now)
  const suggestedTravelMin = input.zip?.startsWith("55") ? 25 : 40;

  return {
    serviceType,
    lineItems: lineItems.length > 0 ? lineItems : getDefaultLineItems(serviceType),
    estimatedLaborHours: Math.round(estimatedLaborHours * 10) / 10,
    suggestedTravelMin,
    notes: bestTemplate?.notes || undefined,
  };
}

// --- Helpers ---

function normalizeServiceType(
  explicit: string | undefined,
  text: string
): "hvac" | "plumbing" | "electrical" | "general" {
  if (explicit) return explicit as any;

  if (text.includes("heat") || text.includes("furnace") || text.includes("ac") || text.includes("cooling")) {
    return "hvac";
  }
  if (text.includes("pipe") || text.includes("water") || text.includes("drain") || text.includes("toilet")) {
    return "plumbing";
  }
  if (text.includes("electric") || text.includes("outlet") || text.includes("breaker") || text.includes("light")) {
    return "electrical";
  }
  return "general";
}

function findBestTemplateByKeywords(text: string, templates: any[]) {
  const keywords = {
    hvac: ["heat", "furnace", "ac", "cooling", "thermostat"],
    plumbing: ["pipe", "frozen", "water", "leak", "drain"],
    electrical: ["power", "outlet", "light", "breaker", "electric"],
  };

  for (const t of templates) {
    const pattern = t.descriptionPattern.toLowerCase();
    if (text.includes(pattern)) return t;

    // loose keyword match
    const serviceKeywords = keywords[t.serviceType as keyof typeof keywords] || [];
    if (serviceKeywords.some((k) => text.includes(k))) {
      return t;
    }
  }
  return null;
}

async function matchPriceBookItems(text: string, serviceType: string): Promise<LineItemDraft[]> {
  const items = await db
    .select()
    .from(priceBookItems)
    .where(eq(priceBookItems.active, true));

  const matched: LineItemDraft[] = [];

  // Very simple but effective keyword matching
  const keywordMap: Record<string, string[]> = {
    frozen: ["pipe", "insulation", "heat tape"],
    heat: ["igniter", "flame sensor", "capacitor"],
    ac: ["capacitor", "contactor"],
    water: ["pipe", "valve"],
    light: ["led", "recessed"],
    outlet: ["gfci"],
  };

  for (const [trigger, suggestions] of Object.entries(keywordMap)) {
    if (text.includes(trigger)) {
      for (const suggestion of suggestions) {
        const match = items.find(
          (i) =>
            i.name.toLowerCase().includes(suggestion) &&
            (i.category === serviceType || i.category === "general")
        );
        if (match) {
          matched.push({
            description: match.name,
            category: match.category,
            quantity: 1,
            unitPrice: match.unitPrice,
            lineTotal: match.unitPrice,
            source: "price_book",
          });
        }
      }
    }
  }

  // Always add a labor line if we have items
  if (matched.length > 0) {
    const laborRate = serviceType === "electrical" ? 145 : 125;
    matched.push({
      description: "Labor - Service",
      category: serviceType,
      quantity: 2,
      unitPrice: laborRate,
      lineTotal: 2 * laborRate,
      source: "manual",
    });
  }

  return matched;
}

function estimateLaborFromText(text: string, serviceType: string, items: LineItemDraft[]): number {
  let hours = 1.5;

  if (text.includes("frozen")) hours = 3.5;
  if (text.includes("furnace") || text.includes("no heat")) hours = 2.25;
  if (text.includes("ac") || text.includes("cooling")) hours = 2.0;
  if (text.includes("water heater")) hours = 3.0;

  // Add time based on matched items
  const itemTime = items.length * 0.4;
  hours = Math.max(hours, itemTime);

  return Math.min(Math.max(hours, 1), 8); // clamp between 1-8 hours
}

function getDefaultLineItems(serviceType: string): LineItemDraft[] {
  const laborRate = serviceType === "electrical" ? 145 : serviceType === "hvac" ? 135 : 125;

  return [
    {
      description: "Service call / diagnostic",
      category: serviceType,
      quantity: 1,
      unitPrice: 95,
      lineTotal: 95,
      source: "manual",
    },
    {
      description: "Labor",
      category: serviceType,
      quantity: 2,
      unitPrice: laborRate,
      lineTotal: laborRate * 2,
      source: "manual",
    },
  ];
}