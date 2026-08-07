# API reference — x402-shop-scout

Base URL: `http://localhost:4022` locally, or your deployment's origin.

All paid routes answer `402` when called without an `X-PAYMENT` header, and the 402 body lists **both** payment rails. See [tutorial.md](tutorial.md) for the end-to-end flow and [agents.md](agents.md) for the agent integration.

---

## `GET /search`

**$0.002** · Search live marketplace listings with prices, shipping, condition and seller reputation.

Full-text search across the marketplace. Each listing is normalized to a stable shape: item id, title, price and currency, condition, seller username with feedback percentage and score, buying option (fixed price / auction / best offer), shipping cost and type, location, and the listing URL. Shipping is returned separately from price so a caller can compute landed cost.

### Parameters

| Name | In | Type | Required | Default | Description |
|---|---|---|---|---|---|
| `q` | query | string | **yes** | — | Search term, e.g. `sony wh-1000xm5`. |
| `limit` | query | integer | no | `10` | Maximum listings to return (1–50). |

### Example

```bash
curl -s 'http://localhost:4022/search?q=sony%20wh-1000xm5&limit=2'
```

### Response `200`

normalized listings with price, shipping cost, condition, seller feedback, location and URL. The `payment` field mirrors the `X-PAYMENT-RESPONSE` header.

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

### Errors

`400 missing_query` when `?q=` is absent or blank. `502 upstream_error` when eBay rejects the search or is unreachable.

---

## `GET /deal-check/:itemId`

**$0.002** · Grade one listing against comparable listings and return a deal verdict with the arithmetic.

Fetches the listing, pulls comparable active listings, and compares **total cost** — price plus shipping — against their median. Returns one of `great-deal` (≥20% below median), `good-deal` (8–20% below), `fair-price` (within ±10%), `overpriced` (≥10% above), or `insufficient-data` (fewer than two comparables). The comparable sample used is included, so the verdict is auditable rather than asserted.

eBay item ids contain `|` characters — URL-encode the id (`v1%7C120002%7C0`) or pass it raw; both work.

### Parameters

| Name | In | Type | Required | Default | Description |
|---|---|---|---|---|---|
| `itemId` | path | string | **yes** | — | Marketplace item id, e.g. `v1|120002|0` (URL-encoding optional). |

### Example

```bash
curl -s 'http://localhost:4022/deal-check/v1%7C120002%7C0'
```

### Response `200`

a verdict (`great-deal` … `overpriced`), the comparable sample, median/mean total cost, delta, percentage, and plain-English reasoning. The `payment` field mirrors the `X-PAYMENT-RESPONSE` header.

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

### Errors

`404 item_not_found` when the id isn't in the active corpus. `502 upstream_error` on an eBay failure. Fewer than two comparables is **not** an error — you get a `200` with `verdict: "insufficient-data"` and null statistics, because you paid for an answer and "I can't tell" is an honest one.

---

## Free routes

### `GET /health`

```json
{
  "ok": true,
  "service": "x402-shop-scout",
  "source": "fixture",
  "rails": [
    { "rail": "evm", "network": "base-sepolia" },
    { "rail": "solana", "network": "solana" }
  ]
}
```

### `GET /.well-known/x402`

The discovery manifest. Every resource entry carries its price and an `accepts` array with both rails. This is what [x402scan.com](https://x402scan.com), the x402 Bazaar and [agentic.market](https://agentic.market) index.

---

## The 402 challenge

```json
{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [
    {
      "scheme": "exact",
      "network": "base-sepolia",
      "maxAmountRequired": "2000",
      "resource": "http://localhost:4022/search",
      "description": "Search live marketplace listings with prices, shipping, condition and seller reputation.",
      "mimeType": "application/json",
      "payTo": "0x40252CFDF8B20Ed757D61ff157719F33Ec332402",
      "maxTimeoutSeconds": 60,
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "extra": {
        "name": "USDC",
        "version": "2"
      }
    },
    {
      "scheme": "exact",
      "network": "solana",
      "maxAmountRequired": "2000",
      "resource": "http://localhost:4022/search",
      "description": "Search live marketplace listings with prices, shipping, condition and seller reputation.",
      "mimeType": "application/json",
      "payTo": "WwwuGbqHrwF5RG89KhUbmRWEvjnRH9k5kVM5p7T3WwW",
      "maxTimeoutSeconds": 60,
      "asset": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "extra": {
        "name": "USD Coin",
        "decimals": 6,
        "feePayer": "2wKupLR9q6wXYppw8Gr2NvWxKBUqm4PPJKkQfoxHDBg4",
        "amount": "2000"
      }
    }
  ]
}
```

Amounts are USDC atomic units (6 decimals): `"2000"` is `$0.002`.

## Settlement receipt

Successful paid responses carry `X-PAYMENT-RESPONSE`, base64 JSON:

```json
{
  "success": true,
  "rail": "evm",
  "network": "base-sepolia",
  "transaction": "0x…",
  "payer": "0x…",
  "amount": "2000",
  "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "resource": "http://localhost:4022/search"
}
```

The same object is echoed in the response body's `payment` field, so an agent that only reads JSON still gets its receipt.

## Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `missing_query` | 400 | `GET /search` called without `?q=` |
| `missing_item_id` | 400 | `GET /deal-check/` called with no item id |
| `item_not_found` | 404 | The item id does not exist in the active corpus |
| `upstream_error` | 502 | The eBay API rejected the request or was unreachable |
| `no_payment_rail` | 500 | Neither rail is configured on this instance |
| `facilitator_unreachable` | 502 | The rail's facilitator could not be reached to verify the payment |
| `settlement_error` | 502 | The payment verified but settlement failed — you were not charged |
