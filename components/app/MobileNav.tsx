"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sparkle,
  Grid,
  Book,
  Mic,
  Chart,
  Wallet,
  Gear,
  Clock,
  Menu,
  Logout,
} from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof Grid;
  activePrefixes?: string[];
};

const learning: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    Icon: Grid,
  },
  {
    href: "/dashboard/courses",
    label: "My Learning",
    Icon: Book,
    activePrefixes: ["/dashboard/courses", "/dashboard/lesson"],
  },
  {
    href: "/dashboard/practice",
    label: "Practice",
    Icon: Mic,
  },
  {
    href: "/dashboard/nina",
    label: "Nina",
    Icon: Sparkle,
    activePrefixes: ["/dashboard/nina", "/dashboard/coaching"],
  },
  {
    href: "/dashboard/progress",
    label: "Progress",
    Icon: Chart,
  },
];

const account: NavItem[] = [
  {
    href: "/dashboard/wallet",
    label: "Learning Credit",
    Icon: Wallet,
    activePrefixes: ["/dashboard/wallet", "/dashboard/referrals"],
  },
  {
    href: "/dashboard/billing",
    label: "Membership",
    Icon: Clock,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    Icon: Gear,
  },
];

function itemIsActive(pathname: string, item: NavItem) {
  if (item.href === "/dashboard") {
    return pathname === "/dashboard";
  }

  const prefixes = item.activePrefixes ?? [item.href];

  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function MobileSection({
  label,
  items,
  pathname,
  close,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
  close: () => void;
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mat-muted-light)]">
        {label}
      </p>

      <div className="space-y-1">
        {items.map((item) => {
          const active = itemIsActive(pathname, item);
          const Icon = item.Icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-[var(--mat-green-100)] text-[var(--mat-green-700)]"
                  : "text-[var(--mat-muted)] hover:bg-[var(--mat-surface-soft)] hover:text-[var(--mat-ink)]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  active
                    ? "bg-white text-[var(--mat-green-600)]"
                    : "text-[var(--mat-muted)]",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>

              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function close() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--mat-border)] bg-white text-[var(--mat-ink)] shadow-[var(--mat-shadow-xs)]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 h-full w-full bg-[#17231d]/35 backdrop-blur-[1px]"
            onClick={close}
          />

          <aside className="absolute left-0 top-0 flex h-dvh w-[min(86vw,320px)] flex-col overflow-hidden border-r border-[var(--mat-border)] bg-white px-4 py-5 shadow-[var(--mat-shadow-lg)]">
            <div className="flex items-center justify-between px-2">
              <Link
                href="/dashboard"
                onClick={close}
                className="flex items-center gap-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mat-green-600)] text-white">
                  <Mic className="h-[18px] w-[18px]" />
                </span>

                <span>
                  <span className="block text-sm font-extrabold text-[var(--mat-ink)]">
                    MyAccentTrainer
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--mat-muted-light)]">
                    Learn with Nina
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={close}
                aria-label="Close navigation"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl leading-none text-[var(--mat-muted)] transition hover:bg-[var(--mat-surface-soft)] hover:text-[var(--mat-ink)]"
              >
                ×
              </button>
            </div>

            <nav className="mt-7 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pb-6">
              <MobileSection
                label="Learn"
                items={learning}
                pathname={pathname}
                close={close}
              />

              <MobileSection
                label="Account"
                items={account}
                pathname={pathname}
                close={close}
              />
            </nav>

            <div className="shrink-0 border-t border-[var(--mat-border)] bg-white pt-4">
              <Link
                href="/dashboard/nina"
                onClick={close}
                className="mb-2 flex items-center gap-3 rounded-xl bg-[var(--mat-green-50)] px-3 py-3 text-sm font-semibold text-[var(--mat-green-700)]"
              >
                <Sparkle className="h-[18px] w-[18px]" />
                Continue with Nina
              </Link>

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[var(--mat-muted)] transition hover:bg-[var(--mat-surface-soft)] hover:text-[var(--mat-ink)]"
                >
                  <Logout className="h-[18px] w-[18px]" />
                  Log out
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
