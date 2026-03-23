# Intel Hub

Real-time cybersecurity, geopolitics, and OSINT intelligence aggregator with multi-channel feeds, severity classification, and email alerting.

## Features

- **Multi-channel dashboard** — three dedicated views: Cybersecurity, World News & Geopolitics, and OSINT
- **50+ RSS feeds** aggregated in real-time via server-side parsing
- **API integrations** — ThreatFox IoCs, GreyNoise trending threats, VulnCheck KEV
- **Auto-classification** — articles scored by severity (BREACH / CRITICAL / HIGH / MEDIUM / INFO)
- **Keyword flagging** — 40+ keywords relevant to PCI, payments, and hospitality
- **Real-time updates** — WebSocket push from Node.js backend to React frontend
- **Email alerts** — configurable SMTP notifications for high-severity items
- **Persistent cache** — articles stored to disk with deduplication and retention management
- **Source credibility scoring** — feeds tagged by reliability and bias
- **Paid feed support** — API key infrastructure for authenticated feeds via environment variables

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

### World News & Geopolitics (35+ feeds)

| Category | Sources |
|----------|---------|
| Wire Services | Reuters, AP News, UPI |
| International | France24, Nikkei Asia, BBC World |
| US News | CNN, NPR, Fox News, New York Post, NewsNation |
| US Politics | The Hill, Wall Street Journal, Axios, Washington Examiner, The Dispatch, National Review |
| Geopolitics | Foreign Affairs, Foreign Policy, The Diplomat, War on the Rocks |
| Think Tanks | RAND, CSIS, Council on Foreign Relations, Stimson Center, Atlantic Council, Heritage Foundation, Hudson Institute, Cato Institute |
| Independent Journalism | Racket News (Matt Taibbi), Glenn Greenwald, Chris Hedges Report, Seymour Hersh, The Orf Report (Matt Orfalea), The Grayzone, Consortium News |
| Defense | Defense One, Breaking Defense |

### OSINT (20+ feeds)

| Category | Sources |
|----------|---------|
| Raw Data | GDELT Project |
| Methodology | IntelTechniques Blog |
| OSINT Investigations | Bellingcat |
| Threat Intel | Recorded Future, Intel471, DarkReading, Flashpoint, Kaspersky Securelist, Microsoft Threat Intel, Cisco Talos, CrowdStrike, SentinelOne Labs, Unit 42, The Record, BleepingComputer |
| Independent Cyber | Krebs on Security, Schneier on Security |
| Conflict Monitoring | Long War Journal |
| Security Policy | Lawfare |
| Government Advisory | CISA Alerts |
| Sanctions | OFAC Updates |

## API Integrations

These feeds use dedicated API calls (not RSS) and require free API keys set in `.env`:

| API | What it provides | Key required |
|-----|-----------------|--------------|
| ThreatFox (abuse.ch) | Recent IoCs — malware, C2, botnet indicators | None (free, always active) |
| GreyNoise | Internet noise/scan data, trending threat tags | Free community key |
| VulnCheck | Known Exploited Vulnerabilities, exploit intel | Free community key |

## Email Alerts

Configure SMTP in `.env` to receive email notifications when high-severity articles are detected:

```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_TO=alerts@yourcompany.com
EMAIL_MIN_SEVERITY=BREACH
```

## Customization

### Add RSS feeds

Add entries to the appropriate channel in `server.js`:

```js
{ name: "Your Feed", url: "https://example.com/rss", category: "Custom" },
```

### Add authenticated API feeds

1. Add `YOUR_API_KEY=` to `.env` and `.env.example`
2. Write a `fetchYourFeed()` function in `server.js` with auth headers
3. Add it to `fetchAllApiFeeds()`

### Adjust severity rules

Edit the severity classification logic in `src/utils/classify.js` and `src/constants/severity.js`.

### Modify alert keywords

Edit keyword arrays in `src/constants/` to flag terms relevant to your environment.

## Architecture

```
React (Vite) ←—WebSocket—→ Node.js Server
                              ├── RSS Parser (rss-parser)
                              ├── API Fetchers (ThreatFox, GreyNoise, VulnCheck)
                              ├── Severity Classifier
                              ├── Dedup & Retention Engine
                              ├── JSON Persistence (data/)
                              └── SMTP Alerter (nodemailer)
```

## License

Private — all rights reserved.
