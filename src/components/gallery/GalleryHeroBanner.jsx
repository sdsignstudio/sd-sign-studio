import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGalleryBannerSettings } from '../../data/galleryBannerService'

const isVideoUrl = (url) => {
  if (!url) return false
  return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.includes('video')
}

export default function GalleryHeroBanner() {
  const [settings, setSettings] = useState(getGalleryBannerSettings())
  const [activeMode, setActiveMode] = useState(() => settings.videoUrl ? 'video' : 'slideshow')
  const [currentSlide, setCurrentSlide] = useState(0)
  const videoRefs = useRef([])

  const slides = useMemo(() => settings.slides || [], [settings.slides])
  const hasVideo = settings.mediaType === 'video' && Boolean(settings.videoUrl)
  const hasSlides = (settings.mediaType !== 'video' || !hasVideo) && slides.length > 0

  useEffect(() => {
    const handleUpdate = () => setSettings(getGalleryBannerSettings())
    window.addEventListener('gallery-banner-settings-updated', handleUpdate)
    return () => window.removeEventListener('gallery-banner-settings-updated', handleUpdate)
  }, [])

  useEffect(() => {
    if (hasVideo && hasSlides) {
      if (activeMode === 'video') {
        const timer = setTimeout(() => {
          setActiveMode('slideshow')
          setCurrentSlide(0)
        }, 7000)
        return () => clearTimeout(timer)
      }

      const timer = setInterval(() => {
        setCurrentSlide(prev => {
          if (prev >= slides.length - 1) {
            setActiveMode('video')
            return 0
          }
          return prev + 1
        })
      }, 3200)
      return () => clearInterval(timer)
    }

    if (hasVideo) setActiveMode('video')
    else if (hasSlides) setActiveMode('slideshow')
  }, [activeMode, hasSlides, hasVideo, slides.length])

  useEffect(() => {
    const activeVideo = activeMode === 'video'
      ? videoRefs.current[0]
      : videoRefs.current[currentSlide + 1]
    activeVideo?.play().catch(() => {})
  }, [activeMode, currentSlide])

  return (
    <section className="gallery-hero-banner">
      <div className="gallery-hero-media">
        {hasVideo && (
          <video
            ref={el => videoRefs.current[0] = el}
            src={settings.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            style={{ opacity: activeMode === 'video' ? 1 : 0 }}
          />
        )}

        {hasSlides && slides.map((slide, idx) => {
          const mediaUrl = slide.image || slide
          const active = activeMode === 'slideshow' && idx === currentSlide
          return isVideoUrl(mediaUrl) ? (
            <video
              key={`gallery-hero-video-${idx}`}
              ref={el => videoRefs.current[idx + 1] = el}
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{ opacity: active ? 1 : 0 }}
            />
          ) : (
            <img
              key={`gallery-hero-image-${idx}`}
              src={mediaUrl}
              alt=""
              style={{ opacity: active ? 1 : 0 }}
            />
          )
        })}
      </div>

      <div className="gallery-hero-overlay" />
      <div className="gallery-hero-content">
        <span className="hero-eyebrow">Project Gallery</span>
        <h1>Our Gallery</h1>
        <p>Explore recent vehicle wraps, storefront installations, illuminated signage, and custom print projects.</p>
        <div className="shop-breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <span>Gallery</span>
        </div>
      </div>
    </section>
  )
}
