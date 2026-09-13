import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTheme } from '../app/ThemeContext'

export function GlassCard({ className = '', children, onClick }) {
  return <div onClick={onClick} className={`glass rounded-2xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(17,24,39,0.22)] ${className}`}>{children}</div>
}

export function Kpi({ label, value, sub, to }) {
  const inner = (
    <>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-slate-900 transition-transform duration-300 group-hover:scale-[1.04] origin-left">{value}</div>
      {sub && <div className="mt-1 text-sm text-slate-500">{sub}</div>}
    </>
  )
  const cls = 'glass rounded-2xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(17,24,39,0.22)] group'
  if (to) {
    return <Link to={to} className={`${cls} block cursor-pointer`}>{inner}</Link>
  }
  return <div className={cls}>{inner}</div>
}

export function Badge({ tone = 'slate', children }) {
  const tones = {
    slate: 'bg-slate-900/5 text-slate-700 border-slate-900/10',
    green: 'bg-emerald-500/15 text-emerald-800 border-emerald-600/30',
    amber: 'bg-amber-500/20 text-amber-800 border-amber-600/30',
    red: 'bg-rose-500/15 text-rose-800 border-rose-600/30',
    sky: 'bg-sky-500/15 text-sky-800 border-sky-600/30',
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Btn({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none'
  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-500 text-white border border-sky-700/30',
    ghost: 'glass text-slate-800 hover:bg-slate-900/5',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-700/30',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Input(props) {
  return <input {...props} className={`glass-input rounded-xl px-3 py-2 text-sm w-full ${props.className || ''}`} />
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}

export function stockTone(p) {
  if (p.qty === 0) return 'red'
  if (p.qty <= p.reorderPoint) return 'amber'
  return 'green'
}

export function stockLabel(p) {
  if (p.qty === 0) return 'Out'
  if (p.qty <= p.reorderPoint) return 'Low'
  return 'OK'
}

export const idr = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export function usePager(allRows, initialSize = 10) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(initialSize)
  const total = allRows.length
  const pages = Math.max(1, Math.ceil(total / size))
  const cur = Math.min(page, pages)
  const start = (cur - 1) * size
  return {
    rows: allRows.slice(start, start + size),
    page: cur,
    setPage,
    size,
    setSize,
    total,
    pages,
    start,
  }
}

export function Pager({ page, pages, total, size, setSize, setPage, start }) {
  const btn = 'rounded-lg px-2.5 py-1 text-sm glass transition-all duration-200 hover:shadow disabled:opacity-40'
  return (
    <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <span>Showing {total === 0 ? 0 : start + 1}–{Math.min(start + size, total)} of {total}</span>
      <div className="flex items-center gap-2">
        <label className="text-slate-500">Rows:</label>
        <select
          value={size}
          onChange={(e) => {
            setSize(Number(e.target.value))
            setPage(1)
          }}
          className="glass-input rounded-lg px-2 py-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <button className={btn} disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
        <span className="text-slate-500">{page} / {pages}</span>
        <button className={btn} disabled={page >= pages} onClick={() => setPage(page + 1)}>Next ›</button>
      </div>
    </div>
  )
}

export function Modal({ open, onClose, maxWidth = 'max-w-lg', backdrop = 'bg-slate-900/40 backdrop-blur-sm', children }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!open) {
      setShow(false)
      return
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 ${backdrop} transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`glass-strong relative w-full ${maxWidth} max-h-[90vh] overflow-auto rounded-2xl p-6 transition-all duration-300 ease-out ${
          show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title = 'Are you sure?', message = '', confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth="max-w-sm" backdrop="bg-slate-900/60 backdrop-blur-md">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm}>{confirmLabel}</Btn>
      </div>
    </Modal>
  )
}
