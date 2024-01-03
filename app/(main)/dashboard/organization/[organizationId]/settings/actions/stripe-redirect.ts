"use server";

import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-action";

import { StripeRedirect } from "./schema";
import { InputType, ReturnType } from "./types";

import { absoluteUrl } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@/lib/current-user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import nile from "@/lib/NileServer";

const handler = async (data: InputType): Promise<ReturnType> => {
  //   const { userId, orgId } = auth();
  const user = await currentUser();
  console.log("user: ", user);
  const userId = user.id;
  console.log(userId);

  const headersList = headers();
  console.log(headersList);
  const referer = headersList.get("referer");
  console.log(referer);
  if (!referer) {
    redirect("/");
  }
  const parts = referer.split("/");
  const number = parts[5];
  console.log(number);
  const orgId = number;
  //   const { orgId } = user;
  if (!userId || !orgId || !user) {
    return {
      error: "Unauthorized",
    };
  }

  const settingsUrl = absoluteUrl(`/organization/${orgId}`);

  let url = "";

  try {
    const orgSubscription = await nile.db("user_subscription").where({
      tenant_id: orgId,
      user_id: userId,
    });

    console.log(orgSubscription);

    if (orgSubscription[0] && orgSubscription[0].stripe_customer_id) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: orgSubscription[0].stripe_customer_id,
        return_url: settingsUrl,
      });
      console.log("Exist:", stripeSession);
      url = stripeSession.url;
    } else {
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: settingsUrl,
        cancel_url: settingsUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: "Chatty Pro",
                description: "Unlimited boards for your organization",
              },
              unit_amount: 2000,
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          orgId,
        },
      });
      console.log("New:", stripeSession);
      url = stripeSession.url || "";
    }
  } catch {
    return {
      error: "Something went wrong!",
    };
  }

  revalidatePath(`/organization/${orgId}`);
  return { data: url };
};

export const stripeRedirect = createSafeAction(StripeRedirect, handler);
