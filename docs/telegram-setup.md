# Telegram Integration Setup Guide

Intel Hub supports two methods for pulling Telegram channel data:

1. **Public Preview Scraper** (no token needed, works with any public channel)
2. **Bot API** (requires token, only works with channels your bot is admin of)

Method 1 is recommended for monitoring public cybersecurity channels you don't own.

---

## Method 1: Public Preview Scraper (Recommended)

This method scrapes the public preview pages (`t.me/s/channelname`) and requires **zero configuration**. It works with any public Telegram channel.

### Setup

No setup required. Intel Hub ships with 12 built-in channels and auto-rotation. Just start the server and Telegram data appears in the Social Media channel.

### How It Works

- Fetches the public HTML preview of each channel every 5 minutes
- Parses the latest posts (title, date, link)
- Health checker runs every 6 hours to detect dead/banned channels
- Dead channels are automatically replaced from a backup pool
- Health state is persisted to `data/telegram_health.json`

### Built-in Channels

| Handle | Category | What It Covers |
|--------|----------|----------------|
| `@vxunderground` | Threat Intel | Malware samples, source code, threat campaigns |
| `@hackgit` | Threat Intel | Offensive tools, red team utilities, OSINT tools |
| `@DarkfeedNews` | Ransomware | Real-time ransomware victim alerts, breach announcements |
| `@dailydarkweb` | Dark Web | Data leaks, threat actor claims, exploit sales |
| `@RansomFeedNews` | Ransomware | Ransomware victim notifications (ransomfeed.it) |
| `@ransomlook` | Ransomware | Ransomware group posts & leak site activity |
| `@intelslava` | Geopolitics | Conflict monitoring, geopolitical breaking news |
| `@OsintTv` | OSINT | OSINT investigations & collection techniques |
| `@thehackernews` | Cyber News | Breaking cybersec news, zero-days, breaches |
| `@true_secator` | Threat Intel | Russian-language CTI analysis |
| `@thebugbountyhunter` | Bug Bounty | Vulnerability research, bug bounty findings |
| `@bug_bounty_channel` | Bug Bounty | Bug bounty programs, vulnerability disclosures |

### Backup Pool (auto-rotated in when primary channels die)

| Handle | Category |
|--------|----------|
| `@secnewsru` | Cyber News (RU) |
| `@f6_cybersecurity` | Threat Intel (RU) |
| `@cloudandcybersecurity` | Cyber News |
| `@topcybersecurity` | Cyber News |
| `@teammatrixs` | Cyber News |

### Adding Custom Channels

Edit `TELEGRAM_CHANNELS_PRIMARY` in `server.js`:

```js
{ handle: "yourchannel", category: "Category", label: "Display Name" },
```

Or add backup channels to `TELEGRAM_CHANNELS_BACKUP` for auto-rotation.

---

## Method 2: Telegram Bot API

Use this method if you want to monitor **private channels** that you own or administer.

### Step 1: Create a Bot

1. Open Telegram on your phone or desktop
2. Search for **@BotFather** (look for the blue verified checkmark)
3. Tap **Start** or send `/start`
4. Send `/newbot`
5. When prompted, enter a display name: `Intel Hub Monitor`
6. When prompted, enter a username: `intelhub_monitor_bot` (must end in `bot`)
7. BotFather replies with a message containing your token:
   ```
   Use this token to access the HTTP Bot API:
   7123456789:AAHxAbCdEfGhIjKlMnOpQrStUvWxYz
   ```
8. Copy the entire token (including the numbers before the colon)

### Step 2: Add Token to Environment

Open your `.env` file in the project root and add:

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxAbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 3: Add Bot to Your Channels

**Important:** The Bot API's `getUpdates` method only receives messages from channels where your bot is an admin. This means:

- You **can** monitor channels you own or co-administer
- You **cannot** monitor public channels you don't own (use Method 1 for those)

To add your bot to a channel you own:

1. Open the channel in Telegram
2. Tap the channel name at the top to open info
3. Tap **Administrators** (or **Edit** → **Administrators**)
4. Tap **Add Admin**
5. Search for your bot: `@intelhub_monitor_bot`
6. Grant it **Read Messages** permission (no other permissions needed)
7. Tap **Save** / **Done**

Repeat for each channel you want to monitor.

### Step 4: Override Channel List (Optional)

By default, Intel Hub uses the 12 built-in channels. To monitor only specific channels via the Bot API, set:

```env
TELEGRAM_CHANNELS=your_channel1,your_channel2,your_private_channel
```

This overrides the built-in list entirely.

### Step 5: Restart the Server

```bash
npm run restart
# or
npm run dev
```

### Step 6: Verify

Check the server logs for Telegram activity:

```bash
npm run logs
```

You should see lines like:
```
[TG-HEALTH] Running channel health check...
[TG-HEALTH] Summary: 12 alive, 0 failing, 0 dead — 12 active channels
```

---

## Troubleshooting

### No Telegram data showing up

1. **Using Method 1 (scraper)?** Check that the channels are public and not geo-blocked
2. **Using Method 2 (Bot API)?** Make sure your bot is an admin in each channel
3. Check server logs: `npm run logs` — look for `[API] Telegram` errors

### Bot token invalid

```
[API] Telegram vxunderground: Telegram: 401
```

Your token is wrong or expired. Go to @BotFather, send `/mybot`, select your bot, and regenerate the token.

### Channel marked as dead

```
[TG-HEALTH] ✗ DARKFEED (@DarkfeedNews) — MARKED DEAD (HTTP 404)
```

The channel was banned or renamed. A backup channel will be rotated in automatically. Check `data/telegram_health.json` for the full health report.

To force a re-check of all channels, delete the health file and restart:

```bash
rm data/telegram_health.json
npm run restart
```

### Rate limiting

Telegram may rate-limit aggressive scraping. The health checker includes a 2-second delay between checks to avoid this. If you see 429 errors, increase the delay in `server.js` (`runTelegramHealthCheck` function).

---

## Architecture

```
Telegram Channels
    │
    ├─── Method 1: Public Preview Scraper
    │    └── GET t.me/s/{handle} → parse HTML → extract posts
    │
    └─── Method 2: Bot API
         └── GET api.telegram.org/bot{TOKEN}/getUpdates → filter by channel
    │
    ▼
Health Checker (every 6h)
    ├── Ping each channel's public page
    ├── Track consecutive failures
    ├── Mark dead after 4 failures (24h)
    ├── Auto-rotate backup channels in
    └── Persist state to data/telegram_health.json
    │
    ▼
Social Media Channel (WebUI)
```

---

## Security Notes

- **Never commit your `.env` file** — it's already in `.gitignore`
- Bot tokens grant full control of the bot — treat them like passwords
- If your token is compromised, revoke it immediately via @BotFather: `/revoke`
- The public preview scraper makes unauthenticated requests — no credentials at risk
- Underground channels may contain malicious links — Intel Hub displays text only, never loads external content
