"use client";

import type { ReactNode } from "react";

interface EngraveTextProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  variant?: "engraved" | "etched";
  className?: string;
}

// Text pressed into stone. Two finishes: deep "engraved" for headings, faint
// uppercase "etched" for survey marks and labels.
export function EngraveText({
  children,
  as = "p",
  variant = "engraved",
  className = "",
}: EngraveTextProps) {
  const Tag = as;
  const base = variant === "etched" ? "etched font-mark" : "engraved font-engrave";
  return <Tag className={`${base} ${className}`}>{children}</Tag>;
}
