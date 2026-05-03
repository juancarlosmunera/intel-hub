# Political Bias Tags

Every news and editorial source is tagged with its political leaning so readers can see — at a glance — the editorial slant of any article. Technical and cybersec feeds show no tag (NONPARTISAN).

| Tag | Color | Examples |
|-----|-------|----------|
| LEFT | Blue | CNN |
| LEAN LEFT | Light Blue | NPR, Foreign Policy, Middle East Eye, Ars Technica |
| CENTER | Gray | Reuters, AP, BBC, RAND, CSIS, Defense One, Bellingcat |
| LEAN RIGHT | Orange | NY Post, The Dispatch, Atlantic Council, 19FortyFive, Alma Research |
| RIGHT | Red | Fox News, Washington Examiner, National Review, Heritage Foundation |
| INDEPENDENT | Purple | Racket News (Taibbi), Glenn Greenwald, Seymour Hersh, The Grayzone |
| NONPARTISAN | Hidden | All technical, cybersec, and data feeds (tag not shown in UI) |

## Methodology

Tags are assigned manually based on widely-cited media bias research (AllSides, Ad Fontes, Media Bias/Fact Check) cross-referenced with editorial track record. The goal is **transparency for the reader**, not endorsement or condemnation of any source.

## Editorial principles

- **No source is excluded for political reasons.** Every viewpoint included gets a counterpart on the other side where one exists.
- **Tags are applied consistently across the spectrum.** A "LEAN LEFT" or "LEAN RIGHT" tag uses the same evidence bar regardless of direction.
- **Independent journalists** (Taibbi, Greenwald, Hersh, etc.) are tagged INDEPENDENT rather than fitted into Left/Right because their criticism crosses partisan lines.

## Where bias tags live

- Tag definitions and assignments: [`src/constants/sourceBias.js`](../src/constants/sourceBias.js)
- Color mapping and display: [`src/utils/classify.js`](../src/utils/classify.js)
