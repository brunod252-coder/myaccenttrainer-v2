import Link from "next/link";
import {
  getMarketingDestination,
  getMarketingSessionUser,
} from "@/lib/auth/marketing-session";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/prices", label: "Prices" },
  { href: "/news", label: "News" },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About" },
];

export default async function Header() {
  const user =
    await getMarketingSessionUser();

  const destination =
    getMarketingDestination(user);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
        >
          <span className="text-[#20ad68]">my</span>
          <span className="mx-1 rounded-md bg-[#20ad68] px-1.5 text-white">
            ACCENT
          </span>
          <span className="text-[#52719f]">trainer</span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition hover:text-[#20ad68]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            {user.firstName && (
              <span className="hidden text-sm text-gray-600 sm:block">
                Hi, {user.firstName}
              </span>
            )}

            <Link
              href={destination}
              className="rounded-lg bg-[#20ad68] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
            >
              {user.role === "ADMIN"
                ? "Admin"
                : "Dashboard"}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-[#52719f] transition hover:text-[#20ad68] sm:block"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#20ad68] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#169357]"
            >
              Start free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
