import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Btn, ConfirmDialog, GlassCard, Input, Pager, usePager } from '../components/ui'
import { api } from '../services/api'

export function Suppliers() {
  const { user } = useAuth()
  const canAdd = user?.role === 'spv' || user?.role === 'manager' || user?.role === 'admin'
  const canRemove = user?.role === 'spv' || user?.role === 'manager'
  const [rows, setRows] = useState([])
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ name: '', contact: '', leadTime: '' })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [msg, setMsg] = useState('')
  const pager = usePager(rows)
  useEffect(() => {
    api.listSuppliers().then(setRows)
  }, [])

  const saveAdd = async () => {
    try {
      const created = await api.addSupplier(draft, user.username)
      setRows((rs) => [created, ...rs])
      setDraft({ name: '', contact: '', leadTime: '' })
      setAdding(false)
      setMsg(`Added supplier ${created.name}.`)
    } catch (e) {
      setMsg(e.message)
    }
  }

  const removeItem = async () => {
    const s = pendingDelete
    if (!s) return
    setPendingDelete(null)
    try {
      await api.removeSupplier(s.id, user.username)
      setRows((rs) => rs.filter((r) => r.id !== s.id))
      setMsg(`Removed supplier ${s.name}.`)
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="space-y-3">
      <GlassCard className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-slate-900 font-semibold">Suppliers</h2>
          {user?.role === 'admin' && <p className="text-xs text-slate-500">Admin can add suppliers only.</p>}
        </div>
        {canAdd && <Btn onClick={() => setAdding((a) => !a)}>{adding ? 'Close' : '+ Add supplier'}</Btn>}
      </GlassCard>

      {msg && <div className="glass rounded-xl px-3 py-2 text-sm text-slate-800">{msg}</div>}

      {adding && canAdd && (
        <GlassCard className="glass-strong">
          <h3 className="text-slate-900 font-semibold">Add supplier</h3>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <Input placeholder="Supplier name *" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Input placeholder="Contact" value={draft.contact} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} />
            <Input placeholder="Lead time (e.g. 3 days)" value={draft.leadTime} onChange={(e) => setDraft({ ...draft, leadTime: e.target.value })} />
          </div>
          <div className="mt-2 flex gap-2">
            <Btn onClick={saveAdd}>Add supplier</Btn>
            <Btn variant="ghost" onClick={() => setAdding(false)}>Cancel</Btn>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {pager.rows.map((s) => (
            <div key={s.id} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-slate-900 font-medium">{s.name}</div>
                {canRemove && (
                  <button className="rounded-lg bg-rose-600/10 px-2 py-1 text-xs text-rose-700" onClick={() => setPendingDelete(s)}>
                    Remove
                  </button>
                )}
              </div>
              <div className="text-sm text-slate-500">Contact {s.contact} · {s.leadTime}</div>
            </div>
          ))}
        </div>
        <Pager {...pager} />
      </GlassCard>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove supplier?"
        message={pendingDelete ? `${pendingDelete.name} — this cannot be undone.` : ''}
        confirmLabel="Remove"
        onConfirm={removeItem}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

export function Locations() {
  const [rows, setRows] = useState([])
  const pager = usePager(rows)
  useEffect(() => {
    api.listLocations().then(setRows)
  }, [])
  return (
    <GlassCard>
      <h2 className="text-slate-900 font-semibold">Locations</h2>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        {pager.rows.map((l) => (
          <div key={l.id} className="glass rounded-xl p-3">
            <div className="font-mono text-sky-700">{l.code}</div>
            <div className="text-sm text-slate-700">{l.zone}</div>
            <div className="text-xs text-slate-500">Cap {l.capacity}</div>
          </div>
        ))}
      </div>
      <Pager {...pager} />
    </GlassCard>
  )
}

export function Activity() {
  const [rows, setRows] = useState([])
  const pager = usePager(rows)
  useEffect(() => {
    api.listActivity().then(setRows)
  }, [])
  return (
    <GlassCard>
      <h2 className="text-slate-900 font-semibold">Activity log</h2>
      <div className="mt-2 space-y-2">
        {pager.rows.map((a) => (
          <div key={a.id} className="glass rounded-xl px-3 py-2 text-sm flex flex-col md:flex-row md:justify-between gap-1">
            <span className="text-slate-800">{a.action}</span>
            <span className="text-slate-500 font-mono text-xs">{a.at} · {a.by}</span>
          </div>
        ))}
      </div>
      <Pager {...pager} />
    </GlassCard>
  )
}
