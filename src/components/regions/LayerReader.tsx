"use client";

import { motion } from "framer-motion";
import { useColumnStore } from "@/store/useColumnStore";
import { EngraveText } from "@/components/ui/EngraveText";
import { InstrumentButton } from "@/components/ui/InstrumentButton";
import {
  STATE_LABELS,
  RELATION_LABELS,
  VANTAGE_LABELS,
  weightPhrase,
  relativeTime,
} from "@/utils/format";
import { bandColor } from "@/utils/layerState";

// Region 4: The Layer Reader. The column splits open like a cracked core,
// revealing engraved interior panels. Not a modal, not a result page.
export function LayerReader() {
  const layer = useColumnStore((s) => s.activeLayer);
  const faults = useColumnStore((s) => s.faults);
  const reduceMotion = useColumnStore((s) => s.reduceMotion);
  const closeLayer = useColumnStore((s) => s.closeLayer);
  const setRegion = useColumnStore((s) => s.setRegion);

  if (!layer) {
    return (
      <section className="px-6 py-20 text-center">
        <EngraveText variant="etched" className="text-[10px]">
          No layer opened. Read a layer from the column.
        </EngraveText>
        <div className="mt-5">
          <InstrumentButton tone="brass" onClick={() => setRegion("column")} ariaLabel="Return to the column">
            Return to the column
          </InstrumentButton>
        </div>
      </section>
    );
  }

  const color = bandColor(layer.state);
  const nearbyFaults = faults.filter((f) => f.layerId === layer.id);

  const takeRubbing = () => {
    const lines = [
      `# Rubbing of a ${STATE_LABELS[layer.state]} layer`,
      "",
      `Claim: ${layer.claim}`,
      `Relation: ${RELATION_LABELS[layer.relation]}`,
      `Weight of agreement: ${layer.weight} (${weightPhrase(layer.weight)})`,
      `Supporters: ${layer.supporters}`,
      `Depth: ${layer.depth}`,
      "",
      "## What corroborates it",
      ...layer.testimonies.map(
        (t) => `- (${VANTAGE_LABELS[t.vantage]}) ${t.text}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rubbing-${layer.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="px-4 sm:px-10 py-12 max-w-4xl mx-auto">
      <EngraveText variant="etched" className="text-[10px] mb-1">
        The Layer Reader
      </EngraveText>
      <EngraveText as="h2" className="text-2xl mb-8">
        A core cracked open.
      </EngraveText>

      {/* Two halves of a cracked core sliding apart to reveal the interior */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={reduceMotion ? { x: 0 } : { x: 40 }}
          animate={{ x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
          className="stone rounded-sm p-5"
          style={{ borderLeft: `3px solid ${color}` }}
        >
          <EngraveText variant="etched" className="text-[9px] mb-2">
            The settled claim
          </EngraveText>
          <EngraveText as="p" className="text-lg leading-snug mb-4">
            {layer.claim}
          </EngraveText>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[10px] font-mark">
            <span className="text-quartz">
              State <span className="text-bone">{STATE_LABELS[layer.state]}</span>
            </span>
            <span className="text-quartz">
              Relation <span className="text-bone">{RELATION_LABELS[layer.relation]}</span>
            </span>
            <span className="text-quartz">
              Depth <span className="text-bone">{layer.depth}</span>
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? { x: 0 } : { x: -40 }}
          animate={{ x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
          className="stone rounded-sm p-5"
        >
          <EngraveText variant="etched" className="text-[9px] mb-2">
            Weight of agreement
          </EngraveText>
          <EngraveText as="p" className="text-3xl mb-1">
            {layer.weight}
          </EngraveText>
          <EngraveText variant="etched" className="text-[9px] mb-4">
            {weightPhrase(layer.weight)} . {layer.supporters} supporters . {relativeTime(layer.createdAt)}
          </EngraveText>
          {/* Compaction bar */}
          <div className="h-2 rounded-full overflow-hidden bg-[rgba(140,138,130,0.2)]">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, (layer.weight / 600) * 100)}%`,
                background: color,
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* What corroborates it */}
      <div className="stone rounded-sm p-5 mt-4">
        <EngraveText variant="etched" className="text-[9px] mb-3">
          What corroborates it
        </EngraveText>
        {layer.testimonies.length === 0 ? (
          <EngraveText variant="etched" className="text-[9px] text-quartz">
            Nothing here corroborates yet.
          </EngraveText>
        ) : (
          <ul className="space-y-3">
            {layer.testimonies.map((t) => (
              <li key={t.id} className="border-l border-[rgba(176,125,58,0.4)] pl-3">
                <p className="engraved font-engrave text-sm leading-snug">{t.text}</p>
                <span className="etched text-[8px] text-quartz">
                  {VANTAGE_LABELS[t.vantage]} . {RELATION_LABELS[t.relation]} . +{t.weightContribution}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Any faults nearby */}
      <div
        className="rounded-sm p-5 mt-4"
        style={{
          background: "linear-gradient(180deg, rgba(166,68,46,0.08), rgba(11,10,8,0.4))",
          border: "1px solid rgba(166,68,46,0.3)",
        }}
      >
        <EngraveText variant="etched" className="text-[9px] mb-3">
          Any faults nearby
        </EngraveText>
        {nearbyFaults.length === 0 ? (
          <EngraveText variant="etched" className="text-[9px] text-quartz">
            No faults touch this layer.
          </EngraveText>
        ) : (
          <ul className="space-y-2">
            {nearbyFaults.map((f) => (
              <li key={f.id} className="text-[11px] font-mark text-[#D98A77]">
                Two claims collide here. The deep holds the {f.holdingSide} side.
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-8">
        <InstrumentButton tone="brass" onClick={() => setRegion("bench")} ariaLabel="Add a corroborating testimony">
          Add a corroborating testimony
        </InstrumentButton>
        <InstrumentButton tone="quiet" onClick={closeLayer} ariaLabel="Return to the column">
          Return to the column
        </InstrumentButton>
        <InstrumentButton tone="mineral" onClick={takeRubbing} ariaLabel="Take a rubbing of this layer">
          Take a rubbing of this layer
        </InstrumentButton>
      </div>
    </section>
  );
}
