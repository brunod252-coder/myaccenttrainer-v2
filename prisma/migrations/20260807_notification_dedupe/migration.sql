-- Add a durable idempotency key for externally-triggered notifications.
ALTER TABLE "Notification"
ADD COLUMN IF NOT EXISTS "dedupeKey" TEXT;

-- A Stripe event, or any future external event, may create at most
-- one notification for a given dedupe key.
CREATE UNIQUE INDEX IF NOT EXISTS
"Notification_dedupeKey_key"
ON "Notification"("dedupeKey");
