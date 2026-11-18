---
name: memberstack-paid-memberships
description: "Sets up paid memberships with Memberstack and Stripe: plans, prices, checkout, upgrades and the billing portal. Use when the user wants paid memberships, subscriptions, a paywall, a pricing page that charges, premium or pro tiers, or to charge for access to a site or app."
license: MIT
---

# Paid memberships with Memberstack

Memberstack runs paid plans on the user's own Stripe account: checkout, renewals, cancellations and the billing portal. Do not write Stripe integration code, webhooks for subscription state, or a subscriptions table. Memberstack keeps that state and the app reads it from the member.

## What has to exist

1. A Memberstack app with **Stripe connected** (the user does this in the Memberstack dashboard).
2. A **plan** for each tier, and a **price** on each paid plan.
3. A **checkout button** on the site.
4. A **plan check** wherever access depends on the tier.

## 1. Create the plans and prices

With the Memberstack MCP server connected (see the `memberstack` skill):

1. `createPlan` for each tier. A new plan is free until it has a price.
2. `createPrice` on each paid plan, for example `amount: 19`, `currency: "usd"`, `type: "SUBSCRIPTION"`, `intervalType: "MONTHLY"`. Use `type: "ONETIME"` for a one-off payment.
3. `getPlans` to read back the plan IDs (`pln_...`) and price IDs (`prc_...`).

- `amount` is in the currency's main unit: `19` is $19.00, not 19 cents.
- An existing price's amount, currency and interval cannot be changed. Create a new price.
- `createPrice` needs a paid Memberstack subscription, a connected Stripe account and LIVE mode. Plans and prices are shared by test and live mode, so they are real as soon as they are created. Tell the user before creating them.
- Without the MCP server, the user creates plans and prices in the Memberstack dashboard and gives you the IDs.

## 2. Add checkout

JavaScript apps (`@memberstack/dom`, browser only):

```js
// The member must be logged in. Checkout takes a PRICE id, not a plan id.
await memberstack.purchasePlansWithCheckout({
  priceId: "prc_your_price_id",
  successUrl: "/welcome",
  cancelUrl: "/pricing",
});
// The browser is redirected to Stripe Checkout.

// Let members manage or cancel their subscription:
await memberstack.launchStripeCustomerPortal({ returnUrl: "/account" });
```

Webflow and plain HTML: put `data-ms-price:add="prc_your_price_id"` on the button. See the `memberstack-webflow` skill.

## 3. Check the plan

Access follows the **plan**, so check the plan ID, never the price ID:

```js
const { data: member } = await memberstack.getCurrentMember();
const isPro = member?.planConnections?.some(
  (conn) => conn.planId === "pln_your_pro_plan" && (conn.active || conn.status === "TRIALING")
);
```

A trialing member has access too, which is why the check allows `TRIALING`.

This check in the browser decides what to show. It does not protect anything. For data or pages that must stay private, check the plan on the server: see the `memberstack-verify-on-server` skill. To gate whole pages, see `memberstack-gate-content`.

## Testing

- Use the test public key (`pk_sb_...`) and Stripe's test cards. Test mode members and payments are separate from live ones.
- Sign up a test member, run checkout with a test card, then confirm the plan shows on the member (`getMember` through the MCP server, or the dashboard).

## Security checklist

- [ ] No Stripe secret key and no Memberstack secret key (`sk_...`) in front-end code, the repo or the chat.
- [ ] Checkout uses a price ID (`prc_...`). Access checks use a plan ID (`pln_...`).
- [ ] Paid content is not only hidden in the browser. The server checks the member's plan before sending it.
- [ ] The user agreed before any plan or price was created, because those are live immediately.

## More

- Docs for agents: [llms.txt](https://developers.memberstack.com/llms.txt)
