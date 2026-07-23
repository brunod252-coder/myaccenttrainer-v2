import AdminLayout from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/auth/admin";
import { getPlatformStats, getLessonStats } from "@/lib/admin/stats";

export default async function AdminReports() {
  const admin = await requireAdmin();
  const [s, lessonStats] = await Promise.all([getPlatformStats(), getLessonStats()]);
  const adminName = [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email;

  const conversion = s.users > 0 ? Math.round((s.subscribers / s.users) * 100) : 0;
  const activation = s.users > 0 ? Math.round((s.attempts > 0 ? Math.min(s.users, s.attempts) : 0) / s.users * 100) : 0;

  const rows: { label: string; value: string }[] = [
    { label: "Total learners", value: String(s.users) },
    { label: "New learners (7 days)", value: String(s.newThisWeek) },
    { label: "Active subscribers", value: String(s.subscribers) },
    { label: "Subscriber conversion", value: `${conversion}%` },
    { label: "Total recordings scored", value: String(s.attempts) },
    { label: "Referral invites sent", value: String(s.invites) },
    { label: "Referrals rewarded", value: String(s.rewarded) },
  ];

  return (
    <AdminLayout admin={{ name: adminName }}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-[#17223b]">Reports</h1>
        <a href="/api/admin/users/export" className="rounded-lg border border-[#20ad68] px-4 py-2.5 text-sm font-semibold text-[#168c56] transition hover:bg-[#e9f8f3]">⬇ Export users CSV</a>
      </div>
      <p className="mt-1 text-sm text-gray-500">Key platform metrics at a glance.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <Big label="Conversion" value={`${conversion}%`} note="learners → subscribers" />
        <Big label="Engagement" value={`${activation}%`} note="learners who've recorded" />
        <Big label="Referral reach" value={String(s.invites)} note="invites sent" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-gray-50 last:border-none">
                <td className="px-5 py-3.5 text-gray-600">{r.label}</td>
                <td className="px-5 py-3.5 text-right font-semibold text-[#17223b]">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lessonStats.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-display text-lg text-[#17223b]">Lesson statistics</h2>
            <p className="text-sm text-gray-500">Which lessons learners practice most, and how clear they sound.</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fbfa] text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3">Lesson</th>
                <th className="px-5 py-3 text-right">Recordings</th>
                <th className="px-5 py-3 text-right">Avg clarity</th>
              </tr>
            </thead>
            <tbody>
              {lessonStats.map((l) => (
                <tr key={l.slug} className="border-b border-gray-50 last:border-none">
                  <td className="px-5 py-3.5 font-medium text-[#17223b]">{l.title}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{l.attempts}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-[#20ad68]">{l.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </AdminLayout>
  );
}

function Big({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 font-display text-4xl text-[#20ad68]">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{note}</p>
    </div>
  );
}
