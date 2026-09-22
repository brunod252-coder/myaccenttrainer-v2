import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import ListManager from "@/components/admin/ListManager";
import { requireAdmin } from "@/lib/auth/admin";
import { getFaqs } from "@/lib/content/content";

export default async function AdminFrequentlyAskedQuestionsPage() {
  const admin = await requireAdmin();
  const faqs = await getFaqs({ adminAll: true });

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Publishing"
        title="Frequently Asked Questions"
        description="Create FAQ entries, control whether they are published, and remove entries that are no longer needed."
      >
        <div className="space-y-6">
          <ListManager
            endpoint="/api/admin/content/faq"
            heading="FAQ library"
            blurb="Manage the questions and answers stored for the public FAQ experience."
            fields={[
              { name: "question", label: "Question" },
              {
                name: "answer",
                label: "Answer",
                textarea: true,
              },
            ]}
            items={faqs.map((faq) => ({
              id: faq.id,
              published: faq.published,
              question: faq.question,
              answer: faq.answer,
            }))}
            publishKey="published"
          />

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">FAQ-management boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Current administrative capability
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This workspace can create FAQ entries, publish or hide existing
              entries, and delete entries. Editing the question or answer of an
              existing FAQ entry is not currently exposed by the underlying
              management contract.
            </p>
          </aside>
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}
