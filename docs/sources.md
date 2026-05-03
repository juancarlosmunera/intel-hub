# Sources by Channel

Full per-channel breakdown of every feed Intel Hub aggregates. To add or remove sources, see [customization.md](customization.md).

## Cybersecurity (45+ feeds)

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

## World News (40+ feeds)

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

## Geopolitics & Defense (20 feeds)

| Category | Sources |
|----------|---------|
| Geopolitics | Foreign Affairs, Foreign Policy, The Diplomat, War on the Rocks |
| Think Tanks | RAND, CSIS, Council on Foreign Relations, Stimson Center, Atlantic Council, Heritage Foundation, Hudson Institute |
| Defense | Defense One, Breaking Defense, USNI News, The Aviationist, 19FortyFive, SOF News |
| Conflict Monitor | Middle East Eye, Alma Research Center, Long War Journal |

## OSINT (24+ feeds)

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

## Dark Web Monitor (20+ feeds)

| Category | Sources |
|----------|---------|
| Ransomware Tracking | Ransomware.live, Ransomfeed.it, DarkFeed, The DFIR Report |
| Breach & Leak Journalism | DataBreaches.net, Troy Hunt, CyberScoop |
| Underground / Threat Intel | Intel 471 Blog, Flashpoint, BushidoToken, Check Point Research, Google Threat Intel, Securelist (Kaspersky), Huntress Blog, Elastic Security Labs |
| Malware & Botnet Tracking | ANY.RUN Blog, Malwarebytes Blog, Sophos Blog |
| Exploitation in the Wild | SANS ISC, Rapid7 Blog |
| Government | UK NCSC Reports |
| API Feeds | Have I Been Pwned domain search, URLhaus, MalwareBazaar, Feodo Tracker, SSL Blacklist, Ransomfeed.it API |

## Social Media (16+ feeds)

| Category | Sources | Key Required? |
|----------|---------|---------------|
| Reddit (10 subreddits) | r/netsec, r/cybersecurity, r/malware, r/darknet, r/privacy, r/ReverseEngineering, r/AskNetsec, r/blueteamsec, r/computerforensics, r/OSINT | No |
| Mastodon (4 accounts) | Jerry Bell, Brian Krebs, BleepingComputer, MalwareTech — via infosec.exchange | No |
| GitHub Advisories | Reviewed CVEs with severity and CVSS scores | No |
| NVD (NIST) | High-severity CVEs from last 3 days via REST API 2.0 | No |
| X / Twitter | Search API v2 — cybersecurity keyword monitoring | Yes ($100/mo Basic tier) |

## Chat Feeds (11 primary + 2 backup)

The list is **deliberately small**. Most "best cybersec Telegram" lists circulating online recommend channels that haven't posted in months or years. Every channel below was verified to post within the last 7 days at the time of the last audit. Run `npm run tg:audit` anytime to re-verify (see [telegram-setup.md](telegram-setup.md)).

**Threat Intel & Malware** — vx-underground
**Ransomware & Leak Tracking** — DARKFEED, RansomFeed News, RansomLook, Red Packet Security
**Cybersec News** — The Hacker News
**OSINT** — OsintTV, True OSINT
**Geopolitics** — Intel Slava (Russian-language but high-volume conflict intel)
**Bug Bounty** — Bug Bounty Hunter, Bug Bounty Channel
**Backup pool** (Russian-language; promoted if any primary goes stale) — SecAtor, F6 Cybersecurity

| Source Type | Key Required? |
|-------------|---------------|
| Telegram public preview scraper | No |
| Telegram Bot API (optional supplement for private channels) | Bot token (free) |
| Universal Ingest API (any messaging platform via webhook) | Optional API key |

**Why so few Telegram channels?** The English-language professional cybersec community has largely migrated off Telegram to Mastodon, X, Discord, and direct news sources. We picked freshness over channel count.
