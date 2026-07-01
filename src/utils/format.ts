import type { LayerState, Relation, Vantage } from "@/lib/genlayer/types";

export function shortAddress(addr: string): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function relativeTime(ts: number | null, now = Date.now()): string {
  if (!ts) return "unmarked";
  const diff = Math.max(0, now - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "just settled";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m deep`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h deep`;
  const day = Math.floor(hr / 24);
  return `${day}d deep`;
}

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export function mockTxHash(): string {
  const hex = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 64; i++) out += hex[Math.floor(Math.random() * 16)];
  return out;
}

// Human labels. State is never conveyed by color alone; these words travel with
// every band and plaque.
export const STATE_LABELS: Record<LayerState, string> = {
  loose: "Loose",
  settling: "Settling",
  corroborated: "Corroborated",
  hardened: "Hardened",
  floating: "Floating",
  faulted: "Faulted",
};

export const STATE_BLURB: Record<LayerState, string> = {
  loose: "Freshly dropped, not yet settled.",
  settling: "Under reading, compacting.",
  corroborated: "Recurs across testimonies. Sinking and darkening.",
  hardened: "Sustained agreement. Compressed into canonical rock.",
  floating: "An isolated claim near the surface, unattached.",
  faulted: "A contradiction cracked across this band.",
};

export const RELATION_LABELS: Record<Relation, string> = {
  corroborates: "Corroborates the deep",
  contradicts: "Contradicts a layer",
  distorts: "Distorts a layer",
  new: "A new claim",
};

export const VANTAGE_LABELS: Record<Vantage, string> = {
  witnessed: "Witnessed",
  heard: "Heard",
  recorded: "Recorded",
  inferred: "Inferred",
  unstated: "Unstated",
};

// Weight of agreement, phrased geologically rather than as a score.
export function weightPhrase(weight: number): string {
  if (weight >= 600) return "compressed to rock";
  if (weight >= 300) return "settling under weight";
  if (weight >= 150) return "gaining weight";
  return "light, near the surface";
}
