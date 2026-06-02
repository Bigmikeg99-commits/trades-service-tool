export const runtime = "nodejs";

import { createJob } from "@/app/actions/jobs";
import { getCustomers } from "@/app/actions/customers";
import Link from "next/link";

export default async function NewJobPage() {
  const customerList = await getCustomers();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/jobs" className="text-sm text-zinc-500 hover:text-zinc-700">← Back to Jobs</Link>
        <h1 className="text-4xl font-semibold tracking-tighter mt-1">Create New Job</h1>
      </div>

      <div className="pro-card p-6">
        <form action={createJob} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Customer *</label>
            <select name="customerId" required className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950">
              <option value="">Select a customer</option>
              {customerList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Job Title *</label>
            <input name="title" required placeholder="e.g. Frozen pipe in basement" className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Plain English Description</label>
            <textarea name="rawDescription" rows={3} placeholder="Describe the issue as the customer reported it..." className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Service Type *</label>
              <select name="serviceType" required className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950">
                <option value="hvac">HVAC</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Address (if different from customer)</label>
              <input name="addressOverride" className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">City</label>
              <input name="city" className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">State</label>
              <input name="state" defaultValue="MN" className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">ZIP</label>
              <input name="zip" className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Internal Notes</label>
            <textarea name="notes" rows={2} className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-zinc-950" />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit"
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900"
            >
              Create Job
            </button>
            <Link href="/jobs" className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}