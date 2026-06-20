export const runtime = "nodejs";

import { lucia } from "@/lib/auth/lucia";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSubscriptionStatus, createCustomerPortalSession } from "@/app/actions/billing";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    redirect("/login");
  }

  const { user } = (await lucia.validateSession(sessionId)) as {
    user: { id: string; name: string; email: string; role: string } | null;
  };

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscriptionStatus();
  const plan = (subscription.plan || "free").toLowerCase();
  const isTrialing = subscription.status === "trialing";
  const isActiveSub = subscription.status === "active" || isTrialing;
  const isFree = plan === "free";
  // Only show upgrade banner for paid plans that are inactive (free users get basic access without nag)
  const showUpgradeBanner = !isFree && !isActiveSub;
  const trialDaysLeft =
    isTrialing && subscription.currentPeriodEnd
      ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Trial Banner - reminds trialing users when the free trial ends */}
      {isTrialing && trialDaysLeft !== null && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-center text-sm dark:bg-blue-950 dark:border-blue-900">
          <span className="text-blue-800 dark:text-blue-200">
            You're on a free trial of Pro — {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left.{" "}
            <Link href="/billing" className="font-medium underline hover:no-underline">
              Manage billing
            </Link>
          </span>
        </div>
      )}

      {/* Subscription Status Banner - only for lapsed paid plans; Free tier users see no banner */}
      {showUpgradeBanner && (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center text-sm dark:bg-amber-950 dark:border-amber-900">
          <span className="text-amber-800 dark:text-amber-200">
            Your subscription is not active.{" "}
            <Link href="/billing" className="font-medium underline hover:no-underline">
              Upgrade now
            </Link>{" "}
            to unlock full features.
          </span>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="border-b bg-white dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <span className="font-semibold tracking-[-1px]">SP</span>
              </div>
              <span className="font-semibold tracking-tight">SoloPro</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/dashboard" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/jobs" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                Jobs
              </Link>
              <Link href="/customers" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                Customers
              </Link>
              <Link href="/schedule" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                Schedule
              </Link>
              <Link href="/pricebook" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                Price Book
              </Link>
              <Link href="/billing" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                Billing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:block">
              {user.name}
            </div>

            {/* Manage Subscription - only show if they have an active paid subscription */}
            {isActiveSub && !isFree && (
              <form action={createCustomerPortalSession}>
                <button 
                  type="submit"
                  className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Manage
                </button>
              </form>
            )}

            <ThemeToggle />
            <form action={logout}>
              <button 
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8 pb-20 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t dark:bg-zinc-950 dark:border-zinc-800 z-50">
        <div className="flex justify-around text-xs py-2">
          <a href="/dashboard" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400">Dashboard</a>
          <a href="/jobs" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400">Jobs</a>
          <a href="/customers" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400">Customers</a>
          <a href="/schedule" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400">Schedule</a>
          <a href="/billing" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400">Billing</a>
          <a href="/settings" className="flex flex-col items-center text-zinc-600 dark:text-zinc-400">Settings</a>
        </div>
      </nav>
    </div>
  );
}