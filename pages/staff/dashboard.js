import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getSession, clearSession, getMaterials, addMaterial, removeMaterial } from '../../lib/store'

const YEARS = ['1', '2', '3', '4']

export default function StaffDashboard() {
  const router = useRouter()
  const [materials, setMaterials] = useState([])
  const [session, setSessionData] = useState(null)
  const [form, setForm] = useState({ title: '', year: '1', subject: '', content: '', fileUrl: '' })
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState('upload')

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== 'staff') { router.replace('/'); return }
    setSessionData(s)
    refresh()
  }, [])

  function refresh() { setMaterials(getMaterials()) }

  function handleUpload(e) {
    e.preventDefault()
    if (!form.title || !form.subject || !form.content) {
      setMsg('Please fill all fields.')
      return
    }
    addMaterial({ ...form, uploadedBy: session?.name || 'Staff' })
    setForm({ title: '', year: '1', subject: '', content: '', fileUrl: '' })
    setMsg('Material uploaded successfully!')
    refresh()
    setTimeout(() => setMsg(''), 3000)
  }

  function handleDelete(id) {
    removeMaterial(id)
    refresh()
  }

  function logout() { clearSession(); router.push('/') }

  const C = '#2D9CDB'
  const myMaterials = materials.filter(m => m.uploadedBy === session?.name)

  return (
    <div style={s.page}>
      <div style={s.grid} />
      <aside style={s.sidebar}>
        <div style={s.sideTop}>
          <div style={s.brand}>
            <span style={{ color: C, fontSize: 22 }}>◈</span>
            <span style={s.brandText}>Staff Panel</span>
          </div>
          <nav style={s.nav}>
            {[['upload', '📤 Upload Material'], ['mine', '📚 My Uploads']].map(([t, l]) => (
              <button key={t} style={{ ...s.navBtn, ...(tab === t ? { ...s.navActive, borderColor: C, color: C, background: 'rgba(45,156,219,0.08)' } : {}) }} onClick={() => setTab(t)}>{l}</button>
            ))}
          </nav>
        </div>
        <button style={s.logout} onClick={logout}>← Logout</button>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.h1}>{tab === 'upload' ? 'Upload Study Material' : 'My Uploads'}</h1>
            <p style={s.sub}>Welcome, <strong>{session?.name}</strong></p>
          </div>
          <div style={{ ...s.badge, background: 'rgba(45,156,219,0.15)', color: C }}>◈ Staff Member</div>
        </header>

        {tab === 'upload' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>Add New Study Material</h2>
            <form onSubmit={handleUpload} style={s.form}>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Material Title</label>
                  <input style={s.input} placeholder="e.g. Data Structures Notes" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Subject</label>
                  <input style={s.input} placeholder="e.g. Computer Science" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Year</label>
                  <select style={s.input} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                    {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Study Material Content</label>
                <textarea
                  style={{ ...s.input, height: 180, resize: 'vertical', lineHeight: 1.6 }}
                  placeholder="Paste the full study material content here. Students will be able to read and download this..."
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>External Link (optional)</label>
                <input style={s.input} placeholder="https://example.com/resource.pdf" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} />
              </div>
              {msg && <p style={{ color: '#27AE60', fontSize: 13, marginTop: 4 }}>{msg}</p>}
              <button type="submit" style={{ ...s.btn, background: C }}>📤 Upload Material</button>
            </form>
          </div>
        )}

        {tab === 'mine' && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>My Uploads ({myMaterials.length})</h2>
            {myMaterials.length === 0 ? (
              <p style={{ color: '#6B6B80', padding: '20px 0' }}>You haven't uploaded any materials yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {myMaterials.map(m => (
                  <div key={m.id} style={s.matCard}>
                    <div style={s.matLeft}>
                      <div style={s.matTitle}>{m.title}</div>
                      <div style={s.matMeta}>
                        <span style={{ color: C }}>Year {m.year}</span>
                        <span>•</span>
                        <span>{m.subject}</span>
                        <span>•</span>
                        <span style={{ color: '#6B6B80' }}>{new Date(m.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <p style={s.matPreview}>{m.content.slice(0, 120)}…</p>
                    </div>
                    <button style={s.delBtn} onClick={() => handleDelete(m.id)}>Delete</button>
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
  grid: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)`, backgroundSize: '60px 60px' },
  sidebar: { width: 240, background: '#13131A', borderRight: '1px solid rgba(255,255,255,0.06)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'sticky', top: 0, height: '100vh', zIndex: 10 },
  sideTop: { display: 'flex', flexDirection: 'column', gap: 32 },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandText: { fontWeight: 800, fontSize: 16 },
  nav: { display: 'flex', flexDirection: 'column', gap: 8 },
  navBtn: { background: 'transparent', color: '#6B6B80', padding: '12px 16px', borderRadius: 10, textAlign: 'left', fontSize: 14, fontWeight: 500, border: '1px solid transparent', transition: 'all 0.2s' },
  navActive: { fontWeight: 600 },
  logout: { background: 'transparent', color: '#6B6B80', fontSize: 13, padding: '10px 0', textAlign: 'left' },
  main: { flex: 1, padding: '36px 40px', zIndex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 },
  h1: { fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' },
  sub: { color: '#6B6B80', fontSize: 14, marginTop: 4 },
  badge: { padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  card: { background: '#13131A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 24 },
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 200px' },
  label: { fontSize: 12, fontWeight: 600, color: '#6B6B80', letterSpacing: '0.08em', textTransform: 'uppercase' },
  input: { background: '#1C1C26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', color: '#F0F0F5', fontSize: 14, width: '100%' },
  btn: { padding: '14px 24px', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 14, alignSelf: 'flex-start' },
  matCard: { background: '#1C1C26', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  matLeft: { flex: 1 },
  matTitle: { fontWeight: 700, fontSize: 15, marginBottom: 6 },
  matMeta: { display: 'flex', gap: 8, fontSize: 13, marginBottom: 8, alignItems: 'center' },
  matPreview: { color: '#6B6B80', fontSize: 13, lineHeight: 1.5 },
  delBtn: { background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' },
}
