"use client";

import { AnimatePresence } from "framer-motion";
import { useColumnStore } from "@/store/useColumnStore";
import { SedimentBand } from "@/components/strata/SedimentBand";
import { DepthScale } from "@/components/strata/DepthScale";
import { SiltField } from "@/components/instrument/SiltField";
import { EngraveText } from "@/components/ui/EngraveText";
import { InstrumentButton } from "@/components/ui/InstrumentButton";

// Region 3: The Column. The main operating space, a tall vertical
// cross-section. Surface (recent, loose, drifting) at the top; deep (old,
// hardened, mineral-teal) at the bottom. Bands are physical objects with
// engraved instruments, never a dashboard or feed.
export function Column() {
  const columns = useColumnStore((s) => s.columns);
  const activeColumnId = useColumnStore((s) => s.activeColumnId);
  const setActiveColumn = useColumnStore((s) => s.setActiveColumn);
  const layers = useColumnStore((s) => s.layers);
  const reduceMotion = useColumnStore((s) => s.reduceMotion);
  const openLayer = useColumnStore((s) => s.openLayer);
  const setRegion = useColumnStore((s) => s.setRegion);
  const takeReading = useColumnStore((s) => s.takeReading);
  const busy = useColumnStore((s) => s.busy);

  const activeColumn = columns.find((c) => c.id === activeColumnId) ?? null;

  return (
    <section className="relative px-4 sm:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <EngraveText variant="etched" className="text-[10px] mb-1">
            The Column . a core sample of shared memory
          </EngraveText>
          <EngraveText as="h2" className="text-2xl">
            {activeColumn ? activeColumn.subject : "No column open yet"}
          </EngraveText>
        </div>
        <div className="flex items-center gap-2">
          <InstrumentButton
            tone="mineral"
            onClick={takeReading}
            disabled={busy || !activeColumn || layers.length === 0}
            ariaLabel="Take a deep reading of the column"
          >
            {busy ? "Reading the strata..." : "Take a deep reading"}
          </InstrumentButton>
          <InstrumentButton
            tone="brass"
            onClick={() => setRegion("bench")}
            ariaLabel="Go to the Coring Bench to drop a testimony"
          >
            Drop a testimony
          </InstrumentButton>
        </div>
      </div>

      {/* Column picker as small engraved studs, only if more than one */}
      {columns.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {columns.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveColumn(c.id)}
              aria-pressed={c.id === activeColumnId}
              className={`font-mark uppercase tracking-[0.14em] text-[9px] px-3 py-1.5 rounded-sm border transition-colors ${
                c.id === activeColumnId
                  ? "border-[rgba(205,176,137,0.9)] text-bone"
                  : "border-[rgba(140,138,130,0.3)] text-quartz hover:text-sand"
              }`}
            >
              {c.subject.slice(0, 28)}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {/* The depth scale rail */}
        <div className="hidden sm:block shrink-0 pt-1">
          <DepthScale height={Math.max(420, layers.length * 96 + 80)} />
        </div>

        {/* The cross-section: surface at top, deep at bottom */}
        <div className="relative flex-1 min-w-0">
          {/* Loose surface band with drifting silt */}
          <div className="relative h-16 rounded-t-sm overflow-hidden mb-1"
            style={{
              background:
                "linear-gradient(180deg, rgba(205,176,137,0.12), rgba(11,10,8,0.2))",
            }}
          >
            <SiltField count={14} reduceMotion={reduceMotion} />
            <div className="relative h-full flex items-center px-4">
              <EngraveText variant="etched" className="text-[9px]">
                Surface band . loose, drifting
              </EngraveText>
            </div>
          </div>

          {layers.length === 0 ? (
            <div className="stone rounded-sm px-5 py-10 text-center">
              <EngraveText variant="etched" className="text-[10px]">
                Nothing here corroborates yet. Drop a core to begin.
              </EngraveText>
            </div>
          ) : (
            <div className="space-y-1 pb-24">
              <AnimatePresence initial={false}>
                {layers.map((layer, i) => (
                  <SedimentBand
                    key={layer.id}
                    layer={layer}
                    index={i}
                    reduceMotion={reduceMotion}
                    onRead={(id) => openLayer(id)}
                    onInspectFault={() => setRegion("faults")}
                    onCorroborate={() => setRegion("bench")}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
