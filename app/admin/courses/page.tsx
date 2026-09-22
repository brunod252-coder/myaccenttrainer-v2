import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import ListManager from "@/components/admin/ListManager";
import { requireAdmin } from "@/lib/auth/admin";
import { getCourses } from "@/lib/content/content";

export default async function AdminCoursesPage() {
  const admin = await requireAdmin();
  const courses = await getCourses();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Learning management"
        title="Courses"
        description="Create course catalog entries, control whether they are published, and remove entries that are no longer needed."
      >
        <div className="space-y-6">
          <ListManager
            endpoint="/api/admin/content/course"
            heading="Course catalog"
            blurb="Manage the course entries stored for MyAccentTrainer."
            fields={[
              { name: "title", label: "Title" },
              {
                name: "description",
                label: "Description",
                textarea: true,
              },
            ]}
            items={courses.map((course) => ({
              id: course.id,
              published: course.isPublished,
              title: course.title,
              description: course.description || "",
            }))}
            publishKey="isPublished"
          />

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">Course-management boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Current administrative capability
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This workspace can create course catalog entries, publish or hide
              existing entries, and delete entries. Editing an existing
              course&apos;s title or description is not currently exposed by
              the underlying management contract.
            </p>
          </aside>
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}
