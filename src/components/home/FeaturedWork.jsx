import { useState, useEffect, useRef, useCallback } from 'react'

const slides = [
  { src: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg', alt: 'Client Work 1' },
  { src: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg', alt: 'Client Work 2' },
  { src: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg', alt: 'Client Work 3' },
  { src: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg', alt: 'Client Work 4' },
  { src: '/images/client-images/car2.jpg', alt: 'Client Work 5' },
  { src: '/images/client-images/van_wrapping.jpg', alt: 'Client Work 6' },
  { src: '/images/client-images/van_wrapping_2.webp', alt: 'Client Work 7' },
]

export default function FeaturedWork() {
  const [idx, setIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  const total = slides.length
  const autoRef = useRef(null)
  const trackRef = useRef(null)
  const touchStartX = useRef(0)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % total)
    }, 4000)
  }, [total])

  useEffect(() => {
    resetAuto()
    return () => clearInterval(autoRef.current)
  }, [resetAuto])

  const goTo = (i) => { setIdx(i); resetAuto() }
  const slide = (dir) => { setIdx(prev => (prev + dir + total) % total); resetAuto() }

  const getStyle = (i) => {
    let diff = i - idx
    if (diff > total / 2) diff -= total
    if (diff < -total / 2) diff += total

    const base = { transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s' }
    if (diff === 0) return { ...base, transform: 'translateX(0) scale(1) rotateY(0deg)', zIndex: 3, opacity: 1, pointerEvents: 'auto' }
    if (diff === -1) return { ...base, transform: 'translateX(-65%) scale(0.85) rotateY(35deg)', zIndex: 2, opacity: 1, pointerEvents: 'auto' }
    if (diff === 1) return { ...base, transform: 'translateX(65%) scale(0.85) rotateY(-35deg)', zIndex: 2, opacity: 1, pointerEvents: 'auto' }
    if (diff < -1) return { ...base, transform: 'translateX(-100%) scale(0.7) rotateY(45deg)', zIndex: 1, opacity: 0, pointerEvents: 'none' }
    return { ...base, transform: 'translateX(100%) scale(0.7) rotateY(-45deg)', zIndex: 1, opacity: 0, pointerEvents: 'none' }
  }

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX }
  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX
    if (diff > 50) slide(1)
    if (diff < -50) slide(-1)
  }

  return (
    <section className="featured-section" id="portfolio">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-eyebrow">Portfolio</span>
          <h2 className="section-title">Featured <span className="red">Work</span></h2>
        </div>

        {isMobile ? (
          /* ── Mobile: flat swipeable slider, full landscape image visible ── */
          <div style={{ marginTop: '28px' }}>
            <div
              style={{ overflow: 'hidden', borderRadius: '12px' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div style={{
                display: 'flex',
                transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: `translateX(-${idx * 100}%)`
              }}>
                {slides.map((s, i) => (
                  <div key={i} style={{ flex: '0 0 100%', borderRadius: '12px', overflow: 'hidden' }}>
                    <img
                      src={s.src}
                      alt={s.alt}
                      style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="feat-dots" style={{ marginTop: '16px' }}>
              {slides.map((_, i) => (
                <div key={i} className={`feat-dot ${i === idx ? 'active' : ''}`} onClick={() => goTo(i)} />
              ))}
            </div>
          </div>
        ) : (
          /* ── Desktop: 3D coverflow ── */
          <div style={{ position: 'relative' }}>
            <div className="featured-slider-wrap">
              <div
                className="featured-track"
                ref={trackRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {slides.map((s, i) => (
                  <div
                    className="featured-slide"
                    key={i}
                    style={getStyle(i)}
                    onClick={() => i !== idx && goTo(i)}
                  >
                    <img src={s.src} alt={s.alt} />
                  </div>
                ))}
              </div>
            </div>
            <button className="feat-arr prev" onClick={() => slide(-1)} aria-label="Previous">&#8249;</button>
            <button className="feat-arr next" onClick={() => slide(1)} aria-label="Next">&#8250;</button>
            <div className="feat-dots">
              {slides.map((_, i) => (
                <div key={i} className={`feat-dot ${i === idx ? 'active' : ''}`} onClick={() => goTo(i)} />
              ))}
            </div>
          </div>
        )}

        <div className="section-footer">
          <a href="#" className="btn-red">View All Projects</a>
        </div>
      </div>
    </section>
  )
}
