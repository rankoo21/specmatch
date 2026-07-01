"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useColumnStore } from "@/store/useColumnStore";
import { EngraveText } from "@/components/ui/EngraveText";
import { InstrumentButton } from "@/components/ui/InstrumentButton";
import type { ArchivedCore } from "@/lib/genlayer/types";
import { STATE_LABELS } from "@/utils/format";

// Region 6: The Core Archive. A rack of sealed glass core samples, each a
// compressed slice of a column at a moment in time. Pulling a core from the
// rack unrolls it into a readable cross-section strip. Never a grid or history
// table.
export function CoreArchive() {
  const cores = useColumnStore((s) => s.cores);
  const archiveCore = useColumnStore((s) => s.archiveCore);
  const busy = useColumnStore((s) => s.busy);
  const activeColumnId = useColumnStore((s) => s.activeColumnId);
  const setRegion = useColumnStore((s) => s.setRegion);
  const [openId, setOpenId] = useState<string | null>(null);

  const exportMarkdown = (core: ArchivedCore) => {
    const lines = [
      `# Core rubbing . ${core.subject}`,
      `Preserved: ${new Date(core.archivedAt).toISOString()}`,
      `Hash: ${core.mockTxHash}`,
      "",
      "## Hardened and corroborated layers",
      ...core.hardenedLayers.map(
        (l) => `- [${STATE_LABELS[l.state]}] ${l.claim} (weight ${l.weight}, depth ${l.depth})`,
      ),
      "",
      "## Faults",
      ...core.faults.map((f) => `- ${f.claimA} vs ${f.claimB} (holds ${f.holdingSide})`),
    ];
    download(`${core.id}.md`, lines.join("\n"), "text/markdown");
  };

  const exportJson = (core: ArchivedCore) => {
    download(`${core.id}.json`, JSON.stringify(core, null, 2), "application/json");
  };

  const exportText = (core: ArchivedCore) => {
    const lines = [
      `Core: ${core.subject}`,
      `Preserved ${new Date(core.archivedAt).toLocaleString()}`,
      "",
      ...core.hardenedLayers.map((l) => `${STATE_LABELS[l.state]}: ${l.claim}`),
    ];
    download(`${core.id}.txt`, lines.join("\n"), "text/plain");
  };

  return (
    <section className="px-4 sm:px-10 py-12 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <EngraveText variant="etched" className="text-[10px] mb-1">
            The Core Archive . sealed slices of the column
          </EngraveText>
          <EngraveText as="h2" className="text-2xl">
            Preserved cores.
          </EngraveText>
        </div>
        <InstrumentButton
          tone="mineral"
          onClick={archiveCore}
          disabled={busy || !activeColumnId}
          ariaLabel="Seal the current column into a preserved core"
        >
          {busy ? "Sealing the core..." : "Seal a core now"}
        </InstrumentButton>
      </div>

      {cores.length === 0 ? (
        <div className="stone rounded-sm px-5 py-12 text-center">
          <EngraveText variant="etched" className="text-[10px]">
            The rack is empty. Seal a core to preserve the hardened strata.
          </EngraveText>
        </div>
      ) : (
        // The rack of luminous mineral cores
        <div className="flex gap-5 overflow-x-auto thin-scroll pb-4">
          {cores.map((core) => {
            const open = openId === core.id;
            return (
              <div key={core.id} className="shrink-0">
                <motion.button
                  onClick={() => setOpenId(open ? null : core.id)}
                  whileHover={{ y: -4 }}
                  className="block"
                  aria-label={`Core of ${core.subject}. Pull to unroll.`}
                  aria-expanded={open}
                >
                  {/* Sealed glass core object */}
                  <div
                    className="w-16 h-56 rounded-sm relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(63,168,155,0.18), rgba(176,125,58,0.14), rgba(11,10,8,0.6))",
                      border: "1px solid rgba(205,176,137,0.3)",
                      boxShadow: "inset 0 0 18px rgba(63,168,155,0.15), 0 0 14px rgba(0,0,0,0.5)",
                    }}
                  >
                    {core.hardenedLayers.map((l, i) => (
                      <div
                        key={l.id}
                        className="absolute left-0 right-0"
                        style={{
                          top: `${10 + i * 16}%`,
                          height: 10,
                          background:
                            l.state === "hardened"
                              ? "rgba(46,111,102,0.8)"
                              : "rgba(63,168,155,0.55)",
                        }}
                      />
                    ))}
                  </div>
                  <EngraveText variant="etched" className="text-[8px] mt-2 w-16 truncate text-center">
                    {core.subject.slice(0, 16)}
                  </EngraveText>
                </motion.button>
              </div>
            );
          })}
        </div>
      )}

      {/* The unrolled cross-section strip */}
      <AnimatePresence>
        {openId &&
          (() => {
            const core = cores.find((c) => c.id === openId);
            if (!core) return null;
            return (
              <motion.div
                key={core.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-8"
              >
                <div className="stone rounded-sm p-5">
                  <EngraveText variant="etched" className="text-[9px] mb-1">
                    Read the section
                  </EngraveText>
                  <EngraveText as="h3" className="text-lg mb-1">
                    {core.subject}
                  </EngraveText>
                  <EngraveText variant="etched" className="text-[8px] mb-4 text-quartz">
                    sealed {new Date(core.archivedAt).toLocaleString()} . {core.mockTxHash.slice(0, 18)}...
                  </EngraveText>

                  <div className="space-y-2 mb-5">
                    {core.hardenedLayers.length === 0 ? (
                      <EngraveText variant="etched" className="text-[9px] text-quartz">
                        No hardened layers were sealed in this core.
                      </EngraveText>
                    ) : (
                      core.hardenedLayers.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between gap-3 border-b border-[rgba(140,138,130,0.15)] pb-2"
                        >
                          <span className="engraved font-engrave text-sm">{l.claim}</span>
                          <span className="etched text-[8px] shrink-0 text-mineral">
                            {STATE_LABELS[l.state]} . w{l.weight}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <InstrumentButton size="sm" tone="brass" onClick={() => exportMarkdown(core)} ariaLabel="Take a rubbing as Markdown">
                      Take a rubbing
                    </InstrumentButton>
                    <InstrumentButton size="sm" tone="mineral" onClick={() => exportJson(core)} ariaLabel="Cast a copy as JSON">
                      Cast a copy
                    </InstrumentButton>
                    <InstrumentButton size="sm" tone="quiet" onClick={() => exportText(core)} ariaLabel="Read the section as plain text">
                      Read the section
                    </InstrumentButton>
                  </div>
                </div>
              </motion.div>
            );
          })()}
      </AnimatePresence>

      <div className="mt-8">
        <InstrumentButton tone="brass" onClick={() => setRegion("column")} ariaLabel="Return to the column">
          Return to the column
        </InstrumentButton>
      </div>
    </section>
  );
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
