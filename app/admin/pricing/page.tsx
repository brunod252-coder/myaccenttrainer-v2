import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminPricingPage() {
  const admin = await requireAdmin();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Commercial settings"
        title="Pricing"
        description="Manage subscription presentation, billing descriptions, promotional messaging, and plan visibility."
      />
    </AdminLayout>
  );
}
