# CyberSec Monitor Dashboard

Real-time cybersecurity, PCI DSS, fintech, and payments security news aggregator.

## Quick Start

1. Make sure you have **Node.js 18+** installed
2. Open this folder in VS Code
3. Open the integrated terminal (Ctrl + `)
4. Run:

```bash
npm install
npm run dev
```

5. Your browser will open to `http://localhost:3000`

## What It Does

- Pulls live RSS feeds from 10 cybersecurity and fintech sources
- Auto-classifies articles by severity (CRITICAL / HIGH / MEDIUM / INFO)
- Flags articles matching 40+ keywords relevant to PCI, payments, and hospitality
- Auto-refreshes every 5 minutes
- Filter by category, search, or toggle "Alerts Only"

## Feeds Included

| Feed | Category |
|------|----------|
| The Hacker News | Threat Intel |
| Krebs on Security | Threat Intel |
| Bleeping Computer | Threat Intel |
| Dark Reading | Threat Intel |
| SecurityWeek | Threat Intel |
| CISA Advisories | Advisory |
| NIST Cyber Insights | Advisory |
| PCI SSC Blog | PCI / Compliance |
| Finextra Security | Fintech Security |
| Payments Dive | Payments |

## Customization

### Add more feeds
Edit the `FEEDS` array in `src/App.jsx`:

```js
{ name: "Your Feed", url: "https://example.com/rss", category: "Custom" },
```

### Add alert keywords
Edit the `ALERT_KEYWORDS` array in `src/App.jsx` to flag terms relevant to your environment.

### Change severity rules
Edit the `SEVERITY_RULES` array to adjust which keywords trigger CRITICAL vs HIGH vs MEDIUM.

## Production Notes

The free tier of rss2json has rate limits (~10k requests/day). For production:
- Self-host a CORS proxy (simple Express/Cloudflare Worker)
- Or upgrade to rss2json paid plan
- Consider adding browser push notifications for CRITICAL items
- Add a backend with WebSocket for true real-time delivery
