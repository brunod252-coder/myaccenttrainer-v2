import { ReactNode } from "react";

import { requirePremiumAccess } from "@/lib/auth/requirePremiumAccess";

export default async function PremiumDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requirePremiumAccess();

  return <>{children}</>;
}
