import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Badge, Btn, GlassCard, Input } from '../components/ui'
import { api } from '../services/api'

export default function Scan() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('barcode') || '')
  const [mode, setMode] = useState('Receive')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [msg, setMsg] = useState('')
  const [delta, setDelta] = useState('1')
  const inputRef = useRef(null)

  const lookup = async (c = code) => {
    setMsg('')
    setResult(null)
    const v = (c || '').trim()
    if (!v) {
      setMsg('Enter or scan a barcode / SKU.')
      return
    }
    const found = await api.getProductByBarcode(v)
    if (!found) {
      setMsg(`No item for "${v}".`)
      return
    }
    setResult(found)
    setMsg(`Found ${found.name} — ${mode} mode ready.`)
  }

  useEffect(() => {
    const b = params.get('barcode')
    if (b) {
      setCode(b)
      lookup(b)
    }
    inputRef.current?.focus()
  }, [])

  const apply = async (sign = 1) => {
    if (!result) return
    try {
      if (mode === 'Audit') {
        const before = result.qty
        const updated = await api.setStock(result.id, delta, `${user.username} (Audit)`)
        setResult(updated)
        setHistory((h) => [{ at: new Date().toLocaleTimeString(), barcode: updated.barcode, mode, delta: updated.qty - before, qty: updated.qty }, ...h].slice(0, 20))
        setMsg(`OK: ${updated.barcode} counted ${updated.qty} (was ${before})`)
      } else {
        const d = Number(delta) * sign * (mode === 'Pick' ? -1 : 1)
        const updated = await api.adjustStock(result.id, d, `${user.username} (${mode})`)
        setResult(updated)
        setHistory((h) => [{ at: new Date().toLocaleTimeString(), barcode: updated.barcode, mode, delta: d, qty: updated.qty }, ...h].slice(0, 20))
        setMsg(`OK: ${updated.barcode} -> ${updated.qty}`)
      }
      setCode('')
      inputRef.current?.focus()
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <GlassCard className="glass-strong">
        <h2 className="text-xl font-bold text-slate-900">Scan station</h2>
        <p className="text-sm text-slate-500">USB scanner guns work here — they type + Enter. Camera scanning is a future upgrade.</p>
        <div className="mt-3 flex gap-2">
          {['Receive', 'Pick', 'Audit'].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-xl px-3 py-1 text-sm border ${mode === m ? 'bg-sky-600 text-white border-sky-700/40' : 'glass text-slate-700'}`}>
              {m}
            </button>
          ))}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); lookup() }}>
          <Input ref={inputRef} autoFocus placeholder="Focus here, scan barcode…" value={code} onChange={(e) => setCode(e.target.value)} className="text-lg font-mono py-3" />
          <Btn type="submit">Find</Btn>
        </form>
        {msg && <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${msg.startsWith('OK') || msg.startsWith('Found') ? 'bg-emerald-500/15 border-emerald-600/30 text-emerald-800' : 'bg-amber-500/15 border-amber-600/30 text-amber-800'}`}>{msg}</div>}

        {result && (
          <div className="glass mt-3 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-sky-700">{result.barcode} · {result.sku}</div>
                <div className="text-lg font-semibold text-slate-900">{result.name}</div>
                <div className="text-sm text-slate-500">{result.location} · Qty {result.qty}</div>
              </div>
              <Badge tone={result.qty <= result.reorderPoint ? 'amber' : 'green'}>{result.qty <= result.reorderPoint ? 'Low' : 'OK'}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Input type="number" min="0" placeholder={mode === 'Audit' ? 'Counted qty' : 'Qty'} value={delta} onChange={(e) => setDelta(e.target.value)} className="max-w-28" />
              {mode === 'Audit' ? (
                <Btn onClick={() => apply(1)}>Set stock to count</Btn>
              ) : (
                <>
                  <Btn onClick={() => apply(1)}>+ Apply ({mode})</Btn>
                  <Btn variant="ghost" onClick={() => apply(-1)}>- Apply</Btn>
                </>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <h3 className="text-slate-900 font-semibold">Session history ({history.length})</h3>
        <div className="mt-2 space-y-2 max-h-[420px] overflow-auto">
          {history.length === 0 && <div className="text-sm text-slate-500">No scans yet.</div>}
          {history.map((h, i) => (
            <div key={i} className="glass rounded-xl px-3 py-2 text-sm flex justify-between">
              <span className="font-mono">{h.barcode}</span>
              <span>{h.mode} {h.delta > 0 ? `+${h.delta}` : h.delta} → {h.qty}</span>
              <span className="text-slate-500">{h.at}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
