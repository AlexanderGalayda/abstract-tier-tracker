import type { NetworkGrowthPoint } from './types'

export type GrowthPeriod = 'month' | 'quarter' | 'year'

function periodKey(month: string, period: GrowthPeriod): string {
  const [year, monthNum] = month.split('-').map(Number)
  if (period === 'month') return month
  if (period === 'quarter') return `${year}-Q${Math.floor((monthNum - 1) / 3) + 1}`
  return `${year}`
}

export function periodLabel(month: string, period: GrowthPeriod): string {
  const [year, monthNum] = month.split('-').map(Number)
  if (period === 'year') return String(year)
  if (period === 'quarter') return `Q${Math.floor((monthNum - 1) / 3) + 1} ${year}`
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${monthNames[monthNum - 1]} ${year}`
}

// Cumulative counter — resampling to a coarser period just keeps the last
// (largest) value observed in that period, no re-querying needed.
export function resampleGrowth(
  points: NetworkGrowthPoint[],
  period: GrowthPeriod
): NetworkGrowthPoint[] {
  if (period === 'month') return points
  const sorted = [...points].sort((a, b) => a.month.localeCompare(b.month))
  const lastByKey = new Map<string, NetworkGrowthPoint>()
  for (const point of sorted) {
    lastByKey.set(periodKey(point.month, period), point)
  }
  return Array.from(lastByKey.values())
}
