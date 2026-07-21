# Abstract Tier Tracker

A dashboard that tracks how Abstract (abs.xyz) users are distributed across the
7 XP tiers (Bronze → Ethereal), and how that distribution shifts week to week.

Not affiliated with Abstract. Abstract has no public API for aggregate tier
counts, so this reads from [abslysis.xyz](https://abslysis.xyz), an
independent, unofficial fan project. See the disclaimer on the site itself.

## How it works

- **Data source**: `POST https://abslysis.xyz/api/v1/user/fetchUserCount` —
  public, unauthenticated, returns the current per-tier user counts plus the
  previous snapshot the site itself recorded.
- **Tier thresholds**: hardcoded in [`lib/tiers.ts`](lib/tiers.ts), matching
  the public (unauthenticated, unofficial) `GET https://backend.portal.abs.xyz/api/tiers`.
- **History storage**: `data/history.json`, committed straight into this repo.
  No database — a GitHub Actions workflow is the only writer.
- **Polling & change detection**: [`scripts/update-snapshot.mjs`](scripts/update-snapshot.mjs)
  fetches abslysis, compares its `time` field (and the raw counts) against the
  last saved snapshot, and only appends + writes when something actually
  changed. This avoids false "no update" gaps and duplicate rows, since
  abslysis updates on its own unpredictable weekly schedule (not necessarily
  in sync with Abstract's own Tuesday XP refresh).
- **Schedule**: [`.github/workflows/update-snapshot.yml`](.github/workflows/update-snapshot.yml)
  runs the script every hour (`0 * * * *`, UTC — GitHub Actions cron has no
  timezone support). The script itself checks the current hour in
  `Europe/Kyiv` and only performs the real check at local 22:00, so daylight
  saving transitions never require editing the cron string by hand. If the
  file changed, the workflow commits and pushes it — which, once this repo is
  connected to Vercel, triggers a fresh deployment with the new data baked in.
- **Frontend**: `app/page.tsx` reads `data/history.json` from disk
  server-side (see [`lib/history.ts`](lib/history.ts)) and renders tier cards,
  a log-scale bar chart, a cumulative line chart, and a full history table.
  `GET /api/history` exposes the same data as JSON if you want to consume it
  elsewhere.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `data/history.json` is
already seeded with two real snapshots so the dashboard renders immediately.

To manually pull a fresh snapshot (bypassing the Kyiv-22:00 gate):

```bash
FORCE_RUN=1 node scripts/update-snapshot.mjs
```

Without `FORCE_RUN`, the script only acts once `data/history.json` is
non-empty **and** it's currently 22:00 in `Europe/Kyiv` — otherwise it logs
`[skip]` and exits without touching anything.

## Deploying

1. **Push this repo to GitHub.** The Actions workflow needs
   `permissions: contents: write` (already set in the workflow file) to commit
   `data/history.json` back to the repo — no extra repo settings needed
   beyond Actions being enabled (Settings → Actions → General → Workflow
   permissions → "Read and write permissions", if your org has tightened the
   default).
2. **Import the repo into Vercel** (vercel.com → New Project). No environment
   variables or database are required — it's a static-data Next.js app.
3. Once connected, every push (including the automated commits from the cron
   workflow) triggers a new deployment, so the live site always reflects the
   latest `data/history.json`.
4. To trigger a manual check outside the hourly schedule, run the
   "Update tier snapshot" workflow from the Actions tab (`workflow_dispatch`),
   optionally with `force: true` to bypass the Kyiv-22:00 gate.

## Project structure

```
app/
  page.tsx                 dashboard (server component, reads history.json)
  api/history/route.ts     GET endpoint exposing the same data as JSON
  components/              TierCard, TierBarChart, TotalLineChart, HistoryTable, ...
lib/
  tiers.ts                 tier id/name/threshold/color table
  history.ts               read + derive (totals, deltas, staleness) from history.json
  format.ts                number/date formatting helpers
data/
  history.json             the only persisted state — full snapshot history
scripts/
  update-snapshot.mjs      polls abslysis.xyz, appends a snapshot on real change
.github/workflows/
  update-snapshot.yml      hourly cron trigger for the script above
```

## Not included yet

- **Dune Analytics on-chain growth chart** (cumulative unique addresses since
  Abstract mainnet launch) — deliberately left out of this build. It needs a
  real deployed backend to hold the `DUNE_API_KEY` and make server-side calls
  to `api.dune.com` (Dune's API can't be called from a browser, and this
  sandbox has no network path to it either). Add it as a follow-up once the
  site is live: create a Dune query via the Query API, poll for results in a
  scheduled function, and cache the monthly cumulative series similarly to
  `data/history.json`.
- Discord/Telegram push on new snapshots, CSV export, RSS feed — see the
  original spec for ideas; none are required for the MVP above.
