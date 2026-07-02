"use client";

import Script from "next/script";

// The ONLY component that knows Gumroad exists. It loads Gumroad's overlay
// script itself (next/script dedupes by src, so multiple BuyButton instances
// on one page still only load it once) and hooks any <a class="gumroad-button">
// to open checkout in an overlay — PWYW, tax, and delivery are Gumroad's.
// Swapping to native checkout later replaces this file and nothing else.

export function BuyButton({ gumroadUrl, title }: { gumroadUrl?: string; title: string }) {
  if (!gumroadUrl) {
    return (
      <span className="inline-block border border-[#222] text-[#4a4a4a] text-[10px] font-mono tracking-[0.22em] px-4 py-2 select-none">
        SOON
        <span className="sr-only">{title} — coming soon</span>
      </span>
    );
  }
  return (
    <>
      <Script src="https://gumroad.com/js/gumroad.js" strategy="lazyOnload" />
      <a
        className="gumroad-button inline-block border border-[#343434] text-[#c8c8c8] text-[10px] font-mono tracking-[0.22em] px-4 py-2 hover:border-[#666] hover:text-[#e8e8e8] transition-colors duration-300"
        href={gumroadUrl}
        aria-label={`Buy ${title} — pay what you want`}
      >
        PAY WHAT YOU WANT
      </a>
    </>
  );
}
