# Customization

How to extend Intel Hub with new feeds, sources, keywords, and integrations. All changes are in plain JavaScript — no build configuration to touch.

## Add an RSS feed

Add an entry to the appropriate channel's `feeds` array in [`server.js`](../server.js):

```js
{ name: "Your Feed", url: "https://example.com/rss", category: "Custom" },
```

Then add the same `name` to the matching constants file in [`src/constants/`](../src/constants/) so it appears in the feed status bar:

```js
{ name: "Your Feed", category: "Custom" },
```

Optionally add credibility tier and bias tag in `sourceCredibility.js` and `sourceBias.js`.

## Add an authenticated API feed

1. Add `YOUR_API_KEY=` to [`.env`](../.env.example) and `.env.example`
2. Write a `fetchYourFeed()` function in [`server.js`](../server.js) with auth headers
3. Add it to the matching orchestrator:
   - `fetchAllApiFeeds()` for cybersecurity
   - `fetchSocialApiFeeds()` for social media
   - `fetchDarkWebApiFeeds()` for dark web
   - `fetchChatFeedsApiFeeds()` for chat feeds

The orchestrators already handle Promise.allSettled, error reporting, and stats aggregation — your function just returns an array of `{ title, link, pubDate, description, feedName, feedCategory }` objects.

## Add Mastodon accounts

Add entries to `MASTODON_ACCOUNTS` in [`server.js`](../server.js):

```js
{ instance: "infosec.exchange", account: "username", display: "Display Name" },
```

## Add Reddit subreddits

Add the subreddit name to `REDDIT_SUBS` in [`server.js`](../server.js):

```js
const REDDIT_SUBS = ["netsec", "cybersecurity", /* ... */, "your-subreddit"];
```

Then add the feed name to [`src/constants/socialFeeds.js`](../src/constants/socialFeeds.js) and trust tier to [`src/constants/sourceCredibility.js`](../src/constants/sourceCredibility.js).

## Add Telegram channels

Add to `TELEGRAM_CHANNELS_PRIMARY` (or `_BACKUP`) in [`server.js`](../server.js):

```js
{ handle: "channelname", category: "Threat Intel", label: "Display Name" },
```

Verify the channel actually has a public preview by checking `https://t.me/s/{handle}` in your browser. Then add the matching entry to [`src/constants/chatFeeds.js`](../src/constants/chatFeeds.js):

```js
{ name: "TG: Display Name", category: "Telegram" },
```

Run `npm run tg:audit` to confirm it shows as `HOT` or `OK` (see [telegram-setup.md](telegram-setup.md)).

## Adjust severity classification

Edit [`src/utils/classify.js`](../src/utils/classify.js) and [`src/constants/severity.js`](../src/constants/severity.js).

The classifier uses keyword matching with weighted scoring. Severity levels (BREACH > CRITICAL > HIGH > MEDIUM > INFO) determine sort order in "Severity" mode and trigger email alerts.

## Modify alert keywords

Each channel has its own keyword file in [`src/constants/`](../src/constants/):

- [`cyberFeeds.js`](../src/constants/cyberFeeds.js) — Cybersecurity keywords
- [`darkwebFeeds.js`](../src/constants/darkwebFeeds.js) — Dark web alert keywords
- [`socialFeeds.js`](../src/constants/socialFeeds.js) — Social media alert keywords
- [`chatFeeds.js`](../src/constants/chatFeeds.js) — Chat feeds alert keywords
- [`worldFeeds.js`](../src/constants/worldFeeds.js) — World news alert keywords
- [`osintFeeds.js`](../src/constants/osintFeeds.js) — OSINT alert keywords

Articles whose title or description matches any of these get the **ALERT** flag and surface in the **Alerts Only** filter.

## Adjust the promo content filter

The `isPromotionalContent()` function in [`server.js`](../server.js) drops sponsored / affiliate content (credit cards, home equity, "0% intro APR", etc.) before items hit the cache. To add more patterns, append regexes to `PROMO_PATTERNS`.
