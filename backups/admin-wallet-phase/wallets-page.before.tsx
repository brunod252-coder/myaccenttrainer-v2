import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminWalletsPage() {
  const admin = await requireAdmin();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Finance"
        title="Wallets"
        description="Review learner balances, inspect wallet ledgers, and issue audited administrative adjustments."
      />
    </AdminLayout>
  );
}
