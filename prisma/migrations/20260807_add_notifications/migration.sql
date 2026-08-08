-- Reconcile selectedPlanId.
-- This column already exists in production, so IF NOT EXISTS preserves
-- the live schema while making fresh databases reproducible from migrations.
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "selectedPlanId" TEXT;

-- Core in-app notification storage.
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Notification feed lookup.
CREATE INDEX IF NOT EXISTS
"Notification_userId_createdAt_idx"
ON "Notification"("userId", "createdAt");

-- Efficient unread/read lookup.
CREATE INDEX IF NOT EXISTS
"Notification_userId_readAt_idx"
ON "Notification"("userId", "readAt");

-- User ownership with cascade cleanup.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Notification_userId_fkey'
    ) THEN
        ALTER TABLE "Notification"
        ADD CONSTRAINT "Notification_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "User"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
    END IF;
END
$$;
