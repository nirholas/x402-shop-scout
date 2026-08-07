// Fixture data — used when EBAY_CLIENT_ID / EBAY_CLIENT_SECRET (or EBAY_OAUTH_TOKEN) are unset.
// Deterministic: same query → same listings, same order, same deal verdicts.

export interface Listing {
  itemId: string;
  title: string;
  price: { value: number; currency: string };
  condition: string;
  seller: { username: string; feedbackPercentage: number; feedbackScore: number };
  buyingOption: "FIXED_PRICE" | "AUCTION" | "BEST_OFFER";
  shipping: { cost: number; currency: string; type: string };
  location: string;
  itemWebUrl: string;
  imageUrl: string | null;
}

export const FIXTURE_LISTINGS: Listing[] = [
  { itemId: "v1|110001|0", title: "Apple iPhone 13 128GB Midnight - Unlocked - Excellent Condition", price: { value: 389.99, currency: "USD" }, condition: "Excellent - Refurbished", seller: { username: "phoenix_resale", feedbackPercentage: 99.4, feedbackScore: 15230 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Austin, TX", itemWebUrl: "https://www.ebay.com/itm/110001", imageUrl: null },
  { itemId: "v1|110002|0", title: "Apple iPhone 13 128GB Blue Unlocked - Good Condition", price: { value: 359.0, currency: "USD" }, condition: "Good - Refurbished", seller: { username: "techdeals_direct", feedbackPercentage: 98.7, feedbackScore: 88410 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Dallas, TX", itemWebUrl: "https://www.ebay.com/itm/110002", imageUrl: null },
  { itemId: "v1|110003|0", title: "Apple iPhone 13 128GB Starlight - cracked back, fully functional", price: { value: 245.0, currency: "USD" }, condition: "For parts or not working", seller: { username: "fixit_phones", feedbackPercentage: 96.1, feedbackScore: 2210 }, buyingOption: "BEST_OFFER", shipping: { cost: 8.95, currency: "USD", type: "STANDARD" }, location: "Columbus, OH", itemWebUrl: "https://www.ebay.com/itm/110003", imageUrl: null },
  { itemId: "v1|110004|0", title: "NEW SEALED Apple iPhone 13 128GB Midnight Unlocked", price: { value: 529.99, currency: "USD" }, condition: "New", seller: { username: "primetime_wireless", feedbackPercentage: 99.8, feedbackScore: 45102 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Miami, FL", itemWebUrl: "https://www.ebay.com/itm/110004", imageUrl: null },
  { itemId: "v1|110005|0", title: "Apple iPhone 13 128GB - Pink - Unlocked - VERY GOOD", price: { value: 374.5, currency: "USD" }, condition: "Very Good - Refurbished", seller: { username: "renewed_republic", feedbackPercentage: 99.1, feedbackScore: 120540 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Sacramento, CA", itemWebUrl: "https://www.ebay.com/itm/110005", imageUrl: null },
  { itemId: "v1|120001|0", title: "Sony WH-1000XM5 Wireless Noise Canceling Headphones - Black", price: { value: 248.0, currency: "USD" }, condition: "New", seller: { username: "audio_outlet_usa", feedbackPercentage: 99.6, feedbackScore: 67230 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Newark, NJ", itemWebUrl: "https://www.ebay.com/itm/120001", imageUrl: null },
  { itemId: "v1|120002|0", title: "Sony WH-1000XM5 Headphones Silver - Open Box, complete", price: { value: 219.99, currency: "USD" }, condition: "Open box", seller: { username: "bigbox_returns", feedbackPercentage: 98.2, feedbackScore: 31005 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Reno, NV", itemWebUrl: "https://www.ebay.com/itm/120002", imageUrl: null },
  { itemId: "v1|120003|0", title: "Sony WH1000XM5 - broken headband, works with tape", price: { value: 119.0, currency: "USD" }, condition: "For parts or not working", seller: { username: "parts_bin_pete", feedbackPercentage: 94.9, feedbackScore: 812 }, buyingOption: "AUCTION", shipping: { cost: 12.4, currency: "USD", type: "STANDARD" }, location: "Tulsa, OK", itemWebUrl: "https://www.ebay.com/itm/120003", imageUrl: null },
  { itemId: "v1|130001|0", title: "Nintendo Switch OLED White Console - Complete In Box", price: { value: 274.99, currency: "USD" }, condition: "Used", seller: { username: "gamestop_annex", feedbackPercentage: 99.0, feedbackScore: 54200 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Seattle, WA", itemWebUrl: "https://www.ebay.com/itm/130001", imageUrl: null },
  { itemId: "v1|130002|0", title: "Nintendo Switch OLED Neon - Brand New Sealed", price: { value: 319.99, currency: "USD" }, condition: "New", seller: { username: "console_castle", feedbackPercentage: 99.7, feedbackScore: 98120 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Chicago, IL", itemWebUrl: "https://www.ebay.com/itm/130002", imageUrl: null },
  { itemId: "v1|130003|0", title: "Nintendo Switch OLED console only, no dock or joycons", price: { value: 189.0, currency: "USD" }, condition: "Used", seller: { username: "quickflip_dan", feedbackPercentage: 97.5, feedbackScore: 4310 }, buyingOption: "BEST_OFFER", shipping: { cost: 9.99, currency: "USD", type: "STANDARD" }, location: "Boise, ID", itemWebUrl: "https://www.ebay.com/itm/130003", imageUrl: null },
  { itemId: "v1|140001|0", title: "LEGO Star Wars Millennium Falcon 75257 - New Sealed Box", price: { value: 139.95, currency: "USD" }, condition: "New", seller: { username: "brick_bazaar", feedbackPercentage: 99.9, feedbackScore: 22140 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Portland, OR", itemWebUrl: "https://www.ebay.com/itm/140001", imageUrl: null },
  { itemId: "v1|140002|0", title: "LEGO 75257 Millennium Falcon complete with minifigs, retired", price: { value: 112.5, currency: "USD" }, condition: "Used", seller: { username: "afol_attic", feedbackPercentage: 98.8, feedbackScore: 9870 }, buyingOption: "FIXED_PRICE", shipping: { cost: 12.0, currency: "USD", type: "STANDARD" }, location: "Madison, WI", itemWebUrl: "https://www.ebay.com/itm/140002", imageUrl: null },
  { itemId: "v1|150001|0", title: "Dyson V11 Torque Drive Cordless Vacuum - Refurbished by Dyson", price: { value: 299.99, currency: "USD" }, condition: "Certified - Refurbished", seller: { username: "dyson_outlet", feedbackPercentage: 99.3, feedbackScore: 310540 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Aurora, IL", itemWebUrl: "https://www.ebay.com/itm/150001", imageUrl: null },
  { itemId: "v1|150002|0", title: "Dyson V11 Animal cordless vacuum - used, new battery installed", price: { value: 219.0, currency: "USD" }, condition: "Used", seller: { username: "cleansweep_resale", feedbackPercentage: 98.1, feedbackScore: 5120 }, buyingOption: "FIXED_PRICE", shipping: { cost: 14.99, currency: "USD", type: "STANDARD" }, location: "Knoxville, TN", itemWebUrl: "https://www.ebay.com/itm/150002", imageUrl: null },
  { itemId: "v1|140003|0", title: "LEGO Star Wars 75257 Millennium Falcon - open box, bags sealed", price: { value: 124.0, currency: "USD" }, condition: "Open box", seller: { username: "sealed_studs", feedbackPercentage: 99.5, feedbackScore: 16420 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Provo, UT", itemWebUrl: "https://www.ebay.com/itm/140003", imageUrl: null },
  { itemId: "v1|140004|0", title: "LEGO Star Wars Millennium Falcon 75257 - used, missing 4 pieces", price: { value: 84.0, currency: "USD" }, condition: "Used", seller: { username: "loose_bricks_co", feedbackPercentage: 97.2, feedbackScore: 3380 }, buyingOption: "BEST_OFFER", shipping: { cost: 13.75, currency: "USD", type: "STANDARD" }, location: "Fresno, CA", itemWebUrl: "https://www.ebay.com/itm/140004", imageUrl: null },
  { itemId: "v1|150003|0", title: "Dyson V11 Torque Drive cordless vacuum - excellent, all attachments", price: { value: 264.5, currency: "USD" }, condition: "Used", seller: { username: "homecare_hub", feedbackPercentage: 99.0, feedbackScore: 41230 }, buyingOption: "FIXED_PRICE", shipping: { cost: 0, currency: "USD", type: "FREE" }, location: "Raleigh, NC", itemWebUrl: "https://www.ebay.com/itm/150003", imageUrl: null },
  { itemId: "v1|150004|0", title: "Dyson V11 cordless vacuum - motor fault, sold for parts", price: { value: 89.0, currency: "USD" }, condition: "For parts or not working", seller: { username: "spares_and_repairs", feedbackPercentage: 95.4, feedbackScore: 1470 }, buyingOption: "AUCTION", shipping: { cost: 18.5, currency: "USD", type: "STANDARD" }, location: "Toledo, OH", itemWebUrl: "https://www.ebay.com/itm/150004", imageUrl: null },
];

/**
 * Normalize a title into comparison tokens. Strips punctuation so a model
 * number written three different ways ("WH-1000XM5", "WH1000XM5", "wh 1000xm5")
 * still collapses to one token — the same normalization a human does by eye.
 */
function tokens(title: string): string[] {
  return title
    .toLowerCase()
    // Join hyphenated model numbers first, so "WH-1000XM5" and "WH1000XM5"
    // become the same token instead of two near-misses.
    .replace(/[-_./]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w.length > 2);
}

/** Deterministic fixture search over title words. */
export function searchFixtureListings(query: string, limit: number): Listing[] {
  const words = tokens(query);
  const scored = FIXTURE_LISTINGS.map((l) => {
    const title = tokens(l.title);
    let score = 0;
    for (const w of words) if (title.includes(w)) score += 1;
    return { l, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.l.price.value - b.l.price.value);
  return scored.slice(0, limit).map((s) => s.l);
}

export function getFixtureListing(itemId: string): Listing | undefined {
  return FIXTURE_LISTINGS.find((l) => l.itemId === itemId || l.itemId.split("|")[1] === itemId);
}

/**
 * Marketplace filler: words that describe *condition* or *colour* rather than
 * *what the thing is*. Two listings sharing only "open" and "box" are not
 * comparable — that's how a Nintendo Switch ends up priced against headphones.
 */
const FILLER = new Set([
  "new", "used", "open", "box", "sealed", "complete", "condition", "with", "and",
  "for", "the", "only", "brand", "excellent", "good", "very", "works", "working",
  "parts", "not", "refurbished", "certified", "missing", "pieces", "bags", "all",
  "black", "white", "silver", "blue", "pink", "neon", "midnight", "starlight",
]);

/**
 * Comparables = fixture listings sharing at least two *distinctive* title
 * tokens with the target. Two is enough to pair "iPhone 13 128GB" listings
 * while keeping a Dyson out of a headphone comparison.
 */
export function fixtureComparables(target: Listing): Listing[] {
  const words = new Set(tokens(target.title).filter((w) => !FILLER.has(w)));
  return FIXTURE_LISTINGS.filter((l) => {
    if (l.itemId === target.itemId) return false;
    const shared = new Set(tokens(l.title).filter((w) => words.has(w)));
    return shared.size >= 2;
  });
}
