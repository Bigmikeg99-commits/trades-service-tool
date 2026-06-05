export const runtime = "nodejs";

import { lucia } from "@/lib/auth/lucia";
import { cookies } from "next/headers";
import "server-only";

import { db } from "@/lib/db";
import { jobs, customers } from "@/lib/db/schema";
import { eq, count, and, gte, lte, isNotNull } from "drizzle-orm";
import { EmptyState } from "@/components/EmptyState";
import { Briefcase, Users, Calendar, FileText, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? "";
  const { user } = await lucia.validateSession(sessionId) as { user: { id: string; name?: string } | null };

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Calculate start of current week (Monday)
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Open Leads count + value
  const openLeads = await db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "lead"));

  const openLeadsCount = openLeads.length;
  const openLeadsValue = openLeads.reduce((sum, j) => sum + (j.quoteTotal || 0), 0);

  // Jobs Scheduled this week
  const scheduledThisWeek = await db
    .select({ count: count() })
    .from(jobs)
    .where(
      and(
        eq(jobs.status, "scheduled"),
        isNotNull(jobs.scheduledStart),
        gte(jobs.scheduledStart, startOfWeek)
      )
    );

  // Quotes Pending
  const [quotesPending] = await db
    .select({ count: count() })
    .from(jobs)
    .where(eq(jobs.status, "quoted"));

  // Total Customers
  const totalCustomersResult = await db.select({ count: count() }).from(customers);

  // Monthly Revenue (completed jobs this month)
  const completedThisMonth = await db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.status, "completed"),
        isNotNull(jobs.updatedAt),
        gte(jobs.updatedAt, startOfMonth),
        lte(jobs.updatedAt, endOfMonth)
      )
    );

  const monthRevenue = completedThisMonth.reduce((sum, j) => sum + (j.quoteTotal || 0), 0);

  // Job status distribution for chart
  const statusCounts = await db.select().from(jobs);
  const statusDistribution = {
    lead: statusCounts.filter(j => j.status === "lead").length,
    quoted: statusCounts.filter(j => j.status === "quoted").length,
    scheduled: statusCounts.filter(j => j.status === "scheduled").length,
    in_progress: statusCounts.filter(j => j.status === "in_progress").length,
    completed: statusCounts.filter(j => j.status === "completed").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tighter">Good morning, {user?.name?.split(" ")[0]}.</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-1">
          Here's what's happening with your field operations today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {/* Open Leads Value */}
        <div className="pro-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Briefcase className="h-4 w-4" />
            Open Leads Value
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tighter">
            ${openLeadsValue.toLocaleString()}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {openLeadsCount} lead{openLeadsCount !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Jobs Scheduled This Week */}
        <div className="pro-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-4 w-4" />
            Scheduled This Week
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tighter">
            {scheduledThisWeek[0]?.count || 0}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Jobs in the next 7 days
          </div>
        </div>

        {/* Quotes Pending */}
        <div className="pro-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <FileText className="h-4 w-4" />
            Quotes Pending
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tighter">
            {quotesPending?.count || 0}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Awaiting customer decision
          </div>
        </div>

        {/* Total Customers */}
        <div className="pro-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Users className="h-4 w-4" />
            Total Customers
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tighter">
            {totalCustomersResult[0]?.count || 0}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Active client base
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="pro-card p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <DollarSign className="h-4 w-4" />
            Revenue This Month
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tighter">
            ${monthRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            From completed jobs
          </div>
        </div>
      </div>

      <div className="pro-card p-8">
        <h2 className="text-xl font-semibold tracking-tight mb-4">Welcome to SoloPro</h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-prose">
          You now have full customer & job management, intelligent quoting, scheduling, a price book, 
          and professional proposal exports. Settings and crew management are live.
        </p>

        {(openLeadsCount + (scheduledThisWeek[0]?.count || 0) + (quotesPending?.count || 0) === 0) && (
          <div className="mt-8">
            <EmptyState
              icon={Briefcase}
              title="Let's get started"
              description="Create your first customer and job to see how the estimator and scheduling work."
              action={{ label: "Create Your First Job", href: "/jobs/new" }}
            />
          </div>
        )}
      </div>

      {/* Job Pipeline Chart */}
      <div className="pro-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold tracking-tight">Job Pipeline</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Current distribution of all jobs</p>
          </div>
          <div className="text-xs text-zinc-500">
            Total: {Object.values(statusDistribution).reduce((a, b) => a + b, 0)} jobs
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {[
            { label: "Open Leads", value: statusDistribution.lead, color: "bg-blue-500" },
            { label: "Quotes Pending", value: statusDistribution.quoted, color: "bg-amber-500" },
            { label: "Scheduled", value: statusDistribution.scheduled, color: "bg-purple-500" },
            { label: "In Progress", value: statusDistribution.in_progress, color: "bg-orange-500" },
            { label: "Completed", value: statusDistribution.completed, color: "bg-emerald-500" },
          ].map((item, index) => {
            const maxValue = Math.max(...Object.values(statusDistribution)) || 1;
            const percentage = (item.value / maxValue) * 100;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-28 text-sm text-zinc-600 dark:text-zinc-400">{item.label}</div>
                <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm font-medium tabular-nums">{item.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}