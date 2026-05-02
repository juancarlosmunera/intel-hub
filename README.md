# Intel Hub

Real-time cybersecurity, geopolitics, OSINT, dark web, social media, and chat feed intelligence aggregator with 7 channels, 170+ feeds, severity classification, source credibility scoring, political bias tagging, Telegram monitoring, universal webhook ingest, and email alerting.

## Features

- **7-channel dashboard** — Cybersecurity, World News, Geopolitics & Defense, OSINT, Dark Web, Social Media, and Chat Feeds
- **170+ feeds** aggregated in real-time via server-side parsing
- **API integrations** — ThreatFox IoCs, GreyNoise, VulnCheck KEV, Reddit JSON, Mastodon, GitHub Advisories, NVD (NIST), Telegram
- **Telegram monitoring** — 12 channels scraped via public preview with health checks, auto-rotation of dead channels, and backup pool
- **Universal ingest API** — `POST /api/ingest` accepts messages from any source (Tasker, iOS Shortcuts, Discord bots, signal-cli, etc.)
- **Auto-classification** — articles scored by severity (BREACH / CRITICAL / HIGH / MEDIUM / INFO)
- **Keyword flagging** — 60+ keywords covering ransomware, APTs, breaches, exploits, and dark web activity
- **Real-time updates** — WebSocket push from Node.js backend to React frontend
- **Email alerts** — configurable SMTP notifications for high-severity items
- **Persistent cache** — articles stored to disk with deduplication and 90-day retention
- **Memory management** — 4 GB soft cap with tiered article compaction and oldest-first eviction; PM2 hard restart at 4.5 GB
- **Source credibility scoring** — 4-tier trust system (Primary → Verified → Industry → Unvetted)
- **Political bias tagging** — every news source labeled Left / Lean Left / Center / Lean Right / Right / Independent
- **Content red flags** — automatic detection of clickbait, misinfo, and disinfo patterns
- **Single-process production** — Node server bundles the React frontend; one port, one process, auto-launches browser
- **Zero-key startup** — works immediately with no API keys; optional keys unlock premium sources

## Quick Start

Requires **Node.js 18+**.

```bash
cp .env.example .env    # configure API keys and email (optional)
npm install
```

### Production (single process, auto-opens browser)

```bash
npm start               # builds frontend, starts PM2, opens browser to http://localhost:3001
npm run logs            # tail the running server logs
npm run status          # PM2 process status
npm run stop            # stop the server
```

### Development (hot reload)

```bash
npm run dev             # backend on 3001, Vite on 3000 (auto-opens browser)
```

## Channels & Sources

### Cybersecurity (45+ feeds)

| Category | Sources |
|----------|---------|
| News & Journalism | The Hacker News, BleepingComputer, Dark Reading, SecurityWeek, Threatpost, Ars Technica Security, The Record, Infosecurity Magazine, CSO Online, SecurityAffairs, GBHackers, Hackread, Cyber Security News, TechCrunch Security, The Tech Buzz |
| Expert Commentary | Krebs on Security, Schneier on Security, Graham Cluley |
| Threat Research | Google Project Zero, Unit 42 (Palo Alto), Cisco Talos, CrowdStrike, SentinelOne, Microsoft Security Blog, WeLiveSecurity (ESET), Qualys, Recorded Future, Datadog Security Labs, Sekoia, ReversingLabs |
| Advisories | CISA Advisories, NIST Cyber Insights, US-CERT Alerts |
| Vulnerability | Exploit-DB |
| Supply Chain | Snyk, Sonatype, GitHub Security Blog, OpenSSF, Feroot Security, c/side |
| Web Security | Wordfence, Sucuri |
| PCI / Compliance | PCI SSC Blog, Finextra Security, Payments Dive |
| API Feeds (live IoC/threat data) | ThreatFox IoCs (abuse.ch), GreyNoise Trending, VulnCheck KEV |

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

### Chat Feeds (12+ channels)

Dedicated channel for chat-platform intelligence — separated from Social Media so it can be monitored, filtered, and alerted on independently.

| Source | Channels | Key Required? |
|--------|----------|---------------|
| Telegram (public preview scraper) | vx-underground, HackGit, DARKFEED, Daily Dark Web, RansomFeed News, RansomLook, Intel Slava, OsintTV, The Hacker News, SecAtor, Bug Bounty Hunter, Bug Bounty Channel — with health checks, dead-channel detection, and auto-rotation from a backup pool | No |
| Telegram Bot API (optional) | Private channel monitoring (supplement to scraper) | Bot token (free) |
| Universal Ingest API | Any messaging platform (Signal, WhatsApp, Discord, etc.) via `POST /api/ingest` webhook | Optional API key |

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
| Telegram Public Scraper | 12 channels with health checks and auto-rotation | None (always active) |
| Telegram Bot API | Private channel monitoring (supplement) | Bot token (free, optional) |

## Universal Ingest API

`POST /api/ingest` accepts messages from any source — Tasker on Android, iOS Shortcuts, Discord/Signal/WhatsApp bots, signal-cli, Python scripts, anything that can make an HTTP request. Posted items are deduplicated, persisted, and broadcast to subscribers via WebSocket like any other feed.

```bash
curl -X POST http://localhost:3001/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $INGEST_API_KEY" \
  -d '{
    "channel": "chatfeeds",
    "feedName": "Signal: ThreatGroup",
    "title": "Possible IoC drop in #leaks channel",
    "description": "...",
    "link": "https://signal.group/...",
    "pubDate": "2026-05-02T10:30:00Z"
  }'
```

See [docs/ingest-api.md](docs/ingest-api.md) for full payload schema and platform-specific examples.

Other API endpoints:
- `GET /api/health` — server status, uptime, memory usage
- `GET /api/channels` — channel definitions and feed counts

## Environment Variables

Copy `.env.example` to `.env` and configure as needed. All keys are optional — the app works with zero configuration.

```env
# ── API Keys (optional, unlocks enhanced data) ──
GREYNOISE_API_KEY=          # Free community key from greynoise.io
VULNCHECK_API_KEY=          # Free community key from vulncheck.com
TWITTER_BEARER_TOKEN=       # Twitter API v2 Basic ($100/mo)
TELEGRAM_BOT_TOKEN=         # Free via @BotFather on Telegram
TELEGRAM_CHANNELS=vxunderground  # Comma-separated channel usernames

# ── Universal Ingest API (optional) ──
INGEST_API_KEY=             # Shared secret required on POST /api/ingest

# ── Memory Management (optional) ──
MEMORY_CAP_MB=4096          # Soft cap before eviction kicks in (default 4 GB)

# ── Email Alerts (optional) ──
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_TO=alerts@yourcompany.com
EMAIL_MIN_SEVERITY=BREACH
```

## Memory Management

Designed for long-running production deployments without manual intervention:

| Threshold | Action |
|-----------|--------|
| < 50% of cap | Normal operation |
| ≥ 50% of cap | Proactive tiered compaction runs every 60s |
| ≥ 75% of cap | Compaction runs as the first step of any check |
| ≥ 100% of cap | Eviction — drop oldest 20% per channel until back under 85% |
| > 4500 MB RSS | PM2 hard-restarts the process (safety net) |

**Tiered compaction** trims article descriptions based on age before evicting:

| Tier | Age | Description trimmed to |
|------|-----|------------------------|
| 1 | < 30 min | Full fidelity |
| 2 | 30 min – 6 h | 100 chars |
| 3 | > 6 h | 50 chars + non-essential fields stripped |

Adjust the cap with `MEMORY_CAP_MB` in `.env`.

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

In production a single Node.js process serves the React bundle, the REST API, and the WebSocket on the same port. PM2 supervises the process, restarts on crash, and enforces a memory ceiling.

```
Browser (auto-launched)
   │
   ├── HTTP  → / (React bundle from dist/)
   ├── HTTP  → /api/* (ingest, health, channels)
   └── WS    → / (live channel updates, on the same origin)
        │
        ▼
Node.js Server  (managed by PM2 — autorestart, 4.5 GB ceiling)
   ├── Static file server (serves dist/)
   ├── Universal Ingest API (POST /api/ingest)
   ├── RSS Parser (rss-parser)
   ├── API Fetchers
   │   ├── ThreatFox, GreyNoise, VulnCheck
   │   ├── Reddit JSON, Mastodon, GitHub Advisories
   │   ├── NVD (NIST), Twitter API, Telegram Bot API
   │   ├── Telegram public preview scraper (12 channels + backups)
   │   └── Have I Been Pwned, URLhaus, MalwareBazaar
   ├── Telegram Channel Health Monitor (auto-rotation)
   ├── Severity Classifier
   ├── Source Credibility Scorer (4-tier)
   ├── Political Bias Tagger (7 categories)
   ├── Content Red Flag Detector
   ├── Dedup & Retention Engine (90 days)
   ├── Memory Manager (tiered compaction → eviction)
   ├── JSON Persistence (data/)
   └── SMTP Alerter (nodemailer)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get involved — from adding a single RSS feed to building new integrations.

## License

MIT — see [LICENSE](LICENSE) for details.
