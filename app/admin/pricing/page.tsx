import AdminLayout from "@/components/admin/AdminLayout";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import PricingForm from "@/components/admin/PricingForm";
import { requireAdmin } from "@/lib/auth/admin";
import { getSettings } from "@/lib/content/content";

export default async function AdminPricingPage() {
  const admin = await requireAdmin();
  const settings = await getSettings();

  const adminName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ") ||
    admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <AdminWorkspace
        eyebrow="Commercial settings"
        title="Pricing"
        description="Manage the headline and subtitle displayed on the public pricing page."
      >
        <div className="space-y-6">
          <PricingForm
            headline={settings.pricing_headline}
            subtitle={settings.pricing_subtitle}
          />

          <aside className="rounded-[var(--mat-radius-xl)] border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-5 sm:p-6">
            <p className="mat-eyebrow">Pricing-management boundary</p>

            <h2 className="mt-1 font-display text-xl text-[var(--mat-ink)]">
              Public copy, not billing configuration
            </h2>

            <p className="mt-3 text-sm leading-6 text-[var(--mat-muted)]">
              This workspace changes only the pricing-page headline and
              subtitle. It does not change subscription amounts, Stripe price
              identifiers, billing intervals, currencies, checkout behavior,
              promotions, or plan visibility.
            </p>

            <p className="mt-3 text-xs leading-5 text-[var(--mat-muted-light)]">
              The current plan prices remain defined outside this content
              settings workflow.
            </p>
          </aside>
        </div>
      </AdminWorkspace>
    </AdminLayout>
  );
}
