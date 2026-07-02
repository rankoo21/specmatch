<div align="center">

# Strata

**Memory, settled into stone.**

[![Network](https://img.shields.io/badge/Network-GenLayer_Bradbury-8A6D3B?style=flat-square)](https://explorer-bradbury.genlayer.com)
[![chainId](https://img.shields.io/badge/chainId-4221-6B4F3A?style=flat-square)](https://explorer-bradbury.genlayer.com)
[![Status](https://img.shields.io/badge/Status-live-3E5C3A?style=flat-square)](https://strata-bs2.pages.dev)
[![Contract](https://img.shields.io/badge/Contract-Python_GenVM-4E3B2A?style=flat-square)](contracts/StrataContract.py)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js-5C5346?style=flat-square)](https://nextjs.org)

</div>

## On-chain proof

Strata is deployed and exercised on GenLayer Bradbury. The lifecycle below is real: a column was opened, corroborated twice, and cracked by a contradiction. Every hash links to the transaction on the Bradbury explorer.

**Contract:** [`0x53c9A1EA3F5bc8c276F9Ce97ceb2f6C2cC97cbEd`](https://explorer-bradbury.genlayer.com/address/0x53c9A1EA3F5bc8c276F9Ce97ceb2f6C2cC97cbEd)

### Verified lifecycle on Bradbury

| Step | Method | Transaction |
| --- | --- | --- |
| Open a memory column | `open_column` | [`0x8908e3...11aa7`](https://explorer-bradbury.genlayer.com/tx/0x8908e328575885998f5066824109f3467c4d34cb74907a17af6771c613a11aa7) |
| Corroborating testimony | `add_testimony` | [`0x401aa7...adef4`](https://explorer-bradbury.genlayer.com/tx/0x401aa7908291f63d3408c2d78470070f8bf3a7ca91abae172919c1f1bbfadef4) |
| Corroborating testimony, merged and weighted | `add_testimony` | [`0x9f983e...49f1fa`](https://explorer-bradbury.genlayer.com/tx/0x9f983ec004bd51bc7c497958a6f52ec0900a1f007a7ae0136a29c60c0349f1fa) |
| Contradicting testimony, cracked a fault | `add_testimony` | [`0xf7c5e6...71eeeb`](https://explorer-bradbury.genlayer.com/tx/0xf7c5e6e5af0ed99bbe671eff81552a28927e5a5871d9911b4caa1810ec71eeeb) |

**Live app:** https://strata-bs2.pages.dev

## What it is

Strata is a collective memory that settles into layers. People add testimonies about a single subject, and each new testimony is read against everything already recorded. What recurs sinks and hardens into canonical rock. What stands alone floats near the surface. The deep is the agreed.

There is no approve or reject, no vote, no verdict. There is only sediment, weight, and stone. Corroboration makes a layer sink and gain weight; sustained agreement hardens it into rock; a contradiction cracks a fault across the band it touches. Reads work with no wallet. Writing a testimony needs a MetaMask wallet funded from the Bradbury faucet, and you pay only network fees.

| Geology | Strata |
| --- | --- |
| Loose silt on the surface | A freshly dropped testimony, not yet settled |
| Recurring deposition | Corroboration: the layer sinks and gains weight |
| Sediment turning to rock | Hardening past a deterministic weight threshold |
| A lone grain near the top | A floating, isolated claim |
| A fault line | A contradiction cracking across a band |
| A sealed core sample | An archived snapshot of the hardened strata |

## Why it needs GenLayer

Strata is a corroboration engine. `add_testimony` asks several independent validators to classify each new testimony against the existing record (corroborates, contradicts, distorts, or new) and to agree on a coarse weight band before the shared memory changes. Relating a natural-language claim to an accumulated record is a subjective semantic judgment, so a single server could quietly rewrite history. Consensus makes the settled strata tamper resistant.

Deterministic guards bound the model so it cannot fabricate history:

- Hardening is computed on-chain from accumulated weight and supporter counts, never chosen by the model. A layer cannot self-harden.
- A claimed corroboration or contradiction must point at a layer that truly shares language (a lexical-overlap backstop), or it falls back to a new isolated claim.
- A hardened layer requires sustained counter-agreement to amend. One stray contradiction records a fault but does not overturn the rock.
- Validation is comparative, agreeing on the relation label and weight band, not byte-equality on model prose.

## Contract

`contracts/StrataContract.py` runs on the GenVM. It stores only compact canonical fields (claim, weight, supporters, fault flag, hardened flag), never raw model prose.

| Method | Kind | Purpose |
| --- | --- | --- |
| `open_column(subject, now_ms)` | write | Open a memory column for one subject. |
| `add_testimony(column_id, text, vantage, now_ms)` | write, non-deterministic | Validators classify the testimony against the strata and agree on a relation and weight band; the contract then settles layers, weights, supporters, and faults. |
| `take_reading(column_id, now_ms)` | write | Deterministic recompute of layer weights and hardening across the column. No new external data. |
| `archive_core(column_id, tx_hash, now_ms)` | write | Snapshot the hardened and corroborated layers as a preserved core. |
| `get_summary()` | view | Global counts of columns, layers, testimonies, faults, cores. |
| `get_columns(offset, limit)` | view | Paged list of column summaries. |
| `get_column(column_id)` | view | A single column summary with counts. |
| `get_layers(column_id, offset, limit)` | view | Layers of a column, ordered surface to deep. |
| `get_layer(layer_id)` | view | One layer with its corroborating testimonies. |
| `get_faults(column_id, offset, limit)` | view | Faults touching a column. |
| `get_cores(column_id, offset, limit)` | view | Archived cores, newest first. |

## Run locally

```
npm install
npm run dev
```

Open http://localhost:3000. The app runs in mock mode by default, so no wallet or contract is required.

Contract checks:

```
genvm-lint check contracts/StrataContract.py --json
python -m pytest tests/direct/ -p gltest_direct -q
```

## Connecting a live contract

The adapter swap is invisible to the UI. `src/lib/genlayer/index.ts` selects the mock or contract adapter from the environment, and both implement the same `StrataAdapter` interface. Set these before building the static export:

```
NEXT_PUBLIC_STRATA_MODE=contract
NEXT_PUBLIC_STRATA_CONTRACT=0x53c9A1EA3F5bc8c276F9Ce97ceb2f6C2cC97cbEd
NEXT_PUBLIC_STRATA_NETWORK=bradbury
```

With `NEXT_PUBLIC_STRATA_MODE` unset or `mock`, the app uses the in-memory adapter and needs no wallet.

## Stack

- Next.js 14, TypeScript, Tailwind CSS
- Framer Motion, Zustand
- genlayer-js for contract reads and writes
- Deployed on Cloudflare Pages
