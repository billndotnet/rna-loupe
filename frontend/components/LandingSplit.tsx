/**
 * Layout B — "Split Cinematic"
 *
 * Fixed left panel with identity + nav. Right side: full-height rotating images.
 * Below the fold: asymmetric grid sections with category showcases.
 * Bold, architectural typography. Dramatic contrast.
 */

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const GalleryShowcase = React.lazy(() =>
  import('@/module/gallery/frontend/components/GalleryShowcase')
    .catch(() => ({ default: () => null as any }))
)

interface SearchImage {
  image_url: string
  title: string
  caption: string
  keywords: string[]
}

interface GalleryInfo {
  id: string
  name: string
  category?: string
  catalog_id?: string
  published?: boolean
}

export default function LandingSplit() {
  const navigate = useNavigate()
  const [heroImages, setHeroImages] = useState<SearchImage[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [galleries, setGalleries] = useState<GalleryInfo[]>([])
  const [loaded, setLoaded] = useState(false)
  const [hoverCategory, setHoverCategory] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/gallery/search?q=landscape')
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => {
        setHeroImages((d.results || []).slice(0, 10))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))

    fetch('/api/gallery/state')
      .then(r => r.ok ? r.json() : { galleries: [] })
      .then(d => setGalleries((d.galleries || []).filter((g: GalleryInfo) => g.published)))
      .catch(() => {})
  }, [])

  // Simple fade rotation
  useEffect(() => {
    if (heroImages.length <= 1) return
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroImages.length])

  const categories = [...new Set(galleries.map(g => g.category).filter(Boolean))]
  const currentImage = heroImages[activeIdx]

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      {/* ── ABOVE THE FOLD: Split layout ── */}
      <section style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Left panel — fixed identity */}
        <div style={{
          width: 'clamp(320px, 35vw, 480px)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(40px, 5vw, 64px)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Top: logo/name */}
          <div style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 1s ease 0.2s',
          }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
              fontWeight: 100,
              letterSpacing: '0.15em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}>
              Bill
            </div>
            <div style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(2rem, 3.5vw, 3.2rem)',
              fontWeight: 600,
              letterSpacing: '0.15em',
              lineHeight: 1,
              textTransform: 'uppercase',
              color: '#d4a574',
            }}>
              Nash
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginTop: 16,
            }}>
              Photography
            </div>
          </div>

          {/* Center: category nav */}
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease 0.6s',
          }}>
            {categories.map((cat, i) => (
              <div
                key={cat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={() => setHoverCategory(cat)}
                onMouseLeave={() => setHoverCategory(null)}
                onClick={() => {
                  const gal = galleries.find(g => g.category === cat)
                  if (gal) navigate(`/galleries/${gal.id}`)
                }}
              >
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  color: hoverCategory === cat ? '#d4a574' : 'rgba(255,255,255,0.2)',
                  fontFeatureSettings: '"tnum"',
                  transition: 'color 0.3s',
                  width: 20,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 15,
                  fontWeight: 300,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: hoverCategory === cat ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'color 0.3s',
                }}>
                  {cat}
                </span>
                <div style={{
                  flex: 1, height: 1,
                  background: hoverCategory === cat ? '#d4a574' : 'rgba(255,255,255,0.06)',
                  transition: 'background 0.3s',
                }} />
              </div>
            ))}
          </nav>

          {/* Bottom: CTA + copyright */}
          <div style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease 0.8s',
          }}>
            <a href="/contact" style={{
              display: 'inline-block',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: '#d4a574',
              borderBottom: '1px solid rgba(212,165,116,0.3)',
              paddingBottom: 4,
              transition: 'border-color 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#d4a574'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,165,116,0.3)'}
            >
              Inquire
            </a>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 10,
              color: 'rgba(255,255,255,0.15)',
              marginTop: 24,
              letterSpacing: '0.05em',
            }}>
              &copy; {new Date().getFullYear()} Bill Nash
            </div>
          </div>
        </div>

        {/* Right panel — full image */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {heroImages.map((img, i) => (
            <img
              key={i}
              src={img.image_url}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: i === activeIdx ? 1 : 0,
                transition: 'opacity 1.5s ease',
                transform: 'scale(1.02)',
              }}
            />
          ))}

          {/* Subtle vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(10,10,10,0.4) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Image counter */}
          <div style={{
            position: 'absolute', bottom: 32, right: 32,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, color: 'rgba(255,255,255,0.35)',
            fontFeatureSettings: '"tnum"',
            zIndex: 2,
          }}>
            {String(activeIdx + 1).padStart(2, '0')} / {String(heroImages.length).padStart(2, '0')}
          </div>
        </div>
      </section>

      {/* ── BELOW THE FOLD: Showcase ── */}
      <section style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(24px, 5vw, 64px)',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'clamp(200px, 30%, 360px) 1fr',
          gap: 'clamp(32px, 5vw, 80px)',
          alignItems: 'start',
        }}>
          {/* Left: section label */}
          <div style={{ position: 'sticky', top: 120 }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase',
              color: '#d4a574', marginBottom: 16,
            }}>
              Featured
            </div>
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 200,
              letterSpacing: '0.06em',
              lineHeight: 1.2,
              margin: 0,
            }}>
              Recent<br />Work
            </h2>
            <div style={{
              width: 32, height: 1, background: 'rgba(255,255,255,0.15)',
              marginTop: 24,
            }} />
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, lineHeight: 1.8,
              color: 'rgba(255,255,255,0.4)',
              marginTop: 20,
            }}>
              From event photography to fine art landscapes,
              each collection captures a distinct atmosphere and narrative.
            </p>
          </div>

          {/* Right: gallery showcase */}
          <div>
            <Suspense fallback={null}>
              <GalleryShowcase
                rotateInterval={4000}
                headingFont="Outfit"
                bodyFont="DM Sans"
                cardAspectRatio="3/4"
                cardMaxWidth={320}
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ── SERVICES STRIP ── */}
      <section style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 0,
        }}>
          {[
            { label: 'Events', desc: 'Concerts, conferences, launches' },
            { label: 'Portraits', desc: 'Individual and group sessions' },
            { label: 'Landscape', desc: 'Fine art and commercial' },
            { label: 'Prints', desc: 'Gallery-quality reproductions' },
          ].map((svc, i) => (
            <div key={svc.label} style={{
              padding: 'clamp(32px, 4vw, 48px)',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              transition: 'background 0.3s',
              cursor: 'default',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,165,116,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 16, fontWeight: 400,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                {svc.label}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.6,
              }}>
                {svc.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(24px, 5vw, 64px)',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)', marginBottom: 24,
        }}>
          Available for commissions
        </div>
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 100,
          letterSpacing: '0.1em',
          margin: '0 0 40px',
          lineHeight: 1.1,
        }}>
          Have a project<br />
          <span style={{ color: '#d4a574' }}>in mind?</span>
        </h2>
        <a href="/contact" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 40px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          color: '#0a0a0a',
          background: '#d4a574',
          transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e0b88a'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#d4a574'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Start a Conversation
          <span style={{ fontSize: 18, transition: 'transform 0.3s' }}>&rarr;</span>
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '32px clamp(24px, 5vw, 64px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: 1400, margin: '0 auto',
      }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10, color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.08em',
        }}>
          &copy; {new Date().getFullYear()} Bill Nash Photography
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['About', 'Contact', 'Shop'].map(label => (
            <a key={label} href={`/${label.toLowerCase()}`} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none', letterSpacing: '0.08em',
              transition: 'color 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#d4a574'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
