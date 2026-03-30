// lib/nickname.ts
// Local Caribbean-themed nickname generator
// No API call — instant, zero cost, never fails
// 100 adjectives × 100 nouns = 10,000 unique combinations before needing numbers

const ADJECTIVES = [
  "Coral", "Turbo", "Steel", "Flame", "Solar", "Mango", "Tropic", "Sapphire", "Golden", "Swift",
  "Cobalt", "Crimson", "Ember", "Jade", "Lunar", "Mystic", "Noble", "Ocean", "Prism", "Royal",
  "Sandy", "Thunder", "Ultra", "Vivid", "Wild", "Xenon", "Yellow", "Zephyr", "Amber", "Blazing",
  "Cedar", "Daring", "Elite", "Fierce", "Gleam", "Hyper", "Indigo", "Jungle", "Keen", "Lively",
  "Marble", "Nimble", "Onyx", "Plum", "Quick", "Radiant", "Shining", "Titan", "Urban", "Velvet",
  "Woven", "Xtreme", "Zonal", "Arctic", "Breezy", "Carib", "Dusk", "Ebony", "Frosty", "Glowing",
  "Hardy", "Island", "Jolly", "Kinetic", "Lush", "Mighty", "Neon", "Opal", "Peak", "Quest",
  "Rustic", "Sunny", "Teal", "Unique", "Vast", "Warm", "Xtra", "Zesty", "Aqua", "Bold",
  "Calm", "Deep", "Epic", "Flash", "Grand", "Hyper", "Iron", "Jade", "Keen", "Lime",
  "Mint", "Nova", "Open", "Pure", "Rapid", "Sleek", "True", "Unity", "Vibe", "Wave",
];

const NOUNS = [
  "Bolt", "Wave", "Conch", "Parrot", "Ibis", "Shark", "Flame", "Drum", "Reef", "Sail",
  "Crab", "Dove", "Eagle", "Finch", "Gull", "Hawk", "Isle", "Jewel", "Kite", "Lark",
  "Mast", "Node", "Oar", "Pearl", "Quest", "Rock", "Shell", "Tide", "Urchin", "Vista",
  "Wren", "Xray", "Yacht", "Zone", "Anchor", "Beach", "Coast", "Dune", "Echo", "Ferry",
  "Grove", "Haven", "Inlet", "Jade", "Knot", "Lagoon", "Mango", "Nook", "Orbit", "Prism",
  "Quay", "Ridge", "Spire", "Torch", "Union", "Vane", "Whirl", "Xenon", "Yarn", "Zenith",
  "Atoll", "Bay", "Cay", "Dell", "Estuary", "Ford", "Glen", "Hill", "Islet", "Jetty",
  "Key", "Ledge", "Mesa", "Nile", "Oasis", "Pond", "Quartz", "River", "Sound", "Trail",
  "Utah", "Vale", "Weir", "Xeno", "Yard", "Zeal", "Arch", "Buoy", "Cliff", "Drift",
  "Edge", "Fjord", "Gulf", "Helm", "Iris", "Jib", "Kelp", "Loch", "Marsh", "Narrows",
];

/**
 * Generate a Caribbean-themed nickname
 * Format: AdjectiveNoun (e.g. CoralBolt, TurboConch)
 * If existingNicknames set is provided, avoids duplicates
 * Falls back to appending a 2-digit number after exhausting clean combos
 */
export function generateNickname(existingNicknames?: Set<string>): string {
  // Try random combinations first
  const maxAttempts = 50;
  for (let i = 0; i < maxAttempts; i++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const candidate = `${adj}${noun}`;
    if (!existingNicknames || !existingNicknames.has(candidate)) {
      return candidate;
    }
  }

  // Fallback: append a 2-digit number
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = String(Math.floor(Math.random() * 90) + 10); // 10–99
  return `${adj}${noun}${num}`;
}

/**
 * Generate a username from a first name
 * Format: firstname + random 3-digit number (e.g. dylan847)
 * Lowercased, spaces removed
 */
export function generateUsername(firstName: string): string {
  const base = firstName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  const num = String(Math.floor(Math.random() * 900) + 100); // 100–999
  return `${base}${num}`;
}