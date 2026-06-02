import { z } from "zod";

export const LineItemDraftSchema = z.object({
  description: z.string(),
  category: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  lineTotal: z.number(),
  source: z.enum(["price_book", "template", "manual"]).default("manual"),
});

export type LineItemDraft = z.infer<typeof LineItemDraftSchema>;

export const QuoteDraftSchema = z.object({
  serviceType: z.enum(["hvac", "plumbing", "electrical", "general"]),
  lineItems: z.array(LineItemDraftSchema),
  estimatedLaborHours: z.number(),
  suggestedTravelMin: z.number().default(30),
  notes: z.string().optional(),
});

export type QuoteDraft = z.infer<typeof QuoteDraftSchema>;

export interface EstimatorInput {
  rawDescription: string;
  serviceType?: string;
  city?: string;
  zip?: string;
}