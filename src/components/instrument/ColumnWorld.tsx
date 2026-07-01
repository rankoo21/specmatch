"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useColumnStore } from "@/store/useColumnStore";

interface ColumnWorldProps {
  children: ReactNode;
}

// The continuous depth environment that wraps every region. It supplies the top
// instrument light, the depth vignette, and a parallax shift driven by the
// Depth Gauge scrub value, so moving between regions feels like traveling down
// one core, not switching pages.
export function ColumnWorld({ children }: ColumnWorldProps) {
  const scrub = useColumnStore((s) => s.scrub);
  const reduceMotion = useColumnStore((s) => s.reduceMotion);

  return (
    <div className="relative min-h-[calc(100vh-46px)] pl-16 sm:pl-20">
      {/* Top instrument light */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(205,176,137,0.16), transparent 70%)",
        }}
      />
      {/* Depth vignette deepening with scrub */}
      <div
        className="pointer-events-none fixed inset-0 depth-vignette"
        style={{ opacity: 0.5 + scrub * 0.4 }}
      />

      {/* Parallax content plane: shifts subtly with depth scrub */}
      <motion.div
        animate={reduceMotion ? { y: 0 } : { y: -scrub * 24 }}
        transition={{ type: "spring", stiffness: 40, damping: 20 }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
