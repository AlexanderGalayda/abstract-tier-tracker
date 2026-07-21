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
