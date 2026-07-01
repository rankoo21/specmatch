"use client";

import { useState } from "react";
import { useColumnStore } from "@/store/useColumnStore";
import { CoreTube } from "@/components/strata/CoreTube";
import { EngraveText } from "@/components/ui/EngraveText";
import { ResinInput } from "@/components/ui/ResinInput";
import { InstrumentButton } from "@/components/ui/InstrumentButton";
import { StoneSlab } from "@/components/ui/StoneSlab";
import type { Vantage } from "@/lib/genlayer/types";
import { VANTAGE_LABELS } from "@/utils/format";

const VANTAGES: Vantage[] = ["witnessed", "heard", "recorded", "inferred"];

// Region 2: The Coring Bench. Not a form. The user prepares and drops a core
// sample: a glass core tube holds the testimony in resin, a subject plate names
// the column, and a small etched vantage mark gives context.
export function CoringBench() {
  const activeColumnId = useColumnStore((s) => s.activeColumnId);
  const columns = useColumnStore((s) => s.columns);
  const openColumn = useColumnStore((s) => s.openColumn);
  const dropTestimony = useColumnStore((s) => s.dropTestimony);
  const busy = useColumnStore((s) => s.busy);

  const activeColumn = columns.find((c) => c.id === activeColumnId) ?? null;

  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [vantage, setVantage] = useState<Vantage>("witnessed");

  const handleDrop = async () => {
    if (!text.trim()) return;
    await dropTestimony(text, vantage);
    setText("");
  };

  return (
    <section className="relative px-6 sm:px-10 py-12 max-w-4xl mx-auto">
      <EngraveText variant="etched" className="text-[10px] mb-2">
        The Coring Bench
      </EngraveText>
      <EngraveText as="h2" className="text-2xl mb-8">
        Prepare a core and drop it into the column.
      </EngraveText>

      {/* Subject plate: chosen once per column, shown as an engraved plate */}
      {activeColumn ? (
        <StoneSlab className="px-5 py-4 mb-8">
          <EngraveText variant="etched" className="text-[9px] mb-1">
            The Subject . engraved plate
          </EngraveText>
          <EngraveText as="p" className="text-lg">
            {activeColumn.subject}
          </EngraveText>
        </StoneSlab>
      ) : (
        <StoneSlab className="px-5 py-5 mb-8">
          <EngraveText variant="etched" className="text-[9px] mb-2">
            The Subject . what this column remembers
          </EngraveText>
          <ResinInput
            id="subject"
            ariaLabel="Subject this column remembers"
            value={subject}
            onChange={setSubject}
            placeholder="Name what this column will remember"
            maxLength={200}
          />
          <div className="mt-3">
            <InstrumentButton
              tone="brass"
              onClick={() => openColumn(subject)}
              disabled={busy || !subject.trim()}
              ariaLabel="Engrave the subject and open the column"
            >
              Engrave the subject
            </InstrumentButton>
          </div>
        </StoneSlab>
      )}

      {/* The Testimony, written into the resin core tube */}
      <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-start">
        <div>
          <EngraveText variant="etched" className="text-[9px] mb-2">
            The Testimony . the resin holds your words
          </EngraveText>
          <ResinInput
            id="testimony"
            ariaLabel="Your testimony, written into the core"
            value={text}
            onChange={setText}
            placeholder="Write what you observed, not what you concluded."
            multiline
            rows={6}
            maxLength={1200}
          />

          {/* Vantage: a small etched mark on the tube, context not authority */}
          <div className="mt-5">
            <EngraveText variant="etched" className="text-[9px] mb-2">
              Vantage . how you know this
            </EngraveText>
            <div className="flex flex-wrap gap-2">
              {VANTAGES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVantage(v)}
                  aria-pressed={vantage === v}
                  className={`font-mark uppercase tracking-[0.16em] text-[10px] px-3 py-1.5 rounded-sm border transition-colors ${
                    vantage === v
                      ? "border-[rgba(205,176,137,0.9)] text-bone"
                      : "border-[rgba(140,138,130,0.35)] text-quartz hover:text-sand"
                  }`}
                >
                  {VANTAGE_LABELS[v]}
                </button>
              ))}
            </div>
          </div>

          {/* Engraved guidance */}
          <ul className="mt-6 space-y-1.5">
            {[
              "Write what you observed, not what you concluded.",
              "Recurring facts sink and harden. Isolated claims float.",
              "Contradictions will show as a fault.",
            ].map((g) => (
              <li key={g} className="etched text-[9px] text-quartz">
                . {g}
              </li>
            ))}
          </ul>

          <div className="mt-7">
            <InstrumentButton
              tone="mineral"
              onClick={handleDrop}
              disabled={busy || !activeColumn || !text.trim()}
              ariaLabel="Drop the core into the column"
            >
              {busy ? "The keepers are reading..." : "Drop the core"}
            </InstrumentButton>
            {!activeColumn && (
              <EngraveText variant="etched" className="text-[9px] mt-3 text-[#D98A77]">
                Choose a subject before opening a column.
              </EngraveText>
            )}
          </div>
        </div>

        {/* The tube, with the testimony suspended in resin */}
        <div className="hidden sm:block w-28">
          <CoreTube glow={Boolean(text.trim())}>
            <div className="h-72 px-2 py-3 overflow-hidden">
              <p className="engraved font-engrave text-[10px] leading-relaxed text-center opacity-80">
                {text.trim() ? text.slice(0, 240) : "your words, held in resin"}
              </p>
            </div>
          </CoreTube>
          <EngraveText variant="etched" className="text-[8px] mt-3 text-center">
            {VANTAGE_LABELS[vantage]}
          </EngraveText>
        </div>
      </div>
    </section>
  );
}
