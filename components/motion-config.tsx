"use client";

import { MotionConfig } from "framer-motion";

// Single point where framer-motion learns about prefers-reduced-motion:
// transform animations are dropped for those users, opacity still eases.
// The contour field handles its own reduced-motion path; this covers
// every motion.* element without per-component checks.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
