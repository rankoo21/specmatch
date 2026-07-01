"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useColumnStore } from "@/store/useColumnStore";
import { DepthGauge } from "@/components/instrument/DepthGauge";
import { CoreTag } from "@/components/instrument/CoreTag";
import { BedrockRail } from "@/components/instrument/BedrockRail";
import { ColumnWorld } from "@/components/instrument/ColumnWorld";
import { Surface } from "@/components/regions/Surface";
import { CoringBench } from "@/components/regions/CoringBench";
import { Column } from "@/components/regions/Column";
import { LayerReader } from "@/components/regions/LayerReader";
import { FaultMap } from "@/components/regions/FaultMap";
import { CoreArchive } from "@/components/regions/CoreArchive";

export default function Page() {
  const region = useColumnStore((s) => s.region);
  const bootstrap = useColumnStore((s) => s.bootstrap);
  const setReduceMotion = useColumnStore((s) => s.setReduceMotion);
  const error = useColumnStore((s) => s.error);
  const notice = useColumnStore((s) => s.notice);
  const clearMessages = useColumnStore((s) => s.clearMessages);

  useEffect(() => {
    bootstrap();
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }
  }, [bootstrap, setReduceMotion]);

  useEffect(() => {
    if (!error && !notice) return;
    const t = setTimeout(clearMessages, 4200);
    return () => clearTimeout(t);
  }, [error, notice, clearMessages]);

  return (
    <main className="relative min-h-screen flex flex-col">
      <DepthGauge />
      <CoreTag />

      <ColumnWorld>
        <AnimatePresence mode="wait">
          <motion.div
            key={region}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {region === "surface" && <Surface />}
            {region === "bench" && <CoringBench />}
            {region === "column" && <Column />}
            {region === "reader" && <LayerReader />}
            {region === "faults" && <FaultMap />}
            {region === "archive" && <CoreArchive />}
          </motion.div>
        </AnimatePresence>
      </ColumnWorld>

      {/* Settling notices, engraved into a passing silt band */}
      <AnimatePresence>
        {(error || notice) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%]"
          >
            <div
              className="rounded-sm px-4 py-3 text-center"
              style={{
                background: error
                  ? "linear-gradient(180deg, rgba(166,68,46,0.16), rgba(11,10,8,0.9))"
                  : "linear-gradient(180deg, rgba(63,168,155,0.14), rgba(11,10,8,0.9))",
                border: `1px solid ${error ? "rgba(166,68,46,0.4)" : "rgba(63,168,155,0.4)"}`,
              }}
            >
              <span className={`font-mark text-[11px] ${error ? "text-[#D98A77]" : "text-[#9FD9CF]"}`}>
                {error ?? notice}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BedrockRail />
    </main>
  );
}
