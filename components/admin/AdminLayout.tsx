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
        aria-current={active ? "page" : undefined}
        className={[
          "inline-flex shrink-0 items-center gap-2 rounded-[var(--mat-radius-lg)] border px-3 py-2 text-sm font-semibold transition",
          active
            ? "border-[var(--mat-green-700)] bg-[var(--mat-green-700)] text-white shadow-[var(--mat-shadow-sm)]"
            : "border-[var(--mat-border)] bg-white text-[var(--mat-muted)] hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)] hover:text-[var(--mat-green-700)]",
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
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center gap-3 rounded-[var(--mat-radius-lg)] px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-[var(--mat-green-700)] text-white shadow-[var(--mat-shadow-sm)]"
          : "text-white/65 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <Icon
        className={[
          "h-[18px] w-[18px] shrink-0",
          active
            ? "text-white"
            : "text-white/45 group-hover:text-white",
        ].join(" ")}
      />

      <span>{item.label}</span>

      {active ? (
        <span
          aria-hidden="true"
          className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
        />
      ) : null}
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
    <div className="min-h-screen bg-[var(--mat-surface-soft)] md:grid md:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto bg-[var(--mat-ink)] px-4 py-6 md:flex">
        <Link href="/admin" className="px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--mat-radius-lg)] bg-[var(--mat-green-700)] text-sm font-black text-white">
              MAT
            </div>

            <div>
              <p className="font-display text-base font-semibold text-white">
                My Accent Trainer
              </p>

              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                Administration
              </p>
            </div>
          </div>
        </Link>

        <div className="mx-2 mt-6 rounded-[var(--mat-radius-lg)] border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
            Workspace
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            Platform operations
          </p>

          <p className="mt-1 text-xs leading-5 text-white/45">
            Learning, publishing, users, growth, and system administration.
          </p>
        </div>

        <nav
          aria-label="Administration"
          className="mt-7 flex flex-col gap-6"
        >
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
            className="flex items-center gap-2 rounded-[var(--mat-radius-lg)] px-3 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <Arrow className="h-4 w-4 rotate-180" />
            Back to learner app
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--mat-border)] bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mat-green-700)] md:hidden">
                Administration
              </p>

              <p className="truncate text-sm font-semibold text-[var(--mat-ink)]">
                My Accent Trainer
                <span className="hidden font-normal text-[var(--mat-muted)] sm:inline">
                  {" "}
                  / Administration
                </span>
              </p>
            </div>

            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-[var(--mat-ink)]">
                {admin.name}
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--mat-muted-light)]">
                Administrator
              </p>
            </div>
          </div>

          <nav
            aria-label="Mobile administration"
            className="overflow-x-auto border-t border-[var(--mat-border)] px-4 py-2 md:hidden"
          >
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
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
