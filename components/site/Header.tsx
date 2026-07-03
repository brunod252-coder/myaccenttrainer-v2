import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/prices", label: "Prices" },
  { href: "/news", label: "News" },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About" },
];

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold">
          <span className="text-[#20ad68]">my</span>
          <span className="mx-1 rounded bg-[#20ad68] px-1 text-white">
            ACCENT
          </span>
          <span className="text-[#52719f]">trainer</span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-gray-700 transition hover:text-[#20ad68]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded bg-[#20ad68] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#169357]"
        >
          Login
        </Link>
      </div>
    </header>
  );
}