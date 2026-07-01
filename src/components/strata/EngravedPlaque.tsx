"use client";

import { motion } from "framer-motion";
import type { Layer } from "@/lib/genlayer/types";
import { STATE_LABELS, weightPhrase, relativeTime } from "@/utils/format";

interface EngravedPlaqueProps {
  layer: Layer;
}

// On hover over a band, this engraved plaque surfaces: short claim, weight of
// agreement, supporter count, depth/age, fault flag. Never a tooltip card.
export function EngravedPlaque({ layer }: EngravedPlaqueProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.28 }}
      className="stone rounded-sm px-4 py-3 w-72 max-w-[80vw]"
      role="status"
    >
      <p className="engraved font-engrave text-sm leading-snug mb-2">{layer.claim}</p>
      <dl className="grid grid-cols-2 gap-y-1 text-[10px] font-mark">
        <dt className="etched text-[9px]">State</dt>
        <dd className="text-bone text-right">{STATE_LABELS[layer.state]}</dd>
        <dt className="etched text-[9px]">Weight</dt>
        <dd className="text-bone text-right">
          {layer.weight} . {weightPhrase(layer.weight)}
        </dd>
        <dt className="etched text-[9px]">Supporters</dt>
        <dd className="text-bone text-right">{layer.supporters}</dd>
        <dt className="etched text-[9px]">Depth</dt>
        <dd className="text-bone text-right">{layer.depth} . {relativeTime(layer.createdAt)}</dd>
        {layer.faultFlag && (
          <>
            <dt className="etched text-[9px] text-[#D98A77]">Fault</dt>
            <dd className="text-[#D98A77] text-right">{layer.contradictions} crossing</dd>
          </>
        )}
      </dl>
    </motion.div>
  );
}
