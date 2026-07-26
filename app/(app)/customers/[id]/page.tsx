export const runtime = "nodejs";

import { getCustomer, updateCustomer, deleteCustomer } from "@/app/actions/customers";
import { getJobsForCustomer } from "@/app/actions/jobs";
import { formatStatus, formatServiceType } from "@/lib/format";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function CustomerDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { id } = await params;
  const { edit } = await searchParams;
  const customer = await getCustomer(id);
  const customerJobs = await getJobsForCustomer(id);

  if (!customer) {
    notFound();
  }

  const isEditing = edit === "1";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/customers" className="text-sm text-zinc-500 hover:text-zinc-700">← Back to Customers</Link>
          <h1 className="text-4xl font-semibold tracking-tighter mt-1">{customer.name}</h1>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Link
              href={`/customers/${id}?edit=1`}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Edit
            </Link>
          )}
          <Link href="/jobs/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900">
            + New Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info / Edit Form */}
        <div className="pro-card p-6 lg:col-span-1">
          {isEditing ? (
            <>
              <h2 className="font-semibold mb-4">Edit Customer</h2>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateCustomer(id, formData);
                  redirect(`/customers/${id}`);
                }}
                className="space-y-4 text-sm"
              >
                <div>
                  <label htmlFor="name" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">Name</label>
                  <input
                    id="name"
                    name="name"
                    defaultValue={customer.name}
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    defaultValue={customer.phone ?? ""}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={customer.email ?? ""}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label htmlFor="addressLine1" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">Address</label>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    defaultValue={customer.addressLine1 ?? ""}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="city" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">City</label>
                    <input id="city" name="city" defaultValue={customer.city ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">State</label>
                    <input id="state" name="state" defaultValue={customer.state ?? "MN"} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950" />
                  </div>
                  <div>
                    <label htmlFor="zip" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">ZIP</label>
                    <input id="zip" name="zip" defaultValue={customer.zip ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950" />
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block font-medium mb-1 text-zinc-700 dark:text-zinc-300">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={customer.notes ?? ""}
                    className="w-full rounded-lg border px-3 py-2 text-sm dark:bg-zinc-950"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900"
                  >
                    Save changes
                  </button>
                  <Link
                    href={`/customers/${id}`}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </Link>
                </div>
              </form>

              {/* Danger Zone */}
              {customerJobs.length === 0 && (
                <div className="mt-8 pt-6 border-t border-red-200 dark:border-red-900">
                  <div className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</div>
                  <p className="text-xs text-zinc-500 mb-3">This customer has no jobs. Deleting is permanent.</p>
                  <form
                    action={async () => {
                      "use server";
                      await deleteCustomer(id);
                      redirect("/customers");
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete customer
                    </button>
                  </form>
                </div>
              )}
              {customerJobs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500">This customer has {customerJobs.length} job{customerJobs.length !== 1 ? "s" : ""} on record. Deletion is disabled to preserve job history.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-zinc-500">Phone:</span> {customer.phone || "—"}</div>
                <div><span className="text-zinc-500">Email:</span> {customer.email || "—"}</div>
                <div><span className="text-zinc-500">Address:</span> {customer.addressLine1 || "—"}</div>
                <div><span className="text-zinc-500">Location:</span> {[customer.city, customer.state, customer.zip].filter(Boolean).join(", ") || "—"}</div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2 text-sm">Notes</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{customer.notes || "No notes yet."}</p>
              </div>
            </>
          )}
        </div>

        {/* Job History */}
        <div className="pro-card p-6 lg:col-span-2">
          <h2 className="font-semibold mb-4">Job History ({customerJobs.length})</h2>

          {customerJobs.length === 0 ? (
            <p className="text-sm text-zinc-500">No jobs recorded for this customer yet.</p>
          ) : (
            <div className="space-y-3">
              {customerJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-lg border p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{formatServiceType(job.serviceType)} • {new Date(job.createdAt!).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      {formatStatus(job.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
