import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'

function AppInner() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Mono', monospace", color: '#64748b', fontSize: '14px'
      }}>
        🛡️ Loading...
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}