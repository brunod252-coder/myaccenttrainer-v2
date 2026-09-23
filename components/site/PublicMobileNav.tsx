"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/prices", label: "Prices" },
  { href: "/news", label: "News" },
  { href: "/faqs", label: "FAQs" },
  { href: "/about", label: "About" },
] as const;

export default function PublicMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function close() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="public-mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#17223b] shadow-sm transition hover:border-[#20ad68] hover:text-[#20ad68]"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "×" : "☰"}
        </span>
      </button>

      {open ? (
        <div
          id="public-mobile-navigation"
          className="absolute left-0 right-0 top-full border-b border-gray-100 bg-white shadow-lg"
        >
          <nav
            aria-label="Mobile public navigation"
            className="mx-auto max-w-6xl px-6 py-4"
          >
            <div className="grid gap-1">
              {navigation.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "rounded-lg px-3 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-[#eefaf4] text-[#168c56]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#20ad68]",
                    ].join(" ")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
