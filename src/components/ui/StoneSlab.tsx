"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface StoneSlabProps {
  children: ReactNode;
  className?: string;
  tone?: "stone" | "resin";
  as?: "div" | "section" | "article";
}

// A cut slab of stone or a resin-filled panel. The base surface for engraved
// interiors, plaques, and instrument housings.
export function StoneSlab({
  children,
  className = "",
  tone = "stone",
  as = "div",
}: StoneSlabProps) {
  const MotionTag = as === "section" ? motion.section : as === "article" ? motion.article : motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      className={`${tone === "resin" ? "resin" : "stone"} rounded-sm ${className}`}
    >
      {children}
    </MotionTag>
  );
}
