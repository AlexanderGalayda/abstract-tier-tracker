export type TierCounts = Record<string, number> // keys "1".."7"

export interface Snapshot {
  /** Source timestamp reported by abslysis.xyz (data.currentData.time at capture) */
  date: string
  /** When our cron job actually detected and recorded this snapshot */
  fetchedAt: string
  counts: TierCounts
}

export interface HistoryFile {
  snapshots: Snapshot[]
}

export interface NetworkGrowthPoint {
  /** First day of the month, ISO date (YYYY-MM-DD) */
  month: string
  /** Cumulative count of unique wallets that have ever sent a transaction on Abstract */
  cumulative: number
}
