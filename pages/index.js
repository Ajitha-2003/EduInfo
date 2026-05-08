import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { login, setSession, getSession } from '../lib/store'

const roles = [
  {
    key: 'admin',
    label: 'Admin',
    icon: '⬡',
    color: '#FF6B35',
    glow: 'rgba(255,107,53,0.3)',
    desc: 'Manage users & system',
    redirect: '/admin/dashboard',
  },
  {
    key: 'staff',
    label: 'Staff',
    icon: '◈',
    color: '#2D9CDB',
    glow: 'rgba(45,156,219,0.3)',
    desc: 'Upload study materials',
    redirect: '/staff/dashboard',
  },
  {
    key: 'student',
    label: 'Student',
    icon: '◎',
    color: '#27AE60',
    glow: 'rgba(39,174,96,0.3)',
    desc: 'Access your learning hub',
    redirect: '/student/dashboard',
  },
]

export default function Home() {
  const router = useRouter()
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const s = getSession()
    if (s) router.replace(`/${s.role}/dashboard`)
  }, [])

  const role = roles.find(r => r.key === selected)

  function handleSelect(key) {
    setSelected(key)
    setForm({ username: '', password: '' })
    setError('')
  }

  function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      const user = login(form.username, form.password, selected)
      if (user) {
        setSession(user)
        router.push(roles.find(r => r.key === selected).redirect)
      } else {
        setError('Invalid credentials. Please try again.')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.grid} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoMark}>◈</span>
          <span style={styles.logoText}>EduBot</span>
        </div>
        <p style={styles.tagline}>Intelligent Study Material Hub</p>
      </header>

      {/* Role Selector */}
      {!selected && (
        <main style={styles.main}>
          <h1 style={styles.headline}>Select your<br /><em style={styles.em}>portal</em></h1>
          <p style={styles.sub}>Choose your role to continue</p>
          <div style={styles.cards}>
            {roles.map(r => (
              <button key={r.key} style={{ ...styles.card, '--c': r.color, '--g': r.glow }} onClick={() => handleSelect(r.key)}>
                <div style={{ ...styles.cardIcon, color: r.color }}>{r.icon}</div>
                <div style={styles.cardLabel}>{r.label}</div>
                <div style={styles.cardDesc}>{r.desc}</div>
                <div style={{ ...styles.cardBar, background: r.color }} />
              </button>
            ))}
          </div>
        </main>
      )}

      {/* Login Form */}
      {selected && role && (
        <main style={styles.main}>
          <button style={styles.back} onClick={() => setSelected(null)}>← Back</button>
          <div style={{ ...styles.loginBox, '--c': role.color, '--g': role.glow }}>
            <div style={{ ...styles.loginIcon, color: role.color }}>{role.icon}</div>
            <h2 style={styles.loginTitle}>{role.label} <span style={{ color: role.color }}>Login</span></h2>
            <p style={styles.loginDesc}>{role.desc}</p>

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Username</label>
                <input
                  style={styles.input}
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter username"
                  required
                  autoFocus
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  style={styles.input}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <button
                type="submit"
                style={{ ...styles.btn, background: role.color }}
                disabled={loading}
              >
                {loading ? 'Authenticating…' : `Enter as ${role.label}`}
              </button>
            </form>
          </div>
        </main>
      )}

      <footer style={styles.footer}>
        EduBot © 2025 — Powered by AI
      </footer>

      <style>{`
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 60px var(--g) !important; }
        ${styles.cardKeyframes}
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 24px',
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    zIndex: 1,
    textAlign: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoMark: {
    fontSize: 28,
    color: '#2D9CDB',
  },
  logoText: {
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  tagline: {
    color: '#6B6B80',
    fontSize: 13,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  main: {
    zIndex: 1,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 900,
    paddingBottom: 60,
  },
  headline: {
    fontSize: 'clamp(40px, 7vw, 72px)',
    fontWeight: 800,
    textAlign: 'center',
    lineHeight: 1.1,
    letterSpacing: '-2px',
    marginBottom: 16,
  },
  em: {
    fontStyle: 'italic',
    color: '#2D9CDB',
  },
  sub: {
    color: '#6B6B80',
    fontSize: 16,
    marginBottom: 48,
  },
  cards: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    background: '#13131A',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
    padding: '36px 32px',
    width: 240,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
    display: 'block',
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B6B80',
    lineHeight: 1.5,
  },
  cardBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: '0 0 20px 20px',
  },
  back: {
    background: 'transparent',
    color: '#6B6B80',
    fontSize: 14,
    padding: '8px 0',
    marginBottom: 32,
    alignSelf: 'flex-start',
    transition: 'color 0.2s',
  },
  loginBox: {
    background: '#13131A',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 24,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 440,
    boxShadow: '0 0 80px var(--g)',
    textAlign: 'center',
  },
  loginIcon: {
    fontSize: 56,
    marginBottom: 16,
    display: 'block',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 8,
  },
  loginDesc: {
    color: '#6B6B80',
    fontSize: 14,
    marginBottom: 36,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    textAlign: 'left',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6B6B80',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  input: {
    background: '#1C1C26',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '14px 16px',
    color: '#F0F0F5',
    fontSize: 15,
    transition: 'border-color 0.2s',
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    background: 'rgba(255,107,107,0.1)',
    border: '1px solid rgba(255,107,107,0.2)',
    borderRadius: 8,
    padding: '10px 14px',
  },
  btn: {
    padding: '16px',
    borderRadius: 12,
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    transition: 'opacity 0.2s, transform 0.1s',
    marginTop: 8,
  },
  footer: {
    zIndex: 1,
    color: '#6B6B80',
    fontSize: 12,
    padding: '24px 0',
    letterSpacing: '0.08em',
  },
  cardKeyframes: `
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  `,
}
