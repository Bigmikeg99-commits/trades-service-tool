export const runtime = "nodejs";

import { 
  getCompanySettings, 
  updateCompanySettings, 
  createCrewMember, 
  updateCrewMember, 
  toggleCrewActive,
  getActiveCrew 
} from "@/app/actions/settings";
import "server-only";

import { db } from "@/lib/db";
import { crewMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ExportDataButton } from "@/components/ExportDataButton";
import { ImportDataButton } from "@/components/ImportDataButton";

export default async function SettingsPage() {
  const company = await getCompanySettings();
  const crew = await db.select().from(crewMembers).orderBy(crewMembers.name);

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tighter">Settings</h1>
        <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
          Manage your company profile, crew, and future billing options.
        </p>
      </div>

      {/* Company Profile */}
      <div className="pro-card p-6 mb-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Company Profile</h2>
        <p className="text-sm text-zinc-500 mb-4">This information appears on all proposals and PDFs.</p>

        <form action={updateCompanySettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input 
                name="name" 
                defaultValue={company?.name || ""} 
                className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="phone" defaultValue={company?.phone || ""} className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" defaultValue={company?.email || ""} className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input name="addressLine1" defaultValue={company?.addressLine1 || ""} className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input name="city" defaultValue={company?.city || ""} className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input name="state" defaultValue={company?.state || "MN"} className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ZIP</label>
                <input name="zip" defaultValue={company?.zip || ""} className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="font-medium mb-3 text-sm">Licenses (shown on proposals)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">HVAC License #</label>
                <input name="licenseHvac" defaultValue={company?.licenseHvac || ""} className="w-full rounded border px-3 py-1.5 text-sm dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Plumbing License #</label>
                <input name="licensePlumbing" defaultValue={company?.licensePlumbing || ""} className="w-full rounded border px-3 py-1.5 text-sm dark:bg-zinc-950" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Electrical License #</label>
                <input name="licenseElectrical" defaultValue={company?.licenseElectrical || ""} className="w-full rounded border px-3 py-1.5 text-sm dark:bg-zinc-950" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
              <input 
                name="defaultTaxRate" 
                type="number" 
                step="0.01" 
                defaultValue={company?.defaultTaxRate || 8.875} 
                className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Terms (shown on proposals)</label>
              <textarea 
                name="defaultTerms" 
                rows={2} 
                defaultValue={company?.defaultTerms || ""} 
                className="w-full rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" 
              />
            </div>
          </div>

          <button 
            type="submit"
            className="mt-4 rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900"
          >
            Save Company Settings
          </button>
        </form>
      </div>

      {/* Crew Management */}
      <div className="pro-card p-6 mb-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Crew Management</h2>
        
        <form action={createCrewMember} className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input name="name" placeholder="Name" required className="md:col-span-2 rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
          <input name="title" placeholder="Title (e.g. Lead Tech)" className="md:col-span-2 rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
          <input name="phone" placeholder="Phone" className="rounded-lg border px-4 py-2 text-sm dark:bg-zinc-950" />
          <input name="color" type="color" defaultValue="#3b82f6" className="h-10 w-12 rounded border p-1 dark:bg-zinc-950" />
          <button type="submit" className="rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-black dark:bg-white dark:text-zinc-900">Add Crew</button>
        </form>

        <div className="space-y-2">
          {crew.length === 0 && <div className="text-sm text-zinc-500">No crew members yet.</div>}
          {crew.map((member) => (
            <div key={member.id} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: member.color }} />
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-zinc-500">{member.title} • {member.phone}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form action={async (formData) => {
                  "use server";
                  const active = formData.get("active") === "true";
                  await toggleCrewActive(member.id, active);
                }}>
                  <input type="hidden" name="active" value={(!member.active).toString()} />
                  <button type="submit" className={`text-xs px-3 py-1 rounded ${member.active ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-600"}`}>
                    {member.active ? "Active" : "Inactive"}
                  </button>
                </form>
                <details>
                  <summary className="text-xs cursor-pointer px-3 py-1 border rounded">Edit</summary>
                  <form action={async (formData) => {
                    "use server";
                    await updateCrewMember(member.id, formData);
                  }} className="mt-2 space-y-2">
                    <input name="name" defaultValue={member.name} className="w-full border rounded px-3 py-1 text-sm" />
                    <input name="title" defaultValue={member.title || ""} className="w-full border rounded px-3 py-1 text-sm" />
                    <input name="color" type="color" defaultValue={member.color} className="h-8" />
                    <button type="submit" className="text-xs bg-zinc-900 text-white px-3 py-1 rounded">Save</button>
                  </form>
                </details>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Link */}
      <div className="pro-card p-6 mb-8">
        <h2 className="text-xl font-semibold tracking-tight mb-2">Billing &amp; Subscriptions</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Manage your subscription and view available plans.
        </p>
        <Link
          href="/billing"
          className="inline-flex items-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900"
        >
          Go to Billing Page →
        </Link>
      </div>

      {/* Data Export / Import */}
      <div className="pro-card p-6">
        <h2 className="text-xl font-semibold tracking-tight mb-2">Data Backup &amp; Restore</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Export all your data as a JSON file (customers, jobs, line items, price book, company settings).
          Use the matching JSON to import/restore (duplicates by ID are skipped safely; relations preserved by insert order).
          Pro/Team feature.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ExportDataButton />
          <ImportDataButton />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Import will add new records only. Existing records with the same IDs are left unchanged.
          Errors (e.g. bad references) are reported per item.
        </p>
      </div>
    </div>
  );
}