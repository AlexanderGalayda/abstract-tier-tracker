import type { TierInfo } from '@/lib/tiers'
import { formatDelta, formatNumber, formatPercent } from '@/lib/format'

export function TierCard({
  tier,
  count,
  delta,
  total,
}: {
  tier: TierInfo
  count: number
  delta: number
  total: number
}) {
  const deltaColor =
    delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-gray-400'
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '–'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: tier.color }}
          aria-hidden
        />
        <span className="text-sm font-semibold text-gray-700">{tier.name}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums text-gray-900">
          {formatNumber(count)}
        </span>
        <span className="text-sm font-medium tabular-nums text-gray-400">
          {formatPercent(count, total)}
        </span>
      </div>
      <div className={`mt-1 text-sm font-medium tabular-nums ${deltaColor}`}>
        {arrow} {formatDelta(delta)}
      </div>
      <div className="mt-3 text-xs text-gray-400">
        Threshold: {formatNumber(tier.threshold)} XP
      </div>
    </div>
  )
}
