# Contributing to Intel Hub

Intel Hub is a real-time cybersecurity and OSINT intelligence aggregator. It pulls from 160+ feeds across RSS, Telegram, Reddit, Mastodon, GitHub Advisories, NVD, and a bunch of threat intel APIs — then classifies, scores, and surfaces what matters through a live WebSocket dashboard.

This is a tool built for the cybersecurity community. If you work in threat intel, incident response, SOC operations, OSINT, or you're just someone who follows infosec news — you probably know a feed or a source that should be here and isn't. That's the easiest way to contribute, and every single feed addition makes this tool better for everyone.

You don't need to be a full-stack developer to help. Some of the most valuable contributions are one-line PRs that add an RSS feed.

---

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Project Structure](#project-structure)
- [Easiest Ways to Contribute](#easiest-ways-to-contribute)
- [Adding API Integrations](#adding-api-integrations)
- [Branch Naming and Commits](#branch-naming-and-commits)
- [Pull Requests](#pull-requests)
- [Reporting Bugs and Requesting Features](#reporting-bugs-and-requesting-features)
- [Code Style](#code-style)
- [Documentation Contributions](#documentation-contributions)
- [Recognition](#recognition)
- [Code of Conduct](#code-of-conduct)

---

## Local Development Setup

**Requirements:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/juancarlosmunera/intel-hub.git
cd intel-hub

# Set up environment (all keys are optional — the app works with zero config)
cp .env.example .env

# Install dependencies
npm install

# Start the dev server (backend + frontend)
npm run dev
```

This runs two things concurrently:
- **Node.js backend** on `ws://localhost:3001` — fetches feeds, runs WebSocket server
- **Vite dev server** on `http://localhost:3000` — React frontend with hot reload

Open `http://localhost:3000` and you should see the dashboard pulling live data.

### Optional: API keys for enhanced data

These are all free and go in your `.env` file:

| Key | Where to get it | What it unlocks |
|-----|-----------------|-----------------|
| `GREYNOISE_API_KEY` | [greynoise.io](https://viz.greynoise.io/signup) | Internet scan/noise data |
| `VULNCHECK_API_KEY` | [vulncheck.com](https://vulncheck.com/register) | Known Exploited Vulnerabilities |
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram | Private channel monitoring (public channels work without this) |

### Other useful commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start backend + frontend for development |
| `npm run build` | Build production frontend to `dist/` |
| `npm run server` | Start backend only |
| `npm run client` | Start Vite frontend only |
| `npm start` | Start via PM2 (production) |
| `npm stop` | Stop PM2 process |
| `npm run logs` | Tail PM2 logs |
| `npm run status` | PM2 process status |

---

## Project Structure

```
intel-hub/
├── server.js                  # Backend: RSS parsing, APIs, WebSocket, email alerts
├── ecosystem.config.cjs       # PM2 production config
├── vite.config.js             # Vite bundler config
├── index.html                 # Vite entry point
├── .env.example               # Environment variable template
│
├── src/                       # React frontend
│   ├── App.jsx                # Router setup
│   ├── main.jsx               # React entry point
│   ├── styles/global.css      # Global dark theme styles
│   │
│   ├── pages/                 # One page per channel
│   │   ├── Overview.jsx       # Dashboard landing
│   │   ├── Cyber.jsx          # Cybersecurity
│   │   ├── WorldNews.jsx      # World News
│   │   ├── Geopolitics.jsx    # Geopolitics & Defense
│   │   ├── OSINT.jsx          # OSINT
│   │   ├── DarkWeb.jsx        # Dark Web Monitor
│   │   └── SocialMedia.jsx    # Social Media
│   │
│   ├── components/            # Shared UI components
│   │   ├── Layout.jsx         # Sidebar navigation + main content
│   │   ├── FeedPage.jsx       # Reusable feed page template
│   │   ├── ArticleList.jsx    # Article rendering with severity/bias tags
│   │   ├── StatCards.jsx      # Severity breakdown cards
│   │   └── Pulse.jsx          # Live pulse animation
│   │
│   ├── hooks/
│   │   └── useWebSocket.js    # WebSocket connection + reconnect logic
│   │
│   ├── utils/
│   │   └── classify.js        # Severity classifier, bias lookup, trust tiers
│   │
│   └── constants/             # Feed definitions, keywords, scoring rules
│       ├── severity.js        # Severity classification rules + colors
│       ├── sourceCredibility.js  # 4-tier trust system
│       ├── sourceBias.js      # Political bias tags per source
│       ├── cyberFeeds.js      # Cybersecurity feed list + alert keywords
│       ├── worldFeeds.js      # World News feeds
│       ├── osintFeeds.js      # OSINT feeds
│       ├── darkwebFeeds.js    # Dark Web feeds
│       └── socialFeeds.js     # Social Media feeds (Reddit, Telegram, Mastodon)
│
├── docs/                      # Documentation
│   ├── deployment-plan.txt    # Free hosting guide (Oracle Cloud)
│   └── telegram-setup.md     # Telegram integration guide
│
├── data/                      # Article cache (gitignored, auto-generated)
└── logs/                      # PM2 logs (gitignored)
```

**Key architecture points:**
- Backend is raw Node.js — no Express or framework
- WebSocket via `ws` library (not Socket.io)
- RSS parsing via `rss-parser`
- Frontend is React 18 + React Router v7 + Vite 6
- Styling is inline CSS + one `global.css` (no CSS framework)
- ES Modules throughout (`import`/`export`, `"type": "module"` in package.json)

---

## Easiest Ways to Contribute

These don't require understanding the full codebase. Most are one-line changes.

### Add an RSS feed

Open `server.js` and find the channel you want to add to (search for `cybersecurity:`, `world:`, `geopolitics:`, `osint:`, `darkweb:`). Add a line to the `feeds` array:

```js
{ name: "Your Feed Name", url: "https://example.com/rss.xml", category: "Threat Intel" },
```

**Before you PR:** verify the feed URL returns valid RSS/Atom XML. Curl it or open it in a browser. Broken feeds get skipped silently, so test first.

Then add entries for the source in:
- `src/constants/sourceCredibility.js` — assign a trust tier (1-4)
- `src/constants/sourceBias.js` — assign a bias code (`"N"` for technical feeds, or `"L"`, `"LL"`, `"C"`, `"LR"`, `"R"`, `"I"` for news sources)
- The corresponding `src/constants/*Feeds.js` file — add `{ name: "Your Feed Name", category: "Category" }`

### Add a Reddit subreddit

In `server.js`, find the `REDDIT_SUBS` array and add the subreddit name (without `r/`):

```js
const REDDIT_SUBS = ["netsec", "cybersecurity", /* ... */, "your-subreddit"];
```

Then add `{ name: "r/your-subreddit", category: "Reddit" }` to `src/constants/socialFeeds.js` and a credibility tier to `src/constants/sourceCredibility.js`.

### Add a Mastodon account

In `server.js`, find `MASTODON_ACCOUNTS` and add:

```js
{ instance: "infosec.exchange", account: "username", display: "Display Name" },
```

### Add a Telegram channel

In `server.js`, add to `TELEGRAM_CHANNELS_PRIMARY`:

```js
{ handle: "channelname", category: "Threat Intel", label: "Display Name" },
```

Or add to `TELEGRAM_CHANNELS_BACKUP` if it should be in the rotation pool.

### Add alert keywords

Each channel has its own keyword list in `src/constants/`. Open the relevant file (`severity.js`, `darkwebFeeds.js`, `socialFeeds.js`, etc.) and add terms to the `ALERT_KEYWORDS` array. These trigger the "alert" badge on matching articles.

### Update source credibility or bias tags

- **Credibility:** Edit `src/constants/sourceCredibility.js` — tiers 1 (Primary) through 4 (Unvetted)
- **Bias:** Edit `src/constants/sourceBias.js` — codes: `L`, `LL`, `C`, `LR`, `R`, `I`, `N`

If you disagree with a classification, open a PR with your reasoning. Bias tags are based on [AllSides](https://www.allsides.com/) and [Media Bias/Fact Check](https://mediabiasfactcheck.com/) where available.

---

## Adding API Integrations

If you want to add a new API-based data source (not RSS), follow the existing pattern:

1. **Write a fetch function** in `server.js`:

```js
async function fetchYourSource() {
  const res = await fetch("https://api.example.com/data", {
    headers: { "Authorization": `Bearer ${process.env.YOUR_API_KEY}` },
  });
  if (!res.ok) throw new Error(`YourSource: ${res.status}`);
  const json = await res.json();
  return json.items.map(item => ({
    title: item.title.slice(0, 120),
    link: item.url,
    pubDate: item.date || new Date().toISOString(),
    description: item.summary.slice(0, 300),
    feedName: "Your Source",
    feedCategory: "Category",
  }));
}
```

2. **Add it to the appropriate orchestrator** in `server.js`:
   - `fetchAllApiFeeds()` — for cybersecurity APIs
   - `fetchSocialApiFeeds()` — for social media APIs
   - `fetchDarkWebApiFeeds()` — for dark web APIs

3. **Add the env var** to `.env.example` with a comment explaining where to get the key

4. **Add feed metadata** to the frontend constants (`socialFeeds.js`, `sourceCredibility.js`, `sourceBias.js`)

---

## Branch Naming and Commits

### Branch names

```
feat/add-sans-isc-feed
fix/nvd-date-format
docs/update-readme-feeds
refactor/telegram-health-check
```

Format: `type/short-description` where type is `feat`, `fix`, `docs`, `refactor`, `chore`.

### Commit messages

Keep them short and descriptive. Lead with what changed, not why.

```
Add SANS ISC and US-CERT feeds to cybersecurity channel
Fix NVD API date format to include pubEndDate parameter
Update README with Telegram channel list
```

Don't use conventional commit prefixes (`feat:`, `fix:`) — just write a clear sentence.

---

## Pull Requests

### What a good PR looks like

- **Title:** clear, specific, under 70 characters
- **Description:** what you changed and why. For feed additions, include the source URL and what it covers.
- **Scope:** one logical change per PR. Adding 5 related feeds to the same channel = one PR. Adding a feed + refactoring the parser = two PRs.
- **Tested:** you ran `npm run dev`, confirmed the feed loads, and checked the browser.

### PR template

```markdown
## What

Added [Source Name] RSS feed to the [Channel] channel.

## Why

[Source] covers [topic] and fills a gap in our [area] coverage.

## Testing

- [ ] `npm run dev` starts without errors
- [ ] Feed appears in the channel's feed status bar (green dot)
- [ ] Articles from the feed show up in the article list
- [ ] Source has credibility tier in sourceCredibility.js
- [ ] Source has bias tag in sourceBias.js (or "N" for technical)
```

---

## Reporting Bugs and Requesting Features

Use the GitHub issue templates:

- **[Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)** — something broken or erroring
- **[Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)** — new functionality or improvement
- **[New Feed Request](.github/ISSUE_TEMPLATE/new_feed_request.md)** — suggest an RSS feed, API, subreddit, Telegram channel, or Mastodon account

For feed requests, please verify the URL returns valid data before submitting. A broken feed URL wastes everyone's time.

---

## Code Style

There's no linter or formatter configured. Follow what's already in the codebase:

| Rule | Convention |
|------|-----------|
| Indentation | 2 spaces |
| Semicolons | Yes, always |
| Quotes | Double quotes (`"`) |
| Component files | PascalCase (`.jsx`) — `ArticleList.jsx`, `FeedPage.jsx` |
| Utility/hook files | camelCase (`.js`) — `useWebSocket.js`, `classify.js` |
| Constants | camelCase files, `UPPER_SNAKE_CASE` exports — `MAX_ARTICLES`, `SEVERITY_RANK` |
| Imports | ES Modules (`import`/`export`), no `require()` |
| React components | Functional with hooks, no class components |
| CSS | Inline styles in JSX + `src/styles/global.css`, no CSS framework |

**Don't:**
- Add a linter, formatter, or CSS framework in a drive-by PR
- Refactor code you didn't need to touch for your change
- Add TypeScript types to existing JS files
- Add comments to code that's already self-explanatory

**Do:**
- Match the style of surrounding code
- Keep functions small and focused
- Use descriptive variable names

---

## Documentation Contributions

You don't need to write code to contribute. Documentation improvements are always welcome:

- **Fix typos or unclear instructions** in `README.md`, `docs/`, or this file
- **Add setup guides** for specific platforms (Windows, Docker, etc.)
- **Improve the deployment plan** in `docs/deployment-plan.txt`
- **Translate documentation** into other languages
- **Write guides** for common use cases (setting up email alerts, adding a custom channel, etc.)
- **Verify and update feed URLs** — feeds break all the time, and catching dead URLs is genuinely helpful

Documentation PRs follow the same process as code PRs.

---

## Recognition

Contributors are recognized in the following ways:

- **Contributors section** in the GitHub repository sidebar (automatic via Git history)
- **Mentioned in release notes** when your contribution ships
- **Feed contributors** get credited in commit messages (e.g., "Add SANS ISC feed (suggested by @username)")

If you've made a significant contribution and want to be listed in the README, open a PR adding yourself.

---

## Code of Conduct

Be professional. Be respectful. This is a cybersecurity project — the community includes people from different countries, organizations, and backgrounds.

- Don't be a jerk in issues, PRs, or discussions
- Constructive criticism is welcome; personal attacks are not
- Respect differing opinions on source credibility and bias classifications — back up your position with evidence
- No spam, self-promotion, or off-topic content in issues

If someone is being disruptive, report it to the maintainers.

---

## Questions?

Open an issue with the `question` label, or start a discussion if GitHub Discussions is enabled.

Thanks for helping make Intel Hub better. Every feed, every fix, every doc improvement matters.
