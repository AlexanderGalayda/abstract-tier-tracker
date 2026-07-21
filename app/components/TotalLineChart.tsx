'use client'

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatDate, formatNumber } from '@/lib/format'

interface Props {
  points: { date: string; total: number }[]
}

export function TotalLineChart({ points }: Props) {
  const data = points.map((p) => ({ ...p, label: formatDate(p.date) }))

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 500, height: 288 }}
      >
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            tickFormatter={(v) => formatNumber(Number(v))}
            width={64}
          />
          <Tooltip
            formatter={(v) => [formatNumber(Number(v)), 'Total users']}
            labelStyle={{ color: '#111827' }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#6cb8be"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6cb8be' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
