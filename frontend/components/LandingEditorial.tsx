/**
 * Layout A — "Editorial Immersive"
 *
 * Full-bleed hero with crossfading landscape images, minimal typography overlay.
 * Gallery showcase section. Category navigation strips. Contact CTA.
 * Dark, cinematic, lots of negative space. Gold accent sparingly.
 */

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'

const GalleryShowcase = React.lazy(() =>
  import('@/module/gallery/frontend/components/GalleryShowcase')
    .catch(() => ({ default: () => null as any }))
)

interface SearchImage {
  image_url: string
  title: string
  caption: string
}

interface GalleryInfo {
  id: string
  name: string
  category?: string
  catalog_id?: string
  published?: boolean
}

export default function LandingEditorial() {
  const navigate = useNavigate()
  const [heroImages, setHeroImages] = useState<SearchImage[]>([])
  const [activeSlot, setActiveSlot] = useState(0)
  const [slots, setSlots] = useState([0, 1])
  const [galleries, setGalleries] = useState<GalleryInfo[]>([])
  const [scrollY, setScrollY] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // Load hero images from landscape search
  useEffect(() => {
    fetch('/api/gallery/search?q=landscape')
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => {
        const imgs = (d.results || []).slice(0, 8)
        setHeroImages(imgs)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))

    fetch('/api/gallery/state')
      .then(r => r.ok ? r.json() : { galleries: [] })
      .then(d => setGalleries((d.galleries || []).filter((g: GalleryInfo) => g.published)))
      .catch(() => {})
  }, [])

  // Crossfade rotation
  const advance = useCallback(() => {
    if (heroImages.length <= 1) return
    const nextIdx = (slots[activeSlot] + 1) % heroImages.length
    const backSlot = activeSlot === 0 ? 1 : 0
    setSlots(prev => {
      const updated = [...prev]
      updated[backSlot] = nextIdx
      return updated
    })
    setTimeout(() => setActiveSlot(backSlot), 60)
  }, [heroImages.length, activeSlot, slots])

  useEffect(() => {
    if (heroImages.length <= 1) return
    const timer = setInterval(advance, 6000)
    return () => clearInterval(timer)
  }, [advance, heroImages.length])

  // Parallax scroll tracking
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const categories = [...new Set(galleries.map(g => g.category).filter(Boolean))]

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Crossfade images */}
        {heroImages.length > 0 && [0, 1].map(slot => {
          const img = heroImages[slots[slot]]
          if (!img) return null
          return (
            <img
              key={slot}
              src={img.image_url}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: slot === activeSlot ? 1 : 0,
                transition: 'opacity 2s ease',
                transform: `scale(1.05) translateY(${scrollY * 0.15}px)`,
              }}
            />
          )
        })}

        {/* Gradient overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.1) 40%, rgba(10,10,10,0.7) 80%, #0a0a0a 100%)',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(10,10,10,0.5) 0%, transparent 50%)',
          zIndex: 1,
        }} />

        {/* Hero content */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: 2,
          padding: 'clamp(32px, 8vw, 96px)',
          paddingBottom: 'clamp(48px, 10vh, 120px)',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1.2s ease 0.3s, transform 1.2s ease 0.3s',
        }}>
          <div style={{
            width: 48, height: 1, background: '#d4a574',
            marginBottom: 24,
          }} />
          <h1 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 200,
            letterSpacing: '0.08em',
            lineHeight: 1.05,
            margin: 0,
            textTransform: 'uppercase',
          }}>
            Bill Nash
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#d4a574',
            marginTop: 12,
            marginBottom: 0,
          }}>
            Photography
          </p>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          opacity: scrollY > 50 ? 0 : 0.5,
          transition: 'opacity 0.5s',
        }}>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' }}>
            Scroll
          </span>
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, #fff, transparent)' }} />
        </div>
      </section>

      {/* ── GALLERY SHOWCASE ── */}
      <section style={{
        padding: 'clamp(64px, 10vh, 120px) clamp(24px, 5vw, 64px)',
        maxWidth: 1400, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vh, 80px)' }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#d4a574',
          }}>
            Selected Work
          </span>
        </div>
        <Suspense fallback={null}>
          <GalleryShowcase
            rotateInterval={5000}
            headingFont="Outfit"
            bodyFont="DM Sans"
            cardAspectRatio="2/3"
            cardMaxWidth={300}
          />
        </Suspense>
      </section>

      {/* ── CATEGORY NAV ── */}
      {categories.length > 0 && (
        <section style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: 'clamp(40px, 5vh, 64px) clamp(24px, 5vw, 64px)',
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 4vw, 64px)',
            flexWrap: 'wrap',
          }}>
            {categories.map(cat => {
              const count = galleries.filter(g => g.category === cat).length
              return (
                <div key={cat} style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    const gal = galleries.find(g => g.category === cat)
                    if (gal) navigate(`/galleries/${gal.id}`)
                  }}
                >
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                    fontWeight: 300,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    transition: 'color 0.3s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#d4a574'}
                    onMouseLeave={e => e.currentTarget.style.color = '#fff'}
                  >
                    {cat}
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11, color: 'rgba(255,255,255,0.3)',
                    marginTop: 6,
                  }}>
                    {count} {count === 1 ? 'gallery' : 'galleries'}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── ABOUT STRIP ── */}
      <section style={{
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 5vw, 64px)',
        maxWidth: 800, margin: '0 auto',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
          fontWeight: 200,
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: '0.02em',
          margin: 0,
        }}>
          Capturing light, shadow, and the quiet moments between.
          From the deserts of Arizona to the peaks of Wyoming,
          every frame tells a story worth preserving.
        </p>
        <div style={{
          width: 32, height: 1, background: '#d4a574',
          margin: '40px auto 0',
        }} />
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(64px, 8vh, 100px) clamp(24px, 5vw, 64px)',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
          fontWeight: 200,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: '0 0 32px',
        }}>
          Let's Create Something
        </h2>
        <a
          href="/contact"
          style={{
            display: 'inline-block',
            padding: '14px 48px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: '#0a0a0a',
            background: '#d4a574',
            borderRadius: 0,
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e0b88a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#d4a574'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Get In Touch
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '40px clamp(24px, 5vw, 64px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.1em',
          margin: 0,
        }}>
          &copy; {new Date().getFullYear()} Bill Nash Photography
        </p>
      </footer>
    </div>
  )
}
