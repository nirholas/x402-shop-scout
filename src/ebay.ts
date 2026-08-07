// Live eBay Browse API adapter — used when EBAY_CLIENT_ID + EBAY_CLIENT_SECRET
// (client-credentials flow) or a raw EBAY_OAUTH_TOKEN are set.
// Docs: https://developer.ebay.com/api-docs/buy/browse/overview.html (free developer account)

import type { Listing } from "./fixtures.js";

const EBAY_BASE = process.env.EBAY_BASE_URL ?? "https://api.ebay.com";
const MARKETPLACE = process.env.EBAY_MARKETPLACE_ID ?? "EBAY_US";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function ebayConfigured(): boolean {
  return Boolean(
    process.env.EBAY_OAUTH_TOKEN || (process.env.EBAY_CLIENT_ID && process.env.EBAY_CLIENT_SECRET),
  );
}

async function getToken(): Promise<string> {
  if (process.env.EBAY_OAUTH_TOKEN) return process.env.EBAY_OAUTH_TOKEN;
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.token;
  const basic = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`,
  ).toString("base64");
  const res = await fetch(`${EBAY_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=" + encodeURIComponent("https://api.ebay.com/oauth/api_scope"),
  });
  if (!res.ok) throw new Error(`eBay token request failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

interface EbayItemSummary {
  itemId: string;
  title: string;
  price?: { value: string; currency: string };
  condition?: string;
  seller?: { username?: string; feedbackPercentage?: string; feedbackScore?: number };
  buyingOptions?: string[];
  shippingOptions?: Array<{ shippingCost?: { value: string; currency: string }; shippingCostType?: string }>;
  itemLocation?: { city?: string; stateOrProvince?: string; country?: string };
  itemWebUrl?: string;
  image?: { imageUrl?: string };
}

function mapItem(it: EbayItemSummary): Listing {
  const ship = it.shippingOptions?.[0];
  const buying = it.buyingOptions?.[0];
  return {
    itemId: it.itemId,
    title: it.title,
    price: { value: Number(it.price?.value ?? 0), currency: it.price?.currency ?? "USD" },
    condition: it.condition ?? "Unspecified",
    seller: {
      username: it.seller?.username ?? "unknown",
      feedbackPercentage: Number(it.seller?.feedbackPercentage ?? 0),
      feedbackScore: it.seller?.feedbackScore ?? 0,
    },
    buyingOption: buying === "AUCTION" ? "AUCTION" : buying === "BEST_OFFER" ? "BEST_OFFER" : "FIXED_PRICE",
    shipping: {
      cost: Number(ship?.shippingCost?.value ?? 0),
      currency: ship?.shippingCost?.currency ?? "USD",
      type: ship?.shippingCostType ?? (Number(ship?.shippingCost?.value ?? 0) === 0 ? "FREE" : "STANDARD"),
    },
    location: [it.itemLocation?.city, it.itemLocation?.stateOrProvince ?? it.itemLocation?.country]
      .filter(Boolean)
      .join(", "),
    itemWebUrl: it.itemWebUrl ?? "",
    imageUrl: it.image?.imageUrl ?? null,
  };
}

export async function ebaySearch(query: string, limit: number): Promise<Listing[]> {
  const token = await getToken();
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${EBAY_BASE}/buy/browse/v1/item_summary/search?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": MARKETPLACE,
    },
  });
  if (!res.ok) throw new Error(`eBay search failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { itemSummaries?: EbayItemSummary[] };
  return (data.itemSummaries ?? []).map(mapItem);
}

export async function ebayGetItem(itemId: string): Promise<Listing> {
  const token = await getToken();
  const res = await fetch(`${EBAY_BASE}/buy/browse/v1/item/${encodeURIComponent(itemId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": MARKETPLACE,
    },
  });
  if (!res.ok) throw new Error(`eBay get item failed: ${res.status} ${await res.text()}`);
  const it = (await res.json()) as EbayItemSummary;
  return mapItem(it);
}
