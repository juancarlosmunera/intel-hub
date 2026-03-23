export const FEEDS = [
  // ── Center (7) ──
  { name: "Reuters World", category: "Wire Service" },
  { name: "UPI", category: "Wire Service" },
  { name: "France24", category: "International" },
  { name: "Nikkei Asia", category: "International" },
  { name: "The Hill", category: "US Politics" },
  { name: "NewsNation", category: "US Politics" },
  { name: "Wall Street Journal", category: "US Politics" },

  // ── Lean Left (5) ──
  { name: "AP News World", category: "Wire Service" },
  { name: "BBC World", category: "International" },
  { name: "NPR World", category: "US News" },
  { name: "CNN World", category: "US News" },
  { name: "Axios", category: "US Politics" },

  // ── Lean Right (5) ──
  { name: "Fox News", category: "US News" },
  { name: "New York Post", category: "US News" },
  { name: "Washington Examiner", category: "US News" },
  { name: "The Dispatch", category: "US Politics" },
  { name: "National Review", category: "US News" },

  // ── Geopolitics & Strategy ──
  { name: "Foreign Affairs", category: "Geopolitics" },
  { name: "Foreign Policy", category: "Geopolitics" },
  { name: "The Diplomat", category: "Geopolitics" },
  { name: "War on the Rocks", category: "Geopolitics" },

  // ── Think Tanks (4 left-leaning, 4 right-leaning) ──
  { name: "RAND", category: "Think Tank" },
  { name: "CSIS", category: "Think Tank" },
  { name: "Council on Foreign Relations", category: "Think Tank" },
  { name: "Stimson Center", category: "Think Tank" },
  { name: "Atlantic Council", category: "Think Tank" },
  { name: "Heritage Foundation", category: "Think Tank" },
  { name: "Hudson Institute", category: "Think Tank" },
  { name: "Cato Institute", category: "Think Tank" },

  // ── Defense & Military ──
  { name: "Defense One", category: "Defense" },
  { name: "Breaking Defense", category: "Defense" },
];

export const ALERT_KEYWORDS = [
  // Conflict & Military
  "military strike", "missile launch", "airstrike", "invasion",
  "armed conflict", "ceasefire", "troop deployment", "mobilization",
  "nuclear test", "weapons test", "drone strike", "military buildup",
  // Geopolitical Crisis
  "sanctions imposed", "diplomatic crisis", "embassy closed",
  "trade war", "economic sanctions", "asset freeze", "arms embargo",
  "territorial dispute", "border clash", "coup attempt", "coup",
  "martial law", "state of emergency", "civil unrest",
  // Nuclear / WMD
  "nuclear", "uranium enrichment", "ICBM", "ballistic missile",
  "chemical weapons", "biological weapons",
  // Terrorism
  "terrorist attack", "bombing", "hostage", "mass shooting",
  "ISIS", "al-Qaeda", "extremist attack",
  // Humanitarian
  "humanitarian crisis", "refugee crisis", "famine",
  "mass displacement", "genocide", "ethnic cleansing",
  // Key Actors
  "NATO", "UN Security Council", "G7", "G20", "EU summit",
  "BRICS", "OPEC",
];
