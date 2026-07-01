"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import {
  REGION_ORDER,
  REGION_LABELS,
  useColumnStore,
  type Region,
} from "@/store/useColumnStore";

// The Depth Gauge: a slim brass-and-glass gauge fixed to one side of the
// viewport, marked with depth ticks. A draggable bead travels along it. Idle it
// ticks faintly. Dragging the bead scrubs the whole column through depth/time;
// distinct depth zones map to regions. The active region is shown by the bead
// position and a glowing tick, never by tabs.
export function DepthGauge() {
  const region = useColumnStore((s) => s.region);
  const setRegion = useColumnStore((s) => s.setRegion);
  const setScrub = useColumnStore((s) => s.setScrub);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const y = useMotionValue(0);

  const regionIndex = Math.max(0, REGION_ORDER.indexOf(region));
  const steps = REGION_ORDER.length - 1;

  // Place the bead at the active region whenever it changes from elsewhere.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const h = track.clientHeight;
    const pos = (regionIndex / steps) * h;
    y.set(pos);
    setScrub(regionIndex / steps);
  }, [regionIndex, steps, y, setScrub]);

  const settleToNearest = useCallback(
    (pos: number) => {
      const track = trackRef.current;
      if (!track) return;
      const h = track.clientHeight;
      const ratio = Math.max(0, Math.min(1, pos / h));
      const idx = Math.round(ratio * steps);
      const target = REGION_ORDER[idx] as Region;
      setScrub(idx / steps);
      setRegion(target);
    },
    [steps, setRegion, setScrub],
  );

  return (
    <div
      className="fixed left-0 top-0 bottom-0 z-40 w-16 sm:w-20 flex flex-col items-center py-6 select-none"
      style={{
        background: "linear-gradient(90deg, rgba(11,10,8,0.9), rgba(11,10,8,0.2))",
        borderRight: "1px solid rgba(176,125,58,0.2)",
      }}
      role="group"
      aria-label="The Depth Gauge. Scrub the depth to travel the column."
    >
      <span className="etched text-[8px] mb-3 rotate-0">Depth</span>

      <div ref={trackRef} className="relative flex-1 w-8 flex justify-center">
        {/* Brass rail with engraved ticks */}
        <div className="absolute inset-y-0 w-[2px] bg-[rgba(176,125,58,0.5)]" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 tick-line animate-tick opacity-70" />

        {/* Region ticks */}
        {REGION_ORDER.map((r, i) => {
          const active = r === region;
          return (
            <button
              key={r}
              onClick={() => setRegion(r)}
              aria-label={`Go to ${REGION_LABELS[r]}`}
              aria-current={active ? "true" : undefined}
              className="absolute left-1/2 -translate-x-1/2 group"
              style={{ top: `${(i / steps) * 100}%` }}
            >
              <span
                className="block h-[2px] transition-all"
                style={{
                  width: active ? 22 : 12,
                  background: active ? "#3FA89B" : "rgba(205,176,137,0.6)",
                  boxShadow: active ? "0 0 8px rgba(63,168,155,0.8)" : "none",
                }}
              />
            </button>
          );
        })}

        {/* Draggable bead */}
        <motion.div
          drag="y"
          dragConstraints={trackRef}
          dragElastic={0.04}
          dragMomentum={false}
          style={{ y }}
          onDrag={(_, info) => {
            const track = trackRef.current;
            if (!track) return;
            const rect = track.getBoundingClientRect();
            setScrub(Math.max(0, Math.min(1, (info.point.y - rect.top) / rect.height)));
          }}
          onDragEnd={(_, info) => {
            const track = trackRef.current;
            if (!track) return;
            const rect = track.getBoundingClientRect();
            settleToNearest(info.point.y - rect.top);
          }}
          whileDrag={{ scale: 1.15 }}
          tabIndex={0}
          role="slider"
          aria-label="Depth bead. Drag to scrub the column."
          aria-valuemin={0}
          aria-valuemax={steps}
          aria-valuenow={regionIndex}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setRegion(REGION_ORDER[Math.min(steps, regionIndex + 1)]);
            if (e.key === "ArrowUp") setRegion(REGION_ORDER[Math.max(0, regionIndex - 1)]);
          }}
          className="absolute left-1/2 -translate-x-1/2 -ml-[1px] cursor-grab active:cursor-grabbing z-10"
        >
          <div
            className="w-5 h-5 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #EDE6D6, #B07D3A 60%, #5B4327)",
              boxShadow: "0 0 10px rgba(63,168,155,0.5), inset 0 1px 1px rgba(255,255,255,0.4)",
              border: "1px solid rgba(11,10,8,0.5)",
            }}
          />
        </motion.div>
      </div>

      {/* Active region name, written vertically along the gauge */}
      <div className="mt-3 h-28 flex items-center justify-center">
        <span
          className="etched text-[9px] whitespace-nowrap"
          style={{ writingMode: "vertical-rl" }}
        >
          {REGION_LABELS[region]}
        </span>
      </div>
      <span className="etched text-[8px] mt-2">Deep</span>
    </div>
  );
}
