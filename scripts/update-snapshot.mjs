#!/usr/bin/env node
// Polls abslysis.xyz for the latest Abstract tier user counts and appends a
// new snapshot to data/history.json ONLY when the source's own timestamp has
// advanced. Run by .github/workflows/update-snapshot.yml every hour; the
// Kyiv-21:00-onward gate below (not the cron schedule) decides whether a
// check actually happens, so daylight-saving shifts never need manual cron
// edits. This is a range, not an exact hour match, because GitHub Actions'
// schedule trigger can drift by 2-3+ hours, so a single-hour window
// sometimes has no run land in it at all and silently skips a whole day.
// Any run from 21:00 Kyiv onward proceeds; the change-detection logic below
// already no-ops extra same-day runs, so this can't create duplicate commits.
import fs from 'node:fs'
import path from 'node:path'

const HISTORY_PATH = path.join(process.cwd(), 'data', 'history.json')
const ABSLYSIS_URL = 'https://abslysis.xyz/api/v1/user/fetchUserCount'
const TIER_IDS = [1, 2, 3, 4, 5, 6, 7]

function kyivHourNow() {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Kyiv',
      hour: 'numeric',
      hour12: false,
    }).format(new Date())
  )
}

function readHistory() {
  try {
    const raw = fs.readFileSync(HISTORY_PATH, 'utf-8')
    return JSON.parse(raw).snapshots ?? []
  } catch {
    return []
  }
}

function writeHistory(snapshots) {
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true })
  fs.writeFileSync(HISTORY_PATH, JSON.stringify({ snapshots: sorted }, null, 2) + '\n')
}

function countsEqual(a, b) {
  return TIER_IDS.every((id) => (a[String(id)] ?? 0) === (b[String(id)] ?? 0))
}

function extractCounts(block) {
  const counts = {}
  for (const id of TIER_IDS) counts[String(id)] = block.data[String(id)] ?? 0
  return counts
}

async function fetchAbslysis() {
  const res = await fetch(ABSLYSIS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!res.ok) throw new Error(`abslysis.xyz responded ${res.status}`)
  const json = await res.json()
  return json.data
}

async function main() {
  const force = process.env.FORCE_RUN === '1'
  const history = readHistory()

  // The hour gate only applies once we already have a baseline — the very
  // first bootstrap run should seed data regardless of what time it is.
  if (history.length > 0 && !force) {
    const hour = kyivHourNow()
    if (hour < 21) {
      console.log(`[skip] Kyiv local hour is ${hour}, before the 21:00 window. No check performed.`)
      return
    }
  }

  const data = await fetchAbslysis()

  if (history.length === 0) {
    const older = {
      date: data.snapshots.time,
      fetchedAt: new Date().toISOString(),
      counts: extractCounts(data.snapshots),
    }
    const newer = {
      date: data.currentData.time,
      fetchedAt: new Date().toISOString(),
      counts: extractCounts(data.currentData),
    }
    writeHistory([older, newer])
    console.log(`[bootstrap] Seeded history with 2 points: ${older.date} and ${newer.date}`)
    return
  }

  const latest = history[history.length - 1]
  const newCounts = extractCounts(data.currentData)

  if (latest.date === data.currentData.time || countsEqual(latest.counts, newCounts)) {
    console.log(`[no-op] Source unchanged since ${latest.date}. Nothing written.`)
    return
  }

  const snapshot = {
    date: data.currentData.time,
    fetchedAt: new Date().toISOString(),
    counts: newCounts,
  }
  writeHistory([...history, snapshot])
  console.log(`[update] New snapshot recorded for ${snapshot.date}`)
  for (const id of TIER_IDS) {
    const delta = newCounts[String(id)] - (latest.counts[String(id)] ?? 0)
    console.log(`  tier ${id}: ${newCounts[String(id)]} (${delta >= 0 ? '+' : ''}${delta})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
