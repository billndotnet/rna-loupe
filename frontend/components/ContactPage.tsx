import React, { useState, useEffect } from 'react'

interface ThemeConfig {
  background_color?: string
  text_color?: string
  accent_color?: string
  heading_font?: string
  body_font?: string
  logo_url?: string
  site_title?: string
}

export default function ContactPage() {
  const [theme, setTheme] = useState<ThemeConfig>({})
  const [form, setForm] = useState({ name: '', email: '', phone: '', event_type: '', event_date: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cms/snippets')
      .then(r => r.ok ? r.json() : [])
      .then(snippets => {
        const ts = snippets.find((s: any) => s.slug === 'site-theme')
        if (ts) try { setTheme(JSON.parse(ts.content)) } catch {}
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const resp = await fetch('/api/loupe/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (resp.ok) {
        setSubmitted(true)
      } else {
        const data = await resp.json()
        setError(data.error?.message || 'Failed to send message')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const bg = theme.background_color || '#0a0a0a'
  const text = theme.text_color || '#fff'
  const accent = theme.accent_color || '#d4a574'
  const headingFont = theme.heading_font || 'Playfair Display'
  const bodyFont = theme.body_font || 'Inter'

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6, color: text,
    fontSize: 15, fontFamily: `'${bodyFont}', sans-serif`,
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 24px' }}>
        <h1 style={{
          fontFamily: `'${headingFont}', serif`,
          fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          margin: '0 0 8px', textAlign: 'center',
        }}>Contact</h1>
        <p style={{
          fontFamily: `'${bodyFont}', sans-serif`,
          fontSize: 15, color: 'rgba(255,255,255,0.5)',
          textAlign: 'center', margin: '0 0 40px',
        }}>
          Interested in prints, licensing, or booking a shoot? Let's talk.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{
              fontFamily: `'${headingFont}', serif`,
              fontWeight: 400, fontSize: 24, margin: '0 0 8px',
            }}>Message Sent</h2>
            <p style={{
              fontFamily: `'${bodyFont}', sans-serif`,
              fontSize: 15, color: 'rgba(255,255,255,0.6)',
            }}>Thank you! I'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: '10px 16px', marginBottom: 16,
                background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)',
                borderRadius: 6, color: '#ff6b6b', fontSize: 14,
                fontFamily: `'${bodyFont}', sans-serif`,
              }}>{error}</div>
            )}

            <div style={{ marginBottom: 16 }}>
              <input
                required placeholder="Your name *"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                required type="email" placeholder="Email address *"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                placeholder="Phone (optional)"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <select
                value={form.event_type}
                onChange={e => setForm({ ...form, event_type: e.target.value })}
                style={{ ...inputStyle, flex: 1, appearance: 'none' }}
              >
                <option value="">Type of inquiry</option>
                <option value="print">Print Purchase</option>
                <option value="licensing">Licensing</option>
                <option value="event">Event Photography</option>
                <option value="portrait">Portrait Session</option>
                <option value="commercial">Commercial Work</option>
                <option value="other">Other</option>
              </select>
              <input
                type="date" placeholder="Date (if applicable)"
                value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <textarea
                required placeholder="Your message *" rows={5}
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <button
              type="submit" disabled={submitting}
              style={{
                width: '100%', padding: '14px',
                background: accent, color: bg,
                border: 'none', borderRadius: 6,
                fontSize: 15, fontWeight: 600,
                fontFamily: `'${bodyFont}', sans-serif`,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
