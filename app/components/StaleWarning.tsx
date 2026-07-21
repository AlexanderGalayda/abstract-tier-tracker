export function StaleWarning({ lastFetchedAt }: { lastFetchedAt: string }) {
  return (
    <div className="mx-4 mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:mx-6">
      No new snapshot since {new Date(lastFetchedAt).toDateString()} — abslysis.xyz may have
      stopped updating or the cron job may be failing.
    </div>
  )
}
