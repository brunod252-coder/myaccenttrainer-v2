import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminCurriculumReadModels } from "@/lib/curriculum";

export default async function AdminModulesPage() {
  const admin = await requireAdmin();
  const courses = await getAdminCurriculumReadModels();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  const moduleCount = courses.reduce(
    (total, course) => total + course.modules.length,
    0,
  );

  const lessonCount = courses.reduce(
    (total, course) =>
      total +
      course.modules.reduce(
        (moduleTotal, module) => moduleTotal + module.lessons.length,
        0,
      ),
    0,
  );

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Curriculum structure"
        title="Modules"
        description="Inspect the durable course, module, and curriculum-lesson hierarchy used by the learner experience."
      >
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Courses" value={courses.length} />
            <SummaryCard label="Modules" value={moduleCount} />
            <SummaryCard label="Curriculum lessons" value={lessonCount} />
          </section>

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">Curriculum authority</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Read-only structure view
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This workspace shows the durable Course → Module → Lesson
              hierarchy, including records that are not currently visible to
              learners.
            </p>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              Module structure and ordering are currently maintained by the
              curriculum synchronization architecture. This page does not
              create, edit, reorder, publish, hide, or delete modules.
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
              Modules do not have their own publication flag. Learner
              visibility is determined by course publication, lesson
              publication, and whether a module contains learner-visible
              lessons.
            </p>
          </aside>

          {courses.length === 0 ? (
            <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-8 text-center shadow-[var(--mat-shadow-sm)]">
              <h2 className="font-display text-xl text-[var(--mat-ink)]">
                No curriculum hierarchy found
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--mat-muted)]">
                No durable Course → Module → Lesson records are currently
                available in the curriculum database.
              </p>
            </section>
          ) : (
            <div className="space-y-6">
              {courses.map((course) => (
                <section
                  key={course.id}
                  className="overflow-hidden rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white shadow-[var(--mat-shadow-sm)]"
                >
                  <div className="border-b border-[var(--mat-border)] p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-2xl text-[var(--mat-ink)]">
                            {course.title}
                          </h2>

                          <StatusBadge
                            published={course.isPublished}
                            publishedLabel="Course published"
                            hiddenLabel="Course hidden"
                          />
                        </div>

                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
                          {course.slug}
                        </p>

                        {course.description ? (
                          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mat-muted)]">
                            {course.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="text-right text-xs leading-5 text-[var(--mat-muted-light)]">
                        <p>Course order: {course.sortOrder}</p>
                        <p>
                          {course.modules.length}{" "}
                          {course.modules.length === 1 ? "module" : "modules"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {course.modules.length === 0 ? (
                    <div className="p-6 text-sm text-[var(--mat-muted)]">
                      This course currently has no durable modules.
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--mat-border)]">
                      {course.modules.map((module) => (
                        <div key={module.id} className="p-5 sm:p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="mat-eyebrow">Module</p>

                              <h3 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
                                {module.title}
                              </h3>

                              {module.description ? (
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--mat-muted)]">
                                  {module.description}
                                </p>
                              ) : null}
                            </div>

                            <div className="text-right text-xs leading-5 text-[var(--mat-muted-light)]">
                              <p>Module order: {module.sortOrder}</p>
                              <p>
                                {module.lessons.length}{" "}
                                {module.lessons.length === 1
                                  ? "lesson"
                                  : "lessons"}
                              </p>
                            </div>
                          </div>

                          {module.lessons.length === 0 ? (
                            <div className="mt-4 rounded-[var(--mat-radius-lg)] border border-dashed border-[var(--mat-border)] bg-[var(--mat-surface-soft)] p-4 text-sm text-[var(--mat-muted)]">
                              Empty module — no durable curriculum lessons are
                              assigned.
                            </div>
                          ) : (
                            <div className="mt-4 overflow-hidden rounded-[var(--mat-radius-lg)] border border-[var(--mat-border)]">
                              <div className="divide-y divide-[var(--mat-border)]">
                                {module.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-semibold text-[var(--mat-ink)]">
                                          {lesson.title}
                                        </p>

                                        <StatusBadge
                                          published={lesson.isPublished}
                                          publishedLabel="Published"
                                          hiddenLabel="Hidden"
                                        />
                                      </div>

                                      <p className="mt-1 text-xs text-[var(--mat-muted-light)]">
                                        {lesson.slug}
                                      </p>

                                      {lesson.description ? (
                                        <p className="mt-2 text-sm leading-6 text-[var(--mat-muted)]">
                                          {lesson.description}
                                        </p>
                                      ) : null}
                                    </div>

                                    <p className="shrink-0 text-xs text-[var(--mat-muted-light)]">
                                      Lesson order: {lesson.sortOrder}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)]">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--mat-muted-light)]">
        {label}
      </p>

      <p className="mt-2 font-display text-3xl text-[var(--mat-ink)]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  published,
  publishedLabel,
  hiddenLabel,
}: {
  published: boolean;
  publishedLabel: string;
  hiddenLabel: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        published
          ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]"
          : "border-[var(--mat-border)] bg-[var(--mat-surface-soft)] text-[var(--mat-muted)]",
      ].join(" ")}
    >
      {published ? publishedLabel : hiddenLabel}
    </span>
  );
}
