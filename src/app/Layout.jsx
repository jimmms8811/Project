import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ThemeToggle } from '../components/ui'

const ALL_ROLES = ['admin', 'manager', 'spv']
const ROLE_LABEL = { admin: 'Admin', manager: 'Manager', spv: 'Supervisor' }
const NAV = [
  { to: '/', label: 'Dashboard', end: true, roles: ALL_ROLES },
  { to: '/inventory', label: 'Inventory', roles: ALL_ROLES },
  { to: '/scan', label: 'Scan', roles: ALL_ROLES },
  { to: '/transactions', label: 'Transactions', roles: ['admin'] },
  { to: '/inbound', label: 'Inbound', roles: ALL_ROLES },
  { to: '/outbound', label: 'Outbound', roles: ALL_ROLES },
  { to: '/orders', label: 'Orders', roles: ALL_ROLES },
  { to: '/suppliers', label: 'Suppliers', roles: ALL_ROLES },
  { to: '/locations', label: 'Locations', roles: ALL_ROLES },
  { to: '/activity', label: 'Activity', roles: ALL_ROLES },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [quick, setQuick] = useState('')
  const nav = useNavigate()

  const submitQuick = (e) => {
    e.preventDefault()
    nav(quick.trim() ? `/scan?barcode=${encodeURIComponent(quick.trim())}` : '/scan')
    setQuick('')
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className={`glass-strong fixed inset-y-0 left-0 z-40 w-64 p-5 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Link to="/" className="block">
          <div className="text-lg font-bold text-slate-900">Warehouse</div>
        </Link>
        <nav className="mt-6 space-y-1">
          {NAV.filter((n) => !n.roles || n.roles.includes(user?.role)).map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm transition-all duration-200 ease-out hover:translate-x-1 hover:shadow-md ${isActive ? 'bg-slate-900/10 text-slate-900 border border-slate-900/15 translate-x-1 shadow-md' : 'text-slate-600 hover:bg-slate-900/5 border border-transparent'}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="glass mt-6 rounded-xl p-3 text-xs text-slate-600">
          <div className="font-medium text-slate-900">{user?.name}</div>
          <div className="uppercase tracking-wide">{ROLE_LABEL[user?.role] || user?.role}</div>
          <button onClick={logout} className="mt-2 w-full rounded-lg bg-slate-900/5 px-2 py-1 text-left transition-all duration-200 ease-out hover:translate-x-0.5 hover:bg-slate-900/10 hover:shadow">
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-0">
        <header className="glass sticky top-0 z-30 m-3 rounded-2xl px-4 py-3 flex items-center gap-3">
          <button className="lg:hidden glass rounded-lg px-3 py-1" onClick={() => setOpen(!open)}>
            ☰
          </button>
          <form onSubmit={submitQuick} className="flex flex-1 items-center gap-2">
            <input
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              placeholder="Scan / search by barcode, SKU… (Enter)"
              className="glass-input rounded-xl px-3 py-2 text-sm w-full"
            />
            <button className="rounded-xl bg-sky-400/80 px-4 py-2 text-sm font-medium text-slate-950" type="submit">
              Go
            </button>
            <ThemeToggle />
          </form>
        </header>
        <main className="p-3 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
