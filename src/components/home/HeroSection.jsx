import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getHeroSettings } from '../../data/heroService'

export default function HeroSection() {
  const [settings, setSettings] = useState(getHeroSettings())
  const [currentSlide, setCurrentSlide] = useState(0)
  const videoRef = useRef(null)

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getHeroSettings())
    }
    window.addEventListener('hero-settings-updated', handleUpdate)
    return () => window.removeEventListener('hero-settings-updated', handleUpdate)
  }, [])

  useEffect(() => {
    if (!settings.slides?.length) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % settings.slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [settings.slides])

  // Force play background video on load/change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Video autoplay blocked by browser or failed to load:", err)
      })
    }
  }, [settings.videoUrl])

  const activeHeadline = (settings.slides?.[currentSlide])
    ? settings.slides[currentSlide].headline
    : settings.headline

  const activeSubheadline = (settings.slides?.[currentSlide])
    ? settings.slides[currentSlide].description
    : settings.subheadline

  return (
    <section className="hero" id="hero" style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 'var(--nav-h)', paddingBottom: '0px', background: 'var(--black)' }}>
      
      {/* Sleek separator line at the bottom of hero */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, var(--red), #ff4d4d, var(--red))', zIndex: 10 }} />
      
      {/* Background Media - Ambient Loop Video or Slideshow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {settings.mediaType === 'video' && settings.videoUrl ? (
          <video
            ref={videoRef}
            src={settings.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.45 }}
          />
        ) : (
          settings.slides?.map((slide, idx) => (
            <img
              key={'bg-' + (slide.image || idx) + idx}
              src={slide.image || slide}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: idx === currentSlide ? 0.3 : 0,
                transition: 'opacity 1s ease-in-out',
                filter: 'brightness(0.6)'
              }}
            />
          ))
        )}
      </div>

      <div className="hero-slide" style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', minHeight: 'auto', background: 'transparent' }}>
        {/* Overlay gradient - fades from dark block on left to transparent on right to see the video */}
        <div className="hero-overlay" style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.7) 45%, rgba(10,10,10,0.25) 100%)' }}></div>
        
        <div className="hero-content" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center', width: '100%' }}>
          
          {/* Left Column: Headline and CTA */}
          <div style={{ textAlign: 'left', padding: '0px' }}>
            <div className="hero-eyebrow" style={{ background: 'rgba(232,0,13,0.12)', border: '1px solid rgba(232,0,13,0.3)', color: 'var(--red)' }}>
              Signage &amp; Wrapping Studio
            </div>
            <h1 className="hero-headline" style={{ 
              fontWeight: 900, 
              color: 'var(--white)', 
              fontSize: 'clamp(40px, 5.5vw, 64px)', 
              lineHeight: '1.1',
              letterSpacing: '-1.5px',
              margin: '16px 0 24px' 
            }}>
              {settings.headline}
            </h1>
            <p className="hero-sub" style={{ 
              fontSize: '18px', 
              color: 'var(--text-light)', 
              maxWidth: '560px', 
              marginBottom: '36px', 
              lineHeight: 1.6 
            }}>
              {settings.subheadline}
            </p>
            
            <div className="hero-btns" style={{ display: 'flex', gap: '16px', marginBottom: '0' }}>
              <Link to="/quote" className="btn-red" style={{ boxShadow: '0 4px 12px rgba(232,0,13,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Get a Free Quote
              </Link>
              <Link to="/gallery" className="btn-outline" style={{ border: '2px solid rgba(255,255,255,0.2)', color: 'var(--white)' }}>
                View Our Work
              </Link>
            </div>
          </div>

          {/* Right Column: Sliding Project Showcase Card */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
            <div style={{
              background: 'var(--gray)',
              border: '1.5px solid rgba(255,255,255,0.05)',
              borderRadius: '20px',
              padding: '16px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              position: 'relative'
            }}>
              
              {/* Image Slideshow Frame */}
              <div style={{
                position: 'relative',
                aspectRatio: '4/3',
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.05)',
                background: 'var(--black)'
              }}>
                {settings.slides?.map((slide, idx) => (
                  <img
                    key={(slide.image || idx) + idx}
                    src={slide.image || slide}
                    alt={`Showcase Work ${idx + 1}`}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: idx === currentSlide ? 1 : 0,
                      transform: idx === currentSlide ? 'scale(1)' : 'scale(1.03)',
                      transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                    }}
                  />
                ))}
              </div>

              {/* Tag indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                  {settings.slides?.[currentSlide]?.headline || "Live Project Portfolio"}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)' }}>
                  Slide {currentSlide + 1} of {settings.slides?.length || 0}
                </span>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: '8px 0 0', lineHeight: 1.5, fontWeight: 500 }}>
                {settings.slides?.[currentSlide]?.caption || settings.slides?.[currentSlide]?.description || "Fabricating storefront signs, custom commercial vehicle decals, and wide-format printing across Glasgow."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
