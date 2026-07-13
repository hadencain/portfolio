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
      <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#665f51]">{prompt}</p>
      {hint && (
        <p className="text-[12px] text-[#7d7566] font-light leading-relaxed">{hint}</p>
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
          className="flex-1 min-w-0 bg-transparent border border-[#3a352b] px-3 py-2 text-[12px] text-[#c2bbab] placeholder:text-[#4e483c] focus:border-[#9e2b25] focus:outline-none disabled:opacity-60 disabled:border-[#292520]"
        />
        <button
          type="submit"
          disabled={!configured}
          className="border border-[#3a352b] text-[#c2bbab] text-[10px] font-mono tracking-[0.22em] px-4 py-2 hover:border-[#9e2b25] transition-colors duration-300 disabled:text-[#4e483c] disabled:border-[#292520] disabled:hover:border-[#292520]"
        >
          {cta}
        </button>
      </form>
    </div>
  );
}
