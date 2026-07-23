# Running MyAccentTrainer (the simple way)

You only need one thing installed first: **Node.js** (the free runtime that runs
the app). Download the "LTS" version from https://nodejs.org and install it
(just click Next through the installer). You only do this once.

Then, inside the project folder:

1. **Double-click `setup.bat`** — this installs everything and prepares the
   database. It only needs to be done once (it may take a few minutes the first
   time). When it says "Setup complete", close the window.

2. **Double-click `run.bat`** — this starts the app and opens it in your browser
   at `http://localhost:3000`. Leave that black window open while you use it; to
   stop, just close the window.

That's it. Create an account, open the dashboard, and try a lesson with Nina.

---

## Making it a real website (later)

Running it on your computer is perfect for trying it out. To put it online so
anyone can use it at a real web address, see `docs/DEPLOY.md`. That step connects
a hosting account (a few clicks), and a developer can do it in well under an hour
— or I can walk you through the clicks whenever you're ready.

## Optional power-ups (nothing needed to use the app)

- **Real speech scoring** with Azure — `docs/PRONUNCIATION.md`.
- **Payments** with Stripe — `docs/PAYMENTS.md`.
