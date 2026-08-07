import {
  fixtureComparables,
  getFixtureListing,
  searchFixtureListings,
  type Listing,
} from "./fixtures.js";
import { ebayConfigured, ebayGetItem, ebaySearch } from "./ebay.js";

export type Source = "ebay" | "fixture";

export interface SearchResult {
  source: Source;
  query: string;
  count: number;
  listings: Listing[];
}

export type Verdict = "great-deal" | "good-deal" | "fair-price" | "overpriced" | "insufficient-data";

export interface DealCheckResult {
  source: Source;
  checkedAt: string;
  item: Listing;
  totalCost: number;
  comparables: {
    count: number;
    priceRange: { min: number; max: number } | null;
    median: number | null;
    mean: number | null;
    sample: Array<{ itemId: string; title: string; totalCost: number; condition: string }>;
  };
  verdict: Verdict;
  deltaVsMedian: number | null;
  percentVsMedian: number | null;
  reasoning: string;
}

export function activeSource(): Source {
  return ebayConfigured() ? "ebay" : "fixture";
}

export async function searchListings(query: string, limit: number): Promise<SearchResult> {
  const source = activeSource();
  const listings =
    source === "ebay" ? await ebaySearch(query, limit) : searchFixtureListings(query, limit);
  return { source, query, count: listings.length, listings };
}

function totalCost(l: Listing): number {
  return Math.round((l.price.value + l.shipping.cost) * 100) / 100;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export async function dealCheck(itemId: string): Promise<DealCheckResult> {
  const source = activeSource();

  let item: Listing;
  let comps: Listing[];

  if (source === "ebay") {
    item = await ebayGetItem(itemId);
    // Comparables: search active listings with the target's title, excluding itself.
    const found = await ebaySearch(item.title.split(/\s+/).slice(0, 6).join(" "), 25);
    comps = found.filter((l) => l.itemId !== item.itemId);
  } else {
    const fixture = getFixtureListing(itemId);
    if (!fixture) {
      const err = new Error(`Item ${itemId} not found`);
      (err as Error & { status?: number }).status = 404;
      throw err;
    }
    item = fixture;
    comps = fixtureComparables(fixture);
  }

  const itemTotal = totalCost(item);
  const compTotals = comps.map(totalCost).filter((v) => v > 0);

  if (compTotals.length < 2) {
    return {
      source,
      checkedAt: new Date().toISOString(),
      item,
      totalCost: itemTotal,
      comparables: { count: compTotals.length, priceRange: null, median: null, mean: null, sample: [] },
      verdict: "insufficient-data",
      deltaVsMedian: null,
      percentVsMedian: null,
      reasoning: `Only ${compTotals.length} comparable listing(s) found — not enough to form a price verdict.`,
    };
  }

  const med = Math.round(median(compTotals) * 100) / 100;
  const mean = Math.round((compTotals.reduce((a, b) => a + b, 0) / compTotals.length) * 100) / 100;
  const delta = Math.round((itemTotal - med) * 100) / 100;
  const pct = Math.round((delta / med) * 1000) / 10;

  let verdict: Verdict;
  if (pct <= -20) verdict = "great-deal";
  else if (pct <= -8) verdict = "good-deal";
  else if (pct < 10) verdict = "fair-price";
  else verdict = "overpriced";

  const reasoning =
    `Item total cost (price + shipping) is $${itemTotal.toFixed(2)} vs a median of $${med.toFixed(2)} ` +
    `across ${compTotals.length} comparable active listings (${pct > 0 ? "+" : ""}${pct}%). ` +
    (verdict === "great-deal"
      ? "Significantly below market — check condition and seller feedback before buying."
      : verdict === "good-deal"
        ? "Below market for comparable listings."
        : verdict === "fair-price"
          ? "In line with the market."
          : "Above market — comparable listings are cheaper.");

  return {
    source,
    checkedAt: new Date().toISOString(),
    item,
    totalCost: itemTotal,
    comparables: {
      count: compTotals.length,
      priceRange: {
        min: Math.min(...compTotals),
        max: Math.max(...compTotals),
      },
      median: med,
      mean,
      sample: comps.slice(0, 5).map((c) => ({
        itemId: c.itemId,
        title: c.title,
        totalCost: totalCost(c),
        condition: c.condition,
      })),
    },
    verdict,
    deltaVsMedian: delta,
    percentVsMedian: pct,
    reasoning,
  };
}
