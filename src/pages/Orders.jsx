import { useEffect, useState } from 'react'
import { Badge, GlassCard, Pager, idr, usePager } from '../components/ui'
import { api } from '../services/api'

export default function Orders() {
  const [rows, setRows] = useState([])
  const pager = usePager(rows)
  useEffect(() => {
    api.listOrders().then(setRows)
  }, [])
  return (
    <GlassCard>
      <h2 className="text-slate-900 font-semibold">Orders</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-500"><tr><th className="text-left p-2">Ref</th><th className="text-left p-2">Customer</th><th className="text-left p-2">Status</th><th className="text-right p-2">Lines</th><th className="text-right p-2">Total</th></tr></thead>
          <tbody>
            {pager.rows.map((o) => (
              <tr key={o.id} className="border-t border-slate-900/10">
                <td className="p-2 font-mono">{o.ref}</td>
                <td className="p-2">{o.customer}</td>
                <td className="p-2"><Badge tone={o.status === 'shipped' ? 'green' : o.status === 'pending' ? 'amber' : 'sky'}>{o.status}</Badge></td>
                <td className="p-2 text-right">{o.lines}</td>
                <td className="p-2 text-right">{idr(o.total)}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        <Pager {...pager} />
      </GlassCard>
  )
}
