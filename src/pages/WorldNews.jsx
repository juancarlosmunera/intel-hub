import FeedPage from "../components/FeedPage";
import { FEEDS, ALERT_KEYWORDS } from "../constants/worldFeeds";

export default function WorldNews() {
  return (
    <FeedPage
      channel="world"
      title="WORLD NEWS & GEOPOLITICS"
      subtitle="Wire Services · Think Tanks · Defense · Analysis"
      feeds={FEEDS}
      alertKeywords={ALERT_KEYWORDS}
      accentColor="#64d2ff"
    />
  );
}
