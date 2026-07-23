import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/auth/admin";
import { getPlatformStats } from "@/lib/admin/stats";

export default async function AdminOverview() {
  const admin = await requireAdmin();
  const s = await getPlatformStats();
  const adminName = [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email;

  const tiles: { label: string; value: string | number; hint?: string }[] = [
    { label: "Total learners", value: s.users, hint: `${s.newThisWeek} new this week` },
    { label: "Active subscribers", value: s.subscribers },
    { label: "Recordings scored", value: s.attempts },
    { label: "Stored recordings", value: s.recordings },
    { label: "Referral invites", value: s.invites, hint: `${s.rewarded} rewarded` },
    { label: "Admins", value: s.admins },
  ];

  return (
    <AdminLayout admin={{ name: adminName }}>
      <h1 className="font-display text-3xl text-[#17223b]">Platform overview</h1>
      <p className="mt-1 text-sm text-gray-500">A live snapshot of MyAccentTrainer.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">{t.label}</p>
            <p className="mt-2 font-display text-4xl text-[#17223b]">{t.value}</p>
            {t.hint && <p className="mt-1 text-xs font-semibold text-[#20ad68]">{t.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/users" className="rounded-lg bg-[#20ad68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#169357]">Manage users</Link>
        <Link href="/admin/reports" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">View reports</Link>
      </div>
    </AdminLayout>
  );
}
