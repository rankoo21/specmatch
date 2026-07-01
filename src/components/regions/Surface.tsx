"use client";

import { motion } from "framer-motion";
import { useColumnStore } from "@/store/useColumnStore";
import { SiltField } from "@/components/instrument/SiltField";
import { CoreTube } from "@/components/strata/CoreTube";
import { EngraveText } from "@/components/ui/EngraveText";
import { SILT_HINTS } from "@/data/mockTestimonies";

// Region 1: The Surface. The top of a core under a glass instrument cap, loose
// silt drifting, depth fading into darkness below. The only affordance is to
// lower a core tube into the surface, which slides to the Coring Bench.
export function Surface() {
  const setRegion = useColumnStore((s) => s.setRegion);
  const reduceMotion = useColumnStore((s) => s.reduceMotion);

  return (
    <section className="relative min-h-[calc(100vh-46px)] flex flex-col items-center justify-center px-6 py-16">
      <SiltField reduceMotion={reduceMotion} />

      {/* Glass instrument cap with engraved title */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl"
      >
        <div
          className="mx-auto mb-8 rounded-full px-8 py-6"
          style={{
            background:
              "radial-gradient(80% 100% at 50% 0%, rgba(237,230,214,0.08), transparent 70%)",
            border: "1px solid rgba(205,176,137,0.18)",
          }}
        >
          <EngraveText as="h1" className="text-4xl sm:text-5xl leading-tight">
            Memory, settled into stone.
          </EngraveText>
        </div>

        {/* Etched into the surface band */}
        <EngraveText variant="etched" className="text-[11px] leading-relaxed max-w-md mx-auto">
          Drop a testimony. What recurs will harden. What stands alone will float.
        </EngraveText>
      </motion.div>

      {/* The core tube: lowering it begins coring */}
      <motion.button
        onClick={() => setRegion("bench")}
        whileHover={reduceMotion ? undefined : { y: 10 }}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 mt-14 group"
        aria-label="Lower a core to begin"
      >
        <CoreTube className="w-24" glow>
          <div className="h-40 flex items-end justify-center pb-3">
            <motion.span
              animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="etched text-[8px] text-mineral"
            >
              lower
            </motion.span>
          </div>
        </CoreTube>
        <EngraveText variant="etched" className="mt-4 text-[10px] group-hover:text-bone transition-colors">
          Lower a core to begin
        </EngraveText>
      </motion.button>

      {/* Drifting silt hints near the surface */}
      <div className="relative z-10 mt-16 flex flex-wrap gap-x-8 gap-y-2 justify-center max-w-xl">
        {SILT_HINTS.map((hint, i) => (
          <motion.span
            key={hint}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 6, delay: i * 1.2, repeat: Infinity }}
            className="etched text-[9px] text-quartz"
          >
            {hint}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
