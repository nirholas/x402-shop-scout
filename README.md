# x402-shop-scout

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![x402](https://img.shields.io/badge/x402-payment%20protocol-0052ff)](https://x402.org)
[![USDC on Base + Solana](https://img.shields.io/badge/USDC-Base%20%2B%20Solana-2775ca)](https://x402.org)

> Ask the secondhand market what something is worth — live eBay listings plus a priced verdict on whether a given listing is actually a deal.

Two calls, two cents. `GET /search` returns live eBay listings with total landed cost — price plus shipping, seller feedback, condition, buying option. `GET /deal-check/:itemId` takes one listing and answers the question an agent actually has: *is this a good price?* It pulls comparable active listings, computes the median total cost, and returns a verdict with the arithmetic attached.

## Why x402 for this

Price intelligence is worth exactly one query's worth of money, and no more. A subscription forces an agent to commit to a monthly spend before it knows whether it will make ten calls or ten thousand; an API key forces a human into the loop to sign up. With x402 the agent pays $0.002 at the moment it needs the answer, from its own wallet, with a settlement receipt it can log against the decision it made.

## Quickstart

```bash
git clone https://github.com/nirholas/x402-shop-scout
cd x402-shop-scout
npm install
npm run dev          # http://localhost:4022
```

No configuration needed — the server ships with the suite's receive addresses and a deterministic fixture marketplace of 15 listings, so the demo works before you have eBay credentials. Set `PAY_TO_ADDRESS` / `SOLANA_PAY_TO_ADDRESS` to receive funds yourself.

```bash
# 1. Unpaid → 402 listing both rails
curl -i 'http://localhost:4022/search?q=nintendo%20switch%20oled'

# 2. Paid, via any x402 client
npm run client
```

## API

| Route | Price | What you get back |
|---|---|---|
| `GET /search` | **$0.002** | normalized listings with price, shipping cost, condition, seller feedback, location and URL |
| `GET /deal-check/:itemId` | **$0.002** | a verdict (`great-deal` … `overpriced`), the comparable sample, median/mean total cost, delta, percentage, and plain-English reasoning |
| `GET /health` | free | Liveness, active data source, configured rails |
| `GET /.well-known/x402` | free | Machine-readable discovery manifest |

Every paid route returns the purchased artifact **in the 200 body**. Nothing is deferred to a webhook or a later fetch.

Full reference: [docs/api.md](docs/api.md) · [openapi.json](openapi.json) · [skill.md](skill.md)

## How x402 works

```
  agent                            x402-shop-scout                    facilitator
    │  GET /search          │                                │
    ├──────────────────────────────▶│                                │
    │  402 + accepts[base, solana]  │                                │
    ◀──────────────────────────────┤                                │
    │  sign USDC authorization      │                                │
    │  retry + X-PAYMENT            │                                │
    ├──────────────────────────────▶│  verify + settle               │
    │                               ├───────────────────────────────▶│
    │  200 + artifact               │                                │
    │  + X-PAYMENT-RESPONSE         │  ◀── tx hash / signature ──────┤
    ◀──────────────────────────────┤                                │
```

**Pay in USDC on Base or Solana — your client picks the rail.** The 402 challenge always lists both:

| Rail | Network | Asset | payTo |
|---|---|---|---|
| EVM | `base-sepolia` (`base` via `NETWORK=base`) | USDC | `0x40252CFDF8B20Ed757D61ff157719F33Ec332402` |
| Solana | `solana` | USDC (SPL) | `WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW` |

The Solana rail's `extra.feePayer` is a public facilitator sponsor account that pays the SOL network fee, so a buyer needs only USDC — no SOL for gas. Wallets that sign serialized transactions (Phantom, most agent SDKs) can use the built-in helpers at `POST /api/x402-checkout?action=prepare|encode`.

## Real backend / API keys

This service reads the [eBay Browse API](https://developer.ebay.com/api-docs/buy/browse/overview.html). A developer account is free.

| Env var | Unlocks |
|---|---|
| `EBAY_CLIENT_ID` + `EBAY_CLIENT_SECRET` | Live listings via the client-credentials OAuth flow |
| `EBAY_OAUTH_TOKEN` | Use a token you already hold instead of the id/secret pair |
| `EBAY_MARKETPLACE_ID` | Marketplace to query — `EBAY_US` (default), `EBAY_GB`, `EBAY_DE`, … |
| `EBAY_BASE_URL` | Point at eBay's sandbox host instead of production |

**Without them, everything still works.** The service answers from a deterministic fixture marketplace and marks every response `"source": "fixture"`. The field is in the JSON, in the OpenAPI schema and in `skill.md`, so an agent can branch on it. Set the credentials and `source` flips to `"ebay"`.

The client-credentials token is fetched on demand and cached until a minute before expiry.

## Human checkout

For a browser-facing checkout, drop in [`@three-ws/x402-payment-modal`](https://www.npmjs.com/package/@three-ws/x402-payment-modal) — it reads the 402 challenge and drives the whole connect → sign → settle flow for **both** rails (Phantom on Solana, any injected wallet on EVM), with SIWX re-entry so a returning buyer skips the wallet prompt, and client-side spending caps that stop an agent or a mis-click from over-spending. Reference it from npm or the CDN; it is a separate proprietary package and is never vendored here.

## For AI agents

- **[`skill.md`](skill.md)** — the agent-facing contract: every endpoint, its price, its response schema, and how to pay. Point your agent at this file.
- **`GET /.well-known/x402`** — machine-readable discovery ([manifest](public/.well-known/x402)). Lists both rails per resource.
- **[`examples/mcp-tool.md`](examples/mcp-tool.md)** — expose this service as an MCP tool for Claude in about 30 lines.
- **[`examples/agent-client.ts`](examples/agent-client.ts)** — a complete paid call with `x402-fetch`, printing the artifact and the decoded settlement receipt.
- **Discovery/listing** — indexable by [x402scan.com](https://x402scan.com), the [x402 Bazaar](https://x402.org), and [agentic.market](https://agentic.market). Deploy, then submit your public base URL; all three read `/.well-known/x402`.

## Docs

<https://nirholas.github.io/x402-shop-scout/> — [tutorial](docs/tutorial.md) · [API reference](docs/api.md) · [for agents](docs/agents.md)

## Support

nichxbt@gmail.com

## License

Apache-2.0 — see [LICENSE](LICENSE).

Part of the [x402 Suite](https://github.com/nirholas/x402-suite).
