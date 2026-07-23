# MyAccentTrainer — Setup & Activation

Everything runs today with `npm run dev`. This checklist turns on the features
that need a one-time command or your own keys.

## 1. Run it

```
npm install
npm run dev            # http://localhost:3000
```

Register an account at `/register`, then explore `/dashboard`.

## 2. Activate real data (one time)

Two new database features ship guarded, so the app builds and runs without them.
Turn them on together:

```
npx prisma db push     # adds practice-attempt + subscription fields to the DB
```

Then, with the dev server running, load the lessons into the database by visiting
once in your browser (development only):

```
http://localhost:3000/api/dev/seed
```

After this: recorded practice saves (clarity + streak become real), and finishing
a lesson marks it complete (dashboard "lessons completed" and course progress
become real).

## 3. Real pronunciation scoring (Azure) — optional

See `docs/PRONUNCIATION.md`. Three steps: install the SDK, add
`AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION` to `.env`, uncomment one block.

## 4. Payments (Stripe) — optional

See `docs/PAYMENTS.md`. Add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
`STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_APP_URL` to `.env`; the Subscribe button
and webhook then work end-to-end.

## 5. Before production

- Set a strong `JWT_SECRET` in `.env` (currently falls back to a dev default).
- Use live Stripe keys and a deployed `NEXT_PUBLIC_APP_URL`.
- Consider moving from SQLite to Postgres for the database.

## Housekeeping

`_backup_pre_rebuild/` (your original code) and `_to_delete/` (build backups) can
be removed whenever you're ready.
