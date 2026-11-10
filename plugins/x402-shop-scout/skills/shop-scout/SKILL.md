---
name: shop-scout
description: Search eBay listings and get is-this-a-deal verdicts through a paid x402 API. Use when an agent needs live marketplace prices or a deal check on a specific item.
---

# x402-shop-scout marketplace lookups

Two paid lookups over eBay's Browse API: search and a deal check for one item.

## Run the server

The repo is a self-hosted Express service. It is not published to npm, so run it from a clone.

```bash
git clone https://github.com/nirholas/x402-shop-scout && cd x402-shop-scout
npm install
cp .env.example .env   # optional: the defaults run out of the box
npm run dev            # listens on http://localhost:4022 (override with PORT)
```

Set `PAY_TO_ADDRESS` (Base) and `SOLANA_PAY_TO_ADDRESS` (Solana) in `.env` to receive payments yourself.
eBay credentials go in `.env`: `EBAY_CLIENT_ID` and `EBAY_CLIENT_SECRET` (or `EBAY_OAUTH_TOKEN`), plus `EBAY_MARKETPLACE_ID` (default `EBAY_US`).
`GET http://localhost:4022/.well-known/x402` lists every route with its price, and `GET /health` is the liveness probe.

## Routes

| Route | Price | Purpose |
|---|---|---|
| `GET /search` | $0.002 | Query `q` (required), `limit` (1 to 50) |
| `GET /deal-check/:itemId` | $0.002 | `itemId` is the marketplace id, for example `v1|120002|0` (URL-encoding optional) |
| `GET /health`, `GET /.well-known/x402` | free | Liveness and discovery |

Errors: 400 `missing_query`, `missing_item_id`; 404 `item_not_found`; 502 `upstream_error`.

The full request and response schemas are in `skill.md` at the repo root (the running server also serves it at `GET /skill.md`).

## Paying

Paid routes answer an unpaid request with HTTP 402 and an `accepts` array with one entry per rail (USDC on Base and USDC on Solana). A client picks an entry, signs, and retries with the `X-PAYMENT` header. The 200 body carries the artifact and an `X-PAYMENT-RESPONSE` header carries the settlement receipt. Any x402 client works (`x402-fetch` with `viem` on the EVM rail). Each paid call spends real USDC on whichever network the server is configured for (`NETWORK`, `SOLANA_NETWORK`), so show the user the route, price and network and get a yes before paying.

## Worked example

```bash
curl -s http://localhost:4022/health
curl -si 'http://localhost:4022/search?q=sony+wh-1000xm5&limit=5'
```

The second call prints the 402 challenge. After the user approves the $0.002, pay it with an x402 client, then call `GET /deal-check/<itemId>` with an id from the results (another $0.002).
