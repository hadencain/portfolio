"use client";

import { BUTTONDOWN_USERNAME } from "./products";

// Buttondown embed form — plain POST, no backend. Until a username is
// configured, renders disabled with a "soon" hint (graceful degradation).

export function WaitlistForm() {
  const configured = BUTTONDOWN_USERNAME.length > 0;
  return (
    <form
      action={configured ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}` : undefined}
      method="post"
      target="_blank"
      className="flex gap-3"
    >
      <input
        type="email"
        name="email"
        required
        disabled={!configured}
        placeholder={configured ? "email" : "beta opening soon"}
        className="flex-1 min-w-0 bg-transparent border border-[#343434] px-3 py-2 text-[12px] text-[#c8c8c8] placeholder:text-[#4a4a4a] focus:border-[#666] focus:outline-none disabled:opacity-60 disabled:border-[#222]"
        aria-label="email for sampleViewer beta"
      />
      <button
        type="submit"
        disabled={!configured}
        className="border border-[#343434] text-[#c8c8c8] text-[10px] font-mono tracking-[0.22em] px-4 py-2 hover:border-[#666] transition-colors duration-300 disabled:text-[#4a4a4a] disabled:border-[#222] disabled:hover:border-[#222]"
      >
        JOIN BETA
      </button>
    </form>
  );
}
