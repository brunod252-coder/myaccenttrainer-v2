import { prisma } from "@/lib/prisma";

export type AdminWalletUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  currencyCode: string;
  balanceMinor: number;
  transactionCount: number;
};

export type AdminWalletTransaction = {
  id: string;
  type: string;
  amountMinor: number;
  currencyCode: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
};

export type AdminWalletDetail = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  wallet: {
    id: string | null;
    currencyCode: string;
    balanceMinor: number;
  };
  transactions: AdminWalletTransaction[];
};

export async function listAdminWalletUsers(
  query?: string,
): Promise<AdminWalletUser[]> {
  const q = query?.trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" } },
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    take: 250,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      wallet: {
        select: {
          currencyCode: true,
          transactions: {
            select: {
              amountMinor: true,
            },
          },
        },
      },
    },
  });

  return users.map((user) => {
    const transactions = user.wallet?.transactions ?? [];

    return {
      id: user.id,
      email: user.email,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
      role: user.role,
      currencyCode: user.wallet?.currencyCode || "USD",
      balanceMinor: transactions.reduce(
        (sum, transaction) => sum + transaction.amountMinor,
        0,
      ),
      transactionCount: transactions.length,
    };
  });
}

export async function getAdminWalletDetail(
  userId: string,
): Promise<AdminWalletDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      wallet: {
        select: {
          id: true,
          currencyCode: true,
          transactions: {
            orderBy: {
              createdAt: "desc",
            },
            take: 50,
            select: {
              id: true,
              type: true,
              amountMinor: true,
              currencyCode: true,
              description: true,
              referenceType: true,
              referenceId: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const transactions = user.wallet?.transactions ?? [];

  return {
    user: {
      id: user.id,
      email: user.email,
      name:
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
      role: user.role,
    },
    wallet: {
      id: user.wallet?.id ?? null,
      currencyCode: user.wallet?.currencyCode || "USD",
      balanceMinor: transactions.reduce(
        (sum, transaction) => sum + transaction.amountMinor,
        0,
      ),
    },
    transactions,
  };
}
