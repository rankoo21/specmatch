"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface CoreTubeProps {
  children?: ReactNode;
  className?: string;
  glow?: boolean;
}

// A glass core-sample tube. A vertical instrument tube with resin inside and
// brass caps top and bottom. Used at the Surface and the Coring Bench.
export function CoreTube({ children, className = "", glow = false }: CoreTubeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.9 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative ${className}`}
    >
      {/* Brass cap top */}
      <div
        className="h-3 rounded-t-sm mx-auto"
        style={{
          width: "70%",
          background: "linear-gradient(180deg, #CDB089, #8a6a3a)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
        }}
      />
      {/* Glass tube body */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(90deg, rgba(237,230,214,0.05) 0%, rgba(63,168,155,0.06) 50%, rgba(237,230,214,0.05) 100%)",
          border: "1px solid rgba(205,176,137,0.28)",
          boxShadow: glow
            ? "inset 0 0 30px rgba(63,168,155,0.12), 0 0 24px rgba(63,168,155,0.08)"
            : "inset 0 0 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Vertical glass highlight */}
        <div
          className="absolute top-0 bottom-0 left-[12%] w-[6%] opacity-40"
          style={{ background: "linear-gradient(90deg, rgba(237,230,214,0.5), transparent)" }}
        />
        <div className="relative">{children}</div>
      </div>
      {/* Brass cap bottom */}
      <div
        className="h-3 rounded-b-sm mx-auto"
        style={{
          width: "70%",
          background: "linear-gradient(180deg, #8a6a3a, #5B4327)",
          boxShadow: "0 -1px 2px rgba(0,0,0,0.5)",
        }}
      />
    </motion.div>
  );
}
