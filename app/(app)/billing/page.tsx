export const runtime = "nodejs";

import { createCheckoutSession, getSubscriptionStatus, createCustomerPortalSession } from "@/app/actions/billing";
import { redirect } from "next/navigation";
import Link from "next/link";

const PRICING_TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started with the basics",
    features: [
      "Up to 10 jobs per month",
      "Basic quoting & line items",
      "Customer management",
      "Manual job tracking",
    ],
    priceId: null, // No checkout for free
    popular: false,
    tier: "free" as const,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious contractors",
    features: [
      "Unlimited jobs",
      "Advanced quote builder",
      "Scheduling calendar with availability",
      "Price book management",
      "Professional PDF proposals",
      "Crew management (single)",
      "Data export & backup",
      "Priority support",
    ],
    priceId: process.env.STRIPE_PRO_PRICE_ID, // User must set this in .env (lookup_key=pro)
    popular: true,
    tier: "pro" as const,
  },
  {
    name: "Team",
    price: "$59",
    period: "/month",
    description: "For growing teams",
    features: [
      "Everything in Pro",
      "Unlimited jobs",
      "Multi-crew support",
      "Team permissions & roles",
      "Advanced scheduling & conflict detection",
      "Full data export",
    ],
    priceId: process.env.STRIPE_TEAM_PRICE_ID, // User must set this in .env (lookup_key=team)
    popular: false,
    tier: "team" as const,
  },
];

export default async function BillingPage() {
  const subscription = await getSubscriptionStatus();

  const currentPlan = (subscription.plan || "free").toLowerCase();
  const isTrialing = subscription.status === "trialing";
  const isActive = subscription.status === "active" || isTrialing;
  const isPaidActive = isActive && (currentPlan === "pro" || currentPlan === "team");
  const trialEligible = !subscription.hasUsedTrial;

  // Normalize display name
  const currentPlanDisplay = currentPlan === "free" ? "Free" :
    currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  // While trialing, currentPeriodEnd doubles as the trial end date.
  const trialDaysLeft =
    isTrialing && subscription.currentPeriodEnd
      ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tighter">Billing &amp; Plans</h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          Choose the plan that fits your business. All plans include core quoting and customer tools.
        </p>
      </div>

      {/* Current Status */}
      <div className="pro-card p-6 mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-zinc-500">Current Plan</div>
            <div className="text-2xl font-semibold tracking-tight mt-1 flex items-center gap-3">
              {currentPlanDisplay}
              {isActive && !isTrialing && (currentPlan === "pro" || currentPlan === "team") && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  Active
                </span>
              )}
              {isTrialing && (currentPlan === "pro" || currentPlan === "team") && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Free Trial{trialDaysLeft !== null ? ` — ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left` : ""}
                </span>
              )}
              {currentPlan === "free" && (
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  Free
                </span>
              )}
            </div>
            {subscription.currentPeriodEnd && isPaidActive && (
              <div className="text-xs text-zinc-500 mt-1">
                {isTrialing
                  ? `Trial ends ${subscription.currentPeriodEnd.toLocaleDateString()} — your card will then be charged unless you cancel`
                  : `Renews ${subscription.currentPeriodEnd.toLocaleDateString()}`}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Manage Subscription Button - only for active paid subs */}
            {isPaidActive && (
              <form action={createCustomerPortalSession}>
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Manage Subscription
                </button>
              </form>
            )}
            <Link 
              href="/settings" 
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Go to Settings →
            </Link>
          </div>
        </div>
        {!isPaidActive && currentPlan === "free" && (
          <div className="mt-3 text-xs text-zinc-500">
            You're on the Free plan.{" "}
            {trialEligible
              ? "Try Pro free for 14 days — unlimited jobs and advanced features, no charge until the trial ends."
              : "Upgrade for unlimited jobs and advanced features."}
          </div>
        )}
      </div>

      {/* Pricing Tiers with Feature Comparison */}
      <div className="grid md:grid-cols-3 gap-6">
        {PRICING_TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.tier;
          return (
            <div
              key={tier.name}
              className={`pro-card p-8 flex flex-col relative ${
                tier.popular ? "ring-2 ring-zinc-900 dark:ring-white" : ""
              } ${isCurrent ? "border-2 border-emerald-600 dark:border-emerald-400" : ""}`}
            >
              {tier.popular && (
                <div className="mb-4">
                  <span className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-zinc-900">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    CURRENT PLAN
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-zinc-500">{tier.period}</span>}
              </div>

              <div className="mt-1 text-xl font-semibold tracking-tight">{tier.name}</div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{tier.description}</p>

              {tier.tier === "pro" && trialEligible && !isCurrent && (
                <div className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  14-day free trial — no charge until it ends
                </div>
              )}

              <ul className="mt-6 space-y-3 text-sm flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {tier.priceId ? (
                  isCurrent ? (
                    <div className="w-full rounded-lg border border-emerald-600 py-3 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      Current Plan
                    </div>
                  ) : (
                    <form
                      action={async () => {
                        "use server";
                        const { url } = await createCheckoutSession(tier.priceId!);
                        if (url) redirect(url);
                      }}
                    >
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                      >
                        {tier.tier === "pro" && trialEligible
                          ? "Start 14-day free trial"
                          : `${currentPlan === "free" ? "Subscribe" : "Upgrade"} to ${tier.name}`}
                      </button>
                    </form>
                  )
                ) : (
                  <div className={`w-full rounded-lg py-3 text-center text-sm font-medium ${
                    isCurrent ? "border border-emerald-600 text-emerald-700 dark:text-emerald-400" : "border text-zinc-500"
                  }`}>
                    {isCurrent ? "Current Plan" : "Free Forever"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold tracking-tight mb-4">Feature Comparison</h3>
        <div className="pro-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-zinc-800 text-left">
                <th className="px-4 py-3 font-medium text-zinc-500">Feature</th>
                <th className="px-4 py-3 font-medium text-center">Free</th>
                <th className="px-4 py-3 font-medium text-center">Pro</th>
                <th className="px-4 py-3 font-medium text-center">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {[
                ["Jobs per month", "10", "Unlimited", "Unlimited"],
                ["Quote builder", "Basic", "Advanced", "Advanced"],
                ["Scheduling & availability", "—", "✓", "✓"],
                ["PDF proposals & export", "—", "✓", "✓"],
                ["Price book", "—", "✓", "✓"],
                ["Data export / backup", "—", "✓", "✓"],
                ["Crew management", "1 crew", "1 crew", "Multi-crew"],
                ["Team permissions", "—", "—", "✓"],
              ].map(([feature, free, pro, team], i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium">{feature}</td>
                  <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">{free}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400">{pro}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400">{team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-zinc-500">
        New Pro subscriptions include a 14-day free trial — your card is required to start, but you won&apos;t be charged until the trial ends, and you can cancel anytime before then at no cost.
        <br />
        Payments are processed securely by Stripe.
        <br />
        Test mode is enabled — no real charges will be made. Add your keys in .env for live.
      </div>
    </div>
  );
}