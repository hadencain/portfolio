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

// Document header bar — always the ink plate, so it holds over both the ink
// hero and the paper catalog without flipping colors.
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
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 lg:px-24 py-5 border-b transition-colors duration-500 ${
        scrolled
          ? "border-paper/15 bg-ink/95 backdrop-blur-sm"
          : "border-transparent"
      }`}
    >
      <Link
        href="/#hero"
        className="display text-paper text-[17px] leading-none tracking-tight hover:text-blood transition-colors duration-200"
        aria-label="Haden Cain — top"
      >
        HC.
      </Link>

      {/* -mr trues the last label's glyph edge against the page margin —
          trailing letter-spacing (0.25em @ 11px = 2.75px) otherwise leaves it short */}
      <div className="flex gap-6 md:gap-8 -mr-[2.75px]">
        {ITEMS.map((item) => {
          const current =
            !item.href.startsWith("/#") && pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`relative font-mono text-[11px] tracking-[0.25em] uppercase transition-colors duration-300 py-2 -my-2 ${
                current
                  ? "text-paper"
                  : "text-paper-mute hover:text-paper-dim"
              }`}
            >
              {current && (
                <span
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-[5px] h-[5px] bg-blood"
                  aria-hidden
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
