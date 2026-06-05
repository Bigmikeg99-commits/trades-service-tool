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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
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
    return { status: "inactive" as const, plan: "free" as const };
  }

  let plan = (settings.subscriptionPlan || "free").toLowerCase();
  if (plan === "starter") plan = "free"; // legacy
  return {
    status: (settings.subscriptionStatus || "inactive") as string,
    plan: plan,
    currentPeriodEnd: settings.subscriptionCurrentPeriodEnd
      ? new Date(settings.subscriptionCurrentPeriodEnd)
      : null,
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
      updatedAt: new Date(),
    })
    .where(eq(companySettings.id, settings.id));
}