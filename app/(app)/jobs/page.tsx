export const runtime = "nodejs";

import { getJobs } from "@/app/actions/jobs";
import { EmptyState } from "@/components/EmptyState";
import { ClipboardList } from "lucide-react";
import Link from "next/link";

const statuses = ["all", "lead", "quoted", "scheduled", "in_progress", "completed", "cancelled"];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;
  const jobList = await getJobs({ 
    status: status === "all" ? undefined : status, 
    search 
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Jobs</h1>
          <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
            Track and manage all field service work
          </p>
        </div>
        <Link 
          href="/jobs/new" 
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900"
        >
          + New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => {
          const isActive = (status || "all") === s;
          return (
            <Link
              key={s}
              href={`/jobs?status=${s}${search ? `&search=${search}` : ""}`}
              className={`rounded-full px-4 py-1 text-sm capitalize transition-colors ${
                isActive 
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </Link>
          );
        })}
      </div>

      {/* Search (GET form so status filter links + search work together; responds on submit/enter) */}
      <form method="get" className="mb-6 flex gap-2">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search jobs..."
          className="w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button type="submit" className="rounded-lg border px-4 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900">Search</button>
        {search && <Link href="/jobs" className="self-center text-xs text-zinc-500 hover:underline">clear</Link>}
      </form>

      {/* Jobs Table */}
      <div className="pro-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-3 text-left">Job</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {jobList.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="py-8">
                    <EmptyState
                      icon={ClipboardList}
                      title="No jobs yet"
                      description="Start by creating your first job from the button above."
                      action={{ label: "Create New Job", href: "/jobs/new" }}
                    />
                  </div>
                </td>
              </tr>
            )}
            {jobList.map((job) => (
              <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-6 py-4 font-medium">
                  <Link href={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{job.customerName}</td>
                <td className="px-6 py-4 text-sm capitalize">{job.serviceType}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs capitalize dark:bg-zinc-800">
                    {job.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  {new Date(job.createdAt!).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/jobs/${job.id}`} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}