"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface InstrumentButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "brass" | "mineral" | "fault" | "quiet";
  size?: "sm" | "md";
  ariaLabel?: string;
  className?: string;
  type?: "button" | "submit";
}

// Actions styled as small engraved instruments, never as SaaS buttons. Brass by
// default; mineral for settling/reading; fault only for inspecting a fault.
const TONES: Record<string, string> = {
  brass:
    "border-[rgba(176,125,58,0.5)] text-[#CDB089] hover:border-[rgba(205,176,137,0.9)] hover:text-[#EDE6D6]",
  mineral:
    "border-[rgba(63,168,155,0.5)] text-[#7FD3C7] hover:border-[rgba(63,168,155,0.95)] hover:text-[#BdEee7]",
  fault:
    "border-[rgba(166,68,46,0.55)] text-[#D98A77] hover:border-[rgba(166,68,46,0.95)] hover:text-[#F0B6A8]",
  quiet:
    "border-[rgba(140,138,130,0.4)] text-[#8C8A82] hover:border-[rgba(140,138,130,0.8)] hover:text-[#CDB089]",
};

export function InstrumentButton({
  children,
  onClick,
  disabled,
  tone = "brass",
  size = "md",
  ariaLabel,
  className = "",
  type = "button",
}: InstrumentButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { y: 1, scale: 0.99 }}
      className={`font-mark uppercase tracking-[0.18em] bg-[rgba(11,10,8,0.6)] border rounded-sm
        ${size === "sm" ? "text-[10px] px-3 py-1.5" : "text-xs px-4 py-2.5"}
        ${TONES[tone]} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        transition-colors ${className}`}
    >
      {children}
    </motion.button>
  );
}
