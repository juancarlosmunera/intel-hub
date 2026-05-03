# Memory Management

Intel Hub is designed for long-running production deployments without manual intervention. Memory is bounded by a configurable cap, with three layers of defense before anything bad happens.

## Threshold ladder

| Threshold | Action |
|-----------|--------|
| < 50% of cap | Normal operation |
| ≥ 50% of cap | Proactive tiered compaction runs every 60s |
| ≥ 75% of cap | Compaction runs as the first step of any check |
| ≥ 100% of cap | Eviction — drop oldest 20% per channel until back under 85% |
| > 4500 MB RSS | PM2 hard-restarts the process (safety net) |

The cap defaults to **4 GB**. Override with `MEMORY_CAP_MB` in `.env`.

## Tiered compaction

Before evicting articles entirely, Intel Hub trims article descriptions based on age. Older articles take less space without losing the article itself:

| Tier | Age | Description trimmed to |
|------|-----|------------------------|
| 1 | < 30 min | Full fidelity |
| 2 | 30 min – 6 h | 100 chars |
| 3 | > 6 h | 50 chars + non-essential fields stripped |

This typically reclaims enough RAM to avoid eviction entirely. When eviction does kick in, it drops the oldest 20% from each channel, persists the trimmed cache to disk, and triggers garbage collection.

## Sizing guidance

Default 4 GB cap supports roughly:
- 7 channels × 5,000 articles each = ~35,000 cached articles
- 90 days of retention
- 60-second WebSocket fan-out to multiple browser clients

For higher loads, increase `MEMORY_CAP_MB` and `max_memory_restart` in [`ecosystem.config.cjs`](../ecosystem.config.cjs) in tandem (keep `max_memory_restart` ~10% above the soft cap).

## Where memory management lives

All memory logic is in [`server.js`](../server.js) — search for `MEMORY_CAP_MB`, `compactArticles`, `checkMemoryAndEvict`, and `runCompaction`.
