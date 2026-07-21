#!/usr/bin/env node
// Refreshes data/network-growth.json — monthly cumulative count of unique
// wallets that have ever sent a transaction on Abstract mainnet, sourced from
// Dune Analytics (on-chain data, not the abslysis.xyz tier badges tracked by
// update-snapshot.mjs). This is a different, larger number than the "users
// with tier badges" figure shown elsewhere on the dashboard.
//
// Runs on its own weekly schedule (see .github/workflows/update-network-growth.yml)
// since on-chain history barely moves day to day and a full-history query
// costs Dune credits — no reason to run it on the hourly tier-snapshot cron.
//
// The query itself is a saved Dune query (created once via the Query API and
// reused here by id) rather than re-created on every run:
//   https://dune.com/queries/8057914
const QUERY_ID = 8057914

const DUNE_API_KEY = process.env.DUNE_API_KEY
if (!DUNE_API_KEY) {
  console.error('Missing DUNE_API_KEY environment variable.')
  process.exit(1)
}

const API_BASE = 'https://api.dune.com/api/v1'
const POLL_INTERVAL_MS = 5000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

async function duneRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'X-Dune-Api-Key': DUNE_API_KEY, ...options.headers },
  })
  if (!res.ok) {
    throw new Error(`Dune API ${path} responded ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

async function executeQuery() {
  const { execution_id: executionId } = await duneRequest(`/query/${QUERY_ID}/execute`, {
    method: 'POST',
  })
  return executionId
}

async function waitForCompletion(executionId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS
  while (Date.now() < deadline) {
    const status = await duneRequest(`/execution/${executionId}/status`)
    if (status.state === 'QUERY_STATE_COMPLETED') return
    if (status.state === 'QUERY_STATE_FAILED') {
      throw new Error(`Dune execution failed: ${status.error?.message ?? 'unknown error'}`)
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
  }
  throw new Error(`Dune execution ${executionId} did not complete within ${POLL_TIMEOUT_MS}ms`)
}

async function fetchResults(executionId) {
  const { result } = await duneRequest(`/execution/${executionId}/results`)
  return result.rows
}

async function main() {
  console.log(`Executing saved Dune query ${QUERY_ID}...`)
  const executionId = await executeQuery()
  await waitForCompletion(executionId)
  const rows = await fetchResults(executionId)

  const points = rows
    .map((row) => ({
      month: String(row.month).slice(0, 10),
      cumulative: Number(row.cumulative_addresses),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const path = await import('node:path')
  const fs = await import('node:fs')
  const outPath = path.join(process.cwd(), 'data', 'network-growth.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(points, null, 2) + '\n')

  const latest = points[points.length - 1]
  console.log(`Wrote ${points.length} monthly points. Latest: ${latest.month} -> ${latest.cumulative}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
