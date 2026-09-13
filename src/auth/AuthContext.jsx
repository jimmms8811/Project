import { createContext, useContext, useEffect, useState } from 'react'
import users from '../mocks/users.json'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('warehouse-user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem('warehouse-user', JSON.stringify(user))
    else localStorage.removeItem('warehouse-user')
  }, [user])

  const login = async (username, password) => {
    await new Promise((r) => setTimeout(r, 300))
    const found = users.find(
      (u) => u.username.toLowerCase() === String(username).trim().toLowerCase() && u.password === password
    )
    if (!found) throw new Error('Invalid username or password')
    const { password: _pw, ...safe } = found
    setUser(safe)
    return safe
  }

  const loginAs = (role) => {
    const found = users.find((u) => u.role === role)
    if (!found) return
    const { password: _pw, ...safe } = found
    setUser(safe)
    return safe
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
