import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Badge, Btn, GlassCard, Input, Pager, usePager } from '../components/ui'
import { api } from '../services/api'

export default function Movements() {
  const { user } = useAuth()
  const role = user?.role
  const [term, setTerm] = useState('')
  const [found, setFound] = useState([])
  const [selected, setSelected] = useState(null)
  const [type, setType] = useState('in')
  const [qty, setQty] = useState('')
  const [ref, setRef] = useState('')
  const [note, setNote] = useState('')
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('')
  const pager = usePager(history)

  useEffect(() => {
    api.listMovements().then(setHistory)
  }, [])

  if (role !== 'admin') {
    return (
      <GlassCard>
        <h2 className="text-slate-900 font-semibold">Transactions — Admin only</h2>
        <p className="mt-1 text-sm text-slate-500">
          Only Admin can input item movement data. SPV & Manager approve shipments and use the Scan page for operations.
        </p>
      </GlassCard>
    )
  }

  const search = async (e) => {
    e?.preventDefault()
    setFound(await api.searchProducts(term))
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!selected) {
      setMsg('Select an item first (search by name, SKU or barcode).')
      return
    }
    try {
      const updated = await api.recordMovement({
        productId: selected.id,
        type,
        qty,
        ref,
        note,
        by: user.username,
      })
      setSelected(updated)
      setHistory(await api.listMovements())
      setQty('')
      setRef('')
      setNote('')
      setMsg(`OK: ${updated.barcode} ${type === 'in' ? '+' : '-'}${Number(qty)} → ${updated.qty}`)
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <GlassCard className="glass-strong">
        <h2 className="text-xl font-bold text-slate-900">Item</h2>
        <p className="text-sm text-slate-500">Admin-only goods in/out entry. Updates stock + movement history.</p>

        <form onSubmit={search} className="mt-3 flex gap-2">
          <Input placeholder="Find item: name, SKU, barcode…" value={term} onChange={(e) => setTerm(e.target.value)} />
          <Btn type="submit" variant="ghost">Find</Btn>
        </form>

        {found.length > 0 && (
          <div className="mt-2 max-h-44 space-y-1 overflow-auto">
            {found.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className={`block w-full rounded-xl border px-3 py-2 text-left text-sm ${selected?.id === p.id ? 'bg-sky-500/15 border-sky-600/40 text-slate-900' : 'glass text-slate-700'}`}
              >
                <span className="font-mono text-sky-700">{p.barcode}</span> · {p.name} · Qty {p.qty}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-3 space-y-2">
          <div className="flex gap-2">
            {['in', 'out'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium border ${type === t ? (t === 'in' ? 'bg-emerald-600 text-white border-emerald-700/40' : 'bg-rose-600 text-white border-rose-700/40') : 'glass text-slate-700'}`}
              >
                {t === 'in' ? 'Goods IN (+)' : 'Goods OUT (−)'}
              </button>
            ))}
          </div>
          {selected && (
            <div className="glass rounded-xl px-3 py-2 text-sm">
              <span className="font-mono text-sky-700">{selected.barcode}</span>
              <span className="text-slate-900"> · {selected.name}</span>
              <span className="text-slate-500"> · Qty {selected.qty}</span>
            </div>
          )}
          <Input type="number" min="1" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Input placeholder="Reference (e.g. IN-9004, SO-5007)" value={ref} onChange={(e) => setRef(e.target.value)} />
          <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Btn type="submit" className="w-full">Record movement</Btn>
        </form>

        {msg && (
          <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${msg.startsWith('OK') ? 'bg-emerald-500/15 border-emerald-600/30 text-emerald-800' : 'bg-amber-500/15 border-amber-600/30 text-amber-800'}`}>
            {msg}
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <h3 className="text-slate-900 font-semibold">History ({history.length})</h3>
        <div className="mt-2 max-h-[480px] space-y-2 overflow-auto">
          {pager.rows.map((m) => (
            <div key={m.id} className="glass rounded-xl px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sky-700">{m.barcode}</span>
                <Badge tone={m.type === 'in' ? 'green' : 'red'}>{m.type === 'in' ? `IN +${m.qty}` : `OUT −${m.qty}`}</Badge>
              </div>
              <div className="text-slate-800">{m.name}</div>
              <div className="text-xs text-slate-500">
                {[m.ref, m.note].filter(Boolean).join(' · ') || '—'} · {m.at} · {m.by}
              </div>
            </div>
          ))}
        </div>
        <Pager {...pager} />
      </GlassCard>
    </div>
  )
}
