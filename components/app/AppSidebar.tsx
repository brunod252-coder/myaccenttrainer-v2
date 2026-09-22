"use client";

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
  Target,
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

function SidebarNavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const active = itemIsActive(pathname, item);
  const Icon = item.Icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-[var(--mat-green-100)] text-[var(--mat-green-700)]"
          : "text-[var(--mat-muted)] hover:bg-[var(--mat-surface-soft)] hover:text-[var(--mat-ink)]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
          active
            ? "bg-white text-[var(--mat-green-600)] shadow-[var(--mat-shadow-xs)]"
            : "text-[var(--mat-muted)] group-hover:text-[var(--mat-green-600)]",
        ].join(" ")}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>

      <span className="truncate">{item.label}</span>

      {active ? (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--mat-green-500)]" />
      ) : null}
    </Link>
  );
}

function NavigationSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mat-muted-light)]">
        {label}
      </p>

      <div className="space-y-1">
        {items.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            pathname={pathname}
          />
        ))}
      </div>
    </div>
  );
}

type Props = {
  userName?: string | null;
  role?: string | null;
};

export default function AppSidebar({ userName, role }: Props) {
  const pathname = usePathname();
  const initial = (userName || "U").slice(0, 1).toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-[252px] flex-col border-r border-[var(--mat-border)] bg-white px-4 py-5 lg:flex">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-xl px-2 py-2"
        aria-label="MyAccentTrainer dashboard"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--mat-green-600)] text-white shadow-[var(--mat-shadow-sm)]">
          <Mic className="h-[18px] w-[18px]" />
        </span>

        <span className="leading-none">
          <span className="block text-[15px] font-extrabold tracking-[-0.02em] text-[var(--mat-ink)]">
            MyAccentTrainer
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--mat-muted-light)]">
            Learn with Nina
          </span>
        </span>
      </Link>

      <nav className="mt-7 space-y-6">
        <NavigationSection
          label="Learn"
          items={learning}
          pathname={pathname}
        />

        <NavigationSection
          label="Account"
          items={account}
          pathname={pathname}
        />

        {role === "ADMIN" ? (
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mat-muted-light)]">
              Staff
            </p>

            <Link
              href="/admin"
              className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--mat-muted)] transition hover:bg-[var(--mat-surface-soft)] hover:text-[var(--mat-ink)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--mat-muted)] group-hover:text-[var(--mat-green-600)]">
                <Target className="h-[18px] w-[18px]" />
              </span>
              Admin
            </Link>
          </div>
        ) : null}
      </nav>

      <div className="mt-auto">
        <Link
          href="/dashboard/nina"
          className="block rounded-2xl border border-[var(--mat-border-green)] bg-[var(--mat-green-50)] p-4 transition hover:bg-[var(--mat-green-100)]"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--mat-green-700)]">
            <Sparkle className="h-4 w-4" />
            Nina
          </div>

          <p className="mt-1.5 text-xs leading-5 text-[var(--mat-ink-soft)]">
            Your personal accent coach remembers your practice and helps you
            choose what to work on next.
          </p>
        </Link>

        <div className="mt-4 border-t border-[var(--mat-border)] pt-4">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--mat-green-600)] text-sm font-bold text-white">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--mat-ink)]">
                {userName || "Learner"}
              </p>

              <p className="text-xs text-[var(--mat-muted)]">
                {role === "ADMIN" ? "Administrator" : "Learner"}
              </p>
            </div>
          </div>

          <form action="/api/auth/logout" method="post" className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--mat-muted)] transition hover:bg-[var(--mat-surface-soft)] hover:text-[var(--mat-ink)]"
            >
              <Logout className="h-[18px] w-[18px]" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
