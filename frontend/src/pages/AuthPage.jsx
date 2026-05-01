import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await login({
          email: form.email,
          password: form.password
        })
      } else {
        await register(form.name, form.email, form.password)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #334155',
    background: '#020617',
    color: '#e2e8f0',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
    transition: '0.3s',
  }

  const buttonStyle = {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    color: 'white',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    transition: '0.3s',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617, #0f172a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>

        <h2 style={{
          color: '#f1f5f9',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '700'
        }}>
          {isLogin ? 'Welcome Back 👋' : 'Create Account 🚀'}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
        >

          {!isLogin && (
            <input
              style={inputStyle}
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          )}

          <input
            style={inputStyle}
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />

          <input
            style={inputStyle}
            type="text"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          {error && (
            <div style={{
              background: '#7f1d1d',
              padding: '10px',
              borderRadius: '8px',
              color: '#fecaca',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          color: '#94a3b8',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            onClick={() => setIsLogin(!isLogin)}
            style={{
              color: '#60a5fa',
              cursor: 'pointer',
              marginLeft: '6px',
              fontWeight: '600'
            }}
          >
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>

      </div>
    </div>
  )
}