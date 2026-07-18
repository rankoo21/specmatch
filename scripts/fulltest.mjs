// Full live test of the Strata contract on Bradbury using the funded deploy key.
// Prints every transaction hash and a public Bradbury explorer link.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient, createAccount } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function envVal(file, key) {
  try {
    for (const line of readFileSync(join(root, file), "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (t.startsWith(key + "=")) return t.slice(key.length + 1).trim();
    }
  } catch {}
  return undefined;
}

const PK = envVal(".env.deploy", "GENLAYER_PRIVATE_KEY");
const ADDR = envVal(".env.deploy", "STRATA_CONTRACT_ADDRESS");
const EXPLORER = "https://explorer-bradbury.genlayer.com";
const g = (o, k) => (o && typeof o.get === "function" ? o.get(k) : o?.[k]);
const J = (v) => JSON.stringify(v, (k, x) => (typeof x === "bigint" ? Number(x) : x));

const links = [];
function logTx(label, hash) {
  const url = `${EXPLORER}/tx/${hash}`;
  links.push({ label, url });
  console.log(`  ${label}\n    ${url}`);
}

async function main() {
  if (!PK) throw new Error("Missing GENLAYER_PRIVATE_KEY in .env.deploy");
  if (!ADDR) throw new Error("Missing STRATA_CONTRACT_ADDRESS in .env.deploy");
  const acc = createAccount(PK.startsWith("0x") ? PK : `0x${PK}`);
  const c = createClient({ chain: testnetBradbury, account: acc });
  console.log("Signer:", acc.address);
  console.log("Contract:", `${EXPLORER}/address/${ADDR}`, "\n");

  const wait = (h) => c.waitForTransactionReceipt({ hash: h, status: TransactionStatus.ACCEPTED, interval: 6000, retries: 150 });
  const read = (fn, args = []) => c.readContract({ address: ADDR, functionName: fn, args });
  const write = async (label, fn, args) => {
    // Bradbury can transiently revert at the consensus layer; retry a few times.
    let lastErr;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const h = await c.writeContract({ address: ADDR, functionName: fn, args, value: 0n });
        logTx(attempt > 1 ? `${label} (attempt ${attempt})` : label, h);
        await wait(h);
        await new Promise((r) => setTimeout(r, 8000));
        return h;
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message ?? e);
        if (!/revert|timed out|temporarily|429|nonce/i.test(msg)) throw e;
        console.log(`    (transient: ${msg.split("\n")[0].slice(0, 60)}; retrying)`);
        await new Promise((r) => setTimeout(r, 10000));
      }
    }
    throw lastErr;
  };

  await write("open_column", "open_column", ["Bridge closure, June 2021", Date.now()]);
  const cols = await read("get_columns", [0, 20]);
  const colId = g(cols[0], "id");
  console.log("    -> column:", colId, "\n");

  await write("add_testimony (corroborating #1)", "add_testimony", [colId, "The water reached the second step of the bridge by noon.", "witnessed", Date.now()]);
  await write("add_testimony (corroborating #2)", "add_testimony", [colId, "By midday the flood had climbed to the bridge's second step.", "witnessed", Date.now()]);
  await write("add_testimony (contradicting)", "add_testimony", [colId, "The bridge stayed completely dry all day; no water rose at all.", "witnessed", Date.now()]);

  const layers = await read("get_layers", [colId, 0, 20]);
  const faults = await read("get_faults", [colId, 0, 20]);
  console.log("\nLayers:", J(layers));
  console.log("Faults:", J(faults));

  console.log("\n================ EXPLORER LINKS ================");
  console.log("Contract: " + `${EXPLORER}/address/${ADDR}`);
  for (const t of links) console.log(`${t.label}: ${t.url}`);
  console.log("================================================");
}
main().catch((e) => { console.error("ERROR:", (e.message || String(e)).split("\n")[0]); process.exit(1); });
