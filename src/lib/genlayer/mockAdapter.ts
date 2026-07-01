import type {
  AddTestimonyInput,
  ArchivedCore,
  Column,
  Fault,
  Layer,
  LayerReading,
  ReadingResult,
  StrataAdapter,
  Testimony,
  TestimonyResult,
} from "./types";
import {
  AMEND_CONTRADICTION_MIN,
  BAND_WEIGHT,
  WEIGHT_BASE,
  WEIGHT_MAX,
  classifyTestimony,
  overlapScore,
  recomputeLayer,
} from "@/utils/layerState";
import { makeId, mockTxHash } from "@/utils/format";
import {
  DEMO_CORROBORATED,
  DEMO_FAULT,
  DEMO_FLOATING,
  DEMO_HARDENED,
  DEMO_SUBJECT,
  type MockTestimonySeed,
} from "@/data/mockColumns";

const MOCK_OWNER = "0xC0re_tag_demo_keeper_00000000000";

// In-memory store mirroring what the contract would hold authoritatively.
class MockStore {
  columns = new Map<string, Column>();
  layers = new Map<string, Layer>();
  testimonies = new Map<string, Testimony>();
  faults = new Map<string, Fault>();
  cores = new Map<string, ArchivedCore>();
  seeded = false;
}

const store = new MockStore();

function blankColumn(id: string, subject: string, now: number): Column {
  return {
    id,
    owner: MOCK_OWNER,
    subject,
    createdAt: now,
    updatedAt: now,
    layerIds: [],
    faultIds: [],
    coreIds: [],
    testimonyCount: 0,
    counts: { layers: 0, hardened: 0, corroborated: 0, floating: 0, faulted: 0 },
    deepestDepth: 0,
  };
}

function refreshColumnCounts(column: Column): void {
  let hardened = 0;
  let corroborated = 0;
  let floating = 0;
  let faulted = 0;
  let deepest = 0;
  for (const lid of column.layerIds) {
    const layer = store.layers.get(lid);
    if (!layer) continue;
    if (layer.state === "hardened") hardened += 1;
    else if (layer.state === "corroborated") corroborated += 1;
    else if (layer.state === "floating") floating += 1;
    else if (layer.state === "faulted") faulted += 1;
    if (layer.depth > deepest) deepest = layer.depth;
  }
  column.counts = {
    layers: column.layerIds.length,
    hardened,
    corroborated,
    floating,
    faulted,
  };
  column.deepestDepth = deepest;
}

// Apply a single testimony to the store, mutating layers/faults exactly like the
// contract does. Returns the testimony result.
function applyTestimony(
  column: Column,
  text: string,
  vantage: AddTestimonyInput["vantage"],
  now: number,
): TestimonyResult {
  const existingLayers = column.layerIds
    .map((id) => store.layers.get(id))
    .filter((l): l is Layer => Boolean(l));
  const claims = existingLayers.map((l) => l.claim);

  const cls = classifyTestimony(text, claims);
  let relation = cls.relation;
  let target = cls.targetIndex;
  const claim = cls.claim;

  // Deterministic guard: a relation must point at a layer that shares language.
  if (relation !== "new") {
    if (existingLayers.length === 0) {
      relation = "new";
      target = -1;
    } else if (target === -1 || overlapScore(text, existingLayers[target].claim) < 12) {
      relation = "new";
      target = -1;
    }
  }

  const contribution = BAND_WEIGHT[cls.band] ?? BAND_WEIGHT.moderate;
  const testimonyId = makeId("tst");

  const result: TestimonyResult = {
    columnId: column.id,
    relation,
    testimonyId,
    layerId: "",
    faultId: null,
    state: "",
    note: "",
  };

  if (relation === "new") {
    const layerId = makeId("lyr");
    let layer: Layer = {
      id: layerId,
      columnId: column.id,
      claim,
      relation: "new",
      weight: WEIGHT_BASE,
      supporters: 1,
      contradictions: 0,
      hardened: false,
      faultFlag: false,
      state: "loose",
      depth: 0,
      createdAt: now,
      updatedAt: now,
      testimonyIds: [testimonyId],
    };
    layer = recomputeLayer(layer);
    store.layers.set(layerId, layer);
    column.layerIds.push(layerId);
    result.layerId = layerId;
    result.state = layer.state;
    result.note = "A new claim settled near the surface. It floats until it recurs.";
  } else if (relation === "corroborates") {
    let layer = existingLayers[target];
    layer.weight = Math.min(layer.weight + contribution, WEIGHT_MAX);
    layer.supporters += 1;
    layer.testimonyIds.push(testimonyId);
    layer.updatedAt = now;
    const recomputed = recomputeLayer(layer);
    store.layers.set(layer.id, recomputed);
    result.layerId = layer.id;
    result.state = recomputed.state;
    result.note =
      recomputed.state === "hardened"
        ? "This corroborates the deep. The layer hardened into rock."
        : "This corroborates the deep. The layer sank and gained weight.";
  } else {
    // contradicts or distorts
    let layer = existingLayers[target];
    layer.contradictions += 1;
    layer.faultFlag = true;
    layer.testimonyIds.push(testimonyId);
    layer.updatedAt = now;

    let erosion = relation === "contradicts" ? contribution : Math.floor(contribution / 2);
    if (layer.hardened && layer.contradictions < AMEND_CONTRADICTION_MIN) erosion = 0;
    layer.weight = Math.max(0, layer.weight - erosion);
    const recomputed = recomputeLayer(layer);
    store.layers.set(layer.id, recomputed);

    const faultId = makeId("flt");
    const weightA = recomputed.weight;
    const weightB = WEIGHT_BASE;
    const holdingSide =
      weightA > weightB ? "deep" : weightB > weightA ? "surface" : "even";
    const fault: Fault = {
      id: faultId,
      columnId: column.id,
      layerId: layer.id,
      claimA: recomputed.claim,
      claimB: claim,
      depth: recomputed.depth,
      weightA,
      weightB,
      holdingSide,
      createdAt: now,
    };
    store.faults.set(faultId, fault);
    column.faultIds.push(faultId);
    result.faultId = faultId;
    result.layerId = layer.id;
    result.state = recomputed.state;
    result.note = "A fault appeared. Two claims collide here.";
  }

  const testimony: Testimony = {
    id: testimonyId,
    columnId: column.id,
    layerId: result.layerId,
    text: text.trim(),
    vantage,
    relation,
    weightContribution: contribution,
    createdAt: now,
  };
  store.testimonies.set(testimonyId, testimony);
  column.testimonyCount += 1;
  column.updatedAt = now;
  refreshColumnCounts(column);
  return result;
}

function seedDemo(): void {
  if (store.seeded) return;
  store.seeded = true;

  const now = Date.now() - 1000 * 60 * 60 * 6;
  const columnId = "col_demo";
  const column = blankColumn(columnId, DEMO_SUBJECT, now);
  store.columns.set(columnId, column);

  let t = now;
  const drop = (seed: MockTestimonySeed) => {
    t += 1000 * 60 * 7;
    applyTestimony(column, seed.text, seed.vantage, t);
  };

  // Order matters: build the deep hardened layer first, then the mid layer, then
  // a floating surface claim, then the contradiction that cracks a fault.
  DEMO_HARDENED.forEach(drop);
  DEMO_CORROBORATED.forEach(drop);
  DEMO_FLOATING.forEach(drop);
  DEMO_FAULT.forEach(drop);
}

function delay<T>(value: T, ms = 360): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class MockAdapter implements StrataAdapter {
  readonly mode = "mock" as const;

  constructor() {
    seedDemo();
  }

  getIdentityAddress(): string | null {
    return MOCK_OWNER;
  }

  async openColumn(subject: string): Promise<Column> {
    const clean = subject.trim();
    if (!clean) throw new Error("Choose a subject before opening a column.");
    const id = makeId("col");
    const column = blankColumn(id, clean.slice(0, 200), Date.now());
    store.columns.set(id, column);
    return delay(column);
  }

  async addTestimony(input: AddTestimonyInput): Promise<TestimonyResult> {
    const column = store.columns.get(input.columnId);
    if (!column) throw new Error("This column could not be found in the core.");
    if (!input.text.trim()) throw new Error("A core needs words before it can settle.");
    const result = applyTestimony(column, input.text, input.vantage, Date.now());
    return delay(result, 720);
  }

  async takeReading(columnId: string): Promise<ReadingResult> {
    const column = store.columns.get(columnId);
    if (!column) throw new Error("This column could not be found in the core.");
    if (column.layerIds.length === 0) throw new Error("Nothing here corroborates yet.");
    for (const lid of column.layerIds) {
      const layer = store.layers.get(lid);
      if (layer) store.layers.set(lid, recomputeLayer(layer));
    }
    refreshColumnCounts(column);
    column.updatedAt = Date.now();
    return delay(
      {
        columnId,
        layers: column.counts.layers,
        hardened: column.counts.hardened,
        corroborated: column.counts.corroborated,
        floating: column.counts.floating,
        faulted: column.counts.faulted,
        note: "A deep reading settled the column.",
      },
      900,
    );
  }

  async archiveCore(columnId: string): Promise<ArchivedCore> {
    const column = store.columns.get(columnId);
    if (!column) throw new Error("This column could not be found in the core.");
    const hardenedLayers = column.layerIds
      .map((id) => store.layers.get(id))
      .filter((l): l is Layer => Boolean(l))
      .filter((l) => l.state === "hardened" || l.state === "corroborated")
      .map((l) => ({
        id: l.id,
        claim: l.claim,
        weight: l.weight,
        supporters: l.supporters,
        state: l.state,
        depth: l.depth,
        hardened: l.hardened,
      }));
    const faults = column.faultIds
      .map((id) => store.faults.get(id))
      .filter((f): f is Fault => Boolean(f))
      .map((f) => ({
        id: f.id,
        claimA: f.claimA,
        claimB: f.claimB,
        holdingSide: f.holdingSide,
        depth: f.depth,
      }));
    const core: ArchivedCore = {
      id: makeId("core"),
      columnId,
      subject: column.subject,
      hardenedLayers,
      faults,
      archivedAt: Date.now(),
      mockTxHash: mockTxHash(),
    };
    store.cores.set(core.id, core);
    column.coreIds.push(core.id);
    return delay(core);
  }

  async getColumns(): Promise<Column[]> {
    return delay(
      [...store.columns.values()].sort((a, b) => b.createdAt - a.createdAt),
      80,
    );
  }

  async getColumn(columnId: string): Promise<Column | null> {
    return delay(store.columns.get(columnId) ?? null, 60);
  }

  async getLayers(columnId: string): Promise<Layer[]> {
    const column = store.columns.get(columnId);
    if (!column) return delay([], 60);
    const layers = column.layerIds
      .map((id) => store.layers.get(id))
      .filter((l): l is Layer => Boolean(l))
      .slice()
      .sort((a, b) => a.depth - b.depth);
    return delay(layers, 60);
  }

  async getLayer(layerId: string): Promise<LayerReading | null> {
    const layer = store.layers.get(layerId);
    if (!layer) return delay(null, 50);
    const testimonies = layer.testimonyIds
      .map((id) => store.testimonies.get(id))
      .filter((t): t is Testimony => Boolean(t));
    return delay({ ...layer, testimonies }, 50);
  }

  async getFaults(columnId: string): Promise<Fault[]> {
    const column = store.columns.get(columnId);
    if (!column) return delay([], 60);
    const faults = column.faultIds
      .map((id) => store.faults.get(id))
      .filter((f): f is Fault => Boolean(f));
    return delay(faults, 60);
  }

  async getCores(columnId?: string): Promise<ArchivedCore[]> {
    let cores = [...store.cores.values()].sort((a, b) => b.archivedAt - a.archivedAt);
    if (columnId) cores = cores.filter((c) => c.columnId === columnId);
    return delay(cores, 60);
  }
}
