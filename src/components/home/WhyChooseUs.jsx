import { useState, useEffect, useRef } from 'react'
import { getWhyUsSettings } from '../../data/whyUsService'

export default function WhyChooseUs() {
  const [settings, setSettings] = useState(getWhyUsSettings())
  const [itemsPerPage, setItemsPerPage] = useState(3)
  const [startIndex, setStartIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)

  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  useEffect(() => {
    const handleUpdate = () => setSettings(getWhyUsSettings())
    window.addEventListener('why-us-settings-updated', handleUpdate)
    return () => window.removeEventListener('why-us-settings-updated', handleUpdate)
  }, [])

  const points = settings.points || []

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      setIsMobile(w < 640)
      if (w < 640) setItemsPerPage(1)
      else if (w < 960) setItemsPerPage(2)
      else setItemsPerPage(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNext = () => {
    if (startIndex < points.length - itemsPerPage) setStartIndex(prev => prev + 1)
  }
  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(prev => prev - 1)
  }

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
  }

  const totalDots = points.length - itemsPerPage + 1

  return (
    <section className="section" id="why-choose-us" style={{ background: 'linear-gradient(135deg, #fffcfc 0%, #fff5f5 100%)', padding: '90px 0', borderTop: '1px solid #fecaca', borderBottom: '1px solid #fecaca', overflow: 'hidden' }}>
      <div className="section-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>

        {/* Header */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '56px', paddingLeft: isMobile ? '0' : '80px', paddingRight: isMobile ? '0' : '80px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--red)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(232,0,13,0.06)',
            border: '1px solid rgba(232,0,13,0.12)',
            marginBottom: '20px',
            display: 'inline-block'
          }}>
            {settings.badge || "Why Partner With Us"}
          </span>

          <h2 style={{
            fontSize: isMobile ? '36px' : 'clamp(36px, 5vw, 52px)',
            fontWeight: 900,
            color: '#111827',
            lineHeight: 1.15,
            margin: '0 0 20px',
            letterSpacing: '-1.5px'
          }}>
            {settings.title ? (
              <>
                {settings.title.split(',')[0]},<br />
                <span style={{ color: 'var(--red)' }}>{settings.title.split(',')[1] || ''}</span>
              </>
            ) : (
              <>
                Built To Stand Out,<br />
                <span style={{ color: 'var(--red)' }}>Designed To Last</span>
              </>
            )}
          </h2>

          <p style={{ fontSize: '18px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.7, margin: 0, maxWidth: '600px' }}>
            {settings.subtitle || "Glasgow's ultimate sign and wrap fabrication team combining quality materials, elite engineering, and custom graphics."}
          </p>

          {/* Desktop arrows only */}
          {!isMobile && points.length > itemsPerPage && (
            <div style={{ position: 'absolute', right: 0, bottom: 0, display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePrev}
                disabled={startIndex === 0}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '1.5px solid #e5e7eb', background: '#fff', color: '#111827',
                  fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  opacity: startIndex === 0 ? 0.3 : 1,
                  pointerEvents: startIndex === 0 ? 'none' : 'auto'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                &larr;
              </button>
              <button
                onClick={handleNext}
                disabled={startIndex >= points.length - itemsPerPage}
                style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  border: '1.5px solid #e5e7eb', background: '#fff', color: '#111827',
                  fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  opacity: startIndex >= points.length - itemsPerPage ? 0.3 : 1,
                  pointerEvents: startIndex >= points.length - itemsPerPage ? 'none' : 'auto'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{ overflow: 'hidden', margin: '0 -12px', padding: '12px 12px 24px 12px' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div style={{
              display: 'flex',
              gap: '24px',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isMobile
                ? `translateX(calc(-${startIndex} * (82% + 24px)))`
                : `translateX(calc(-${startIndex} * (100% + 24px) / ${itemsPerPage}))`
            }}>
              {points.map((pt, i) => (
                <div
                  key={i}
                  style={{
                    flex: isMobile ? '0 0 82%' : `0 0 calc((100% - ${(itemsPerPage - 1) * 24}px) / ${itemsPerPage})`,
                    background: '#f9f9f9',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    transition: 'transform 0.3s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)'
                    e.currentTarget.style.borderColor = 'rgba(232,0,13,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = ''
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'
                  }}
                >
                  <img src={pt.image} alt={pt.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                  <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--black)', marginBottom: '16px', lineHeight: 1.2 }}>
                      {pt.title}
                    </h3>
                    <p style={{ fontSize: '18px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.7, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          {totalDots > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              {Array.from({ length: totalDots }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStartIndex(i)}
                  style={{
                    width: i === startIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === startIndex ? 'var(--red)' : 'rgba(232,0,13,0.2)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
