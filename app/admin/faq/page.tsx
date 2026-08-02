import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminFrequentlyAskedQuestionsPage() {
  const admin = await requireAdmin();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Publishing"
        title="Frequently Asked Questions"
        description="Maintain the questions and answers shown across the public website and learner experience."
      />
    </AdminLayout>
  );
}
