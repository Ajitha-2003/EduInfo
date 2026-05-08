import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { getSession, clearSession, getMaterialsByYearAndSubject, getMaterials } from '../../lib/store'

const YEARS = ['1', '2', '3', '4']
const BOT_DELAY = 700

function TypingIndicator() {
  return (
    <div style={cs.botMsg}>
      <div style={cs.avatar}>🤖</div>
      <div style={cs.bubble}>
        <span style={cs.typing}>
          <span style={{ ...cs.dot, animationDelay: '0s' }} />
          <span style={{ ...cs.dot, animationDelay: '0.2s' }} />
          <span style={{ ...cs.dot, animationDelay: '0.4s' }} />
        </span>
      </div>
    </div>
  )
}

function MaterialCard({ m }) {
  function downloadTxt() {
    const blob = new Blob([`${m.title}\nYear: ${m.year} | Subject: ${m.subject}\n\n${m.content}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${m.title.replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div style={cs.matCard}>
      <div style={cs.matHeader}>
        <span style={cs.matTitle}>📄 {m.title}</span>
        <span style={cs.matYear}>Year {m.year}</span>
      </div>
      <p style={cs.matContent}>{m.content}</p>
      <div style={cs.matFooter}>
        {m.fileUrl && (
          <a href={m.fileUrl} target="_blank" rel="noreferrer" style={cs.linkBtn}>🔗 Open Link</a>
        )}
        <button style={cs.dlBtn} onClick={downloadTxt}>⬇ Download</button>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const router = useRouter()
  const [session, setSessionData] = useState(null)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState('idle') // idle | askYear | askSubject | done
  const [pendingYear, setPendingYear] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== 'student') { router.replace('/'); return }
    setSessionData(s)
  }, [])

  useEffect(() => {
    if (open && messages.length === 0) {
      bot(`Hi ${session?.name || 'there'}! 👋 Welcome to EduBot.\n\nI can help you find study materials. Just say *hi* to get started!`)
      setStep('idle')
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (open) inputRef.current?.focus()
  }, [messages, typing, open])

  function bot(text, materials = null) {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text, materials, id: Date.now() }])
    }, BOT_DELAY)
  }

  function handleSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { from: 'user', text, id: Date.now() }])
    setInput('')
    processMessage(text)
  }

  function processMessage(text) {
    const lower = text.toLowerCase().trim()

    if (step === 'idle') {
      if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        setStep('askYear')
        bot(`Hello! 😊 I'm EduBot, your study assistant.\n\nWhich **year** are you in?\nPlease type: *1*, *2*, *3*, or *4*`)
      } else {
        bot(`Just say **hi** to start! I'll help you find study materials. 📚`)
      }
      return
    }

    if (step === 'askYear') {
      const y = text.trim()
      if (!['1', '2', '3', '4'].includes(y)) {
        bot(`Please enter a valid year: **1**, **2**, **3**, or **4**.`)
        return
      }
      setPendingYear(y)
      setStep('askSubject')
      bot(`Great! You're in **Year ${y}**. 🎓\n\nWhat **subject** do you need materials for?\n*(e.g. Mathematics, Physics, Computer Science)*`)
      return
    }

    if (step === 'askSubject') {
      const subject = text.trim()
      const found = getMaterialsByYearAndSubject(pendingYear, subject)
      setStep('done')
      if (found.length === 0) {
        bot(`😕 Sorry, no materials found for **${subject}** in **Year ${pendingYear}**.\n\nTry another subject or ask your staff to upload materials.`)
      } else {
        bot(`Found **${found.length}** material(s) for **${subject}** — Year ${pendingYear}! 📖`, found)
      }
      return
    }

    if (step === 'done') {
      if (lower.includes('another') || lower.includes('more') || lower.includes('different') || lower.includes('search')) {
        setStep('askYear')
        setPendingYear(null)
        bot(`Sure! Let's search again. Which **year** are you in? *(1, 2, 3, or 4)*`)
      } else if (lower.includes('hi') || lower.includes('hello')) {
        setStep('askYear')
        setPendingYear(null)
        bot(`Of course! Which **year** are you in? *(1, 2, 3, or 4)*`)
      } else {
        bot(`Type **"search"** to find more materials, or ask me anything! 😊`)
      }
    }
  }

  function renderText(text) {
    return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
      if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>
      return part
    })
  }

  function logout() { clearSession(); router.push('/') }

  const C = '#27AE60'
  const allMats = getMaterials ? getMaterials() : []

  return (
    <div style={sp.page}>
      <div style={sp.grid} />

      {/* Nav */}
      <nav style={sp.nav}>
        <div style={sp.logo}>
          <span style={{ color: C, fontSize: 20 }}>◎</span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>Student Hub</span>
        </div>
        <div style={sp.navRight}>
          <span style={{ color: '#6B6B80', fontSize: 14 }}>👤 {session?.name}</span>
          <button style={sp.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* Hero */}
      <main style={sp.main}>
        <div style={sp.hero}>
          <div style={{ ...sp.heroBadge, background: 'rgba(39,174,96,0.15)', color: C }}>◎ Student Portal</div>
          <h1 style={sp.heroTitle}>Your Learning<br /><em style={{ color: C }}>Hub</em></h1>
          <p style={sp.heroSub}>Click the chat icon in the bottom right to access study materials via our AI chatbot.</p>
        </div>

        {/* Quick stats */}
        <div style={sp.stats}>
          {[
            { label: 'Available Materials', value: allMats.length, color: C },
            { label: 'Years Covered', value: '4', color: '#2D9CDB' },
            { label: 'Ask the Bot', value: '24/7', color: '#FF6B35' },
          ].map(stat => (
            <div key={stat.label} style={sp.stat}>
              <div style={{ ...sp.statVal, color: stat.color }}>{stat.value}</div>
              <div style={sp.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={sp.tip}>
          <span style={{ fontSize: 24 }}>💬</span>
          <div>
            <strong>How to use EduBot:</strong> Click the floating chat button → Say "Hi" → Select your year → Enter your subject → Get your materials instantly!
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button style={{ ...sp.fab, background: C }} onClick={() => setOpen(!open)}>
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={sp.chatWindow}>
          {/* Header */}
          <div style={{ ...sp.chatHeader, background: C }}>
            <div style={sp.chatHeaderLeft}>
              <span style={sp.botAvatar}>🤖</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>EduBot</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>● Online</div>
              </div>
            </div>
            <button style={sp.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div style={sp.messages}>
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.from === 'bot' ? (
                  <div style={cs.botMsg}>
                    <div style={cs.avatar}>🤖</div>
                    <div style={{ maxWidth: '80%' }}>
                      <div style={cs.bubble}>{renderText(msg.text)}</div>
                      {msg.materials && msg.materials.map(m => <MaterialCard key={m.id} m={m} />)}
                    </div>
                  </div>
                ) : (
                  <div style={cs.userMsg}>
                    <div style={{ ...cs.bubble, ...cs.userBubble, background: C }}>{msg.text}</div>
                  </div>
                )}
              </div>
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={sp.inputRow}>
            <input
              ref={inputRef}
              style={sp.chatInput}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message…"
            />
            <button type="submit" style={{ ...sp.sendBtn, background: C }}>↑</button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

const sp = {
  page: { minHeight: '100vh', position: 'relative', display: 'flex', flexDirection: 'column' },
  grid: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)`, backgroundSize: '60px 60px' },
  nav: { zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  navRight: { display: 'flex', alignItems: 'center', gap: 20 },
  logoutBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0F0F5', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontFamily: 'Sora, sans-serif' },
  main: { zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '60px 24px', width: '100%' },
  hero: { textAlign: 'center', marginBottom: 60 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 },
  heroTitle: { fontSize: 'clamp(40px,6vw,70px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 },
  heroSub: { color: '#6B6B80', fontSize: 16, maxWidth: 500, margin: '0 auto' },
  stats: { display: 'flex', gap: 20, marginBottom: 40, justifyContent: 'center' },
  stat: { background: '#13131A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px 36px', textAlign: 'center', flex: '1 1 160px' },
  statVal: { fontSize: 36, fontWeight: 800, letterSpacing: '-1px' },
  statLabel: { color: '#6B6B80', fontSize: 13, marginTop: 6 },
  tip: { background: '#13131A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.6 },
  fab: { position: 'fixed', bottom: 32, right: 32, width: 60, height: 60, borderRadius: '50%', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100, transition: 'transform 0.2s', cursor: 'pointer' },
  chatWindow: { position: 'fixed', bottom: 104, right: 32, width: 380, height: 540, background: '#13131A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, display: 'flex', flexDirection: 'column', zIndex: 99, boxShadow: '0 20px 80px rgba(0,0,0,0.6)', overflow: 'hidden', animation: 'fadeUp 0.25s ease' },
  chatHeader: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  botAvatar: { fontSize: 24 },
  closeBtn: { background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 28, height: 28, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  inputRow: { padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10 },
  chatInput: { flex: 1, background: '#1C1C26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', color: '#F0F0F5', fontSize: 14, fontFamily: 'Sora, sans-serif' },
  sendBtn: { width: 40, height: 40, borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
}

const cs = {
  botMsg: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  userMsg: { display: 'flex', justifyContent: 'flex-end' },
  avatar: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  bubble: { background: '#1C1C26', borderRadius: '4px 16px 16px 16px', padding: '10px 14px', fontSize: 14, lineHeight: 1.6, color: '#F0F0F5', whiteSpace: 'pre-line' },
  userBubble: { borderRadius: '16px 4px 16px 16px', color: '#fff' },
  typing: { display: 'flex', gap: 4, padding: '4px 0', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#6B6B80', display: 'block', animation: 'blink 1.2s infinite' },
  matCard: { background: '#0A0A0F', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 12, padding: '14px', marginTop: 10 },
  matHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matTitle: { fontWeight: 700, fontSize: 13 },
  matYear: { background: 'rgba(39,174,96,0.15)', color: '#27AE60', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 },
  matContent: { fontSize: 12, lineHeight: 1.6, color: '#A0A0B0', marginBottom: 12, maxHeight: 120, overflowY: 'auto' },
  matFooter: { display: 'flex', gap: 8 },
  dlBtn: { background: 'rgba(39,174,96,0.15)', border: '1px solid rgba(39,174,96,0.3)', color: '#27AE60', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
  linkBtn: { background: 'rgba(45,156,219,0.15)', border: '1px solid rgba(45,156,219,0.3)', color: '#2D9CDB', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, display: 'inline-block' },
}
