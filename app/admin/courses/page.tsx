import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { requireAdmin } from "@/lib/auth/admin";

export default async function AdminCoursesPage() {
  const admin = await requireAdmin();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Learning management"
        title="Courses"
        description="Create, organize, publish, and maintain the training programs available to learners."
      />
    </AdminLayout>
  );
}
