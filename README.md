# Intel Hub

Real-time cybersecurity, geopolitics, OSINT, dark web, and social media intelligence aggregator with 6 channels, 150+ feeds, severity classification, source credibility scoring, political bias tagging, and email alerting.

## Features

- **6-channel dashboard** — Cybersecurity, World News, Geopolitics & Defense, OSINT, Dark Web, and Social Media
- **150+ RSS feeds** aggregated in real-time via server-side parsing
- **API integrations** — ThreatFox IoCs, GreyNoise, VulnCheck KEV, Reddit JSON, Mastodon, GitHub Advisories, NVD (NIST)
- **Auto-classification** — articles scored by severity (BREACH / CRITICAL / HIGH / MEDIUM / INFO)
- **Keyword flagging** — 60+ keywords covering ransomware, APTs, breaches, exploits, and dark web activity
- **Real-time updates** — WebSocket push from Node.js backend to React frontend
- **Email alerts** — configurable SMTP notifications for high-severity items
- **Persistent cache** — articles stored to disk with deduplication and 48-hour retention
- **Source credibility scoring** — 4-tier trust system (Primary → Verified → Industry → Unvetted)
- **Political bias tagging** — every news source labeled Left / Lean Left / Center / Lean Right / Right / Independent
- **Content red flags** — automatic detection of clickbait, misinfo, and disinfo patterns
- **Zero-key startup** — works immediately with no API keys; optional keys unlock premium sources

## Quick Start

Requires **Node.js 18+**.

```bash
cp .env.example .env    # configure API keys and email (optional)
npm install
npm run dev             # starts server + Vite dev server
```

Open `http://localhost:3000`

## Channels & Sources

### Cybersecurity (40+ feeds)

| Category | Sources |
|----------|---------|
| Threat Intel | The Hacker News, Krebs on Security, BleepingComputer, Dark Reading, SecurityWeek, Threatpost, Ars Technica Security, The Record, Infosecurity Magazine, CSO Online, SecurityAffairs, GBHackers, Hackread, Cyber Security News, Graham Cluley, Schneier on Security |
| Advisories | CISA Advisories, NIST Cyber Insights, US-CERT Alerts |
| Vulnerability | Exploit-DB |
| Research | Google Project Zero, Unit 42 (Palo Alto), Cisco Talos, Qualys, Recorded Future, Datadog Security Labs, Sekoia, ReversingLabs |
| Vendor Security | Microsoft Security Blog, SentinelOne, CrowdStrike, WeLiveSecurity (ESET) |
| Supply Chain | Snyk, Sonatype, GitHub Security Blog, OpenSSF, Feroot Security, c/side |
| Web Security | Wordfence, Sucuri |
| PCI / Compliance | PCI SSC Blog, Finextra Security, Payments Dive |
| API Feeds | ThreatFox IoCs (abuse.ch), GreyNoise Trending, VulnCheck KEV |

### World News (40+ feeds)

| Category | Sources |
|----------|---------|
| Wire Services | Reuters, AP News, UPI |
| International | France24, Nikkei Asia, BBC World, Middle East Eye |
| US News | CNN, NPR, Fox News, New York Post, NewsNation |
| US Politics | The Hill, Wall Street Journal, Axios, Washington Examiner, The Dispatch, National Review |
| Geopolitics | Foreign Affairs, Foreign Policy, The Diplomat, War on the Rocks |
| Think Tanks | RAND, CSIS, Council on Foreign Relations, Stimson Center, Atlantic Council, Heritage Foundation, Hudson Institute |
| Independent Journalism | Racket News (Matt Taibbi), Glenn Greenwald, Chris Hedges Report, Seymour Hersh, The Orf Report (Matt Orfalea), The Grayzone, Consortium News |
| Defense | Defense One, Breaking Defense, USNI News, The Aviationist, 19FortyFive, SOF News |
| Conflict Monitor | Alma Research Center |

### Geopolitics & Defense (20 feeds)

| Category | Sources |
|----------|---------|
| Geopolitics | Foreign Affairs, Foreign Policy, The Diplomat, War on the Rocks |
| Think Tanks | RAND, CSIS, Council on Foreign Relations, Stimson Center, Atlantic Council, Heritage Foundation, Hudson Institute |
| Defense | Defense One, Breaking Defense, USNI News, The Aviationist, 19FortyFive, SOF News |
| Conflict Monitor | Middle East Eye, Alma Research Center, Long War Journal |

### OSINT (24+ feeds)

| Category | Sources |
|----------|---------|
| Raw Data | GDELT Project |
| Methodology | IntelTechniques Blog |
| OSINT Investigations | Bellingcat |
| Threat Intel | Recorded Future, Intel471, DarkReading, Flashpoint, Kaspersky Securelist, Microsoft Threat Intel, Cisco Talos, CrowdStrike, SentinelOne Labs, Unit 42, The Record, BleepingComputer |
| Independent Cyber | Krebs on Security, Schneier on Security |
| Conflict Monitoring | Long War Journal |
| Government Advisory | CISA Alerts |
| Sanctions | OFAC Updates |

### Dark Web Monitor (20+ feeds)

| Category | Sources |
|----------|---------|
| Ransomware Tracking | Ransomware.live, RansomFeed.it, DarkFeed, The DFIR Report |
| Breach & Leak Journalism | DataBreaches.net, Troy Hunt, CyberScoop |
| Underground / Threat Intel | Intel 471 Blog, Flashpoint, BushidoToken, Check Point Research, Google Threat Intel, Securelist (Kaspersky), Huntress Blog, Elastic Security Labs |
| Malware & Botnet Tracking | ANY.RUN Blog, Malwarebytes Blog, Sophos Blog |
| Exploitation in the Wild | SANS ISC, Rapid7 Blog |
| Government | UK NCSC Reports |
| API Feeds | Have I Been Pwned domain search, URLhaus, MalwareBazaar, Feodo Tracker, SSL Blacklist |

### Social Media (16+ feeds)

| Category | Sources | Key Required? |
|----------|---------|---------------|
| Reddit (10 subreddits) | r/netsec, r/cybersecurity, r/malware, r/darknet, r/privacy, r/ReverseEngineering, r/AskNetsec, r/blueteamsec, r/computerforensics, r/OSINT | No |
| Mastodon (4 accounts) | Jerry Bell, Brian Krebs, BleepingComputer, MalwareTech — via infosec.exchange | No |
| GitHub Advisories | Reviewed CVEs with severity and CVSS scores | No |
| NVD (NIST) | High-severity CVEs from last 3 days via REST API 2.0 | No |
| X / Twitter | Search API v2 — cybersecurity keyword monitoring | Yes ($100/mo Basic tier) |
| Telegram | Bot API channel monitoring (vx-underground, etc.) | Yes (free via @BotFather) |

## API Integrations

These feeds use dedicated API calls (not RSS):

| API | What it provides | Key required |
|-----|-----------------|--------------|
| ThreatFox (abuse.ch) | Recent IoCs — malware, C2, botnet indicators | None (always active) |
| GreyNoise | Internet noise/scan data, trending threat tags | Free community key |
| VulnCheck | Known Exploited Vulnerabilities, exploit intel | Free community key |
| Reddit JSON | Subreddit posts via `/r/{sub}/new.json` | None (always active) |
| Mastodon | Infosec researcher toots via public API | None (always active) |
| GitHub Advisories | Reviewed security advisories with CVSS | None (always active) |
| NVD (NIST) | High-severity CVEs, last 3 days | None (rate-limited) |
| Twitter API v2 | Keyword search across X/Twitter | Bearer token ($100/mo) |
| Telegram Bot API | Channel message history | Bot token (free) |

## Environment Variables

Copy `.env.example` to `.env` and configure as needed. All keys are optional — the app works with zero configuration.

```env
# ── API Keys (optional, unlocks enhanced data) ──
GREYNOISE_API_KEY=          # Free community key from greynoise.io
VULNCHECK_API_KEY=          # Free community key from vulncheck.com
TWITTER_BEARER_TOKEN=       # Twitter API v2 Basic ($100/mo)
TELEGRAM_BOT_TOKEN=         # Free via @BotFather on Telegram
TELEGRAM_CHANNELS=vxunderground  # Comma-separated channel usernames

# ── Email Alerts (optional) ──
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_TO=alerts@yourcompany.com
EMAIL_MIN_SEVERITY=BREACH
```

## Source Credibility System

Every feed is assigned a trust tier that displays alongside articles:

| Tier | Label | Description | Example |
|------|-------|-------------|---------|
| 1 | PRIMARY | Government agencies, official databases, raw data feeds | CISA, NVD, GitHub Advisories |
| 2 | VERIFIED | Major outlets with editorial standards, recognized researchers | Krebs, BleepingComputer, Brian Krebs (Mastodon) |
| 3 | INDUSTRY | Vendor blogs, think tanks, moderated communities | CrowdStrike, r/netsec, Telegram channels |
| 4 | UNVETTED | Aggregators, less established or unvetted sources | r/darknet, GBHackers |

Content red flags (clickbait, misinfo patterns) are automatically detected and surfaced.

## Political Bias Tags

Every news and editorial source is tagged with its political leaning. Technical/cybersec feeds show no tag.

| Tag | Color | Examples |
|-----|-------|---------|
| LEFT | Blue | CNN |
| LEAN LEFT | Light Blue | NPR, Foreign Policy, Middle East Eye, Ars Technica |
| CENTER | Gray | Reuters, AP, BBC, RAND, CSIS, Defense One, Bellingcat |
| LEAN RIGHT | Orange | NY Post, The Dispatch, Atlantic Council, 19FortyFive, Alma Research |
| RIGHT | Red | Fox News, Washington Examiner, National Review, Heritage Foundation |
| INDEPENDENT | Purple | Racket News (Taibbi), Glenn Greenwald, Seymour Hersh, The Grayzone |
| NONPARTISAN | Hidden | All technical, cybersec, and data feeds (tag not shown in UI) |

Bias classifications are in `src/constants/sourceBias.js`.

## Customization

### Add RSS feeds

Add entries to the appropriate channel in `server.js`:

```js
{ name: "Your Feed", url: "https://example.com/rss", category: "Custom" },
```

### Add authenticated API feeds

1. Add `YOUR_API_KEY=` to `.env` and `.env.example`
2. Write a `fetchYourFeed()` function in `server.js` with auth headers
3. Add it to the appropriate orchestrator (`fetchAllApiFeeds()`, `fetchSocialApiFeeds()`, or `fetchDarkWebApiFeeds()`)

### Adjust severity rules

Edit the severity classification logic in `src/utils/classify.js` and `src/constants/severity.js`.

### Modify alert keywords

Edit keyword arrays in `src/constants/` — each channel has its own keyword file:
- `src/constants/severity.js` — Cybersecurity keywords
- `src/constants/darkwebFeeds.js` — Dark web alert keywords
- `src/constants/socialFeeds.js` — Social media alert keywords

### Add Mastodon accounts

Add entries to `MASTODON_ACCOUNTS` in `server.js`:

```js
{ instance: "infosec.exchange", account: "username", display: "Display Name" },
```

### Add Reddit subreddits

Add the subreddit name to `REDDIT_SUBS` in `server.js`:

```js
const REDDIT_SUBS = ["netsec", "cybersecurity", /* ... */, "your-subreddit"];
```

Then add the feed name to `src/constants/socialFeeds.js` and trust tier to `src/constants/sourceCredibility.js`.

## Architecture

```
React (Vite) ←—WebSocket—→ Node.js Server
                              ├── RSS Parser (rss-parser)
                              ├── API Fetchers
                              │   ├── ThreatFox, GreyNoise, VulnCheck
                              │   ├── Reddit JSON, Mastodon, GitHub Advisories
                              │   ├── NVD (NIST), Twitter API, Telegram Bot API
                              │   └── Have I Been Pwned, URLhaus, MalwareBazaar
                              ├── Severity Classifier
                              ├── Source Credibility Scorer (4-tier)
                              ├── Political Bias Tagger (7 categories)
                              ├── Content Red Flag Detector
                              ├── Dedup & Retention Engine (48h)
                              ├── JSON Persistence (data/)
                              └── SMTP Alerter (nodemailer)
```

## License

Private — all rights reserved.
