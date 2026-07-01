"use client";

import { create } from "zustand";
import { getAdapter } from "@/lib/genlayer";
import type {
  AddTestimonyInput,
  ArchivedCore,
  Column,
  Fault,
  Layer,
  LayerReading,
  TestimonyResult,
  Vantage,
} from "@/lib/genlayer/types";
import { shortAddress } from "@/utils/format";

// The six depth regions of one continuous core sample.
export type Region =
  | "surface"
  | "bench"
  | "column"
  | "reader"
  | "faults"
  | "archive";

// Ordered surface to deep for the Depth Gauge bead mapping.
export const REGION_ORDER: Region[] = [
  "surface",
  "bench",
  "column",
  "reader",
  "faults",
  "archive",
];

export const REGION_LABELS: Record<Region, string> = {
  surface: "The Surface",
  bench: "The Coring Bench",
  column: "The Column",
  reader: "The Layer Reader",
  faults: "The Fault Map",
  archive: "The Core Archive",
};

interface ColumnState {
  // navigation
  region: Region;
  setRegion: (r: Region) => void;
  // 0..1 depth scrub position, driven by the Depth Gauge.
  scrub: number;
  setScrub: (v: number) => void;

  // identity (the core tag)
  tagAddress: string | null;
  tagLabel: string;
  tagCore: () => Promise<void>;
  releaseTag: () => void;

  // data
  columns: Column[];
  activeColumnId: string | null;
  layers: Layer[];
  faults: Fault[];
  cores: ArchivedCore[];
  activeLayer: LayerReading | null;
  lastResult: TestimonyResult | null;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;

  busy: boolean;
  error: string | null;
  notice: string | null;

  // lifecycle
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  setActiveColumn: (id: string | null) => Promise<void>;
  openColumn: (subject: string) => Promise<void>;
  dropTestimony: (text: string, vantage: Vantage) => Promise<void>;
  takeReading: () => Promise<void>;
  openLayer: (layerId: string) => Promise<void>;
  closeLayer: () => void;
  archiveCore: () => Promise<void>;
  clearMessages: () => void;
}

const adapter = getAdapter();

// Writes require a tagged core (a connected wallet) in contract mode. Reads
// never do. Returns true when a write may proceed; otherwise sets a geological
// prompt to tag the core and returns false.
function ensureTagged(
  set: (partial: Partial<ColumnState>) => void,
): boolean {
  if (adapter.mode === "contract" && !adapter.isUsingWallet?.()) {
    set({ error: "Tag your core (connect a wallet) to do this." });
    return false;
  }
  return true;
}

export const useColumnStore = create<ColumnState>((set, get) => ({
  region: "surface",
  setRegion: (r) => set({ region: r }),
  scrub: 0,
  setScrub: (v) => set({ scrub: Math.max(0, Math.min(1, v)) }),

  tagAddress: null,
  tagLabel: "Tag your core",
  tagCore: async () => {
    // The only identity path is connecting a real browser wallet through The
    // Core Tag. In mock mode the adapter supplies a synthetic identity so the
    // offline demo still works; there is no in-browser burner key.
    if (adapter.mode === "contract") {
      if (!adapter.hasInjectedWallet?.() || !adapter.connectWallet) {
        set({
          error:
            "No browser wallet found. Install MetaMask with the GenLayer Snap, then tag your core.",
        });
        return;
      }
      set({ busy: true, error: null });
      try {
        const addr = await adapter.connectWallet();
        set({ tagAddress: addr, tagLabel: shortAddress(addr) });
      } catch (e) {
        set({ error: (e as Error).message });
      } finally {
        set({ busy: false });
      }
      return;
    }
    const real = adapter.getIdentityAddress();
    if (real) {
      set({ tagAddress: real, tagLabel: shortAddress(real) });
    }
  },
  releaseTag: () => {
    adapter.disconnectWallet?.();
    set({ tagAddress: null, tagLabel: "Tag your core" });
  },

  columns: [],
  activeColumnId: null,
  layers: [],
  faults: [],
  cores: [],
  activeLayer: null,
  lastResult: null,
  reduceMotion: false,
  setReduceMotion: (v) => set({ reduceMotion: v }),

  busy: false,
  error: null,
  notice: null,

  bootstrap: async () => {
    const columns = await adapter.getColumns();
    set({ columns });
    const first = columns[0]?.id ?? null;
    if (first) {
      await get().setActiveColumn(first);
    }
  },

  refresh: async () => {
    const columns = await adapter.getColumns();
    set({ columns });
    const id = get().activeColumnId;
    if (!id) return;
    const [layers, faults, cores] = await Promise.all([
      adapter.getLayers(id),
      adapter.getFaults(id),
      adapter.getCores(id),
    ]);
    set({ layers, faults, cores });
  },

  setActiveColumn: async (id) => {
    set({ activeColumnId: id, activeLayer: null });
    if (!id) {
      set({ layers: [], faults: [], cores: [] });
      return;
    }
    const [layers, faults, cores] = await Promise.all([
      adapter.getLayers(id),
      adapter.getFaults(id),
      adapter.getCores(id),
    ]);
    set({ layers, faults, cores });
  },

  openColumn: async (subject) => {
    if (!subject.trim()) {
      set({ error: "Choose a subject before opening a column." });
      return;
    }
    if (!ensureTagged(set)) return;
    set({ busy: true, error: null });
    try {
      const column = await adapter.openColumn(subject.trim());
      await get().refresh();
      await get().setActiveColumn(column.id);
      set({ notice: "A column opened. Drop the first core." });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  dropTestimony: async (text, vantage) => {
    const columnId = get().activeColumnId;
    if (!columnId) {
      set({ error: "Open a column before dropping a core." });
      return;
    }
    if (!text.trim()) {
      set({ error: "A core needs words before it can settle." });
      return;
    }
    if (!ensureTagged(set)) return;
    set({ busy: true, error: null });
    try {
      const result = await adapter.addTestimony({
        columnId,
        text: text.trim(),
        vantage,
      } satisfies AddTestimonyInput);
      await get().refresh();
      set({ lastResult: result, notice: result.note, region: "column" });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  takeReading: async () => {
    const columnId = get().activeColumnId;
    if (!columnId) return;
    if (!ensureTagged(set)) return;
    set({ busy: true, error: null });
    try {
      const result = await adapter.takeReading(columnId);
      await get().refresh();
      set({ notice: result.note });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  openLayer: async (layerId) => {
    set({ busy: true, error: null });
    try {
      const layer = await adapter.getLayer(layerId);
      if (!layer) {
        set({ error: "This layer could not be read." });
        return;
      }
      if (layer.state === "loose") {
        set({ error: "This layer is still loose; it cannot be read as settled." });
        return;
      }
      set({ activeLayer: layer, region: "reader" });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  closeLayer: () => set({ activeLayer: null, region: "column" }),

  archiveCore: async () => {
    const columnId = get().activeColumnId;
    if (!columnId) return;
    if (!ensureTagged(set)) return;
    set({ busy: true, error: null });
    try {
      await adapter.archiveCore(columnId);
      await get().refresh();
      set({ notice: "A core was sealed and preserved.", region: "archive" });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  clearMessages: () => set({ error: null, notice: null }),
}));
