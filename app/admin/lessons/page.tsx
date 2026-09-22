import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import LessonManager from "@/components/admin/LessonManager";
import { requireAdmin } from "@/lib/auth/admin";
import { listCustomLessons } from "@/lib/lessons/custom";

export default async function AdminLessonsPage() {
  const admin = await requireAdmin();
  const customLessons = await listCustomLessons({ adminAll: true });

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Learning management"
        title="Lessons"
        description="Create and manage custom pronunciation practice lessons that supplement the built-in lesson catalog."
      >
        <div className="space-y-6">
          <LessonManager
            items={customLessons.map((lesson) => ({
              id: lesson.id,
              subtitle: lesson.subtitle,
              referenceText: lesson.referenceText,
              focus: lesson.focus,
              description: lesson.description,
              published: lesson.published,
              hasAudio: Boolean(lesson.audioBase64),
            }))}
          />

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">Lesson-management boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Custom practice lessons
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This workspace manages administrator-authored custom practice
              lessons. Published custom lessons supplement the built-in
              pronunciation lesson catalog available to learners.
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              You can create custom lessons, change their order, publish or
              hide them, upload or replace optional lesson audio, and delete
              custom lessons.
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
              This workspace does not edit the built-in lesson definitions or
              assign curriculum lessons to course modules. Deleting a custom
              lesson removes that lesson record, while historical learner
              records that reference its lesson slug may remain.
            </p>
          </aside>
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}
