"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Grid, Book, Mic, Chart, Wallet, Gift, Gear, Menu, Logout } from "@/components/ui/icons";

const items = [
  { href: "/dashboard", label: "Dashboard", Icon: Grid },
  { href: "/dashboard/courses", label: "Courses", Icon: Book },
  { href: "/dashboard/practice", label: "Practice", Icon: Mic },
  { href: "/dashboard/progress", label: "Progress", Icon: Chart },
  { href: "/dashboard/wallet", label: "Wallet", Icon: Wallet },
  { href: "/dashboard/referrals", label: "Referrals", Icon: Gift },
  { href: "/dashboard/settings", label: "Settings", Icon: Gear },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#17223b]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[#142b4c] px-4 py-6 text-white">
            <div className="flex items-center justify-between px-2">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-lg font-bold">
                <span className="text-[#3ecb8a]">my</span>
                <span className="mx-1 rounded-md bg-[#20ad68] px-1.5 text-white">ACCENT</span>
                <span className="text-white/80">trainer</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-2xl leading-none text-white/60"
              >
                ×
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {items.map(({ href, label, Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
                      (active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white")
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <form action="/api/auth/logout" method="post" className="mt-auto">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <Logout className="h-[18px] w-[18px]" /> Log out
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
