"use client";

import { useColumnStore } from "@/store/useColumnStore";
import { EngraveText } from "@/components/ui/EngraveText";
import { InstrumentButton } from "@/components/ui/InstrumentButton";
import { FaultLine } from "@/components/strata/FaultLine";

// Region 5: The Fault Map. The same column in "stress" mode, where rust fault
// lines glow across the depths they touch. Each fault is presented as a
// geological feature to inspect, never as an error list or moderation queue.
export function FaultMap() {
  const faults = useColumnStore((s) => s.faults);
  const reduceMotion = useColumnStore((s) => s.reduceMotion);
  const setRegion = useColumnStore((s) => s.setRegion);

  return (
    <section className="px-4 sm:px-10 py-12 max-w-4xl mx-auto">
      <EngraveText variant="etched" className="text-[10px] mb-1">
        The Fault Map . the column under stress
      </EngraveText>
      <EngraveText as="h2" className="text-2xl mb-8">
        Where claims collide.
      </EngraveText>

      {faults.length === 0 ? (
        <div className="stone rounded-sm px-5 py-12 text-center">
          <EngraveText variant="etched" className="text-[10px]">
            No faults run through this column. The strata hold together.
          </EngraveText>
        </div>
      ) : (
        <div className="space-y-6">
          {faults.map((f, i) => (
            <div
              key={f.id}
              className="rounded-sm p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(166,68,46,0.1), rgba(11,10,8,0.5))",
                border: "1px solid rgba(166,68,46,0.35)",
              }}
            >
              {/* The fault seam glowing across the depth it touches */}
              <div className="absolute inset-x-0 top-0">
                <FaultLine width={1200} seed={i + 1} reduceMotion={reduceMotion} />
              </div>

              <EngraveText variant="etched" className="text-[9px] mt-3 mb-3">
                A fault appeared . depth {f.depth}
              </EngraveText>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border-l-2 pl-3" style={{ borderColor: "rgba(63,168,155,0.6)" }}>
                  <EngraveText variant="etched" className="text-[8px] mb-1">
                    The settled side . weight {f.weightA}
                  </EngraveText>
                  <p className="engraved font-engrave text-sm leading-snug">{f.claimA}</p>
                </div>
                <div className="border-l-2 pl-3" style={{ borderColor: "rgba(166,68,46,0.7)" }}>
                  <EngraveText variant="etched" className="text-[8px] mb-1">
                    The colliding claim . weight {f.weightB}
                  </EngraveText>
                  <p className="engraved font-engrave text-sm leading-snug">{f.claimB}</p>
                </div>
              </div>

              <p className="mt-4 text-[11px] font-mark text-[#D98A77]">
                {f.holdingSide === "even"
                  ? "Two claims collide here. Neither side carries more weight yet."
                  : `Two claims collide here. The deep holds the ${f.holdingSide} side.`}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <InstrumentButton tone="brass" onClick={() => setRegion("column")} ariaLabel="Return to the column">
          Return to the column
        </InstrumentButton>
      </div>
    </section>
  );
}
