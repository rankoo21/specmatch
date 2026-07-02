<div align="center">

# Strata

**Memory, settled into stone.**

A collective, consensus-weighted memory that settles testimonies into geological layers and hardens the agreed record into canonical rock.

[![Live Demo](https://img.shields.io/badge/Live_Demo-strata--bs2.pages.dev-6B4F3A?style=for-the-badge)](https://strata-bs2.pages.dev)
[![Network: Testnet Bradbury](https://img.shields.io/badge/Network-Testnet_Bradbury-8A6D3B?style=for-the-badge)](https://explorer-bradbury.genlayer.com/address/0x53c9A1EA3F5bc8c276F9Ce97ceb2f6C2cC97cbEd)

[![GenLayer Intelligent Contract](https://img.shields.io/badge/GenLayer-Intelligent_Contract-4E3B2A?style=flat-square)](https://genlayer.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-5C5346?style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-70614A?style=flat-square)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-Passing-3E5C3A?style=flat-square)](#8-running-locally)

</div>

## Overview

Strata is a tamper-resistant shared memory built on GenLayer. People add testimonies about a single subject, and each new testimony is read against everything already recorded. GenLayer decides whether it corroborates, contradicts, or distorts the accumulated record, and how much weight it carries. What recurs sinks and hardens into canonical rock. What stands alone floats near the surface. Contradictions crack a fault.

The whole app reads as depth, not as a scrollable list. You travel through one continuous core sample with a brass-and-glass depth gauge: the deeper a layer sits, the older and more agreed it is. The deep is the agreed. There is no approve or reject, no vote, no verdict. There is only sediment, weight, and stone.

Reads work with no wallet, so you can browse the column, scrub through depth, and open sealed cores right away. To write a testimony, connect a MetaMask wallet funded from the GenLayer Bradbury faucet, and you pay only network fees.

- **Live app:** https://strata-bs2.pages.dev
- **Contract (Bradbury):** `0x53c9A1EA3F5bc8c276F9Ce97ceb2f6C2cC97cbEd` on the [Bradbury explorer](https://explorer-bradbury.genlayer.com/address/0x53c9A1EA3F5bc8c276F9Ce97ceb2f6C2cC97cbEd)

### How it works, in three steps

1. **Drop a testimony.** You add a claim about the subject, and it enters as loose silt at the surface.
2. **The record reads it.** GenLayer validators classify the new claim against the existing layers and agree on a relation and a weight band. The layer settles, corroborates, or cracks a fault.
3. **The agreed hardens.** Recurring, well-supported layers sink and harden into canonical rock. You can then seal a core: a preserved slice of the column at a moment in time.

---

## 1. What is this?

Strata is a tamper-resistant, consensus-weighted shared memory. A column
remembers one subject. Each testimony is a layer of sediment. The deeper a layer
sits, the older and more agreed it is. The deep is the agreed.

You drop a testimony, watch it settle, see it corroborate or fault, scrub
through depth and time, and reach the hardened canonical layers. Then you can
seal a core: a preserved slice of the column at a moment in time.

This is not a DAO, a vote, a verdict, a dashboard, or a feed. There is no
approve or reject. There is only sediment, weight, and stone.

## 2. Why GenLayer?

Relating a new natural-language testimony to an accumulated record is a
subjective semantic judgment. A single server could quietly rewrite history by
deciding, on its own, that a claim "corroborates" or "contradicts" the record.

GenLayer makes that judgment a consensus act. The non-deterministic call in
`add_testimony` asks several independent validators to classify the relation
(corroborates / contradicts / distorts / new) and a coarse weight band. They
must agree on the relation label and the band before the shared memory changes.
That is comparative validation, not byte-equality on model prose.

Deterministic guards bound the model so it cannot fabricate history:

- Hardening is computed by the contract from accumulated weight and supporter
  counts, never chosen by the model. Isolated claims cannot self-harden.
- A claimed corroboration or contradiction must point at a layer that truly
  shares language (a lexical-overlap backstop), or it falls back to a new
  isolated claim.
- A hardened layer requires sustained counter-agreement to amend. One stray
  contradiction records a fault but does not overturn the rock.
- Weights are clamped, timestamps are passed in by the caller for determinism,
  and failure paths carry classification prefixes so consensus holds on errors.

## 3. The sediment metaphor

| Geology | Strata |
| --- | --- |
| Loose silt on the surface | A freshly dropped testimony, not yet settled |
| Sediment compacting | A layer under reading |
| Recurring deposition | Corroboration: the layer sinks, darkens, gains mineral-teal veins |
| Sediment turning to rock | Hardening past a deterministic weight threshold |
| A lone grain near the top | A floating, isolated claim |
| A fault line | A contradiction cracking across a band in fault rust |
| A sealed core sample | An archived snapshot of the hardened strata |

State is never carried by color alone. Every band shows its state word, its
weight, and its depth, so the record is legible without relying on teal or rust.

## 4. The depth journey

Not pages. Six depth regions of one continuous core sample, plus instruments.

1. The Surface: the top of the core under a glass cap, loose silt drifting.
   Lower a tube to begin.
2. The Coring Bench: prepare and drop a core. The subject is an engraved plate;
   the testimony is held in resin; the vantage is a small etched mark.
3. The Column: the main cross-section. Surface bands drift at the top; hardened
   mineral cores sit deep. Take a deep reading to settle the whole column.
4. The Layer Reader: a core cracks open to reveal the settled claim, what
   corroborates it, the weight of agreement, and any faults nearby.
5. The Fault Map: the column in stress mode, rust seams glowing across the
   depths they touch. Each fault is a geological feature, not a queue.
6. The Core Archive: a rack of sealed glass cores. Pull one to unroll it into a
   readable section. Take a rubbing, cast a copy, or read the section.

Navigation is the Depth Gauge: a slim brass-and-glass gauge with a draggable
bead. Dragging the bead scrubs the column through depth and time. There are no
tabs. The Core Tag in the corner is the wallet object: a metal sample tag on a
wire, blank until you tag your core, then stamped with your address. The Bedrock
Rail at the bottom is the deepest rock layer, engraved like a survey stamp, not
a footer.

## 5. Intelligent Contract concept

`contracts/StrataContract.py` models columns, testimonies, layers, corroboration
weights, faults, and archived cores.

Methods:

- `open_column(subject, now_ms)` opens a memory column.
- `add_testimony(column_id, text, vantage, now_ms)` is the non-deterministic
  call. Validators classify the relation against the existing layers and agree
  on a relation label and weight band. The contract then updates layers, weights,
  supporter counts, and fault flags deterministically.
- `take_reading(column_id, now_ms)` recomputes layer weights and hardening across
  the column. Pure deterministic recompute, no new external data.
- `get_column`, `get_layers`, `get_layer`, `get_faults`, `get_cores`,
  `get_columns`, `get_summary` are paged read views.
- `archive_core(column_id, tx_hash, now_ms)` snapshots the hardened and
  corroborated layers as a preserved core.

Only compact canonical fields are stored (claim, weight, supporters, fault flag,
hardened flag), never raw model prose blobs. No value transfer, no escrow, no
DAO, no voting. Testnet friendly: users pay only network fees.

## 6. Local mock mode

The app runs fully offline with no contract and no wallet. The default
`NEXT_PUBLIC_STRATA_MODE=mock` uses `src/lib/genlayer/mockAdapter.ts`, an
in-memory store that mirrors the contract's settling rules exactly
(`src/utils/layerState.ts` is a deterministic mirror of the on-chain logic).

A demo column is preloaded so the first visit already shows a hardened deep
layer, a corroborated mid layer, a floating surface claim, and one fault. Drop
your own testimonies and watch them settle, corroborate, or crack a fault, then
seal and export a core.

## 7. Folder structure

```
strata/
  contracts/
    StrataContract.py          the GenLayer intelligent contract
  src/
    app/                       page.tsx, layout.tsx, globals.css
    components/
      instrument/              DepthGauge, BedrockRail, CoreTag, SiltField, ColumnWorld
      regions/                 Surface, CoringBench, Column, LayerReader, FaultMap, CoreArchive
      strata/                  SedimentBand, CoreTube, FaultLine, DepthScale, EngravedPlaque
      ui/                      InstrumentButton, ResinInput, StoneSlab, EngraveText
    lib/genlayer/              mockAdapter, contractAdapter, types, index
    store/                     useColumnStore (Zustand)
    data/                      mockTestimonies, mockColumns
    utils/                     format, layerState
  scripts/
    deploy.mjs                 deploy to a GenLayer network
    livecheck.mjs              verify a live read
  tests/direct/                conftest.py, test_strata.py
```

## 8. Running locally

```
npm install
npm run dev
```

Open http://localhost:3000. The app runs in mock mode by default; no wallet or
contract is required.

Type-check and production build (static export to `out/`):

```
node ./node_modules/typescript/bin/tsc --noEmit -p tsconfig.json
node ./node_modules/next/dist/bin/next build
```

Contract checks:

```
genvm-lint check contracts/StrataContract.py --json
python -m pytest tests/direct/ -p gltest_direct -q
```

## 9. Connecting a real contract

1. Put a funded key in `.env.deploy` (gitignored):

   ```
   GENLAYER_PRIVATE_KEY=...
   GENLAYER_NETWORK=bradbury
   ```

2. Deploy and record the address:

   ```
   node scripts/deploy.mjs
   ```

3. Put the address into `.env.local` and rebuild so it is baked into the static
   export:

   ```
   NEXT_PUBLIC_STRATA_MODE=contract
   NEXT_PUBLIC_STRATA_CONTRACT=0x...
   NEXT_PUBLIC_STRATA_NETWORK=bradbury
   ```

4. Verify a live read:

   ```
   node scripts/livecheck.mjs
   ```

The adapter swap is invisible to the UI. `src/lib/genlayer/index.ts` picks the
mock or the contract adapter from the env, and both implement the identical
`StrataAdapter` interface, so not a line of UI changes between offline and live.

This build is deployed on Bradbury at
`0x53c9A1EA3F5bc8c276F9Ce97ceb2f6C2cC97cbEd`.

## 10. Design principles

- The record reads as depth, not as a list. Depth is meaning: deep is agreed.
- Patient, weighty, geological motion. Heavy springs, slow settling, no strobe.
- Named objects, never generic UI: the Depth Gauge, the Core Tag, the Bedrock
  Rail, sediment bands, core tubes, fault seams.
- Archival, serious tone. No submit, post, dashboard, vote, or verdict language.
- State is shown by depth, compaction, and labels, not by color alone.
- Reduced motion replaces settling and cracking with calm cross-fades.
- The contract owns canonical state; consensus makes the settled strata
  tamper resistant.
