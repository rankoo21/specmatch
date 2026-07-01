// Quick read-without-wallet check: create an account-less client and read
// get_summary from the deployed studionet contract in .env.local.
import { readFileSync } from "node:fs";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();
const address = get("NEXT_PUBLIC_STRATA_CONTRACT");

const client = createClient({ chain: studionet }); // no account, read-only
const summary = await client.readContract({ address, functionName: "get_summary", args: [] });
console.log("READ OK (no wallet). get_summary =", JSON.stringify(summary, (_k, v) => (typeof v === "bigint" ? Number(v) : v)));
