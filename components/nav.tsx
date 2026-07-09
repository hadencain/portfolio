"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ITEMS = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
  { label: "Research", href: "/research" },
  { label: "Store", href: "/store" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Primary"
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-8 md:px-16 lg:px-24 py-6 border-b transition-colors duration-500 ${
        scrolled
          ? "border-[#1c1c1c] bg-[#080808]/90 backdrop-blur-sm"
          : "border-transparent"
      }`}
    >
      {/* -mr trues the last label's glyph edge against the page margin —
          trailing letter-spacing (0.25em @ 11px = 2.75px) otherwise leaves it short */}
      <div className="flex gap-8 -mr-[2.75px]">
        {ITEMS.map((item) => {
          const current =
            !item.href.startsWith("/#") && pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`text-[11px] tracking-[0.25em] uppercase transition-colors duration-300 py-2 -my-2 ${
                current
                  ? "text-[#a8a8a8]"
                  : "text-[#666666] hover:text-[#aaa]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
