import { ReactNode } from "react";

import { requireAuthenticatedUser } from "@/lib/auth/requireAuthenticatedUser";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuthenticatedUser();

  return <>{children}</>;
}
