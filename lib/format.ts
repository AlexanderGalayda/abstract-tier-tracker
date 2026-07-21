export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatDelta(n: number): string {
  if (n === 0) return '0'
  return `${n > 0 ? '+' : ''}${formatNumber(n)}`
}

export function formatPercent(count: number, total: number): string {
  if (total <= 0) return '0%'
  const pct = (count / total) * 100
  return `${pct >= 1 ? pct.toFixed(1) : pct.toFixed(3)}%`
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
