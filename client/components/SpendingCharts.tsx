import React, { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { useAppSelector } from '../hooks'

const CHART_COLORS = [
  '#4a90e2',
  '#7c5cbf',
  '#e8734a',
  '#2db88a',
  '#e84a6b',
  '#f5a623',
  '#50c9e8',
]

// Recharts custom tooltip style
const CustomTooltipStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.92)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '13px',
  color: '#f1f5f9',
  backdropFilter: 'blur(8px)',
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload
    return (
      <div style={CustomTooltipStyle}>
        <p className="font-bold mb-0.5">{name}</p>
        <p>
          $
          {(value as number).toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </p>
      </div>
    )
  }
  return null
}

const LineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={CustomTooltipStyle}>
        <p className="font-bold mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: $
            {(entry.value as number).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
        ))}
      </div>
    )
  }
  return null
}

type ChartTab = 'pie' | 'line'

const SpendingCharts: React.FC = () => {
  const { allExpenses } = useAppSelector((state) => state.expenses)
  const { categoryList } = useAppSelector((state) => state.category)
  const [activeTab, setActiveTab] = useState<ChartTab>('pie')

  const getCategoryName = (id: number) =>
    categoryList.find((c) => c.id === id)?.name || 'Unknown'

  // Pie chart data — category spending breakdown
  const pieData = useMemo(() => {
    const map: Record<number, number> = {}
    allExpenses.forEach((e) => {
      map[e.category_id] = (map[e.category_id] || 0) + e.amount
    })
    return Object.entries(map)
      .map(([catId, total]) => ({
        name: getCategoryName(Number(catId)),
        value: total,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [allExpenses, categoryList])

  // Line chart data — daily spending for last 30 days
  const lineData = useMemo(() => {
    if (allExpenses.length === 0) return []

    const today = new Date()
    const dayMap: Record<string, number> = {}

    // Initialize last 14 days with 0
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      dayMap[key] = 0
    }

    allExpenses.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00')
      const key = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      if (key in dayMap) {
        dayMap[key] += e.amount
      }
    })

    return Object.entries(dayMap).map(([date, amount]) => ({ date, amount }))
  }, [allExpenses])

  if (allExpenses.length === 0) {
    return (
      <div className="expense-card">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Analytics</h2>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="text-4xl mb-3">📊</div>
          <p className="font-medium">No data yet. Add some transactions!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="expense-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Analytics</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pie')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'pie'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            By Category
          </button>
          <button
            onClick={() => setActiveTab('line')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'line'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Trend
          </button>
        </div>
      </div>

      {activeTab === 'pie' ? (
        <div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span className="text-xs font-semibold text-slate-500">
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={lineData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={50}
            />
            <Tooltip content={<LineTooltip />} />
            <Line
              type="monotone"
              dataKey="amount"
              name="Daily Spend"
              stroke="#4a90e2"
              strokeWidth={2.5}
              dot={{ fill: '#4a90e2', r: 3, strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: '#4a90e2',
                strokeWidth: 2,
                stroke: '#fff',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default SpendingCharts
