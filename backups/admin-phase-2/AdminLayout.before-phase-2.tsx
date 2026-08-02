"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  Grid,
  Search,
  Chart,
  Gear,
  Book,
  Arrow,
} from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Grid;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    label: "Platform",
    items: [
      { href: "/admin", label: "Dashboard", Icon: Grid },
      { href: "/admin/users", label: "Users", Icon: Search },
    ],
  },
  {
    label: "Learning",
    items: [
      { href: "/admin/courses", label: "Courses", Icon: Book },
      { href: "/admin/modules", label: "Modules", Icon: Book },
      { href: "/admin/lessons", label: "Lessons", Icon: Book },
      { href: "/admin/recordings", label: "Recordings", Icon: Chart },
    ],
  },
  {
    label: "Finance & growth",
    items: [
      { href: "/admin/wallets", label: "Wallets", Icon: Chart },
      { href: "/admin/referrals", label: "Referrals", Icon: Search },
    ],
  },
  {
    label: "Publishing",
    items: [
      { href: "/admin/news", label: "News", Icon: Book },
      { href: "/admin/faq", label: "FAQ", Icon: Book },
      { href: "/admin/pricing", label: "Pricing", Icon: Chart },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/reports", label: "Reports", Icon: Chart },
      { href: "/admin/settings", label: "Settings", Icon: Gear },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLink({
  item,
  pathname,
  mobile = false,
}: {
  item: NavItem;
  pathname: string;
  mobile?: boolean;
}) {
  const active = isActivePath(pathname, item.href);
  const Icon = item.Icon;

  if (mobile) {
    return (
      <Link
        href={item.href}
        className={[
          "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
          active
            ? "bg-[#111c30] text-white shadow-sm"
            : "bg-white text-[#526070] hover:bg-[#eef7f3] hover:text-[#168c56]",
        ].join(" ")}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-[#20ad68] text-white shadow-sm"
          : "text-white/65 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <Icon
        className={[
          "h-[18px] w-[18px] shrink-0",
          active ? "text-white" : "text-white/45 group-hover:text-white",
        ].join(" ")}
      />

      <span>{item.label}</span>

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
      )}
    </Link>
  );
}

export default function AdminLayout({
  children,
  admin,
}: {
  children: ReactNode;
  admin: { name: string };
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f6faf8] md:grid md:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto bg-[#111c30] px-4 py-6 md:flex">
        <Link href="/admin" className="px-2">
          <div className="text-lg font-bold">
            <span className="text-[#3ecb8a]">my</span>
            <span className="mx-1 rounded-md bg-[#20ad68] px-1.5 text-white">
              ACCENT
            </span>
            <span className="text-white/80">admin</span>
          </div>

          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Control room
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-6">
          {navigation.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
                {section.label}
              </p>

              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <NavigationLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <Arrow className="h-4 w-4 rotate-180" />
            Back to learner app
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div>
              <span className="rounded-full bg-[#111c30] px-3 py-1 text-xs font-semibold text-white md:hidden">
                Admin
              </span>

              <span className="hidden text-sm font-semibold text-[#17223b] md:inline">
                My Accent Trainer Administration
              </span>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-[#17223b]">
                {admin.name}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">
                Administrator
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
            <div className="flex min-w-max gap-2">
              {navigation.flatMap((section) =>
                section.items.map((item) => (
                  <NavigationLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    mobile
                  />
                )),
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
