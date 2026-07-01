// Verify a live read against a deployed StrataContract.
//
//   node scripts/livecheck.mjs
//
// Reads the address from .env.deploy (STRATA_CONTRACT_ADDRESS) or .env.local
// (NEXT_PUBLIC_STRATA_CONTRACT). Calls get_summary and prints the result.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet, testnetBradbury, localnet } from "genlayer-js/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function parseEnv(path) {
  const out = {};
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

function pickChain(name) {
  switch ((name ?? "bradbury").toLowerCase()) {
    case "bradbury":
    case "testnet-bradbury":
    case "testnetbradbury":
      return testnetBradbury;
    case "localnet":
      return localnet;
    case "studionet":
      return studionet;
    default:
      return testnetBradbury;
  }
}

function toPlain(value) {
  if (value instanceof Map) {
    const obj = {};
    for (const [k, v] of value.entries()) obj[String(k)] = toPlain(v);
    return obj;
  }
  if (Array.isArray(value)) return value.map(toPlain);
  if (typeof value === "bigint") return Number(value);
  return value;
}

async function main() {
  const deployEnv = parseEnv(join(root, ".env.deploy"));
  const localEnv = parseEnv(join(root, ".env.local"));
  const address =
    deployEnv.STRATA_CONTRACT_ADDRESS || localEnv.NEXT_PUBLIC_STRATA_CONTRACT;
  const networkName =
    deployEnv.GENLAYER_NETWORK || localEnv.NEXT_PUBLIC_STRATA_NETWORK || "bradbury";
  if (!address) {
    console.error("No contract address found in .env.deploy or .env.local.");
    process.exit(1);
  }

  const chain = pickChain(networkName);
  const account = createAccount(generatePrivateKey());
  const client = createClient({ chain, account });

  console.log(`Network:  ${networkName}`);
  console.log(`Contract: ${address}`);
  console.log("Reading get_summary...");

  const summary = toPlain(
    await client.readContract({ address, functionName: "get_summary", args: [] }),
  );
  console.log(JSON.stringify(summary, null, 2));
  console.log("Live read OK.");
}

main().catch((err) => {
  console.error("Live check failed:", err?.message ?? err);
  process.exit(1);
});
