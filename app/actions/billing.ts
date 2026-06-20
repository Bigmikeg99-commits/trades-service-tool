"use server";

import "server-only";

import { db } from "@/lib/db";
import { companySettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const S = require("stripe");
  return new S(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}

// Get or create company settings row
async function getOrCreateSettings() {
  let settings = (await db.select().from(companySettings).limit(1))[0];

  if (!settings) {
    await db.insert(companySettings).values({
      name: "Your Company Name",
    });
    settings = (await db.select().from(companySettings).limit(1))[0];
  }

  return settings!;
}

export async function createCheckoutSession(priceId: string) {
  const stripe = getStripe();
  const settings = await getOrCreateSettings();

  let customerId = settings.stripeCustomerId;

  // The 14-day free trial only ever applies to the Pro plan, and only the first
  // time an account subscribes — once hasUsedTrial is set, future checkouts
  // (including re-subscribing after a cancellation) go straight to a paid start.
  const isProPlan = !!priceId && priceId === process.env.STRIPE_PRO_PRICE_ID;
  const trialEligible = isProPlan && !settings.hasUsedTrial;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    ...(trialEligible
      ? {
          subscription_data: {
            trial_period_days: 14,
            trial_settings: {
              end_behavior: { missing_payment_method: "cancel" },
            },
          },
          // Require a card up front so the trial converts automatically into a
          // real subscription at the end of 14 days with no surprise gap.
          payment_method_collection: "always" as const,
        }
      : {}),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing?canceled=true`,
    customer: customerId || undefined,
    customer_email: !customerId ? settings.email || undefined : undefined,
    metadata: {
      companySettingsId: String(settings.id),
    },
  });

  return { url: session.url };
}

export async function createCustomerPortalSession() {
  const stripe = getStripe();
  const settings = await getOrCreateSettings();

  if (!settings.stripeCustomerId) {
    throw new Error("No Stripe customer found. Please subscribe first.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: settings.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing`,
  });

  // Redirect the user to the Stripe Customer Portal
  redirect(session.url);
}

export async function getSubscriptionStatus() {
  const settings = (await db.select().from(companySettings).limit(1))[0];

  if (!settings) {
    return {
      status: "inactive" as const,
      plan: "free" as const,
      currentPeriodEnd: null,
      hasUsedTrial: false,
    };
  }

  let plan = (settings.subscriptionPlan || "free").toLowerCase();
  if (plan === "starter") plan = "free"; // legacy
  return {
    status: (settings.subscriptionStatus || "inactive") as string,
    plan: plan,
    // While status === "trialing", Stripe's current_period_end IS the trial end date,
    // so this same field doubles as "trial ends on" in the UI.
    currentPeriodEnd: settings.subscriptionCurrentPeriodEnd
      ? new Date(settings.subscriptionCurrentPeriodEnd)
      : null,
    hasUsedTrial: settings.hasUsedTrial ?? false,
  };
}

export async function updateSubscriptionInDb(params: {
  customerId?: string;
  subscriptionId?: string;
  status: string;
  plan?: string;
  currentPeriodEnd?: number;
}) {
  const settings = await getOrCreateSettings();

  await db
    .update(companySettings)
    .set({
      stripeCustomerId: params.customerId || settings.stripeCustomerId,
      subscriptionId: params.subscriptionId || settings.subscriptionId,
      subscriptionStatus: params.status,
      subscriptionPlan: params.plan || settings.subscriptionPlan,
      subscriptionCurrentPeriodEnd: params.currentPeriodEnd
        ? new Date(params.currentPeriodEnd * 1000)
        : settings.subscriptionCurrentPeriodEnd,
      // Once an account ever reaches "trialing", permanently mark the trial as used
      // so a future checkout (even after cancel/resubscribe) won't grant a second one.
      hasUsedTrial: params.status === "trialing" ? true : settings.hasUsedTrial,
      updatedAt: new Date(),
    })
    .where(eq(companySettings.id, settings.id));
}