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
  a compressed-scale bar chart, a cumulative line chart, and a full history
  table. `GET /api/history` exposes the same data as JSON if you want to
  consume it elsewhere.

### On-chain network growth (separate from the tier data above)

- **Data source**: [Dune Analytics](https://dune.com)' Query API against the
  `abstract.transactions` raw chain table — monthly cumulative count of every
  wallet that has ever sent a transaction on Abstract mainnet. This is a
  different, much larger number than the badge-holder counts above (they come
  from an entirely different source and measure different things — see the
  in-app label).
- **Saved query**: created once via the API and reused by id
  ([`scripts/update-network-growth.mjs`](scripts/update-network-growth.mjs)
  hardcodes `QUERY_ID`) rather than re-created on every run. Requires a
  `DUNE_API_KEY` env var (never hardcoded — see `.env.local` and the repo's
  `DUNE_API_KEY` GitHub Actions secret / Vercel env var).
- **Schedule**: its own weekly workflow,
  [`.github/workflows/update-network-growth.yml`](.github/workflows/update-network-growth.yml)
  (Monday 06:00 UTC) — deliberately separate from the hourly tier-snapshot
  cron, since on-chain history barely changes day to day and each run costs
  real Dune credits.
- **Storage**: `data/network-growth.json`, a flat `{month, cumulative}[]`
  array, committed the same way as `data/history.json`.
- **Frontend**: `NetworkGrowthChart` renders the monthly series with a
  Month/Quarter/Year toggle. Only the monthly data is ever fetched from Dune —
  Quarter/Year just resample the same array client-side
  ([`lib/networkGrowth.ts`](lib/networkGrowth.ts)), since for a cumulative
  counter the value at the end of a quarter/year is just the last monthly
  value in that period, no re-querying needed.

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

To manually refresh the on-chain network growth data (needs `DUNE_API_KEY` in
`.env.local`):

```bash
node scripts/update-network-growth.mjs
```

## Deploying

1. **Push this repo to GitHub.** The Actions workflow needs
   `permissions: contents: write` (already set in the workflow file) to commit
   `data/history.json` back to the repo — no extra repo settings needed
   beyond Actions being enabled (Settings → Actions → General → Workflow
   permissions → "Read and write permissions", if your org has tightened the
   default).
2. **Import the repo into Vercel** (vercel.com → New Project). No database is
   required — it's a static-data Next.js app. `DUNE_API_KEY` isn't actually
   read at runtime by the deployed app (only by the weekly GitHub Action), but
   it's set as a Vercel env var too in case that changes.
3. Once connected, every push (including the automated commits from the cron
   workflows) triggers a new deployment, so the live site always reflects the
   latest `data/history.json` and `data/network-growth.json`.
4. To trigger a manual check outside its schedule, run the "Update tier
   snapshot" workflow from the Actions tab (`workflow_dispatch`, optionally
   with `force: true` to bypass the Kyiv-22:00 gate) or the "Update network
   growth" workflow (`workflow_dispatch`, no inputs).
5. Set the `DUNE_API_KEY` repo secret (Settings → Secrets and variables →
   Actions) so the weekly network-growth workflow can authenticate to Dune.

## Project structure

```
app/
  page.tsx                 dashboard (server component, reads history.json)
  api/history/route.ts     GET endpoint exposing the same data as JSON
  components/              TierCard, TierBarChart, TotalLineChart, NetworkGrowthChart, HistoryTable, ...
lib/
  tiers.ts                 tier id/name/threshold/color table
  history.ts               read + derive (totals, deltas, staleness) from history.json / network-growth.json
  networkGrowth.ts         pure month/quarter/year resampling (safe to import from client components)
  format.ts                number/date formatting helpers
data/
  history.json             tier snapshot history (abslysis.xyz)
  network-growth.json      monthly cumulative on-chain wallet count (Dune)
scripts/
  update-snapshot.mjs        polls abslysis.xyz, appends a snapshot on real change
  update-network-growth.mjs  runs the saved Dune query, rewrites network-growth.json
.github/workflows/
  update-snapshot.yml         hourly cron trigger for the tier snapshot
  update-network-growth.yml   weekly cron trigger for the on-chain growth data
```

## Not included yet

- Discord/Telegram push on new snapshots, CSV export, RSS feed — see the
  original spec for ideas; none are required for the MVP above.
