export const runtime = "nodejs";

import { 
  getPriceBookItems, 
  createPriceBookItem, 
  updatePriceBookItem,
  getPriceBookItemUsageCount 
} from "@/app/actions/pricebook";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";

const categories = ["all", "hvac", "plumbing", "electrical", "general"] as const;

export default async function PriceBookPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category = "all", search = "" } = await searchParams;
  
  const items = await getPriceBookItems({ 
    category: category === "all" ? undefined : category, 
    search: search || undefined 
  });

  // Get usage counts (simple approximation)
  const usageCounts = await Promise.all(
    items.map(async (item) => ({
      id: item.id,
      count: await getPriceBookItemUsageCount(item.id),
    }))
  );

  const usageMap = new Map(usageCounts.map(u => [u.id, u.count]));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Price Book</h1>
          <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
            Manage your service rates and materials. Changes only affect future quotes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-1 rounded-lg border p-1 dark:border-zinc-800">
          {categories.map((cat) => {
            const isActive = category === cat;
            return (
              <a
                key={cat}
                href={`/pricebook?category=${cat}${search ? `&search=${search}` : ""}`}
                className={`px-4 py-1.5 text-sm rounded-md capitalize transition-all ${
                  isActive 
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </a>
            );
          })}
        </div>

        <form method="get" className="flex-1 flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search items..."
            className="w-full max-w-sm rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950 dark:border-zinc-700"
          />
          <button type="submit" className="rounded-lg border px-3 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">Search</button>
          {search && <a href="/pricebook" className="self-center text-xs text-zinc-500 hover:underline">clear</a>}
        </form>
      </div>

      {/* Price Book Table */}
      <div className="pro-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-3 text-left">Item</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-right">Price</th>
              <th className="px-6 py-3 text-left">Unit</th>
              <th className="px-6 py-3 text-right">Labor (min)</th>
              <th className="px-6 py-3 text-left">Used In</th>
              <th className="px-6 py-3 text-left">Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="py-8">
                    <EmptyState
                      icon={Package}
                      title="No price book items"
                      description="Start adding your materials and labor rates so the quote builder has something to work with."
                    />
                  </div>
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-6 py-4">
                  <div className="font-medium">{item.name}</div>
                  {item.sku && <div className="text-xs text-zinc-500">{item.sku}</div>}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs capitalize dark:bg-zinc-800">
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-zinc-500">{item.unit}</td>
                <td className="px-6 py-4 text-right text-zinc-500">{item.typicalLaborMin}</td>
                <td className="px-6 py-4 text-sm">
                  {usageMap.get(item.id) || 0} jobs
                </td>
                <td className="px-6 py-4 text-xs text-zinc-500 max-w-[200px] truncate">
                  {item.notes}
                </td>
                <td className="px-6 py-4">
                  <details className="text-right">
                    <summary className="cursor-pointer text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
                      Edit
                    </summary>
                    <form 
                      action={async (formData) => {
                        "use server";
                        await updatePriceBookItem(item.id, formData);
                      }} 
                      className="mt-2 space-y-2 text-left min-w-[240px]"
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <input 
                        name="name" 
                        defaultValue={item.name} 
                        className="w-full rounded border px-2 py-1 text-sm dark:bg-zinc-950" 
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select name="category" defaultValue={item.category} className="rounded border px-2 py-1 text-sm dark:bg-zinc-950">
                          <option value="hvac">HVAC</option>
                          <option value="plumbing">Plumbing</option>
                          <option value="electrical">Electrical</option>
                          <option value="general">General</option>
                        </select>
                        <input 
                          name="unitPrice" 
                          type="number" 
                          step="0.01" 
                          defaultValue={item.unitPrice} 
                          className="rounded border px-2 py-1 text-sm dark:bg-zinc-950" 
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full rounded bg-zinc-900 py-1 text-xs text-white hover:bg-black dark:bg-white dark:text-zinc-900"
                      >
                        Save Changes
                      </button>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Item */}
      <div className="pro-card mt-8 p-6">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Add New Price Book Item</h2>
        <form action={createPriceBookItem} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <input 
              name="name" 
              placeholder="Item name (e.g. Furnace Igniter)" 
              required 
              className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" 
            />
          </div>
          <div>
            <select name="category" required className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950">
              <option value="hvac">HVAC</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <div className="flex">
              <span className="px-3 py-2 text-zinc-500">$</span>
              <input 
                name="unitPrice" 
                type="number" 
                step="0.01" 
                placeholder="Price" 
                required 
                className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" 
              />
            </div>
          </div>
          <div>
            <input name="unit" defaultValue="ea" placeholder="Unit" className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
          </div>
          <div>
            <input 
              name="typicalLaborMin" 
              type="number" 
              placeholder="Labor min" 
              defaultValue="0" 
              className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" 
            />
          </div>
          <div className="md:col-span-6">
            <input 
              name="notes" 
              placeholder="Notes (optional)" 
              className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" 
            />
          </div>
          <div className="md:col-span-6">
            <button 
              type="submit"
              className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900"
            >
              Add to Price Book
            </button>
          </div>
        </form>
      </div>

      <p className="mt-6 text-xs text-center text-zinc-500">
        Editing prices here only affects new quotes generated after the change. Existing jobs keep their original pricing.
      </p>
    </div>
  );
}