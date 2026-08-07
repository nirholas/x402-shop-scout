import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  activeRails,
  mountSolanaCheckout,
  paymentReceipt,
  paywall,
  usingSuiteDefaultPayTo,
  type RoutePrices,
} from "./payments.js";
import { activeSource, dealCheck, searchListings } from "./service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

const PRICES: RoutePrices = {
  "GET /search": "$0.002",
  "GET /deal-check/**": "$0.002",
};

const app = express();
app.use(express.json({ limit: "128kb" }));

// ----- Free routes (declared before the paywall so they stay free) -----

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "x402-shop-scout",
    source: activeSource(),
    rails: activeRails().map((r) => ({ rail: r.rail, network: r.network })),
  });
});

app.get("/.well-known/x402", (_req, res) => {
  const manifest = JSON.parse(readFileSync(path.join(PUBLIC_DIR, ".well-known", "x402"), "utf8"));
  res.type("application/json").json(manifest);
});

app.use(express.static(PUBLIC_DIR, { dotfiles: "allow" }));

// Solana checkout helpers (prepare/encode) for wallets that sign serialized txs.
await mountSolanaCheckout(app);

// ----- Paywall: dual-rail x402, USDC on Base or Solana -----
app.use(
  paywall(PRICES, {
    service: "x402-shop-scout",
    descriptions: {
      "GET /search": "Live eBay marketplace listings for a search term",
      "GET /deal-check/**": "Is-this-a-deal verdict: an item's total cost vs comparable listings",
    },
  }),
);

// ----- Paid routes: every one returns the purchased artifact in the 200 body -----

app.get("/search", async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) {
      res.status(400).json({ error: "missing_query", message: "Provide ?q=<search term>" });
      return;
    }
    const limit = Math.max(1, Math.min(50, Number(req.query.limit ?? 10) || 10));
    const result = await searchListings(q, limit);
    res.json({ ...result, payment: paymentReceipt(res) });
  } catch (err) {
    res.status(502).json({ error: "upstream_error", message: (err as Error).message });
  }
});

// eBay item ids contain `|` (e.g. `v1|110001|0`), so the id is the rest of the
// path rather than a single segment — `/deal-check/v1|110001|0` works encoded or not.
app.get("/deal-check/*", async (req, res) => {
  try {
    const rest = (req.params as unknown as Record<string, string>)["0"] ?? "";
    const itemId = decodeURIComponent(rest);
    if (!itemId) {
      res.status(400).json({ error: "missing_item_id", message: "Provide an item id: /deal-check/<itemId>" });
      return;
    }
    const verdict = await dealCheck(itemId);
    res.json({ ...verdict, payment: paymentReceipt(res) });
  } catch (err) {
    const status = (err as Error & { status?: number }).status === 404 ? 404 : 502;
    res.status(status).json({
      error: status === 404 ? "item_not_found" : "upstream_error",
      message: (err as Error).message,
    });
  }
});

const port = Number(process.env.PORT ?? 4022);
app.listen(port, () => {
  console.log(`x402-shop-scout listening on http://localhost:${port}`);
  console.log(`  data source: ${activeSource()}`);
  console.log("  payment rails:");
  for (const rail of activeRails()) {
    console.log(`    ${rail.rail.padEnd(7)} ${rail.network.padEnd(14)} → ${rail.payTo}`);
  }
  if (usingSuiteDefaultPayTo()) {
    console.log(
      "  note: using suite default payTo — set PAY_TO_ADDRESS/SOLANA_PAY_TO_ADDRESS to receive funds yourself",
    );
  }
  console.log("  paid routes:");
  for (const [route, price] of Object.entries(PRICES)) {
    console.log(`    ${route.padEnd(24)} ${price}`);
  }
  console.log("  free routes: GET /health, GET /.well-known/x402");
});
