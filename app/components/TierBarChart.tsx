'use client'

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
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

// Pure log scale makes Bronze/Gold look nearly identical despite a ~450k gap,
// while linear makes tiers under a few thousand disappear entirely. A power
// scale below 1 compresses large values without flattening small ones.
const POWER = 0.4
const compress = (v: number) => Math.pow(v, POWER)

export function TierBarChart({ tiers, counts }: Props) {
  const data = tiers.map((tier) => {
    const actual = counts[String(tier.id)] ?? 0
    return {
      name: tier.name,
      actual,
      value: compress(actual),
      color: tier.color,
    }
  })

  const maxActual = Math.max(...data.map((d) => d.actual), 1)
  const maxPower = Math.max(Math.ceil(Math.log10(maxActual)), 1)
  const realTicks = Array.from({ length: maxPower + 1 }, (_, i) => Math.pow(10, i))
  const tickLabels = new Map(realTicks.map((real) => [compress(real), formatNumber(real)]))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 500, height: 288 }}
      >
        <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            type="number"
            domain={[0, compress(Math.pow(10, maxPower))]}
            ticks={realTicks.map(compress)}
            allowDataOverflow
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            tickFormatter={(v) => tickLabels.get(Number(v)) ?? formatNumber(Number(v))}
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
            <LabelList
              dataKey="actual"
              position="top"
              formatter={(v: unknown) => formatNumber(Number(v))}
              style={{ fontSize: 11, fill: '#6b7280' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
