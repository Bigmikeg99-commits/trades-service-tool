"use client";

import { useState } from "react";
import { LineItemDraft, QuoteDraft } from "@/lib/quotes/types";
import { saveQuoteDraft } from "@/app/actions/quotes";
import type { PriceBookItem } from "@/lib/db/schema";

interface QuoteEditorProps {
  initialDraft: QuoteDraft;
  jobId: string;
  priceBookItems?: PriceBookItem[];
}

export function QuoteEditor({ initialDraft, jobId, priceBookItems = [] }: QuoteEditorProps) {
  const [draft, setDraft] = useState<QuoteDraft>(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const updateLineItem = (index: number, field: keyof LineItemDraft, value: any) => {
    const newItems = [...draft.lineItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate line total
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].lineTotal = newItems[index].quantity * newItems[index].unitPrice;
    }

    const newDraft = { ...draft, lineItems: newItems };
    setDraft(newDraft);
  };

  const addLineItem = () => {
    const newItem: LineItemDraft = {
      description: "New line item",
      category: draft.serviceType,
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
      source: "manual",
    };
    setDraft({
      ...draft,
      lineItems: [...draft.lineItems, newItem],
    });
  };

  const removeLineItem = (index: number) => {
    const newItems = draft.lineItems.filter((_, i) => i !== index);
    setDraft({ ...draft, lineItems: newItems });
  };

  const addFromPriceBook = (item: PriceBookItem) => {
    const laborAdd = ((item.typicalLaborMin ?? 0) as number) / 60;
    const newLine: LineItemDraft = {
      description: item.name,
      category: item.category || draft.serviceType,
      quantity: 1,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice,
      source: "price_book",
    };
    const newLabor = Math.round((draft.estimatedLaborHours + laborAdd) * 10) / 10;
    setDraft({
      ...draft,
      lineItems: [...draft.lineItems, newLine],
      estimatedLaborHours: newLabor,
    });
  };

  const filteredPriceBook = (priceBookItems || [])
    .filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    })
    .slice(0, 12);

  const subtotal = draft.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxRate = 8.875; // TODO: pull from company settings later
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalDraft = {
        ...draft,
        lineItems: draft.lineItems.map((item) => ({
          ...item,
          lineTotal: item.quantity * item.unitPrice,
        })),
      };
      await saveQuoteDraft(jobId, finalDraft);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save quote:", error);
      alert("Failed to save quote changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pro-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold tracking-tight">Quote Builder</h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {isSaving ? "Saving..." : justSaved ? "Saved!" : "Save Quote"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Quick Add from Price Book - fast one-click add with prefilled price/unit/labor */}
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Quick Add from Price Book</div>
            <div className="text-[10px] text-zinc-500">searches instantly • pre-fills price, unit &amp; labor</div>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items (filter, capacitor, labor...)"
            className="mb-2 w-full rounded-md border px-3 py-1.5 text-sm dark:bg-zinc-950"
          />
          {filteredPriceBook.length > 0 ? (
            <div className="max-h-44 overflow-auto divide-y divide-zinc-200 rounded border bg-white text-sm dark:divide-zinc-800 dark:bg-zinc-950">
              {filteredPriceBook.map((item) => {
                const laborH = ((item.typicalLaborMin ?? 0) as number) / 60;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <div className="min-w-0 flex-1 truncate pr-2">
                      <div className="font-medium leading-tight">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                        {item.sku && <span>{item.sku}</span>}
                        <span className="capitalize">{item.category}</span>
                        <span>{item.unit}</span>
                        {laborH > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{laborH.toFixed(1)}h</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-right">
                      <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400">${item.unitPrice.toFixed(2)}</div>
                      <button
                        type="button"
                        onClick={() => addFromPriceBook(item)}
                        className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-emerald-700 active:bg-emerald-800"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-1 text-xs text-zinc-500">
              {priceBookItems.length === 0
                ? "No price book items yet — add some on the Price Book page."
                : "No matches. Try a different search."}
            </div>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
            >
              Clear search
            </button>
          )}
        </div>

        {draft.lineItems.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-3 items-end border-b pb-4">
            <div className="col-span-5">
              <input
                value={item.description}
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, "quantity", parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="col-span-2">
              <div className="flex">
                <span className="px-2 py-1.5 text-sm text-zinc-500">$</span>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                  className="w-full rounded-md border px-3 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="col-span-2 text-right font-mono text-sm">
              ${item.lineTotal.toFixed(2)}
            </div>
            <div className="col-span-1 text-right">
              <button
                onClick={() => removeLineItem(index)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={addLineItem}
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
        >
          + Add line item
        </button>

        {/* Totals */}
        <div className="border-t pt-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Tax ({taxRate}%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-1 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-xs text-zinc-500 pt-2 flex items-center gap-x-4">
          <span>
            Estimated labor:{" "}
            <input
              type="number"
              step="0.1"
              min="0"
              value={draft.estimatedLaborHours}
              onChange={(e) => setDraft({ ...draft, estimatedLaborHours: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-14 rounded border px-1 py-0.5 text-xs font-medium dark:bg-zinc-950"
            />{" "}
            hrs
          </span>
          <span>
            Suggested travel:{" "}
            <input
              type="number"
              min="0"
              value={draft.suggestedTravelMin}
              onChange={(e) => setDraft({ ...draft, suggestedTravelMin: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-14 rounded border px-1 py-0.5 text-xs font-medium dark:bg-zinc-950"
            />{" "}
            min
          </span>
        </div>
      </div>
    </div>
  );
}