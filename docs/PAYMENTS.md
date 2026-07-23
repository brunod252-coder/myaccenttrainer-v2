# Payments (Stripe)

The subscription checkout and its fulfillment webhook are wired end-to-end and
work the moment you add your Stripe keys. Until then, the **Subscribe** button on
the Wallet page politely says payments aren't set up — nothing breaks, and no
package needs installing (both the checkout route and the webhook call/verify
Stripe directly, no SDK).

## What's included

- `app/api/checkout/route.ts` — creates a Stripe Checkout session and returns
  its URL.
- `components/app/CheckoutButton.tsx` — the Wallet "Subscribe" button.
- `app/api/stripe/webhook/route.ts` — verifies Stripe's signature and marks the
  user's subscription **active** on `checkout.session.completed` (and canceled on
  subscription deletion).
- `lib/payments/subscription.ts` — reads/writes the subscription fields on the
  user (used by the webhook and the Wallet page's "Active" badge).

A successful payment marks the user active — it does **not** add wallet credit,
so your "learning credit" balance stays clean.

## Turn it on

1. In [Stripe](https://dashboard.stripe.com), create a **Product** with a
   recurring **Price** and copy the price ID (`price_…`).

2. Add to `.env` (use **test** keys while developing):

   ```
   STRIPE_SECRET_KEY="sk_test_…"
   STRIPE_PRICE_ID="price_…"
   STRIPE_WEBHOOK_SECRET="whsec_…"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. Add the subscription fields to the database (one time):

   ```
   npx prisma db push
   ```

4. Restart `npm run dev`. Click **Subscribe** on the Wallet page and pay with
   Stripe's test card `4242 4242 4242 4242` (any future expiry / any CVC).

## Testing the webhook locally

Use the Stripe CLI to forward events to your local server:

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

It prints a `whsec_…` signing secret — put that in `STRIPE_WEBHOOK_SECRET`.
After a test payment, the Wallet page shows an **Active** badge.
