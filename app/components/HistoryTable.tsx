import type { TierInfo } from '@/lib/tiers'
import type { Snapshot } from '@/lib/types'
import { formatDateTime, formatDelta, formatNumber } from '@/lib/format'
import { tierDeltas, totalUsers } from '@/lib/history'

export function HistoryTable({
  tiers,
  snapshots,
}: {
  tiers: TierInfo[]
  snapshots: Snapshot[]
}) {
  // newest first for the table
  const rows = [...snapshots].reverse()

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[#2b2f36] dark:bg-[#1e2126]">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500 dark:border-[#2b2f36] dark:bg-white/[0.03] dark:text-[#9aa1ab]">
            <th className="px-4 py-3 font-medium">Date</th>
            {tiers.map((tier) => (
              <th key={tier.id} className="px-4 py-3 font-medium">
                {tier.name}
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((snapshot, i) => {
            const previous = snapshots[snapshots.length - 2 - i]
            const deltas = tierDeltas(snapshot.counts, previous?.counts)
            const total = totalUsers(snapshot.counts)
            const prevTotal = previous ? totalUsers(previous.counts) : undefined

            return (
              <tr
                key={snapshot.date}
                className="border-b border-gray-100 last:border-0 dark:border-[#2b2f36]"
              >
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-[#9aa1ab]">
                  {formatDateTime(snapshot.date)}
                </td>
                {tiers.map((tier) => {
                  const key = String(tier.id)
                  const count = snapshot.counts[key] ?? 0
                  const delta = deltas[key]
                  return (
                    <td key={tier.id} className="whitespace-nowrap px-4 py-3 tabular-nums">
                      <span className="text-gray-900 dark:text-[#e8eaed]">
                        {formatNumber(count)}
                      </span>
                      {previous && (
                        <span
                          className={`ml-1 text-xs ${
                            delta > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : delta < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-400 dark:text-[#6b7280]'
                          }`}
                        >
                          ({formatDelta(delta)})
                        </span>
                      )}
                    </td>
                  )
                })}
                <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-gray-900 dark:text-[#e8eaed]">
                  {formatNumber(total)}
                  {previous && (
                    <span
                      className={`ml-1 text-xs font-normal ${
                        total - (prevTotal ?? total) > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : total - (prevTotal ?? total) < 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-400 dark:text-[#6b7280]'
                      }`}
                    >
                      ({formatDelta(total - (prevTotal ?? total))})
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
