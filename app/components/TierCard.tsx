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
    delta > 0
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
      : delta < 0
        ? 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'
        : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-[#6b7280]'
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '–'

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2b2f36] dark:bg-[#1e2126]">
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: tier.color }}
          aria-hidden
        />
        <span className="text-sm font-semibold text-gray-700 dark:text-[#e8eaed]">
          {tier.name}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-[#e8eaed]">
          {formatNumber(count)}
        </span>
        <span className="text-sm font-medium tabular-nums text-gray-400 dark:text-[#6b7280]">
          {formatPercent(count, total)}
        </span>
      </div>
      <div
        className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-sm font-medium tabular-nums ${deltaColor}`}
      >
        {arrow} {formatDelta(delta)}
      </div>
      <div className="mt-3 text-xs text-gray-400 dark:text-[#6b7280]">
        Threshold: {formatNumber(tier.threshold)} XP
      </div>
    </div>
  )
}
