import type { TierInfo } from './tiers'
import type { TierCounts } from './types'
import { formatDelta, formatNumber } from './format'

export function buildShareSummary(
  tiers: TierInfo[],
  counts: TierCounts,
  deltas: Record<string, number>,
  total: number,
  totalDelta: number
): string {
  const lines = tiers.map((tier) => {
    const count = counts[String(tier.id)] ?? 0
    const delta = deltas[String(tier.id)] ?? 0
    return `${tier.name}: ${formatNumber(count)} (${formatDelta(delta)})`
  })
  lines.push(`Total: ${formatNumber(total)} (${formatDelta(totalDelta)})`)
  lines.push('via @RetroLayer')
  return lines.join('\n')
}
