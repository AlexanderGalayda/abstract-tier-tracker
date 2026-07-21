// Recharts renders raw SVG attributes, so it can't pick up Tailwind's `dark:`
// variants — callers must read the active theme and pass one of these in.
export const CHART_COLORS = {
  light: { grid: '#e5e7eb', tick: '#6b7280' },
  dark: { grid: 'rgba(255,255,255,0.08)', tick: '#9aa1ab' },
} as const
