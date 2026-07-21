'use client'

import { useState } from 'react'
import type { TierInfo } from '@/lib/tiers'
import type { TierCounts } from '@/lib/types'
import { formatDelta, formatNumber } from '@/lib/format'
import { buildShareSummary } from '@/lib/share'

interface Props {
  tiers: TierInfo[]
  counts: TierCounts
  deltas: Record<string, number>
  total: number
  totalDelta: number
}

function deltaColorClass(delta: number): string {
  if (delta > 0) return 'text-emerald-400'
  if (delta < 0) return 'text-red-400'
  return 'text-gray-500'
}

export function ShareCard({ tiers, counts, deltas, total, totalDelta }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  async function handleCopy() {
    const summary = buildShareSummary(tiers, counts, deltas, total, totalDelta)
    try {
      await navigator.clipboard.writeText(summary)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="rounded-xl bg-gray-900 p-5 text-gray-100 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-semibold text-gray-200">Share this week&apos;s update</h2>
        <a
          href="https://x.com/RetroLayer"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-xs font-medium text-gray-400 hover:text-gray-200"
        >
          @RetroLayer
        </a>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {tiers.map((tier) => {
          const count = counts[String(tier.id)] ?? 0
          const delta = deltas[String(tier.id)] ?? 0
          return (
            <li key={tier.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-gray-300">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: tier.color }}
                  aria-hidden
                />
                {tier.name}
              </span>
              <span className="tabular-nums text-gray-100">
                {formatNumber(count)}{' '}
                <span className={`text-xs ${deltaColorClass(delta)}`}>
                  ({formatDelta(delta)})
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-gray-700 pt-3 text-sm font-bold">
        <span>Total</span>
        <span className="tabular-nums">
          {formatNumber(total)}{' '}
          <span className={`text-xs font-medium ${deltaColorClass(totalDelta)}`}>
            ({formatDelta(totalDelta)})
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white"
      >
        {status === 'copied' ? 'Copied!' : status === 'error' ? 'Copy failed' : 'Copy summary for X'}
      </button>
    </div>
  )
}
