# Source Credibility System

Every feed is assigned a 4-tier trust score that displays alongside each article in the dashboard.

| Tier | Label | Description | Examples |
|------|-------|-------------|----------|
| 1 | PRIMARY | Government agencies, official databases, raw data feeds | CISA, NVD, GitHub Advisories, Ransomware.live, Ransomfeed.it |
| 2 | VERIFIED | Major outlets with editorial standards, recognized researchers | Krebs on Security, BleepingComputer, Reuters, Brian Krebs (Mastodon) |
| 3 | INDUSTRY | Vendor blogs, think tanks, moderated communities | CrowdStrike, SentinelOne, RAND, r/netsec, Telegram channels |
| 4 | UNVETTED | Aggregators, less established or unvetted sources | r/darknet, GBHackers |

## Filtering by tier

The dashboard exposes a **Verified Only** toggle that hides Tier 3 and Tier 4 sources, leaving only Tier 1 and Tier 2. Useful when you need the highest-confidence signal for an incident response or executive brief.

## Content red flags

In addition to credibility tiers, every article runs through a red-flag detector that surfaces:

- Clickbait patterns (`You won't believe...`, `BOMBSHELL`, etc.)
- Misinformation markers
- Disinfo-adjacent language

Articles with red flags get a **FLAGGED** tag and can be hidden via the **Hide Flagged** toggle.

## Where credibility lives in the codebase

Tier assignments are in [`src/constants/sourceCredibility.js`](../src/constants/sourceCredibility.js). The detection logic for red flags is in [`src/utils/classify.js`](../src/utils/classify.js).
