import Link from "next/link";
import { notFound } from "next/navigation";

import AdminLayout from "@/components/admin/AdminLayout";
import { Arrow } from "@/components/ui/icons";
import { requireAdmin } from "@/lib/auth/admin";
import { getUserDetail, getUserRecordings } from "@/lib/admin/stats";

function money(minor: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100);
}

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [u, recordings] = await Promise.all([getUserDetail(id), getUserRecordings(id)]);
  if (!u) notFound();
  const adminName = [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email;

  const facts: { label: string; value: string }[] = [
    { label: "Clarity", value: u.clarity !== null ? String(u.clarity) : "New" },
    { label: "Recordings scored", value: String(u.attempts) },
    { label: "Stored recordings", value: String(u.recordings) },
    { label: "Lessons completed", value: String(u.lessonsCompleted) },
    { label: "Wallet balance", value: money(u.walletMinor) },
    { label: "Invites sent", value: String(u.invitesSent) },
  ];

  return (
    <AdminLayout admin={{ name: adminName }}>
      <Link href="/admin/users" className="inline-flex items-center gap-1 text-sm font-semibold text-[#168c56] hover:underline">
        <Arrow className="h-4 w-4 rotate-180" /> All users
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#20ad68] text-xl font-semibold text-white">
          {(u.name !== "—" ? u.name : u.email).slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl text-[#17223b]">{u.name}</h1>
          <p className="text-sm text-gray-500">{u.email}</p>
        </div>
        <span className={"ml-auto rounded-full px-3 py-1 text-xs font-semibold " + (u.role === "ADMIN" ? "bg-[#111c30] text-white" : "bg-[#eef4f9] text-[#52719f]")}>{u.role.toLowerCase()}</span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-[#17223b]">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Item label="Joined" value={new Date(u.createdAt).toLocaleDateString()} />
            <Item label="Email verified" value={u.emailVerified === null ? "—" : u.emailVerified ? "Yes" : "No"} />
            <Item label="Subscription" value={u.subscriptionStatus || "None"} />
            <Item label="Country" value={u.country || "—"} />
            <Item label="Native language" value={u.nativeLanguage || "—"} />
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-[#17223b]">Progress</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border border-gray-100 bg-[#f8fbfa] p-4">
                <p className="text-xs text-gray-500">{f.label}</p>
                <p className="mt-1 font-display text-xl text-[#17223b]">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {recordings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-[#17223b]">Recent recordings</h2>
          <p className="mt-1 text-sm text-gray-500">Listen to this learner&apos;s latest takes.</p>
          <div className="mt-4 space-y-3">
            {recordings.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-[#f8fbfa] p-4">
                <div className="min-w-[130px]">
                  <p className="text-sm font-semibold text-[#17223b]">{r.focus || "Practice"}</p>
                  <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                {typeof r.overall === "number" && (
                  <span className="rounded-full bg-[#e9f8f3] px-2.5 py-1 text-xs font-semibold text-[#168c56]">{r.overall}%</span>
                )}
                <audio controls preload="none" src={`/api/admin/recordings/${r.id}`} className="h-9 flex-1 min-w-[220px]" />
              </div>
            ))}
          </div>
        </div>
      )}

    </AdminLayout>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-[#17223b]">{value}</dd>
    </div>
  );
}

