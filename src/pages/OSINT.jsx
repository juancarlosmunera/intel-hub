import FeedPage from "../components/FeedPage";
import { FEEDS, ALERT_KEYWORDS } from "../constants/osintFeeds";

export default function OSINT() {
  return (
    <FeedPage
      channel="osint"
      title="OSINT MONITOR"
      subtitle="Investigations · Dark Web · Disinfo · Leaks"
      feeds={FEEDS}
      alertKeywords={ALERT_KEYWORDS}
      accentColor="#ff9500"
    />
  );
}
