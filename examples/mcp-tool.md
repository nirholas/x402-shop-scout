# Expose x402-shop-scout as an MCP tool

[MCP](https://modelcontextprotocol.io) lets Claude (and other MCP clients) call this service directly. The payment is invisible to the model: the wrapper handles the 402 and returns only the artifact.

## Install

```bash
npm install @modelcontextprotocol/sdk x402-fetch viem
```

## `mcp-server.ts`

```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { privateKeyToAccount } from "viem/accounts";
import { wrapFetchWithPayment } from "x402-fetch";

const BASE_URL = process.env.SHOP_SCOUT_URL ?? "http://localhost:4022";

// One wallet, reused for every tool call. On base-sepolia this is testnet USDC.
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const payFetch = wrapFetchWithPayment(fetch, account);

const TOOLS = [
  {
    name: "shop_scout_search",
    description: "Search live marketplace listings with prices, shipping, condition and seller reputation. Costs $0.002 in USDC (paid automatically via x402).",
    inputSchema: {
          "type": "object",
          "properties": {
                "q": {
                      "type": "string",
                      "description": "Search term, e.g. `sony wh-1000xm5`."
                },
                "limit": {
                      "type": "integer",
                      "description": "Maximum listings to return (1–50)."
                }
          },
          "required": [
                "q"
          ]
    },
  },
  {
    name: "shop_scout_deal_check",
    description: "Grade one listing against comparable listings and return a deal verdict with the arithmetic. Costs $0.002 in USDC (paid automatically via x402).",
    inputSchema: {
          "type": "object",
          "properties": {
                "itemId": {
                      "type": "string",
                      "description": "Marketplace item id, e.g. `v1|120002|0` (URL-encoding optional)."
                }
          },
          "required": [
                "itemId"
          ]
    },
  },
];

const server = new Server({ name: "x402-shop-scout", version: "0.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const args = (req.params.arguments ?? {}) as Record<string, unknown>;
  let res: Response;

  switch (req.params.name) {
    case "shop_scout_search": {
      const url = new URL("/search", BASE_URL);
      if (args.q !== undefined) url.searchParams.set("q", String(args.q));
      if (args.limit !== undefined) url.searchParams.set("limit", String(args.limit));
      res = await payFetch(url.toString());
      break;
    }
    case "shop_scout_deal_check": {
      const url = new URL(`/deal-check/${encodeURIComponent(String(args.itemId))}`, BASE_URL);

      res = await payFetch(url.toString());
      break;
    }
    default:
      throw new Error(`unknown tool: ${req.params.name}`);
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`x402-shop-scout ${res.status}: ${detail}`);
  }

  // The artifact is the 200 body — hand it straight to the model.
  return { content: [{ type: "text", text: await res.text() }] };
});

await server.connect(new StdioServerTransport());
```

## Register it with Claude Desktop

```json
{
  "mcpServers": {
    "x402-shop-scout": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp-server.ts"],
      "env": {
        "PRIVATE_KEY": "0xYourFundedKey",
        "SHOP_SCOUT_URL": "http://localhost:4022"
      }
    }
  }
}
```

## Notes

- **Budget the wallet.** Every tool call spends real USDC (GET /search = $0.002, GET /deal-check/:itemId = $0.002). Fund the key with only what a session should be allowed to spend — that cap is your real spending limit.
- **Both rails work.** The example uses the EVM rail because `x402-fetch` handles it in one wrapper. For a Solana-funded agent, use the `/api/x402-checkout` helpers described in [`curl.md`](curl.md) and set the `X-PAYMENT` header yourself.
- **Receipts.** `res.headers.get("X-PAYMENT-RESPONSE")` (base64 JSON) is the settlement proof; the body's `payment` field carries the same thing if you'd rather log the parsed artifact.
- **Point the model at [`skill.md`](../skill.md)** as a resource so it knows the response schemas without a trial call.
