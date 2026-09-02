-- Billing integrity:
-- one persisted checkout attempt per MyAccentTrainer user.

CREATE TABLE "CheckoutAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATING',
    "stripeCheckoutSessionId" TEXT,
    "stripeCheckoutUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutAttempt_pkey"
        PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX
    "CheckoutAttempt_userId_key"
ON "CheckoutAttempt"("userId");

CREATE UNIQUE INDEX
    "CheckoutAttempt_attemptKey_key"
ON "CheckoutAttempt"("attemptKey");

CREATE UNIQUE INDEX
    "CheckoutAttempt_stripeCheckoutSessionId_key"
ON "CheckoutAttempt"("stripeCheckoutSessionId");

CREATE INDEX
    "CheckoutAttempt_status_updatedAt_idx"
ON "CheckoutAttempt"("status", "updatedAt");

ALTER TABLE "CheckoutAttempt"
ADD CONSTRAINT "CheckoutAttempt_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
