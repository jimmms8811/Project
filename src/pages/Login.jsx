import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Btn, GlassCard, Input, ThemeToggle } from '../components/ui'

export default function Login() {
  const { login, loginAs } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('password')
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await login(username, password)
      nav('/')
    } catch (ex) {
      setErr(ex.message)
    }
  }

  const quick = (role) => {
    loginAs(role)
    nav('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <GlassCard className="w-full max-w-md glass-strong">
        <h1 className="text-2xl font-bold text-slate-900">Warehouse</h1>
        <p className="text-sm text-slate-600">Mock login — pick a role or use demo accounts.</p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
          {err && <div className="text-sm text-rose-700">{err}</div>}
          <Btn className="w-full" type="submit">Login</Btn>
        </form>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Btn variant="ghost" onClick={() => quick('admin')}>Admin</Btn>
          <Btn variant="ghost" onClick={() => quick('manager')}>Manager</Btn>
          <Btn variant="ghost" onClick={() => quick('spv')}>Supervisor</Btn>
        </div>
      </GlassCard>
    </div>
  )
}
