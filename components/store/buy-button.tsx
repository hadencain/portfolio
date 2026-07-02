"use client";

// The ONLY component that knows Gumroad exists. Gumroad's overlay script
// (loaded once in store-section) hooks any <a class="gumroad-button"> and
// opens checkout in an overlay — PWYW, tax, and delivery are Gumroad's.
// Swapping to native checkout later replaces this file and nothing else.

export function BuyButton({ gumroadUrl, title }: { gumroadUrl?: string; title: string }) {
  if (!gumroadUrl) {
    return (
      <span
        className="inline-block border border-[#222] text-[#4a4a4a] text-[10px] font-mono tracking-[0.22em] px-4 py-2 select-none"
        aria-label={`${title} — coming soon`}
      >
        SOON
      </span>
    );
  }
  return (
    <a
      className="gumroad-button inline-block border border-[#343434] text-[#c8c8c8] text-[10px] font-mono tracking-[0.22em] px-4 py-2 hover:border-[#666] hover:text-[#e8e8e8] transition-colors duration-300"
      href={gumroadUrl}
      aria-label={`Buy ${title} — pay what you want`}
    >
      PAY WHAT YOU WANT
    </a>
  );
}
