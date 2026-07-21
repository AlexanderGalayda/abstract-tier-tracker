import { readHistory } from '@/lib/history'

// Always read data/history.json fresh — a new snapshot only lands via a git
// commit from the cron workflow, but caching here would fight that.
export const dynamic = 'force-dynamic'

export async function GET() {
  const snapshots = readHistory()
  return Response.json({ snapshots })
}
