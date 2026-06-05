export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { Stripe } from "stripe";
import { updateSubscriptionInDb } from "@/app/actions/billing";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const S = require("stripe");
  const Constructor = S.default ?? S;
  return new Constructor(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });
}

// Resolve plan name from a Stripe Price object.
// Prefers lookup_key (set in Stripe dashboard), falls back to matching env var price IDs.
function resolvePlan(price: Stripe.Price): string | undefined {
  if (price.lookup_key === "pro" || price.id === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (price.lookup_key === "team" || price.id === process.env.STRIPE_TEAM_PRICE_ID) return "team";
  return price.lookup_key ?? undefined;
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
            session.subscription as string,
            { expand: ["items.data.price"] }
          );

          const price = subscription.items.data[0]?.price;
          await updateSubscriptionInDb({
            customerId: session.customer as string,
            subscriptionId: subscription.id,
            status: subscription.status,
            plan: price ? resolvePlan(price) : undefined,
            currentPeriodEnd: (subscription as any).current_period_end,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const price = subscription.items.data[0]?.price;

        const newPlan =
          subscription.status === "canceled" || subscription.status === "unpaid"
            ? "free"
            : price ? resolvePlan(price) : undefined;

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