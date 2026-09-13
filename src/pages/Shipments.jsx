import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Badge, Btn, GlassCard, Pager, usePager } from '../components/ui'
import { api } from '../services/api'

const NEXT = {
  inbound: { pending: 'receiving', receiving: 'completed' },
  outbound: { pending: 'picking', picking: 'completed' },
}

const ACTION_LABEL = {
  receiving: 'Start receiving',
  picking: 'Start picking',
  completed: 'Mark completed',
}

function actionsFor(role, shipment) {
  const { status, type } = shipment
  // Admin handles inventory items/data only — no shipment actions.
  if (role === 'admin') return []
  if (status === 'completed') return []
  if (status === 'pending') {
    // Approve step: SPV + Manager only.
    if (role === 'spv' || role === 'manager') {
      const next = NEXT[type]?.pending
      return next ? [{ to: next, label: `Approve → ${ACTION_LABEL[next]}` }] : []
    }
    return []
  }
  // Active step (receiving/picking): SPV + Manager advance to completed.
  const next = NEXT[type]?.[status]
  if (!next) return []
  if (role === 'spv' || role === 'manager') {
    return [{ to: next, label: ACTION_LABEL[next] || `Move to ${next}` }]
  }
  return []
}

export function ShipmentList({ type }) {
  const { user } = useAuth()
  const role = user?.role || 'spv'
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('all')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.listShipments().then((all) => setRows(all.filter((s) => s.type === type)))
  }, [type])

  const advance = async (s, to) => {
    setMsg('')
    try {
      const updated = await api.updateShipment(s.id, { status: to }, `${user.username} (${role})`)
      setRows((rs) => rs.map((r) => (r.id === updated.id ? updated : r)))
      setMsg(`${s.ref} → ${to}`)
    } catch (e) {
      setMsg(e.message)
    }
  }

  const visible = rows.filter((s) => {
    if (filter === 'all') return true
    if (filter === 'pending') return s.status === 'pending'
    if (filter === 'active') return s.status === 'receiving' || s.status === 'picking'
    if (filter === 'completed') return s.status === 'completed'
    return true
  })
  const pager = usePager(visible)

  return (
    <div className="space-y-3">
      <GlassCard className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-slate-900 font-semibold capitalize">{type} shipments</h2>
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); pager.setPage(1) }}
              className={`rounded-xl px-3 py-1 text-sm border capitalize ${filter === f ? 'bg-sky-600 text-white border-sky-700/40' : 'glass text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </GlassCard>

      {msg && <div className="glass rounded-xl px-3 py-2 text-sm text-slate-800">{msg}</div>}

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left p-2">Ref</th>
                <th className="text-left p-2">Partner</th>
                <th className="text-left p-2">Status</th>
                <th className="text-right p-2">Items</th>
                <th className="text-left p-2">ETA</th>
                <th className="text-left p-2">Menu ({role})</th>
              </tr>
            </thead>
            <tbody>
              {pager.rows.map((s) => {
                const acts = actionsFor(role, s)
                return (
                  <tr key={s.id} className="border-t border-slate-900/10">
                    <td className="p-2 font-mono">{s.ref}</td>
                    <td className="p-2">{s.supplier}</td>
                    <td className="p-2">
                      <Badge tone={s.status === 'completed' ? 'green' : s.status === 'pending' ? 'amber' : 'sky'}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">{s.items}</td>
                    <td className="p-2">{s.eta}</td>
                    <td className="p-2">
                      {acts.length === 0 ? (
                        <span className="text-xs text-slate-500">
                          {s.status === 'completed'
                            ? 'Done'
                            : role === 'admin'
                              ? 'Admin handles inventory only'
                              : '—'}
                        </span>
                      ) : (
                        <span className="flex flex-wrap gap-2">
                          {acts.map((a) => (
                            <Btn key={a.to} className="!px-3 !py-1 !text-xs" onClick={() => advance(s, a.to)}>
                              {a.label}
                            </Btn>
                          ))}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pager {...pager} />
      </GlassCard>
    </div>
  )
}
export const Inbound = () => <ShipmentList type="inbound" />
export const Outbound = () => <ShipmentList type="outbound" />
