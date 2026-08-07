# x402-shop-scout

x402-shop-scout gives an agent secondhand-market pricing intelligence as a pay-per-call API. `GET /search` runs a query against the eBay Browse API and returns normalized listings — item id, title, condition, price, shipping cost and type, seller feedback percentage and score, location, and the listing URL. `GET /deal-check/:itemId` grades a single listing: it fetches comparable active listings, computes their median and mean *total cost* (price + shipping, so a "free shipping" listing is compared fairly against one that isn't), and returns one of `great-deal`, `good-deal`, `fair-price`, `overpriced`, or `insufficient-data` along with the delta, the percentage, the comparable sample it used, and a sentence of plain-English reasoning. Both return the artifact in the response body.

**Base URL:** `{BASE_URL}` (local default `http://localhost:4022`)

## Endpoints

### `GET /search` — $0.002

Full-text search across the marketplace. Each listing is normalized to a stable shape: item id, title, price and currency, condition, seller username with feedback percentage and score, buying option (fixed price / auction / best offer), shipping cost and type, location, and the listing URL. Shipping is returned separately from price so a caller can compute landed cost.

| Param | In | Type | Required | Description |
|---|---|---|---|---|
| `q` | query | string | yes | Search term, e.g. `sony wh-1000xm5`. |
| `limit` | query | integer | no | Maximum listings to return (1–50). |

Returns normalized listings with price, shipping cost, condition, seller feedback, location and URL:

```json
{
  "source": "fixture",
  "query": "sony wh-1000xm5",
  "count": 2,
  "listings": [
    {
      "itemId": "v1|120003|0",
      "title": "Sony WH1000XM5 - broken headband, works with tape",
      "price": {
        "value": 119,
        "currency": "USD"
      },
      "condition": "For parts or not working",
      "seller": {
        "username": "parts_bin_pete",
        "feedbackPercentage": 94.9,
        "feedbackScore": 812
      },
      "buyingOption": "AUCTION",
      "shipping": {
        "cost": 12.4,
        "currency": "USD",
        "type": "STANDARD"
      },
      "location": "Tulsa, OK",
      "itemWebUrl": "https://www.ebay.com/itm/120003",
      "imageUrl": null
    },
    {
      "itemId": "v1|120002|0",
      "title": "Sony WH-1000XM5 Headphones Silver - Open Box, complete",
      "price": {
        "value": 219.99,
        "currency": "USD"
      },
      "condition": "Open box",
      "seller": {
        "username": "bigbox_returns",
        "feedbackPercentage": 98.2,
        "feedbackScore": 31005
      },
      "buyingOption": "FIXED_PRICE",
      "shipping": {
        "cost": 0,
        "currency": "USD",
        "type": "FREE"
      },
      "location": "Reno, NV",
      "itemWebUrl": "https://www.ebay.com/itm/120002",
      "imageUrl": null
    }
  ],
  "payment": {
    "success": true,
    "rail": "evm",
    "network": "base-sepolia",
    "transaction": "0x9c1f…",
    "payer": "0xA11ce…",
    "amount": "2000",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "resource": "http://localhost:4022/search"
  }
}
```

### `GET /deal-check/:itemId` — $0.002

Fetches the listing, pulls comparable active listings, and compares **total cost** — price plus shipping — against their median. Returns one of `great-deal` (≥20% below median), `good-deal` (8–20% below), `fair-price` (within ±10%), `overpriced` (≥10% above), or `insufficient-data` (fewer than two comparables). The comparable sample used is included, so the verdict is auditable rather than asserted.

eBay item ids contain `|` characters — URL-encode the id (`v1%7C120002%7C0`) or pass it raw; both work.

| Param | In | Type | Required | Description |
|---|---|---|---|---|
| `itemId` | path | string | yes | Marketplace item id, e.g. `v1|120002|0` (URL-encoding optional). |

Returns a verdict (`great-deal` … `overpriced`), the comparable sample, median/mean total cost, delta, percentage, and plain-English reasoning:

```json
{
  "source": "fixture",
  "checkedAt": "2026-08-07T12:00:00.000Z",
  "item": {
    "itemId": "v1|120002|0",
    "title": "Sony WH-1000XM5 Headphones Silver - Open Box, complete",
    "price": {
      "value": 219.99,
      "currency": "USD"
    },
    "condition": "Open box",
    "seller": {
      "username": "bigbox_returns",
      "feedbackPercentage": 98.2,
      "feedbackScore": 31005
    },
    "buyingOption": "FIXED_PRICE",
    "shipping": {
      "cost": 0,
      "currency": "USD",
      "type": "FREE"
    },
    "location": "Reno, NV",
    "itemWebUrl": "https://www.ebay.com/itm/120002",
    "imageUrl": null
  },
  "totalCost": 219.99,
  "comparables": {
    "count": 2,
    "priceRange": {
      "min": 131.4,
      "max": 248
    },
    "median": 189.7,
    "mean": 189.7,
    "sample": [
      {
        "itemId": "v1|120001|0",
        "title": "Sony WH-1000XM5 Wireless Noise Canceling Headphones - Black",
        "totalCost": 248,
        "condition": "New"
      },
      {
        "itemId": "v1|120003|0",
        "title": "Sony WH1000XM5 - broken headband, works with tape",
        "totalCost": 131.4,
        "condition": "For parts or not working"
      }
    ]
  },
  "verdict": "overpriced",
  "deltaVsMedian": 30.29,
  "percentVsMedian": 16,
  "reasoning": "Item total cost (price + shipping) is $219.99 vs a median of $189.70 across 2 comparable active listings (+16%). Above market — comparable listings are cheaper.",
  "payment": {
    "success": true,
    "rail": "solana",
    "network": "solana",
    "transaction": "5xkQ…",
    "payer": "9wFh…",
    "amount": "2000",
    "asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "resource": "http://localhost:4022/deal-check/v1|120002|0"
  }
}
```

### Free routes

| Route | Returns |
|---|---|
| `GET /health` | `{ok, service, source, rails}` — liveness plus the rails this instance advertises |
| `GET /.well-known/x402` | The discovery manifest below |

## Payment

This service speaks **x402** (HTTP 402 payment protocol, <https://x402.org>). **Pay in USDC on Base or Solana — your client picks the rail.**

1. Call the endpoint normally. With no `X-PAYMENT` header you get `402` and a JSON body with an `accepts` array holding **both** rails.
2. Pick a rail, produce a payment for it, and retry the identical request with the base64 `X-PAYMENT` header.
3. You get `200` with the artifact **in the response body**, plus an `X-PAYMENT-RESPONSE` header carrying the settlement receipt (tx hash / signature + rail). The same receipt is echoed in the body's `payment` field.

| Rail | Network | Asset | payTo | Facilitator |
|---|---|---|---|---|
| EVM | `base-sepolia` (or `base`) | USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | `0x40252CFDF8B20Ed757D61ff157719F33Ec332402` | `https://x402.org/facilitator` |
| Solana | `solana` | USDC `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | `WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW` | `https://facilitator.payai.network` |

Pay via [`x402-fetch`](https://www.npmjs.com/package/x402-fetch) (EVM), [`@three-ws/x402-payment-modal`](https://www.npmjs.com/package/@three-ws/x402-payment-modal) (browser, both rails), or any x402 client. Solana wallets that sign serialized transactions can use this server's helper endpoints:

```
POST /api/x402-checkout?action=prepare   → unsigned SPL transfer for a chosen accept
POST /api/x402-checkout?action=encode    → wraps your signed tx into an X-PAYMENT header
```

The Solana `extra.feePayer` sponsor pays the SOL network fee, so you need only USDC.

## Errors

| Code | HTTP | Meaning |
|---|---|---|
| `missing_query` | 400 | `GET /search` called without `?q=` |
| `missing_item_id` | 400 | `GET /deal-check/` called with no item id |
| `item_not_found` | 404 | The item id does not exist in the active corpus |
| `upstream_error` | 502 | The eBay API rejected the request or was unreachable |
| `no_payment_rail` | 500 | Neither rail is configured on this instance |
| `facilitator_unreachable` | 502 | The rail's facilitator could not be reached to verify |
| `settlement_error` | 502 | Verified, but settlement failed — you were not charged |

## Data source

Live eBay data is used when `EBAY_CLIENT_ID` + `EBAY_CLIENT_SECRET` (or a raw `EBAY_OAUTH_TOKEN`) are set — a free developer account at developer.ebay.com. Without them the service answers from a deterministic fixture marketplace of 15 listings across five product families and labels every response `"source": "fixture"`. The verdict logic is identical in both modes; only the listing corpus changes.

## Discovery

- Manifest: `{BASE_URL}/.well-known/x402`
- OpenAPI: [`openapi.json`](https://github.com/nirholas/x402-shop-scout/blob/main/openapi.json)
- Docs: <https://nirholas.github.io/x402-shop-scout/>
- Contact: nichxbt@gmail.com
