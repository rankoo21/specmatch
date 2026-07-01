"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Layer } from "@/lib/genlayer/types";
import { bandColor } from "@/utils/layerState";
import { STATE_LABELS } from "@/utils/format";
import { EngravedPlaque } from "./EngravedPlaque";
import { FaultLine } from "./FaultLine";
import { InstrumentButton } from "@/components/ui/InstrumentButton";

interface SedimentBandProps {
  layer: Layer;
  index: number;
  reduceMotion: boolean;
  onRead: (layerId: string) => void;
  onInspectFault: () => void;
  onCorroborate: () => void;
}

// A single sediment band as a physical object, not a list row. Thickness grows
// with weight; corroborated bands carry mineral-teal veins; hardened bands are
// dark and compressed; faulted bands carry a rust seam. Loose bands drift.
export function SedimentBand({
  layer,
  index,
  reduceMotion,
  onRead,
  onInspectFault,
  onCorroborate,
}: SedimentBandProps) {
  const [hover, setHover] = useState(false);
  const color = bandColor(layer.state);

  // Thicker with weight; clamp so the column stays readable.
  const thickness = Math.min(120, 44 + Math.floor(layer.weight / 14));
  const veined = layer.state === "corroborated" || layer.state === "hardened";
  const isLoose = layer.state === "loose" || layer.state === "floating";

  const drift =
    isLoose && !reduceMotion
      ? { y: [0, -3, 0, 2, 0], x: [0, 2, 0, -1, 0] }
      : { y: 0, x: 0 };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: reduceMotion ? 0 : -28 }}
      animate={{ opacity: 1, ...drift }}
      transition={
        reduceMotion
          ? { duration: 0.12 }
          : {
              y: { type: "spring", stiffness: 60, damping: 18, mass: 1.3 },
              opacity: { duration: 0.5 },
            }
      }
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      tabIndex={0}
      role="group"
      aria-label={`${STATE_LABELS[layer.state]} layer. ${layer.claim}`}
      className="relative group outline-none"
      style={{ height: thickness }}
    >
      {/* The band body */}
      <div
        className="absolute inset-0 rounded-[2px] overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${color}26, ${color}0d), linear-gradient(180deg, rgba(35,33,29,0.9), rgba(16,14,11,0.95))`,
          borderTop: `1px solid ${color}55`,
          borderBottom: "1px solid rgba(0,0,0,0.5)",
          boxShadow:
            layer.state === "hardened"
              ? "inset 0 2px 14px rgba(0,0,0,0.6)"
              : "inset 0 1px 0 rgba(237,230,214,0.04)",
        }}
      >
        {/* Compaction lines */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 7px)",
          }}
        />
        {/* Mineral veins for corroborated/hardened */}
        {veined && (
          <div
            className={`absolute inset-0 ${reduceMotion ? "" : "animate-vein"}`}
            style={{
              backgroundImage: `radial-gradient(ellipse at 30% 40%, ${color}40, transparent 55%), radial-gradient(ellipse at 75% 60%, ${color}33, transparent 50%)`,
            }}
          />
        )}
        {/* Fault seam */}
        {layer.faultFlag && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
            <FaultLine width={1200} seed={index + 3} reduceMotion={reduceMotion} />
          </div>
        )}

        {/* Inline claim + state word (state never by color alone) */}
        <div className="relative h-full px-4 flex items-center justify-between gap-3">
          <span className="engraved font-engrave text-[13px] truncate max-w-[60%]">
            {layer.claim}
          </span>
          <span className="etched text-[9px] shrink-0" style={{ color }}>
            {STATE_LABELS[layer.state]} . w{layer.weight} . d{layer.depth}
          </span>
        </div>
      </div>

      {/* Per-band engraved instruments on hover/focus */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute z-20 right-2 top-full mt-1 flex flex-wrap gap-1.5 justify-end"
          >
            <InstrumentButton
              size="sm"
              tone="mineral"
              onClick={() => onRead(layer.id)}
              ariaLabel="Read this layer"
            >
              Read this layer
            </InstrumentButton>
            <InstrumentButton
              size="sm"
              tone="brass"
              onClick={onCorroborate}
              ariaLabel="Add a corroborating core"
            >
              Add a corroborating core
            </InstrumentButton>
            {layer.faultFlag && (
              <InstrumentButton
                size="sm"
                tone="fault"
                onClick={onInspectFault}
                ariaLabel="Inspect the fault"
              >
                Inspect the fault
              </InstrumentButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engraved plaque on hover, anchored to the left */}
      <AnimatePresence>
        {hover && (
          <div className="absolute z-30 left-2 top-full mt-1">
            <EngravedPlaque layer={layer} />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
