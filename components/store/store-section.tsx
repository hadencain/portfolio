"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PRODUCTS, type StoreProduct } from "./products";
import { BuyButton } from "./buy-button";
import { WaitlistForm } from "./waitlist-form";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Media({ product }: { product: StoreProduct }) {
  if (product.videoId) {
    return (
      <iframe
        className="aspect-video w-full border-b border-[#1e1e1e]"
        src={`https://www.youtube-nocookie.com/embed/${product.videoId}`}
        title={product.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  if (product.screenshot) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.screenshot}
        alt={`${product.title} UI`}
        className="aspect-video w-full object-cover object-top border-b border-[#1e1e1e]"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return null; // card lays out without media
}

function ProductCard({ product, delay }: { product: StoreProduct; delay: number }) {
  return (
    <motion.div
      className="border border-[#1a1a1a] bg-[#0a0a0a] flex flex-col"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      <Media product={product} />
      <div className="flex flex-col gap-4 p-6 flex-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[13px] font-light text-[#c8c8c8] leading-tight">{product.title}</h3>
          <a
            href={product.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono tracking-[0.22em] text-[#555] hover:text-[#888] transition-colors duration-300 shrink-0"
          >
            SOURCE
          </a>
        </div>
        <p className="text-[12px] text-[#606060] font-light leading-relaxed flex-1">
          {product.hook}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.tags.map((t) => (
            <span key={t} className="text-[9px] font-mono tracking-[0.18em] uppercase text-[#4a4a4a]">
              {t}
            </span>
          ))}
        </div>
        {product.status === "live" ? (
          <BuyButton gumroadUrl={product.gumroadUrl} title={product.title} />
        ) : (
          <WaitlistForm />
        )}
      </div>
    </motion.div>
  );
}

export function StoreSection() {
  const live = PRODUCTS.filter((p) => p.status === "live");
  const waitlist = PRODUCTS.filter((p) => p.status === "waitlist");

  return (
    <section className="min-h-screen pt-40 pb-28 px-8 md:px-16 lg:px-24">
      {/* Header — two lines, homepage register */}
      <motion.h1
        className="text-6xl md:text-7xl font-extralight tracking-[-0.02em] text-[#e8e8e8] leading-[0.92] mb-4 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        Instruments.
      </motion.h1>
      <motion.p
        className="text-[11px] tracking-[0.3em] uppercase text-[#606060] mb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      >
        experimental audio tools · pay what you want · source on GitHub
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {live.map((p, i) => (
          <ProductCard key={p.id} product={p} delay={i * 0.08} />
        ))}
      </div>

      {waitlist.length > 0 && (
        <div className="mt-16 max-w-5xl">
          <div className="flex items-center gap-5 mb-8">
            <span className="text-[10px] tracking-[0.38em] uppercase text-[#606060] shrink-0">
              In development
            </span>
            <div className="flex-1 h-px bg-[#1c1c1c]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {waitlist.map((p, i) => (
              <ProductCard key={p.id} product={p} delay={i * 0.08} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-24 pt-8 border-t border-[#1c1c1c] flex gap-8">
        <Link href="/#work" className="text-[10px] font-mono tracking-[0.22em] text-[#555] hover:text-[#888] transition-colors duration-300">
          FREE BROWSER TOOLS
        </Link>
        <a
          href="https://github.com/hadencain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono tracking-[0.22em] text-[#555] hover:text-[#888] transition-colors duration-300"
        >
          GITHUB
        </a>
      </div>
    </section>
  );
}
