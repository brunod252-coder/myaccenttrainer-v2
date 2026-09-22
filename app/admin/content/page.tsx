import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { requireAdmin } from "@/lib/auth/admin";

const workspaces = [
  {
    href: "/admin/courses",
    eyebrow: "Catalog",
    title: "Courses",
    description:
      "Create, publish, hide, and remove course catalog entries.",
    action: "Open Courses",
  },
  {
    href: "/admin/modules",
    eyebrow: "Curriculum",
    title: "Modules",
    description:
      "Inspect the durable Course → Module → Lesson structure and ordering.",
    action: "Open Modules",
  },
  {
    href: "/admin/lessons",
    eyebrow: "Learning content",
    title: "Lessons",
    description:
      "Create and manage custom lessons, publication state, ordering, and lesson audio.",
    action: "Open Lessons",
  },
  {
    href: "/admin/news",
    eyebrow: "Public content",
    title: "News",
    description:
      "Create, publish, hide, and remove public news and announcement entries.",
    action: "Open News",
  },
  {
    href: "/admin/faq",
    eyebrow: "Public content",
    title: "FAQ",
    description:
      "Create, publish, hide, and remove questions shown on the public FAQ page.",
    action: "Open FAQ",
  },
  {
    href: "/admin/pricing",
    eyebrow: "Public content",
    title: "Pricing",
    description:
      "Manage pricing-page headline and subtitle copy without changing plan amounts.",
    action: "Open Pricing",
  },
] as const;

export default async function AdminContentPage() {
  const admin = await requireAdmin();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Content operations"
        title="Content"
        description="Use the dedicated administration workspaces below as the canonical destinations for curriculum and public-content operations."
      >
        <div className="space-y-6">
          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">Canonical workspaces</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              One management surface per responsibility
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mat-muted)]">
              Content operations are separated into focused workspaces so the
              same records are not administered from multiple competing
              screens.
            </p>

            <p className="mt-3 max-w-3xl text-xs leading-5 text-[var(--mat-muted-light)]">
              Modules is intentionally a read-only curriculum structure view.
              Pricing manages public pricing-page copy; plan amounts and
              billing identifiers remain outside that workspace.
            </p>
          </aside>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.href}
                href={workspace.href}
                className="group flex min-h-56 flex-col rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--mat-border-green)] hover:shadow-[var(--mat-shadow-md)] sm:p-6"
              >
                <p className="mat-eyebrow">{workspace.eyebrow}</p>

                <h2 className="mt-2 font-display text-2xl text-[var(--mat-ink)]">
                  {workspace.title}
                </h2>

                <p className="mt-3 flex-1 text-sm leading-6 text-[var(--mat-muted)]">
                  {workspace.description}
                </p>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--mat-green-700)]">
                  {workspace.action}
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </section>

          <section className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border)] bg-white p-5 shadow-[var(--mat-shadow-sm)] sm:p-6">
            <p className="mat-eyebrow">Operating boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Content hub, not a second editor
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--mat-muted)]">
              This page provides navigation only. Creating, publishing,
              updating, ordering, or removing content happens inside the
              corresponding dedicated workspace.
            </p>
          </section>
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}
