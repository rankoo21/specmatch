// Shared data models for Strata.
// These types are the contract between the UI, the store, and any GenLayer
// adapter (mock today, real on-chain tomorrow). Keep them stable.

// Per-layer state machine. Mirrored in utils/layerState.ts and the contract.
export type LayerState =
  | "loose"
  | "settling"
  | "corroborated"
  | "hardened"
  | "floating"
  | "faulted";

// How a new testimony relates to the accumulated strata.
export type Relation = "corroborates" | "contradicts" | "distorts" | "new";

// Coarse weight bands the validators agree on.
export type WeightBand = "strong" | "moderate" | "slight";

// How the author knows what they testify. Context, never authority.
export type Vantage = "witnessed" | "heard" | "recorded" | "inferred" | "unstated";

// Which side of a fault the column currently holds.
export type HoldingSide = "deep" | "surface" | "even";

export interface Column {
  id: string;
  owner: string;
  subject: string;
  createdAt: number;
  updatedAt: number;
  layerIds: string[];
  faultIds: string[];
  coreIds: string[];
  testimonyCount: number;
  counts: {
    layers: number;
    hardened: number;
    corroborated: number;
    floating: number;
    faulted: number;
  };
  deepestDepth: number;
}

export interface Layer {
  id: string;
  columnId: string;
  claim: string;
  relation: Relation;
  weight: number;
  supporters: number;
  contradictions: number;
  hardened: boolean;
  faultFlag: boolean;
  state: LayerState;
  depth: number; // 0 (surface) .. 1000 (deep)
  createdAt: number;
  updatedAt: number;
  testimonyIds: string[];
}

export interface Testimony {
  id: string;
  columnId: string;
  layerId: string;
  text: string;
  vantage: Vantage;
  relation: Relation;
  weightContribution: number;
  createdAt: number;
}

// A layer with its supporting testimonies attached, for the Layer Reader.
export interface LayerReading extends Layer {
  testimonies: Testimony[];
}

export interface Fault {
  id: string;
  columnId: string;
  layerId: string;
  claimA: string;
  claimB: string;
  depth: number;
  weightA: number;
  weightB: number;
  holdingSide: HoldingSide;
  createdAt: number;
}

export interface ArchivedCoreLayer {
  id: string;
  claim: string;
  weight: number;
  supporters: number;
  state: LayerState;
  depth: number;
  hardened: boolean;
}

export interface ArchivedCoreFault {
  id: string;
  claimA: string;
  claimB: string;
  holdingSide: HoldingSide;
  depth: number;
}

export interface ArchivedCore {
  id: string;
  columnId: string;
  subject: string;
  hardenedLayers: ArchivedCoreLayer[];
  faults: ArchivedCoreFault[];
  archivedAt: number;
  mockTxHash: string;
}

// Result returned by add_testimony, describing how the new core settled.
export interface TestimonyResult {
  columnId: string;
  relation: Relation;
  testimonyId: string;
  layerId: string;
  faultId: string | null;
  state: LayerState | "";
  note: string;
}

export interface ReadingResult {
  columnId: string;
  layers: number;
  hardened: number;
  corroborated: number;
  floating: number;
  faulted: number;
  note: string;
}

// The adapter interface. MockAdapter and ContractAdapter both implement this so
// the UI never knows or cares which one is live.
export interface StrataAdapter {
  readonly mode: "mock" | "contract";
  // Address of the active identity (the core tag). In contract mode this is the
  // connected browser wallet address, or null when no wallet is connected; in
  // mock mode a synthetic address.
  getIdentityAddress(): string | null;
  // Optional browser-wallet support (contract mode only).
  hasInjectedWallet?(): boolean;
  connectWallet?(): Promise<string>;
  disconnectWallet?(): void;
  isUsingWallet?(): boolean;

  openColumn(subject: string): Promise<Column>;
  addTestimony(input: AddTestimonyInput): Promise<TestimonyResult>;
  takeReading(columnId: string): Promise<ReadingResult>;
  archiveCore(columnId: string): Promise<ArchivedCore>;

  getColumns(): Promise<Column[]>;
  getColumn(columnId: string): Promise<Column | null>;
  getLayers(columnId: string): Promise<Layer[]>;
  getLayer(layerId: string): Promise<LayerReading | null>;
  getFaults(columnId: string): Promise<Fault[]>;
  getCores(columnId?: string): Promise<ArchivedCore[]>;
}

export interface AddTestimonyInput {
  columnId: string;
  text: string;
  vantage: Vantage;
}
