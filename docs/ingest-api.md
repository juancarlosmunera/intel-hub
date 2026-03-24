# Ingest API

Intel Hub exposes a webhook endpoint that accepts messages from any source — Signal, WhatsApp, Discord, Slack, IRC, or anything else that can send an HTTP request. Messages are ingested, deduplicated, classified, and broadcast to connected clients in real-time.

## Endpoints

### POST /api/ingest

Ingest a single message.

```bash
curl -X POST http://localhost:3001/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "source": "whatsapp",
    "group": "InfoSec Alerts",
    "message": "New LockBit variant spotted targeting healthcare orgs",
    "timestamp": "2026-03-24T14:30:00Z"
  }'
```

**Response:**
```json
{ "ok": true, "received": 1, "ingested": 1 }
```

### POST /api/ingest/batch

Ingest multiple messages at once.

```bash
curl -X POST http://localhost:3001/api/ingest/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '[
    { "source": "signal", "group": "DFIR Chat", "message": "CVE-2026-1234 PoC dropped" },
    { "source": "discord", "group": "netsec", "message": "New Cobalt Strike beacon detected" }
  ]'
```

### GET /api/health

Server health and memory stats.

```json
{
  "status": "ok",
  "uptime": 3600,
  "memory_mb": 256,
  "memory_cap_mb": 4096,
  "channels": 7,
  "total_articles": 8500,
  "telegram_active": 12
}
```

### GET /api/channels

Channel summary with article counts.

```json
{
  "cyber": { "label": "Cybersecurity", "feeds": 46, "articles": 1465 },
  "chatfeeds": { "label": "Chat Feeds", "feeds": 0, "articles": 182 }
}
```

## Message Format

| Field | Required | Description |
|-------|----------|-------------|
| `message` or `title` | Yes | The message text (at least one required) |
| `source` | No | Platform name: "whatsapp", "signal", "discord", "slack", "irc" (default: "unknown") |
| `group` | No | Group/channel name. Displayed as "source: group" in the feed |
| `timestamp` | No | ISO 8601 timestamp (default: current time) |
| `channel` | No | Target Intel Hub channel: "chatfeeds", "cyber", "osint", etc. (default: "chatfeeds") |
| `url` or `link` | No | Link to the original message |

## Authentication

If `INGEST_API_KEY` is set in `.env`, all requests must include:

```
Authorization: Bearer your-api-key
```

If `INGEST_API_KEY` is not set, the endpoint is open (fine for local development, not for production).

## Integration Examples

### Android (Tasker)

1. Install Tasker + AutoNotification
2. Create a profile: Event → AutoNotification → Intercept → App: WhatsApp/Signal
3. Add Task → HTTP Request:
   - Method: POST
   - URL: `http://your-server:3001/api/ingest`
   - Headers: `Content-Type: application/json`
   - Body: `{"source": "whatsapp", "group": "%antitle", "message": "%antext"}`

### iOS (Shortcuts)

1. Create an automation: When notification from WhatsApp/Signal
2. Add action: Get Contents of URL
   - URL: `http://your-server:3001/api/ingest`
   - Method: POST
   - Request Body: JSON with source, group, message fields

### Node.js / Script

```javascript
async function forwardToIntelHub(source, group, message) {
  await fetch("http://localhost:3001/api/ingest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer your-api-key",
    },
    body: JSON.stringify({ source, group, message }),
  });
}

// Example: forward a Signal message
forwardToIntelHub("signal", "DFIR Chat", "New ransomware sample uploaded to VT");
```

### Python

```python
import requests

requests.post("http://localhost:3001/api/ingest", json={
    "source": "whatsapp",
    "group": "Cyber Alerts",
    "message": "Critical vuln in Apache Struts - patch now",
}, headers={
    "Authorization": "Bearer your-api-key",
})
```

### n8n / Node-RED

Use the HTTP Request node pointed at `http://your-server:3001/api/ingest` with the JSON body format above. Trigger it from any platform webhook.

### Discord Bot

```javascript
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const INTEL_HUB = "http://localhost:3001/api/ingest";
const WATCHED_CHANNELS = ["threat-intel", "malware", "breaking-news"];

client.on("messageCreate", async (msg) => {
  if (!WATCHED_CHANNELS.includes(msg.channel.name)) return;
  await fetch(INTEL_HUB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "discord",
      group: `#${msg.channel.name}`,
      message: msg.content,
      timestamp: msg.createdAt.toISOString(),
      url: msg.url,
    }),
  });
});

client.login("your-discord-bot-token");
```

### signal-cli

```bash
# Receive messages and pipe to Intel Hub
signal-cli -u +1234567890 receive --json | while read -r line; do
  group=$(echo "$line" | jq -r '.envelope.dataMessage.groupInfo.groupId // empty')
  message=$(echo "$line" | jq -r '.envelope.dataMessage.message // empty')
  if [ -n "$message" ]; then
    curl -s -X POST http://localhost:3001/api/ingest \
      -H "Content-Type: application/json" \
      -d "{\"source\":\"signal\",\"group\":\"$group\",\"message\":\"$message\"}"
  fi
done
```

## How It Works

1. Message arrives at `/api/ingest`
2. Server validates auth (if configured) and parses JSON
3. Each message is deduplicated against existing articles
4. New messages are persisted to disk and added to the live cache
5. Connected WebSocket clients receive the update instantly
6. Messages appear in the Chat Feeds channel (or whichever channel you target)
7. Severity classification, keyword matching, and bias tagging apply automatically
