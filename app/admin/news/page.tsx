import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import ListManager from "@/components/admin/ListManager";
import { requireAdmin } from "@/lib/auth/admin";
import { getNews } from "@/lib/content/content";

export default async function AdminNewsPage() {
  const admin = await requireAdmin();
  const news = await getNews({ adminAll: true });

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Publishing"
        title="News"
        description="Create news entries, control whether they are published, and remove entries that are no longer needed."
      >
        <div className="space-y-6">
          <ListManager
            endpoint="/api/admin/content/news"
            heading="News library"
            blurb="Manage the announcements and updates stored for the public News experience."
            fields={[
              { name: "title", label: "Title" },
              {
                name: "excerpt",
                label: "Excerpt",
                textarea: true,
              },
              {
                name: "dateLabel",
                label: "Date label (e.g. “June 2026”)",
              },
            ]}
            items={news.map((post) => ({
              id: post.id,
              published: post.published,
              title: post.title,
              excerpt: post.excerpt,
              dateLabel: post.dateLabel,
            }))}
            publishKey="published"
          />

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">News-management boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Current administrative capability
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This workspace can create news entries, publish or hide existing
              entries, and delete entries. Editing an existing entry and a
              separate archive state are not currently exposed by the
              underlying management contract.
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
              The date label is display text for the public News experience;
              it is not treated as a canonical publication timestamp.
            </p>
          </aside>
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}
