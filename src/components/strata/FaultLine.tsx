"use client";

import { motion } from "framer-motion";

interface FaultLineProps {
  width?: number;
  seed?: number;
  active?: boolean;
  reduceMotion?: boolean;
  className?: string;
}

// A jagged rust seam that cracks across a band. Rust is used only here, marking
// contradiction. The seam draws itself on detection.
export function FaultLine({
  width = 600,
  seed = 1,
  active = true,
  reduceMotion = false,
  className = "",
}: FaultLineProps) {
  // Deterministic jagged path so the crack looks geological, not random noise.
  const segments = 9;
  let d = `M 0 ${8 + (seed % 5)}`;
  for (let i = 1; i <= segments; i++) {
    const x = (width / segments) * i;
    const y = 4 + ((seed * 13 + i * 31) % 13);
    d += ` L ${x.toFixed(1)} ${y}`;
  }
  return (
    <svg
      width={width}
      height="20"
      viewBox={`0 0 ${width} 20`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label="A fault seam"
    >
      <motion.path
        d={d}
        fill="none"
        stroke="#A6442E"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={reduceMotion ? { pathLength: 1, opacity: 0.85 } : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: active ? 0.9 : 0.4 }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease: "easeInOut" }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="#D98A77"
        strokeWidth="0.6"
        strokeLinecap="round"
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 0.5 : 0.2 }}
        transition={{ duration: reduceMotion ? 0 : 1.4 }}
      />
    </svg>
  );
}
