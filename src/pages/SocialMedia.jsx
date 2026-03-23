import FeedPage from "../components/FeedPage";
import { FEEDS, ALERT_KEYWORDS } from "../constants/socialFeeds";

export default function SocialMedia() {
  return (
    <FeedPage
      channel="social"
      title="SOCIAL MEDIA INTEL"
      subtitle="Reddit · Mastodon · GitHub Advisories · NVD · X · Telegram"
      feeds={FEEDS}
      alertKeywords={ALERT_KEYWORDS}
      accentColor="#7c4dff"
    />
  );
}
