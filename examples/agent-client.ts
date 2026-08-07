/**
 * x402-shop-scout — a complete paid call, end to end.
 *
 *   PRIVATE_KEY=0x... npm run client
 *
 * `wrapFetchWithPayment` intercepts the 402, signs an EIP-3009 USDC
 * authorization for exactly the quoted amount, and replays the request with the
 * `X-PAYMENT` header. You never write the retry loop.
 *
 * Fund the key with base-sepolia USDC: https://faucet.circle.com
 *
 * Prefer the Solana rail? See the commented section at the bottom — the same
 * 402 challenge carries a `solana` accept, and the server exposes the two
 * checkout helpers a Solana wallet needs.
 */

import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";

const BASE_URL = process.env.SHOP_SCOUT_URL ?? "http://localhost:4022";

function decodeReceipt(header: string | null): unknown {
  if (!header) return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString("utf8"));
  } catch {
    return header;
  }
}

async function main(): Promise<void> {
  // ── Step 1: see the challenge ─────────────────────────────────────────────
  // A plain fetch with no payment shows what the server wants. Both rails are
  // always listed; a client picks whichever wallet it holds.
  const unpaid = await fetch(new URL("/search", BASE_URL));
  if (unpaid.status === 402) {
    const challenge = (await unpaid.json()) as { accepts: Array<{ network: string; maxAmountRequired: string; payTo: string }> };
    console.log("402 challenge — accepted rails:");
    for (const a of challenge.accepts) {
      console.log(`  ${a.network.padEnd(14)} ${a.maxAmountRequired.padStart(8)} atomic USDC → ${a.payTo}`);
    }
    console.log();
  }

  const key = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  if (!key) {
    console.error("Set PRIVATE_KEY to a base-sepolia key holding testnet USDC (https://faucet.circle.com).");
    console.error("Without it this script can only show the 402 challenge above.");
    process.exit(1);
  }

  // ── Step 2: pay and get the artifact ──────────────────────────────────────
  const payFetch = wrapFetchWithPayment(fetch, privateKeyToAccount(key));

  // What's on the market? — $0.002
  const search = await payFetch(new URL("/search?q=sony+wh-1000xm5&limit=5", BASE_URL).toString());
  const found = (await search.json()) as {
    source: string;
    count: number;
    listings: Array<{ itemId: string; title: string; price: { value: number }; shipping: { cost: number } }>;
  };
  console.log(`\n${found.count} listings (source: ${found.source}):`);
  for (const l of found.listings) {
    console.log(`  $${(l.price.value + l.shipping.cost).toFixed(2)} landed — ${l.title}`);
  }
  console.log("receipt:", decodeReceipt(search.headers.get("X-PAYMENT-RESPONSE")));

  // Is the cheapest one actually a deal? — $0.002
  const cheapest = [...found.listings].sort(
    (a, b) => a.price.value + a.shipping.cost - (b.price.value + b.shipping.cost),
  )[0];
  const check = await payFetch(
    new URL(`/deal-check/${encodeURIComponent(cheapest.itemId)}`, BASE_URL).toString(),
  );
  const verdict = (await check.json()) as {
    verdict: string;
    totalCost: number;
    comparables: { count: number; median: number | null };
    percentVsMedian: number | null;
    reasoning: string;
  };
  console.log(`\n${cheapest.title}`);
  console.log(`  verdict:  ${verdict.verdict}`);
  console.log(`  total:    $${verdict.totalCost} vs median $${verdict.comparables.median} (${verdict.comparables.count} comps)`);
  console.log(`  ${verdict.reasoning}`);
  console.log("receipt:", decodeReceipt(check.headers.get("X-PAYMENT-RESPONSE")));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/* ─────────────────────────────────────────────────────────────────────────────
 * Paying on Solana instead
 * ─────────────────────────────────────────────────────────────────────────────
 * The same 402 body carries a `solana` accept. A Solana wallet signs a
 * serialized SPL transfer rather than typed data, so the server builds it:
 *
 *   const { accepts } = await (await fetch(url)).json();
 *   const accept = accepts.find((a) => a.network === "solana");
 *
 *   // 1. Build the unsigned transfer
 *   const prep = await fetch(`${BASE_URL}/api/x402-checkout?action=prepare`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ accept, buyer: myBase58Pubkey }),
 *   }).then((r) => r.json());              // → { tx_base64, recent_blockhash }
 *
 *   // 2. Sign tx_base64 with your wallet (Phantom, @solana/web3.js, ...)
 *   const signedTxBase64 = await wallet.signTransaction(prep.tx_base64);
 *
 *   // 3. Wrap it into the X-PAYMENT header
 *   const { x_payment } = await fetch(`${BASE_URL}/api/x402-checkout?action=encode`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ accept, signed_tx_base64: signedTxBase64, resource_url: accept.resource }),
 *   }).then((r) => r.json());
 *
 *   // 4. Retry the original request
 *   const res = await fetch(url, { headers: { "X-PAYMENT": x_payment } });
 *
 * `accept.extra.feePayer` is a facilitator sponsor account that pays the SOL
 * network fee, so the agent's wallet needs only USDC.
 *
 * In a browser, @three-ws/x402-payment-modal does all four steps from one
 * <button> — for both rails.
 *
 * And the raw dual-rail 402 body, for reference:
 *
 *   $ curl -s 'http://localhost:4022/search?q=nintendo%20switch%20oled'
 *   {
 *     "x402Version": 1,
 *     "error": "X-PAYMENT header is required",
 *     "accepts": [
 *       {
 *         "scheme": "exact",
 *         "network": "base-sepolia",
 *         "maxAmountRequired": "2000",
 *         "resource": "http://localhost:4022/search",
 *         "description": "Search live marketplace listings with prices, shipping, condition and seller reputation.",
 *         "mimeType": "application/json",
 *         "payTo": "0x40252CFDF8B20Ed757D61ff157719F33Ec332402",
 *         "maxTimeoutSeconds": 60,
 *         "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
 *         "extra": {
 *           "name": "USDC",
 *           "version": "2"
 *         }
 *       },
 *       {
 *         "scheme": "exact",
 *         "network": "solana",
 *         "maxAmountRequired": "2000",
 *         "resource": "http://localhost:4022/search",
 *         "description": "Search live marketplace listings with prices, shipping, condition and seller reputation.",
 *         "mimeType": "application/json",
 *         "payTo": "WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW",
 *         "maxTimeoutSeconds": 60,
 *         "asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
 *         "extra": {
 *           "name": "USD Coin",
 *           "decimals": 6,
 *           "feePayer": "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4",
 *           "amount": "2000"
 *         }
 *       }
 *     ]
 *   }
 */
