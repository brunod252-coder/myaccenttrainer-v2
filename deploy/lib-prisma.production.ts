// @ts-nocheck — production reference file; uses @prisma/adapter-pg, installed only at deploy time.
// ── Production database client (Postgres) ────────────────────────────
// Use this version of lib/prisma.ts when deploying to the cloud.
// It connects to a hosted Postgres database (Prisma Postgres, Neon,
// Supabase, etc.) instead of the local SQLite file used in development.
//
// To go live: replace the contents of `lib/prisma.ts` with this file.
// Requires these packages (see package.json.changes.md):
//   npm install @prisma/adapter-pg pg
//   npm install -D @types/pg

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
