'use client'

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatNumber } from '@/lib/format'
import type { TierInfo } from '@/lib/tiers'

interface Props {
  tiers: TierInfo[]
  counts: Record<string, number>
}

export function TierBarChart({ tiers, counts }: Props) {
  const data = tiers.map((tier) => {
    const actual = counts[String(tier.id)] ?? 0
    return {
      name: tier.name,
      actual,
      // log scale can't render 0 — floor the plotted value only, tooltip still shows actual
      value: Math.max(actual, 1),
      color: tier.color,
    }
  })

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 500, height: 288 }}
      >
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            scale="log"
            domain={[1, 'auto']}
            allowDataOverflow
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            tickFormatter={(v) => formatNumber(Number(v))}
            width={64}
          />
          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            formatter={(_value, _name, item) => [
              formatNumber(Number((item?.payload as { actual?: number })?.actual ?? 0)),
              'Users',
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
