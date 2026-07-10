"use client";

import { BUTTONDOWN_USERNAME } from "./registry";

export function EmailCapture({
  tag,
  prompt,
  cta,
  hint,
}: {
  tag: string;
  prompt: string;
  cta: string;
  hint?: string;
}) {
  const configured = BUTTONDOWN_USERNAME.length > 0;
  return (
    <div className="flex flex-col gap-3 max-w-md">
      <p className="text-[11px] tracking-[0.3em] uppercase text-[#606060]">{prompt}</p>
      {hint && (
        <p className="text-[12px] text-[#787878] font-light leading-relaxed">{hint}</p>
      )}
      <form
        action={
          configured
            ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`
            : undefined
        }
        method="post"
        target="_blank"
        className="flex gap-3"
      >
        <input type="hidden" name="tag" value={tag} />
        <input
          type="email"
          name="email"
          required
          disabled={!configured}
          placeholder={configured ? "email" : "opening soon"}
          aria-label={`email signup for ${tag}`}
          className="flex-1 min-w-0 bg-transparent border border-[#343434] px-3 py-2 text-[12px] text-[#c8c8c8] placeholder:text-[#4a4a4a] focus:border-[#666] focus:outline-none disabled:opacity-60 disabled:border-[#222]"
        />
        <button
          type="submit"
          disabled={!configured}
          className="border border-[#343434] text-[#c8c8c8] text-[10px] font-mono tracking-[0.22em] px-4 py-2 hover:border-[#666] transition-colors duration-300 disabled:text-[#4a4a4a] disabled:border-[#222] disabled:hover:border-[#222]"
        >
          {cta}
        </button>
      </form>
    </div>
  );
}
