# Putting MyAccentTrainer online

Running it on your computer is great for trying it. To give it a real web address
that anyone can visit, you "deploy" it to a host. The smoothest path for this
kind of app is **Vercel** (the company behind Next.js) — it has a free tier and a
click-through setup.

There is one real change needed for production: the app currently uses a simple
file-based database (SQLite) that's perfect locally but doesn't persist on a
cloud host. Online, it should point at a hosted database (e.g. **Neon** or
**Vercel Postgres**, both have free tiers). This is a small, well-understood
change to one config line plus the hosting connection — not a rebuild.

## The shape of it (a developer can do this in under an hour)

1. Put the project in a **GitHub** repository.
2. Create a free **Neon**/**Vercel Postgres** database; copy its connection URL.
3. In `prisma/schema.prisma`, change the datasource `provider` from `sqlite` to
   `postgresql`, and run `npx prisma migrate deploy`.
4. Import the GitHub repo into **Vercel**, paste the database URL and your other
   keys (JWT secret, and Stripe/Azure if you're using them) as environment
   variables, and click **Deploy**.

Vercel gives you a live URL, and every future change you make redeploys
automatically.

## You don't have to do this alone

This last mile is the one part that genuinely needs an account and a few
decisions. When you're ready, I can prepare every file and setting so it's as
close to copy-paste as possible, and walk you through the clicks — or hand a
tidy checklist to any developer and they'll have it live quickly.
