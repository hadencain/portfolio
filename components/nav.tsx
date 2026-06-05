"use client";

import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-8 md:px-16 lg:px-24 py-6 transition-colors duration-500 ${
        scrolled
          ? "border-b border-[#222] bg-[#080808]/90 backdrop-blur-sm"
          : ""
      }`}
    >
      <div className="flex gap-8">
        {["Work", "About", "Contact"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="text-[11px] tracking-[0.25em] uppercase text-[#545454] hover:text-[#888] transition-colors duration-300"
          >
            {item}
          </a>
        ))}
      </div>
    </nav>
  );
}
