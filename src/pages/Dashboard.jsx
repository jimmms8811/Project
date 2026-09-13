import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GlassCard, Kpi, Badge, stockLabel, stockTone, idr } from '../components/ui'
import { useTheme } from '../app/ThemeContext'
import { api } from '../services/api'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const nav = useNavigate()
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const axis = dark ? '#cbd5e1' : '#4b5563'
  const grid = dark ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.08)'
  const tip = dark
    ? { background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.2)' }
    : { background: '#ffffff', border: '1px solid rgba(17,24,39,0.15)', color: '#111827' }

  useEffect(() => {
    api.kpis().then(setData)
  }, [])

  if (!data) return <div className="glass rounded-2xl p-6 text-slate-700">Loading…</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6 lg:grid-cols-3">
        <Kpi label="SKUs" value={data.totalSkus} to="/inventory" />
        <Kpi label="Stock value" value={idr(data.stockValue)} to="/inventory" />
        <Kpi label="Low stock" value={data.lowStock} sub="needs reorder" to="/inventory" />
        <Kpi label="Inbound today" value={data.inboundToday} to="/inbound" />
        <Kpi label="Outbound today" value={data.outboundToday} to="/outbound" />
        <Kpi label="Fill rate" value={`${data.fillRate}%`} to="/orders" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <GlassCard className="cursor-pointer" onClick={() => nav('/inbound')}>
          <h2 className="text-slate-900 font-semibold">Inbound / Outbound (7d)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data.weekFlow}>
                <CartesianGrid stroke={grid} />
                <XAxis dataKey="day" stroke={axis} />
                <YAxis stroke={axis} />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="inbound" fill="#3b82f6" radius={6} />
                <Bar dataKey="outbound" fill="#6b7280" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="cursor-pointer" onClick={() => nav('/inventory')}>
          <h2 className="text-slate-900 font-semibold">Stock by category</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                  {data.byCategory.map((_, i) => (
                    <Cell key={i} fill={['#2563eb', '#60a5fa', '#93c5fd', '#6b7280', '#9ca3af'][i % 5]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="cursor-pointer" onClick={() => nav('/inventory')}>
        <h2 className="text-slate-900 font-semibold">Top movers</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr><th className="text-left p-2">SKU</th><th className="text-left p-2">Barcode</th><th className="text-left p-2">Name</th><th className="text-right p-2">Qty</th><th className="text-left p-2">Status</th></tr>
            </thead>
            <tbody>
              {data.topMovers.map((p) => (
                <tr key={p.id} className="border-t border-slate-900/10">
                  <td className="p-2 font-mono">{p.sku}</td>
                  <td className="p-2 font-mono">{p.barcode}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-right">{p.qty}</td>
                  <td className="p-2"><Badge tone={stockTone(p)}>{stockLabel(p)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
