import FeedPage from "../components/FeedPage";
import { FEEDS, ALERT_KEYWORDS } from "../constants/darkwebFeeds";

export default function DarkWeb() {
  return (
    <FeedPage
      channel="darkweb"
      title="DARK WEB MONITOR"
      subtitle="Ransomware · Breaches · Underground Markets · Threat Actors"
      feeds={FEEDS}
      alertKeywords={ALERT_KEYWORDS}
      accentColor="#ff2255"
    />
  );
}
