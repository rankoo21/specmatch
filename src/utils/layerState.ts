import type { Layer, LayerState, Relation, WeightBand } from "@/lib/genlayer/types";

// Deterministic mirror of the contract's settling rules. The mock adapter uses
// these so the offline experience matches what the on-chain contract derives.
// Hardening is computed from accumulated weight, never chosen freely; isolated
// claims cannot self-harden.

export const WEIGHT_BASE = 100;
export const WEIGHT_CORROBORATED = 300;
export const WEIGHT_HARDENED = 600;
export const MIN_SUPPORTERS_CORROBORATED = 2;
export const MIN_SUPPORTERS_HARDENED = 3;
export const WEIGHT_MAX = 100000;
export const DEPTH_MAX = 1000;
export const AMEND_CONTRADICTION_MIN = 2;

export const BAND_WEIGHT: Record<WeightBand, number> = {
  strong: 300,
  moderate: 170,
  slight: 80,
};

export const COLORS = {
  core: "#0B0A08",
  slate: "#2B2A26",
  umber: "#5B4327",
  ochre: "#B07D3A",
  sand: "#CDB089",
  bone: "#EDE6D6",
  mineral: "#3FA89B",
  fault: "#A6442E",
  quartz: "#8C8A82",
};

// The base mineral tone of a band at a given state. Teal only for corroborated
// cores; rust only for faults. State is always also carried by the label.
export function bandColor(state: LayerState): string {
  switch (state) {
    case "hardened":
      return "#2E6F66"; // deep mineral teal, darkened by compression
    case "corroborated":
      return COLORS.mineral;
    case "faulted":
      return COLORS.fault;
    case "floating":
      return COLORS.sand;
    case "settling":
      return COLORS.ochre;
    case "loose":
    default:
      return COLORS.ochre;
  }
}

export function deriveState(
  weight: number,
  supporters: number,
  contradictions: number,
  alreadyHardened: boolean,
  hasFault: boolean,
): LayerState {
  if (alreadyHardened) {
    if (contradictions >= AMEND_CONTRADICTION_MIN && weight < WEIGHT_HARDENED) {
      return "faulted";
    }
    return "hardened";
  }
  if (weight >= WEIGHT_HARDENED && supporters >= MIN_SUPPORTERS_HARDENED) {
    return "hardened";
  }
  if (hasFault && contradictions > 0) return "faulted";
  if (weight >= WEIGHT_CORROBORATED && supporters >= MIN_SUPPORTERS_CORROBORATED) {
    return "corroborated";
  }
  if (supporters <= 1) return "floating";
  return "settling";
}

export function depthFor(weight: number, state: LayerState): number {
  const base = state === "floating" ? Math.min(weight, 120) : weight;
  let depth = Math.floor((base * DEPTH_MAX) / WEIGHT_HARDENED);
  if (depth > DEPTH_MAX) depth = DEPTH_MAX;
  if (state === "hardened" && depth < 750) depth = 750;
  return depth;
}

// Recompute a layer's state and depth in place from its accumulated fields.
export function recomputeLayer(layer: Layer): Layer {
  const weight = Math.min(layer.weight, WEIGHT_MAX);
  const state = deriveState(
    weight,
    layer.supporters,
    layer.contradictions,
    layer.hardened,
    layer.faultFlag,
  );
  return {
    ...layer,
    weight,
    hardened: state === "hardened" ? true : layer.hardened,
    state,
    depth: depthFor(weight, state),
  };
}

// Simple deterministic lexical overlap, mirroring the contract backstop. Used by
// the mock to keep classifications grounded in shared language.
function wordSet(text: string): Set<string> {
  const out = new Set<string>();
  for (const w of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length >= 4) out.add(w);
  }
  return out;
}

export function overlapScore(a: string, b: string): number {
  const sa = wordSet(a);
  const sb = wordSet(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter += 1;
  const denom = Math.min(sa.size, sb.size);
  if (denom === 0) return 0;
  return Math.floor((inter * 100) / denom);
}

// Mock classifier: decide how a new testimony relates to existing layers, using
// only lexical overlap and a few cue words. The real relation comes from the
// GenLayer keepers; this keeps the offline flow believable and deterministic.
export interface MockClassification {
  relation: Relation;
  targetIndex: number;
  band: WeightBand;
  claim: string;
}

const CONTRADICT_CUES = [
  "never",
  "did not",
  "didn't",
  "stayed open",
  "no flood",
  "untrue",
  "false",
  "actually",
  "contrary",
];

export function classifyTestimony(
  text: string,
  claims: string[],
): MockClassification {
  const claim = shortClaim(text);
  if (claims.length === 0) {
    return { relation: "new", targetIndex: -1, band: "moderate", claim };
  }

  let bestIndex = -1;
  let bestScore = 0;
  claims.forEach((c, i) => {
    const score = overlapScore(text, c);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  if (bestScore < 18 || bestIndex === -1) {
    return { relation: "new", targetIndex: -1, band: "moderate", claim };
  }

  const lower = text.toLowerCase();
  const contradicts = CONTRADICT_CUES.some((cue) => lower.includes(cue));
  if (contradicts) {
    return { relation: "contradicts", targetIndex: bestIndex, band: "strong", claim };
  }

  const band: WeightBand = bestScore >= 45 ? "strong" : bestScore >= 28 ? "moderate" : "slight";
  return { relation: "corroborates", targetIndex: bestIndex, band, claim };
}

// A short, neutral restatement of a testimony (first sentence, trimmed).
export function shortClaim(text: string): string {
  const trimmed = text.trim();
  const firstStop = trimmed.search(/[.;\n]/);
  let claim = firstStop > 12 ? trimmed.slice(0, firstStop) : trimmed;
  if (claim.length > 200) claim = claim.slice(0, 200);
  return claim.trim() || trimmed.slice(0, 200);
}
