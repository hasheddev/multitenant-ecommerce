import type Stripe from "stripe";
import { getPayload } from "payload";
import config from "@payload-config";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { ExpandedLineItem } from "@/modules/checkout/types";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await (await req.blob()).text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "unknown weeoe";

    if (error instanceof Error) console.error("***ERROR***", errMessage);

    return NextResponse.json(
      {
        message: `Webhook Error: ${errMessage}`,
      },
      {
        status: 400,
      }
    );
  }

  console.log("***SUCCESS***", event.id);

  const permittedEvents: string[] = ["checkout.session.completed"];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    let data;

    try {
      switch (event.type) {
        case "checkout.session.completed":
          data = event.data.object as Stripe.Checkout.Session;
          if (!data.metadata?.userId) {
            throw new Error("USER ID REQUIRED!!!");
          }
          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("USER NOT FOUND!!!");
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"],
            }
          );
          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("LINE ITEMS NOT FOUND!!!");
          }
          const lineItems = expandedSession.line_items
            .data as ExpandedLineItem[];
          for (const item of lineItems) {
            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id,
                user: user.id,
                product: item.price.product.metadata.id,
                name: item.price.product.name,
              },
            });
          }
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.error("***ERROR***", error);
      return NextResponse.json(
        {
          message: "Webhook handler failed",
        },
        {
          status: 500,
        }
      );
    }
  }
  return NextResponse.json(
    { message: "Received" },
    {
      status: 200,
    }
  );
}
