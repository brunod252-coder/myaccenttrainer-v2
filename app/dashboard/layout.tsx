import { ReactNode } from "react";

import { requireEnrollment } from "@/lib/auth/requireEnrollment";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireEnrollment();

  return <>{children}</>;
}
