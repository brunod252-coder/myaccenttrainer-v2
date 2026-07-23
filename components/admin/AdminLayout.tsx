import Link from "next/link";
import type { ReactNode } from "react";

import { Grid, Search, Chart, Gear, Book, Arrow } from "@/components/ui/icons";

const nav = [
  { href: "/admin", label: "Overview", Icon: Grid },
  { href: "/admin/users", label: "Users", Icon: Search },
  { href: "/admin/content", label: "Content", Icon: Book },
  { href: "/admin/reports", label: "Reports", Icon: Chart },
  { href: "/admin/settings", label: "Settings", Icon: Gear },
];

export default function AdminLayout({ children, admin }: { children: ReactNode; admin: { name: string } }) {
  return (
    <div className="grid min-h-screen bg-[#f6faf8] md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-[#111c30] px-4 py-6 md:flex">
        <div className="px-2 text-lg font-bold">
          <span className="text-[#3ecb8a]">my</span>
          <span className="mx-1 rounded-md bg-[#20ad68] px-1.5 text-white">ACCENT</span>
          <span className="text-white/80">admin</span>
        </div>
        <span className="mt-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">Control room</span>
        <nav className="mt-8 flex flex-col gap-1">
          {nav.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/5 hover:text-white">
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition hover:text-white">
            <Arrow className="h-4 w-4 rotate-180" /> Back to app
          </Link>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/85 px-6 backdrop-blur">
          <span className="rounded-full bg-[#111c30] px-3 py-1 text-xs font-semibold text-white">Admin</span>
          <span className="text-sm text-gray-500">{admin.name}</span>
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
