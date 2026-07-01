"use client";

import { motion } from "framer-motion";
import { useColumnStore } from "@/store/useColumnStore";

// The Bedrock Rail: a dark band of bedrock at the bottom edge with faint
// engraved survey-stamp text. It is the deepest, oldest rock layer of the
// column, not a footer. It barely moves; a slow mineral shimmer crosses it at
// idle.
export function BedrockRail() {
  const reduceMotion = useColumnStore((s) => s.reduceMotion);
  return (
    <footer
      className="relative z-30 w-full overflow-hidden"
      style={{
        height: 46,
        background: "linear-gradient(180deg, #1a1813, #0B0A08)",
        borderTop: "1px solid rgba(91,67,39,0.4)",
      }}
      aria-label="Bedrock"
    >
      {/* Mineral shimmer crossing the rail */}
      {!reduceMotion && (
        <motion.div
          className="absolute inset-0 bedrock-shimmer"
          animate={{ backgroundPositionX: ["-200%", "200%"] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="relative h-full flex items-center justify-center">
        <span className="etched text-[9px] sm:text-[10px] text-[rgba(140,138,130,0.7)]">
          GenLayer . Strata . Corroborated by consensus . Testnet
        </span>
      </div>
    </footer>
  );
}
