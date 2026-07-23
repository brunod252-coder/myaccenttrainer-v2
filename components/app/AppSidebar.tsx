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
  Gift,
  Gear,
  Clock,
  Target,
  Logout,
} from "@/components/ui/icons";

const primary = [
  { href: "/dashboard", label: "Dashboard", Icon: Grid },
  { href: "/dashboard/courses", label: "Courses", Icon: Book },
  { href: "/dashboard/practice", label: "Practice", Icon: Mic },
  { href: "/dashboard/nina", label: "Nina", Icon: Sparkle },
  { href: "/dashboard/coaching", label: "Coaching", Icon: Target },
  { href: "/dashboard/progress", label: "Progress", Icon: Chart },
];

const account = [
  { href: "/dashboard/wallet", label: "Wallet", Icon: Wallet },
  { href: "/dashboard/billing", label: "Billing", Icon: Clock },
  { href: "/dashboard/referrals", label: "Referrals", Icon: Gift },
  { href: "/dashboard/settings", label: "Settings", Icon: Gear },
];

type NavigationItem = (typeof primary)[number];

type NavLinkProps = NavigationItem & {
  pathname: string;
};

function SidebarNavLink({
  href,
  label,
  Icon,
  pathname,
}: NavLinkProps) {
  const active =
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition " +
        (active
          ? "bg-white/10 text-white shadow-[inset_3px_0_0_#20ad68]"
          : "text-white/65 hover:bg-white/5 hover:text-white")
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </Link>
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
    <aside className="sticky top-0 hidden h-screen w-[260px] flex-col bg-[#142b4c] px-4 py-6 md:flex">
      <Link href="/dashboard" className="px-2 text-lg font-bold">
        <span className="text-[#3ecb8a]">my</span>
        <span className="mx-1 rounded-md bg-[#20ad68] px-1.5 text-white">
          ACCENT
        </span>
        <span className="text-white/80">trainer</span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {primary.map((item) => (
          <SidebarNavLink
            key={item.href}
            {...item}
            pathname={pathname}
          />
        ))}

        <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
          Account
        </p>

        {account.map((item) => (
          <SidebarNavLink
            key={item.href}
            {...item}
            pathname={pathname}
          />
        ))}

        {role === "ADMIN" && (
          <>
            <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              Staff
            </p>

            <SidebarNavLink
              href="/admin"
              label="Admin"
              Icon={Target}
              pathname={pathname}
            />
          </>
        )}
      </nav>

      <div className="mt-auto">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkle className="h-4 w-4 text-[#3ecb8a]" />
            Meet Nina
          </div>

          <p className="mt-1 text-xs leading-5 text-white/60">
            Your patient AI coach � practice any time and get instant feedback.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#20ad68] font-semibold text-white">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {userName || "User"}
            </p>

            {role && (
              <p className="text-xs text-white/50">
                {role}
              </p>
            )}
          </div>

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              aria-label="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <Logout className="h-[18px] w-[18px]" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
