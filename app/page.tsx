import { TIERS } from '@/lib/tiers'
import { readHistory, readNetworkGrowth, tierDeltas, totalUsers, isStale } from '@/lib/history'
import { formatDateTime, formatNumber } from '@/lib/format'
import { TierCard } from './components/TierCard'
import { TierBarChart } from './components/TierBarChart'
import { NetworkGrowthChart } from './components/NetworkGrowthChart'
import { HistoryTable } from './components/HistoryTable'
import { StaleWarning } from './components/StaleWarning'
import { ShareCard } from './components/ShareCard'
import { Footer } from './components/Footer'
import { ThemeToggle } from './components/ThemeToggle'

// This page only changes when the cron job commits a new snapshot (which
// triggers a fresh deploy), but force-dynamic keeps local/dev reads honest too.
export const dynamic = 'force-dynamic'

export default function Home() {
  const snapshots = readHistory()
  const latest = snapshots[snapshots.length - 1]
  const previous = snapshots[snapshots.length - 2]

  if (!latest) {
    return (
      <main className="flex flex-1 items-center justify-center p-8 text-center text-gray-500 dark:text-[#9aa1ab]">
        No snapshots yet. Run{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-white/10">
          node scripts/update-snapshot.mjs
        </code>{' '}
        to seed data/history.json.
      </main>
    )
  }

  const deltas = tierDeltas(latest.counts, previous?.counts)
  const total = totalUsers(latest.counts)
  const totalDelta = total - (previous ? totalUsers(previous.counts) : total)
  const stale = isStale(snapshots)
  const networkGrowth = readNetworkGrowth()

  return (
    <main className="flex-1 bg-[var(--background)]">
      <header className="border-b border-gray-200 bg-white px-4 py-6 dark:border-[#2b2f36] dark:bg-[#1e2126] sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e8eaed]">
                Abstract Tier Tracker
              </h1>
              <ThemeToggle />
            </div>
            <p className="text-sm text-gray-500 dark:text-[#9aa1ab]">
              XP tier distribution across Abstract (abs.xyz) users, tracked over time
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-[#e8eaed]">
              {formatNumber(total)}
            </div>
            <div className="text-xs text-gray-400 dark:text-[#6b7280]">
              total users · updated {formatDateTime(latest.date)}
            </div>
            <div className="text-xs text-gray-400 dark:text-[#6b7280]">
              Only users with at least one badge are counted
            </div>
          </div>
        </div>
      </header>

      {stale && <StaleWarning lastFetchedAt={latest.fetchedAt} />}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {TIERS.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              count={latest.counts[String(tier.id)] ?? 0}
              delta={deltas[String(tier.id)]}
              total={total}
            />
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2b2f36] dark:bg-[#1e2126]">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-[#e8eaed]">
            Current distribution by tier (compressed scale)
          </h2>
          <TierBarChart tiers={TIERS} counts={latest.counts} />
        </section>

        {networkGrowth.length > 0 && (
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2b2f36] dark:bg-[#1e2126]">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-[#e8eaed]">
              Network growth (on-chain)
            </h2>
            <p className="mb-4 mt-1 text-xs text-gray-400 dark:text-[#6b7280]">
              Cumulative count of all wallets that have ever sent a transaction on Abstract
              mainnet, sourced from on-chain data via Dune Analytics — a different, larger
              number than the {formatNumber(total)} tier badge-holders tracked above.
            </p>
            <NetworkGrowthChart points={networkGrowth} />
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-[#e8eaed]">
            Snapshot history
          </h2>
          <HistoryTable tiers={TIERS} snapshots={snapshots} />
        </section>

        <section className="mt-8">
          <ShareCard
            tiers={TIERS}
            counts={latest.counts}
            deltas={deltas}
            total={total}
            totalDelta={totalDelta}
          />
        </section>
      </div>

      <Footer />
    </main>
  )
}
