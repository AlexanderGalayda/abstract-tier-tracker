'use client'

import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/lib/format'
import { periodLabel, resampleGrowth, type GrowthPeriod } from '@/lib/networkGrowth'
import { CHART_COLORS } from '@/lib/chartTheme'
import type { NetworkGrowthPoint } from '@/lib/types'
import { useTheme } from './ThemeProvider'

const PERIODS: { value: GrowthPeriod; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
]

export function NetworkGrowthChart({ points }: { points: NetworkGrowthPoint[] }) {
  const [period, setPeriod] = useState<GrowthPeriod>('month')
  const { theme } = useTheme()
  const colors = CHART_COLORS[theme]

  const data = useMemo(
    () =>
      resampleGrowth(points, period).map((p) => ({
        ...p,
        label: periodLabel(p.month, period),
      })),
    [points, period]
  )

  return (
    <div>
      <div className="mb-3 flex justify-end gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPeriod(p.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              period === p.value
                ? 'bg-gray-900 text-white dark:bg-[#2b2f36] dark:text-[#e8eaed]'
                : 'text-gray-500 hover:bg-gray-100 dark:text-[#9aa1ab] dark:hover:bg-white/5'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 500, height: 288 }}
        >
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: colors.tick }}
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: colors.tick }}
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
              tickFormatter={(v) => formatNumber(Number(v))}
              width={64}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1e2126' : '#ffffff',
                border: `1px solid ${theme === 'dark' ? '#2b2f36' : '#e5e7eb'}`,
                borderRadius: 8,
                color: theme === 'dark' ? '#e8eaed' : '#111827',
              }}
              formatter={(v) => [formatNumber(Number(v)), 'Wallets']}
              labelStyle={{ color: theme === 'dark' ? '#e8eaed' : '#111827' }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3, fill: '#4f46e5' }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
