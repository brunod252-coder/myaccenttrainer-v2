import Link from "next/link";
import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
  userName?: string | null;
  role?: string | null;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/courses", label: "Courses" },
  { href: "/dashboard/practice", label: "Practice" },
  { href: "/dashboard/progress", label: "Progress" },
  { href: "/dashboard/wallet", label: "Wallet" },
  { href: "/dashboard/referrals", label: "Referrals" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function AppLayout({
  children,
  userName,
  role,
}: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f6faf8] text-[#17223b]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/dashboard" className="text-lg font-bold">
            <span className="text-[#20ad68]">my</span>
            <span className="mx-1 rounded bg-[#20ad68] px-1 text-white">
              ACCENT
            </span>
            <span className="text-[#52719f]">trainer</span>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-right">
              <p className="font-semibold">{userName || "User"}</p>
              {role && <p className="text-xs text-gray-500">{role}</p>}
            </div>

            <form action="/api/auth/logout" method="post">
              <button className="rounded bg-[#20ad68] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#169357]">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[240px_1fr]">
        <aside className="rounded border bg-white p-4 shadow-sm">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-[#e9f8f3] hover:text-[#20ad68]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}