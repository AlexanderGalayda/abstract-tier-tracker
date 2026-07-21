export interface TierInfo {
  id: number
  name: string
  threshold: number
  color: string
}

// Fallback table. Confirmed against GET https://backend.portal.abs.xyz/api/tiers
// (public, unauthenticated) — that endpoint is unofficial/undocumented and may
// change or go down, so this hardcoded table is the source of truth used by
// the app. See scripts/update-snapshot.mjs for the optional live check.
export const TIERS: TierInfo[] = [
  { id: 1, name: 'Bronze', threshold: 0, color: '#ab6c4e' },
  { id: 2, name: 'Silver', threshold: 10_000, color: '#b7bbc1' },
  { id: 3, name: 'Gold', threshold: 110_000, color: '#d7ba6e' },
  { id: 4, name: 'Platinum', threshold: 1_110_000, color: '#6cb8be' },
  { id: 5, name: 'Diamond', threshold: 4_110_000, color: '#7693e8' },
  { id: 6, name: 'Obsidian', threshold: 9_110_000, color: '#a663f5' },
  { id: 7, name: 'Ethereal', threshold: 17_110_000, color: '#00de73' },
]

export function getTier(id: number): TierInfo {
  const tier = TIERS.find((t) => t.id === id)
  if (!tier) throw new Error(`Unknown tier id: ${id}`)
  return tier
}
