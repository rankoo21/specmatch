"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface SiltFieldProps {
  count?: number;
  reduceMotion?: boolean;
  className?: string;
}

// Loose drifting silt particles over the surface band. Settling sediment, not
// decoration: it conveys that the surface is loose and in motion.
export function SiltField({ count = 26, reduceMotion = false, className = "" }: SiltFieldProps) {
  const grains = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        size: 1 + ((i * 7) % 3),
        delay: (i % 9) * 0.6,
        dur: 7 + ((i * 3) % 6),
      })),
    [count],
  );

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {grains.map((g) => (
        <motion.span
          key={g.id}
          className="absolute rounded-full"
          style={{
            left: `${g.left}%`,
            top: `${g.top}%`,
            width: g.size,
            height: g.size,
            background: "rgba(205,176,137,0.55)",
          }}
          animate={
            reduceMotion
              ? { opacity: 0.4 }
              : { y: [0, 18, 36], x: [0, 6, -3], opacity: [0, 0.8, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: g.dur, delay: g.delay, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
    </div>
  );
}
