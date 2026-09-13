import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Badge, Btn, ConfirmDialog, GlassCard, Input, Modal, Pager, idr, stockLabel, stockTone, usePager } from '../components/ui'
import { api } from '../services/api'

function genBarcode() {
  return `WH-${Math.floor(100000 + Math.random() * 899999)}`
}

function genSku() {
  return `SKU-${Math.floor(1000 + Math.random() * 9000)}`
}

const blankDraft = () => ({
  name: '',
  sku: genSku(),
  barcode: genBarcode(),
  category: 'General',
  location: 'A-01-01',
  qty: '0',
  reorderPoint: '10',
  price: '0',
})

export default function Inventory() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [adjust, setAdjust] = useState({ id: null, delta: '' })
  const [msg, setMsg] = useState('')

  const canEdit = user?.role === 'admin'
  const canAdjust = user?.role === 'admin'
  const canAdd = user?.role === 'admin'
  const canRemove = user?.role === 'manager'
  const pager = usePager(rows)

  const load = async (term = q) => {
    setRows(await api.searchProducts(term))
    pager.setPage(1)
  }
  useEffect(() => {
    load('')
  }, [])

  const copy = (t) => navigator.clipboard?.writeText(t).catch(() => {})

  const saveEdit = async () => {
    try {
      const updated = await api.updateProduct(editing.id, {
        name: editing.name,
        barcode: editing.barcode,
        location: editing.location,
        reorderPoint: Number(editing.reorderPoint) || 0,
      })
      setRows((rs) => rs.map((r) => (r.id === updated.id ? updated : r)))
      setEditing(null)
      setMsg('Saved.')
    } catch (e) {
      setMsg(e.message)
    }
  }

  const saveAdjust = async () => {
    try {
      const updated = await api.adjustStock(adjust.id, Number(adjust.delta), user.username)
      setRows((rs) => rs.map((r) => (r.id === updated.id ? updated : r)))
      setAdjust({ id: null, delta: '' })
      setMsg('Stock adjusted.')
    } catch (e) {
      setMsg(e.message)
    }
  }

  const saveAdd = async () => {
    try {
      const created = await api.addProduct(adding, user.username)
      setRows((rs) => [created, ...rs])
      setAdding(null)
      setMsg(`Added ${created.barcode} (${created.sku}).`)
    } catch (e) {
      setMsg(e.message)
    }
  }

  const removeItem = async () => {
    const p = pendingDelete
    if (!p) return
    setPendingDelete(null)
    try {
      await api.removeProduct(p.id, user.username)
      setRows((rs) => rs.filter((r) => r.id !== p.id))
      setMsg(`Removed ${p.barcode}.`)
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="space-y-3">
      <GlassCard className="flex flex-col gap-2 md:flex-row md:items-center">
        <Input placeholder="Search name, SKU, barcode…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <Btn onClick={() => load()}>Search</Btn>
        {canAdd && <Btn variant="ghost" onClick={() => setAdding(blankDraft())}>+ Add item</Btn>}
        {msg && <span className="text-sm text-slate-700">{msg}</span>}
      </GlassCard>

      <GlassCard className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <span className="text-sm text-slate-500">Showing {rows.length} item{rows.length === 1 ? '' : 's'}</span>
        <span className="text-lg font-bold text-slate-900">Total value: {idr(rows.reduce((s, p) => s + p.qty * (p.price || 0), 0))}</span>
      </GlassCard>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left p-2">SKU</th><th className="text-left p-2">Barcode</th><th className="text-left p-2">Name</th>
                <th className="text-left p-2">Loc</th><th className="text-right p-2">Qty</th><th className="text-right p-2">Reorder</th>
                <th className="text-right p-2">Value</th>
                <th className="text-left p-2">Status</th><th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pager.rows.map((p) => (
                <tr key={p.id} className="border-t border-slate-900/10">
                  <td className="p-2 font-mono">{p.sku}</td>
                  <td className="p-2 font-mono">
                    {p.barcode}{' '}
                    <button className="text-sky-700" onClick={() => copy(p.barcode)} title="Copy">⧉</button>
                  </td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 font-mono">{p.location}</td>
                  <td className="p-2 text-right">{p.qty}</td>
                  <td className="p-2 text-right">{p.reorderPoint}</td>
                  <td className="p-2 text-right font-medium">{idr(p.qty * (p.price || 0))}</td>
                  <td className="p-2"><Badge tone={stockTone(p)}>{stockLabel(p)}</Badge></td>
                  <td className="p-2 space-x-2">
                    {canAdjust && <button className="rounded-lg bg-slate-900/5 px-2 py-1" onClick={() => setAdjust({ id: p.id, delta: '' })}>±</button>}
                    {canEdit && <button className="rounded-lg bg-slate-900/5 px-2 py-1" onClick={() => setEditing({ ...p })}>Edit</button>}
                    {canRemove && <button className="rounded-lg bg-rose-600/10 px-2 py-1 text-rose-700" onClick={() => setPendingDelete(p)}>Remove</button>}
                    {!canAdjust && !canEdit && !canRemove && <span className="text-xs text-slate-500">No actions for your role</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager {...pager} />
      </GlassCard>

      {adjust.id && (
        <Modal open onClose={() => setAdjust({ id: null, delta: '' })}>
          <h3 className="text-slate-900 font-semibold">Adjust stock</h3>
          <div className="mt-3 flex gap-2">
            <Input placeholder="Delta e.g. 10 or -5" value={adjust.delta} onChange={(e) => setAdjust({ ...adjust, delta: e.target.value })} />
            <Btn onClick={saveAdjust}>Apply</Btn>
            <Btn variant="ghost" onClick={() => setAdjust({ id: null, delta: '' })}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal open onClose={() => setEditing(null)}>
          <h3 className="text-slate-900 font-semibold">Edit {editing.sku}</h3>
          <p className="mt-1 text-sm text-slate-500">{editing.name} · Qty {editing.qty}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Item name" />
            <Input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Location" />
            <div className="flex gap-2 md:col-span-2">
              <Input value={editing.barcode} onChange={(e) => setEditing({ ...editing, barcode: e.target.value.toUpperCase() })} placeholder="WH-XXXXXX" />
              <Btn variant="ghost" onClick={() => setEditing({ ...editing, barcode: genBarcode() })}>Generate</Btn>
            </div>
            <Input type="number" min="0" value={editing.reorderPoint} onChange={(e) => setEditing({ ...editing, reorderPoint: e.target.value })} placeholder="Reorder point" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn onClick={saveEdit}>Save</Btn>
          </div>
        </Modal>
      )}

      {adding && (
        <GlassCard className="glass-strong">
          <h3 className="text-slate-900 font-semibold">Add inventory item</h3>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <Input placeholder="Item name *" value={adding.name} onChange={(e) => setAdding({ ...adding, name: e.target.value })} />
            <Input placeholder="Category" value={adding.category} onChange={(e) => setAdding({ ...adding, category: e.target.value })} />
            <div className="flex gap-2">
              <Input placeholder="SKU *" value={adding.sku} onChange={(e) => setAdding({ ...adding, sku: e.target.value.toUpperCase() })} />
              <Btn variant="ghost" onClick={() => setAdding({ ...adding, sku: genSku() })}>Generate</Btn>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Barcode WH-XXXXXX *" value={adding.barcode} onChange={(e) => setAdding({ ...adding, barcode: e.target.value.toUpperCase() })} />
              <Btn variant="ghost" onClick={() => setAdding({ ...adding, barcode: genBarcode() })}>Generate</Btn>
            </div>
            <Input placeholder="Location" value={adding.location} onChange={(e) => setAdding({ ...adding, location: e.target.value })} />
            <Input type="number" min="0" placeholder="Qty" value={adding.qty} onChange={(e) => setAdding({ ...adding, qty: e.target.value })} />
            <Input type="number" min="0" placeholder="Reorder point" value={adding.reorderPoint} onChange={(e) => setAdding({ ...adding, reorderPoint: e.target.value })} />
            <Input type="number" min="0" placeholder="Price" value={adding.price} onChange={(e) => setAdding({ ...adding, price: e.target.value })} />
          </div>
          <div className="mt-2 flex gap-2">
            <Btn onClick={saveAdd}>Add item</Btn>
            <Btn variant="ghost" onClick={() => setAdding(null)}>Cancel</Btn>
          </div>
        </GlassCard>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove item?"
        message={pendingDelete ? `${pendingDelete.barcode} (${pendingDelete.sku}) ${pendingDelete.name} — this cannot be undone.` : ''}
        confirmLabel="Remove"
        onConfirm={removeItem}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
