export const runtime = "nodejs";

import { getCustomers, createCustomer } from "@/app/actions/customers";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const customerList = await getCustomers(search);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Customers</h1>
          <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
            Manage your client relationships
          </p>
        </div>
        <Link 
          href="#new-customer" 
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900"
        >
          + New Customer
        </Link>
      </div>

      {/* Search (GET form) */}
      <form method="get" className="mb-6 flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search customers..."
          className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button type="submit" className="rounded-lg border px-4 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">Search</button>
        {search && <Link href="/customers" className="self-center text-xs text-zinc-500 hover:underline">clear</Link>}
      </form>

      {/* Customers Table */}
      <div className="pro-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {customerList.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="py-8">
                    <EmptyState
                      icon={Users}
                      title="No customers yet"
                      description="Add your first customer to start tracking jobs and history."
                    />
                  </div>
                </td>
              </tr>
            )}
            {customerList.map((customer) => (
              <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-6 py-4 font-medium">
                  <Link href={`/customers/${customer.id}`} className="hover:underline">
                    {customer.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {[customer.city, customer.state, customer.zip].filter(Boolean).join(", ")}
                </td>
                <td className="px-6 py-4 text-sm">
                  {customer.phone || customer.email || "—"}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {new Date(customer.createdAt!).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/customers/${customer.id}`}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Customer Form */}
      <div id="new-customer" className="pro-card mt-8 p-6">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Add New Customer</h2>
        <form action={createCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input name="name" required className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input name="addressLine1" className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input name="city" className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <input name="state" defaultValue="MN" className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP</label>
              <input name="zip" className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" rows={2} className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-950" />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button 
              type="submit"
              className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900"
            >
              Create Customer
            </button>
            <p className="text-xs text-zinc-500">Page will refresh on success</p>
          </div>
        </form>
      </div>
    </div>
  );
}