# API Integrations & Environment Variables

Intel Hub works out of the box with **zero configuration**. Optional API keys unlock additional sources and features.

## Built-in API integrations

These feeds use dedicated API calls (not RSS):

| API | What it provides | Key required |
|-----|-----------------|--------------|
| ThreatFox (abuse.ch) | Recent IoCs — malware, C2, botnet indicators | None |
| GreyNoise | Internet noise/scan data, trending threat tags | Free community key |
| VulnCheck | Known Exploited Vulnerabilities, exploit intel | Free community key |
| Reddit JSON | Subreddit posts via `/r/{sub}/new.json` | None |
| Mastodon | Infosec researcher toots via public API | None |
| GitHub Advisories | Reviewed security advisories with CVSS | None |
| NVD (NIST) | High-severity CVEs, last 3 days | None (rate-limited) |
| Twitter API v2 | Keyword search across X/Twitter | Bearer token ($100/mo) |
| Telegram Public Scraper | 11 primary + 2 backup channels with health checks | None |
| Telegram Bot API | Private channel monitoring (supplement) | Bot token (free) |
| Have I Been Pwned | Breach domain search | Optional |
| Ransomfeed.it | Ransomware victim disclosures (~80 latest) | None |
| URLhaus / MalwareBazaar / Feodo Tracker / SSL Blacklist | Various abuse.ch threat data | None |

## Server-exposed endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Server status, uptime, memory usage, channel count |
| `GET /api/channels` | Channel definitions and feed counts |
| `POST /api/ingest` | Universal webhook ingest — see [ingest-api.md](ingest-api.md) |
| WebSocket on same origin | Live feed updates per channel |

## Environment variables

Copy [`.env.example`](../.env.example) to `.env` and configure as needed. Every key is optional.

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

## Where to get free API keys

- **GreyNoise**: register at https://www.greynoise.io/ (free Community tier)
- **VulnCheck**: register at https://vulncheck.com/ (free Community tier)
- **Telegram Bot Token**: message [@BotFather](https://t.me/BotFather) on Telegram → `/newbot`
