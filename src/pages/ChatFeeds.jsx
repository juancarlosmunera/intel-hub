import FeedPage from "../components/FeedPage";
import { FEEDS, ALERT_KEYWORDS } from "../constants/chatFeeds";

export default function ChatFeeds() {
  return (
    <FeedPage
      channel="chatfeeds"
      title="CHAT FEEDS"
      subtitle="Telegram Channels · Threat Intel · Ransomware · OSINT · Bug Bounty"
      feeds={FEEDS}
      alertKeywords={ALERT_KEYWORDS}
      accentColor="#00d4aa"
    />
  );
}
