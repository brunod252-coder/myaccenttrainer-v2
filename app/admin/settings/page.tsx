import AdminLayout from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/auth/admin";
import { getIntegrationStatus } from "@/lib/admin/stats";

export default async function AdminSettings() {
  const admin = await requireAdmin();
  const integrations = getIntegrationStatus();
  const adminName = [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <h1 className="font-display text-3xl text-[#17223b]">System settings</h1>
      <p className="mt-1 text-sm text-gray-500">Integration status. Each feature is keyless-safe — the app runs without any of these and lights up when configured.</p>

      <div className="mt-6 space-y-3">
        {integrations.map((it) => (
          <div key={it.key} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <span className={"flex h-10 w-10 items-center justify-center rounded-full text-lg " + (it.ok ? "bg-[#e9f8f3] text-[#20ad68]" : "bg-[#f1f5f9] text-[#94a3b8]")}>
              {it.ok ? "✓" : "○"}
            </span>
            <div className="flex-1">
              <p className="font-semibold text-[#17223b]">{it.key}</p>
              <p className="text-sm text-gray-500">{it.detail}</p>
            </div>
            <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (it.ok ? "bg-[#e5f3ec] text-[#2e7d5b]" : "bg-[#eef4f9] text-[#52719f]")}>{it.note}</span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
