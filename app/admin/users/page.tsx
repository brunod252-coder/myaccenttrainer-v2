import Link from "next/link";

import AdminLayout from "@/components/admin/AdminLayout";
import { requireAdmin } from "@/lib/auth/admin";
import { listUsers } from "@/lib/admin/stats";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdmin();
  const { q } = await searchParams;
  const users = await listUsers(q);
  const adminName = [admin.firstName, admin.lastName].filter(Boolean).join(" ") || admin.email;

  return (
    <AdminLayout admin={{ name: adminName }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-[#17223b]">Users</h1>
          <p className="mt-1 text-sm text-gray-500">{users.length} learner{users.length === 1 ? "" : "s"}{q ? ` matching “${q}”` : ""}.</p>
        </div>
        <a href="/api/admin/users/export" className="rounded-lg border border-[#20ad68] px-4 py-2.5 text-sm font-semibold text-[#168c56] transition hover:bg-[#e9f8f3]">⬇ Export CSV</a>
      </div>

      <form className="mt-5" action="/admin/users" method="get">
        <input
          name="q"
          defaultValue={q || ""}
          placeholder="Search by name or email…"
          className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#20ad68]"
        />
      </form>

      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {users.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#f8fbfa] text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 last:border-none hover:bg-[#f8fbfa]">
                  <td className="px-5 py-3.5 font-medium text-[#17223b]">{u.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (u.role === "ADMIN" ? "bg-[#111c30] text-white" : "bg-[#eef4f9] text-[#52719f]")}>{u.role.toLowerCase()}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/users/${u.id}`} className="text-sm font-semibold text-[#168c56] hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
