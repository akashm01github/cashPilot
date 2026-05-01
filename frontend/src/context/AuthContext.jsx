import { createContext, useContext, useState, useEffect } from 'react'
import API from '../utils/api'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // ✅ Load user on refresh
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { data } = await API.get('/api/auth/me')
          setUser(data.user)
        } catch (err) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  // ✅ Register
  const register = async (name, email, password) => {
    try {
      const { data } = await API.post('/api/auth/register', { name, email, password })

      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)

    } catch (err) {
      console.error(err.response?.data)
      alert(err.response?.data?.message || "Registration failed")
    }
  }

  // ✅ Login (FIXED)
  const login = async (formData) => {
    try {
      const res = await API.post("/api/auth/login", formData)

      localStorage.setItem("token", res.data.token)
      setToken(res.data.token)
      setUser(res.data.user)

    } catch (err) {
      console.error(err.response?.data)
      throw err
    }
  }

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}