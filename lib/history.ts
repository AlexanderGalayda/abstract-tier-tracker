import fs from 'node:fs'
import path from 'node:path'
import type { HistoryFile, NetworkGrowthPoint, Snapshot, TierCounts } from './types'
import { TIERS } from './tiers'

const HISTORY_PATH = path.join(process.cwd(), 'data', 'history.json')
const NETWORK_GROWTH_PATH = path.join(process.cwd(), 'data', 'network-growth.json')

export function readHistory(): Snapshot[] {
  let raw: string
  try {
    raw = fs.readFileSync(HISTORY_PATH, 'utf-8')
  } catch {
    return []
  }
  const parsed = JSON.parse(raw) as HistoryFile
  return [...parsed.snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function totalUsers(counts: TierCounts): number {
  return TIERS.reduce((sum, tier) => sum + (counts[String(tier.id)] ?? 0), 0)
}

export function tierDeltas(
  current: TierCounts,
  previous: TierCounts | undefined
): Record<string, number> {
  const deltas: Record<string, number> = {}
  for (const tier of TIERS) {
    const key = String(tier.id)
    const curr = current[key] ?? 0
    const prev = previous?.[key] ?? curr
    deltas[key] = curr - prev
  }
  return deltas
}

export function isStale(snapshots: Snapshot[], staleDays = 10): boolean {
  if (snapshots.length === 0) return true
  const latest = snapshots[snapshots.length - 1]
  const ageMs = Date.now() - new Date(latest.fetchedAt).getTime()
  return ageMs > staleDays * 24 * 60 * 60 * 1000
}

export function readNetworkGrowth(): NetworkGrowthPoint[] {
  let raw: string
  try {
    raw = fs.readFileSync(NETWORK_GROWTH_PATH, 'utf-8')
  } catch {
    return []
  }
  const points = JSON.parse(raw) as NetworkGrowthPoint[]
  return [...points].sort((a, b) => a.month.localeCompare(b.month))
}
