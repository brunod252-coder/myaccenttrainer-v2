# MyAccentTrainer

An AI communication platform that helps people speak English more clearly and
confidently — without losing their own voice. Learners practice pronunciation
with **Nina**, a patient AI coach who listens, scores, and gives encouraging,
sound-by-sound feedback.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**,
**Tailwind CSS v4**, and **Prisma 7** (SQLite in development).

## Quick start

```bash
npm install
npx prisma db push          # create the database schema
npm run dev                 # http://localhost:3000
```

Then, with the dev server running, load the starter lessons once (development
only): open `http://localhost:3000/api/dev/seed`.

Register an account at `/register` and open `/dashboard`.

Full activation steps (real scoring, payments, production notes) are in
[`docs/SETUP.md`](docs/SETUP.md).

## What's inside

- **Marketing site** — landing, about, courses, prices, news, FAQs.
- **Accounts** — email/password auth with JWT sessions (`mat_session` cookie).
- **Dashboard** — clarity, streak, lessons, and course progress from real data.
- **Practice with Nina** — record your voice, get a real pronunciation score,
  a sound-by-sound breakdown, and a coaching tip. Five lessons to start.
- **Progress, Wallet, Referrals, Settings** — wired to the database.
- **Payments** — Stripe Checkout + subscription webhook (keyless-safe until you
  add keys).

## Project structure

```
app/
  (marketing)        page.tsx, about, courses, prices, news, faqs
  login, register    split-screen auth
  dashboard/         dashboard, practice, lesson/[id], courses, progress,
                     wallet, referrals, settings
  api/               auth, pronunciation/score, lessons/complete,
                     checkout, stripe/webhook, dev/seed
components/          site, home, cards, layouts, auth, app, lesson, ui
lib/
  jwt, password, prisma
  lessons/           static lesson content + helpers
  pronunciation/     recorder, mock scorer, Azure scorer, attempts
  payments/          subscription helpers
prisma/              schema.prisma + migrations
docs/                SETUP, PRONUNCIATION, PAYMENTS, NINA
```

## Configuration

Copy `.env.example` to `.env` and fill in what you need. Nothing is required to
run in development; each key unlocks a feature:

- `JWT_SECRET` — set a strong value before production.
- `AZURE_SPEECH_KEY` / `AZURE_SPEECH_REGION` — real pronunciation scoring
  (see [`docs/PRONUNCIATION.md`](docs/PRONUNCIATION.md)).
- `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` /
  `NEXT_PUBLIC_APP_URL` — payments (see [`docs/PAYMENTS.md`](docs/PAYMENTS.md)).

## Notes

- SQLite is used for development; switch the Prisma datasource to Postgres for
  production.
- Nina's voice and teaching philosophy live in [`docs/NINA.md`](docs/NINA.md).
