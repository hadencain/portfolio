"use client";

import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function AudienceLine({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="mb-16"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#555] mb-3">
        Who it&apos;s for
      </p>
      <p className="text-[15px] font-light text-[#a8a8a8] leading-relaxed max-w-xl">
        {children}
      </p>
    </motion.div>
  );
}

export function FeatureBeats({
  beats,
}: {
  beats: { name: string; text: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-20 max-w-3xl">
      {beats.map((b, i) => (
        <motion.div
          key={b.name}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
        >
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#606060] mb-2">
            {b.name}
          </p>
          <p className="text-[12px] text-[#787878] font-light leading-relaxed">
            {b.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export function MediaSlot({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <motion.div
      className="mb-20 max-w-3xl border border-[#1e1e1e] bg-[#0a0a0a]"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full" loading="lazy" decoding="async" />
    </motion.div>
  );
}
