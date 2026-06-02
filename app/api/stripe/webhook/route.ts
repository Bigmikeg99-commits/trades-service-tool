export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { updateSubscriptionInDb } from "@/app/actions/billing";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  // Dynamic import to avoid build-time evaluation issues
  const Stripe = require("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return new NextResponse("Webhook signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await updateSubscriptionInDb({
            customerId: session.customer as string,
            subscriptionId: subscription.id,
            status: subscription.status,
            plan: subscription.items.data[0]?.price.lookup_key || undefined,
            currentPeriodEnd: (subscription as any).current_period_end,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const newPlan = subscription.status === "canceled" || subscription.status === "unpaid" 
          ? "free" 
          : (subscription.items.data[0]?.price.lookup_key || undefined);
        await updateSubscriptionInDb({
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
          status: subscription.status,
          plan: newPlan,
          currentPeriodEnd: (subscription as any).current_period_end,
        });
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe Webhook] Handler error:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}