export const runtime = "nodejs";

import { getCustomer, updateCustomer } from "@/app/actions/customers";
import { getJobsForCustomer } from "@/app/actions/jobs";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  const customerJobs = await getJobsForCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/customers" className="text-sm text-zinc-500 hover:text-zinc-700">← Back to Customers</Link>
          <h1 className="text-4xl font-semibold tracking-tighter mt-1">{customer.name}</h1>
        </div>
        <Link href="/jobs/new" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-zinc-900">
          + New Job for this Customer
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="pro-card p-6 lg:col-span-1">
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
                      <div className="text-xs text-zinc-500 mt-0.5">{job.serviceType.toUpperCase()} • {new Date(job.createdAt!).toLocaleDateString()}</div>
                    </div>
                    <div className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 capitalize">
                      {job.status.replace("_", " ")}
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