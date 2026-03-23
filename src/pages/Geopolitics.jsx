import FeedPage from "../components/FeedPage";

const FEEDS = [
  { name: "Foreign Affairs", category: "Geopolitics" },
  { name: "Foreign Policy", category: "Geopolitics" },
  { name: "The Diplomat", category: "Geopolitics" },
  { name: "War on the Rocks", category: "Geopolitics" },
  { name: "RAND", category: "Think Tank" },
  { name: "CSIS", category: "Think Tank" },
  { name: "Council on Foreign Relations", category: "Think Tank" },
  { name: "Stimson Center", category: "Think Tank" },
  { name: "Atlantic Council", category: "Think Tank" },
  { name: "Heritage Foundation", category: "Think Tank" },
  { name: "Hudson Institute", category: "Think Tank" },
  { name: "Defense One", category: "Defense" },
  { name: "Breaking Defense", category: "Defense" },
  { name: "USNI News", category: "Defense" },
  { name: "The Aviationist", category: "Defense" },
  { name: "19FortyFive", category: "Defense" },
  { name: "SOF News", category: "Defense" },
  { name: "Middle East Eye", category: "Conflict Monitor" },
  { name: "Alma Research Center", category: "Conflict Monitor" },
  { name: "Long War Journal", category: "Conflict Monitor" },
];

const ALERT_KEYWORDS = [
  "Iran", "Operation Epic Fury", "CENTCOM", "IRGC", "nuclear",
  "airstrike", "missile", "drone strike", "carrier strike group",
  "escalation", "ceasefire", "NATO", "sanctions", "blockade",
  "Taiwan", "South China Sea", "Ukraine", "Russia", "North Korea",
  "coup", "insurgency", "proxy war", "special operations",
  "F/A-18", "F-35", "B-2", "Tomahawk", "hypersonic",
  "ballistic missile", "air defense", "S-400", "THAAD",
  "intelligence", "SIGINT", "reconnaissance", "surveillance",
];

export default function Geopolitics() {
  return (
    <FeedPage
      channel="geopolitics"
      title="GEOPOLITICS & DEFENSE"
      subtitle="Conflict Monitoring · Defense Analysis · Think Tanks · Strategy"
      feeds={FEEDS}
      alertKeywords={ALERT_KEYWORDS}
      accentColor="#ff6b35"
    />
  );
}
