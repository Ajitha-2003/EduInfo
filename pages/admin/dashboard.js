import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession, clearSession, getUsers, addUser, removeUser, getMaterials, removeMaterial } from '../../lib/store'

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [materials, setMaterials] = useState([])
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'student' })
  const [msg, setMsg] = useState('')
  const [session, setSession] = useState(null)

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== 'admin') { router.replace('/'); return }
    setSession(s)
    refresh()
  }, [])

  function refresh() {
    setUsers(getUsers().filter(u => u.role !== 'admin'))
    setMaterials(getMaterials())
  }

  function handleAddUser(e) {
    e.preventDefault()
    const existing = getUsers().find(u => u.username === form.username)
    if (existing) { setMsg('Username already exists.'); return }
    addUser({ ...form })
    setForm({ name: '', username: '', password: '', role: 'student' })
    setMsg('User added successfully!')
    refresh()
    setTimeout(() => setMsg(''), 3000)
  }

  function handleRemoveUser(username) {
    removeUser(username)
    refresh()
  }

  function handleRemoveMaterial(id) {
    removeMaterial(id)
    refresh()
  }

  function logout() {
    clearSession()
    router.push('/')
  }

  const C = '#FF6B35'

  return (
    <div style={s.page}>
      <div style={s.grid} />

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.brand}>
            <span style={{ color: C, fontSize: 22 }}>⬡</span>
            <span style={s.brandText}>Admin Panel</span>
          </div>
          <nav style={s.nav}>
            {['users', 'materials'].map(t => (
              <button
                key={t}
                style={{ ...s.navBtn, ...(tab === t ? { ...s.navActive, borderColor: C, color: C } : {}) }}
                onClick={() => setTab(t)}
              >
                {t === 'users' ? '👥 Manage Users' : '📁 View Materials'}
              </button>
            ))}
          </nav>
        </div>
        <button style={s.logout} onClick={logout}>← Logout</button>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.h1}>{tab === 'users' ? 'User Management' : 'Study Materials'}</h1>
            <p style={s.sub}>Welcome, <strong>{session?.name}</strong></p>
          </div>
          <div style={{ ...s.badge, background: 'rgba(255,107,53,0.15)', color: C }}>⬡ Administrator</div>
        </header>

        {tab === 'users' && (
          <div>
            {/* Add user form */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>Add New User</h2>
              <form onSubmit={handleAddUser} style={s.form}>
                <input style={s.input} placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                <input style={s.input} placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
                <input style={s.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <select style={s.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
                <button type="submit" style={{ ...s.btn, background: C }}>+ Add User</button>
              </form>
              {msg && <p style={s.msg}>{msg}</p>}
            </div>

            {/* Users table */}
            <div style={s.card}>
              <h2 style={s.cardTitle}>All Users ({users.length})</h2>
              {users.length === 0 ? (
                <p style={s.empty}>No users added yet.</p>
              ) : (
                <div style={s.table}>
                  <div style={s.theader}>
                    <span>Name</span><span>Username</span><span>Role</span><span>Action</span>
                  </div>
                  {users.map(u => (
                    <div key={u.username} style={s.trow}>
                      <span>{u.name}</span>
                      <span style={{ fontFamily: 'monospace', color: '#2D9CDB' }}>{u.username}</span>
                      <span>
                        <span style={{
                          background: u.role === 'staff' ? 'rgba(45,156,219,0.15)' : 'rgba(39,174,96,0.15)',
                          color: u.role === 'staff' ? '#2D9CDB' : '#27AE60',
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}>{u.role}</span>
                      </span>
                      <button style={s.delBtn} onClick={() => handleRemoveUser(u.username)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'materials' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>All Materials ({materials.length})</h2>
            {materials.length === 0 ? (
              <p style={s.empty}>No materials uploaded yet.</p>
            ) : (
              <div style={s.table}>
                <div style={s.theader}>
                  <span>Title</span><span>Year</span><span>Subject</span><span>Uploaded By</span><span>Action</span>
                </div>
                {materials.map(m => (
                  <div key={m.id} style={s.trow}>
                    <span>{m.title}</span>
                    <span style={{ color: C }}>Year {m.year}</span>
                    <span>{m.subject}</span>
                    <span style={{ color: '#6B6B80', fontSize: 13 }}>{m.uploadedBy}</span>
                    <button style={s.delBtn} onClick={() => handleRemoveMaterial(m.id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', position: 'relative' },
  grid: {
    position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)`,
    backgroundSize: '60px 60px',
  },
  sidebar: {
    width: 240, background: '#13131A', borderRight: '1px solid rgba(255,255,255,0.06)',
    padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    position: 'sticky', top: 0, height: '100vh', zIndex: 10,
  },
  sideTop: { display: 'flex', flexDirection: 'column', gap: 32 },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandText: { fontWeight: 800, fontSize: 16 },
  nav: { display: 'flex', flexDirection: 'column', gap: 8 },
  navBtn: {
    background: 'transparent', color: '#6B6B80', padding: '12px 16px', borderRadius: 10,
    textAlign: 'left', fontSize: 14, fontWeight: 500, border: '1px solid transparent', transition: 'all 0.2s',
  },
  navActive: { background: 'rgba(255,107,53,0.08)', fontWeight: 600 },
  logout: { background: 'transparent', color: '#6B6B80', fontSize: 13, padding: '10px 0', textAlign: 'left' },
  main: { flex: 1, padding: '36px 40px', zIndex: 1, maxWidth: 900 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 },
  h1: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' },
  sub: { color: '#6B6B80', fontSize: 14, marginTop: 4 },
  badge: { padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  card: { background: '#13131A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 20 },
  form: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  input: {
    background: '#1C1C26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10,
    padding: '12px 14px', color: '#F0F0F5', fontSize: 14, flex: '1 1 160px',
  },
  btn: { padding: '12px 20px', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' },
  msg: { color: '#27AE60', fontSize: 13, marginTop: 14 },
  empty: { color: '#6B6B80', fontSize: 14, padding: '20px 0' },
  table: { display: 'flex', flexDirection: 'column', gap: 2 },
  theader: {
    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr',
    padding: '8px 12px', color: '#6B6B80', fontSize: 12, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.08em',
  },
  trow: {
    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr 1fr',
    padding: '14px 12px', background: '#1C1C26', borderRadius: 10, alignItems: 'center',
    fontSize: 14, marginBottom: 4,
  },
  delBtn: {
    background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)',
    color: '#FF6B6B', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600,
  },
}
