# Architecture

In production, a single Node.js process serves the React bundle, the REST API, and the WebSocket on the same port. PM2 (or Docker) supervises the process, restarts on crash, and enforces a memory ceiling.

## Component diagram

```
Browser (auto-launched)
   │
   ├── HTTP  → / (React bundle from dist/)
   ├── HTTP  → /api/* (ingest, health, channels)
   └── WS    → / (live channel updates, on the same origin)
        │
        ▼
Node.js Server  (managed by PM2 or Docker — autorestart, 4.5 GB ceiling)
   ├── Static file server (serves dist/)
   ├── Universal Ingest API (POST /api/ingest)
   ├── RSS Parser (rss-parser)
   ├── Promotional Content Filter (drops sponsored / affiliate spam)
   ├── API Fetchers
   │   ├── ThreatFox, GreyNoise, VulnCheck
   │   ├── Reddit JSON, Mastodon, GitHub Advisories
   │   ├── NVD (NIST), Twitter API, Telegram Bot API
   │   ├── Telegram public preview scraper (with health & rotation)
   │   ├── Have I Been Pwned, URLhaus, MalwareBazaar
   │   └── Ransomfeed.it (ransomware victim disclosures)
   ├── Telegram Channel Health Monitor (auto-rotation from backup pool)
   ├── Severity Classifier
   ├── Source Credibility Scorer (4-tier)
   ├── Political Bias Tagger (7 categories)
   ├── Content Red Flag Detector
   ├── Dedup & Retention Engine (90 days)
   ├── Memory Manager (tiered compaction → eviction)
   ├── JSON Persistence (data/)
   └── SMTP Alerter (nodemailer)
```

## Why one process

- **One port, one process** — no proxy, no port juggling, no CORS gymnastics
- **`pm2 monit` works** — single PID with clean stats
- **WebSocket on same origin** — browser doesn't need to discover backend port
- **Survives reboot** — PM2 startup hook (or Docker `restart: unless-stopped`) brings it back

## Data flow

1. **Refresh cycle** runs every 5 minutes per channel
2. Each feed is fetched in parallel via `Promise.allSettled`
3. New items are filtered through `isPromotionalContent()`
4. Items run through severity, credibility, bias, and red-flag classifiers
5. Deduplication merges new items with the persistent cache (`data/articles_*.json`)
6. The merged set is broadcast via WebSocket to all subscribed clients
7. Email alerter dispatches notifications for items at or above `EMAIL_MIN_SEVERITY`
8. Memory manager checks RSS usage and triggers compaction or eviction if needed

## Frontend

- React + Vite, built to a single static bundle in `dist/`
- WebSocket hook (`src/hooks/useWebSocket.js`) connects to same origin in production, port 3001 in dev
- Per-channel pages render the same `FeedPage` component with channel-specific keyword lists
- Cybersecurity channel uses its own page (`src/pages/Cyber.jsx`) for browser notifications
- Sort, severity filter, search, and source-credibility filter are all client-side

## Tech stack

| Layer | Tool |
|-------|------|
| Runtime | Node.js 20 |
| RSS | `rss-parser` |
| WebSocket | `ws` |
| Email | `nodemailer` |
| Process supervisor | PM2 (native) / Docker (`restart: unless-stopped`) |
| Frontend | React 18 + Vite 6 |
| Routing | React Router v7 |
| Persistence | Plain JSON files in `data/` (no DB to maintain) |
