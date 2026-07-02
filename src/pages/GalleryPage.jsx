import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CtaBand from '../components/home/CtaBand'
import GalleryHeroBanner from '../components/gallery/GalleryHeroBanner'
import { ALL_LOCAL_GALLERY_MEDIA } from '../data/galleryMedia'
import { getGalleryCategories } from '../data/galleryCategoriesService'
import { GALLERY_CATEGORY_ICONS } from '../data/galleryCategoryIcons'

const getMediaUrl = (item) => item.src || item.image || item.media_url
const getMediaType = (item) => {
  if (item.mediaType || item.media_type) return item.mediaType || item.media_type
  const url = getMediaUrl(item) || ''
  return /\.(mp4|webm|ogg|mov)$/i.test(url) ? 'video' : 'image'
}

function GalleryVideoTile({ item }) {
  const videoRef = useRef(null)
  const [canLoad, setCanLoad] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35
      setIsVisible(visible)
      if (visible) setCanLoad(true)
    }, { threshold: [0, 0.35, 0.7] })

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (canLoad && isVisible) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [canLoad, isVisible])

  return (
    <video
      ref={videoRef}
      className="gallery-grid-video"
      src={canLoad ? getMediaUrl(item) : undefined}
      muted
      loop
      playsInline
      preload="none"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.4s ease'
      }}
    />
  )
}

const INITIAL_GALLERY_ITEMS = 12
const GALLERY_PAGE_SIZE = 12

export default function GalleryPage() {
  const location = useLocation()
  const initialCategory = new URLSearchParams(location.search).get('category') || 'all'
  const [activeTab, setActiveTab] = useState(initialCategory)
  const [selectedImage, setSelectedImage] = useState(null)
  const [galleryItems, setGalleryItems] = useState([])
  const [galleryCategories, setGalleryCategories] = useState(() => getGalleryCategories())
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(INITIAL_GALLERY_ITEMS)

  useEffect(() => {
    window.scrollTo(0, 0)
    async function loadData() {
      try {
        const galRes = await supabase.from('gallery').select('*')
        setGalleryItems(galRes.data || [])
      } catch (err) {
        console.error("Failed to load gallery:", err)
        setGalleryItems([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const handleUpdate = () => setGalleryCategories(getGalleryCategories())
    const handleStorage = (event) => {
      if (event.key === 'gallery_categories') handleUpdate()
    }
    window.addEventListener('gallery-categories-updated', handleUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('gallery-categories-updated', handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const categoryNames = galleryCategories.map(category => category.name)
  const localGalleryItems = ALL_LOCAL_GALLERY_MEDIA.map((item, index) => {
    const categoryName = categoryNames[index % categoryNames.length] || item.category
    return { ...item, category: categoryName, title: categoryName }
  })
  const allGalleryItems = [...galleryItems, ...localGalleryItems]
  const categoryCards = [
    { id: 'all', name: 'All Work', value: 'all', icon: 'LayoutGrid', image: '' },
    ...galleryCategories.map(category => ({ ...category, value: category.name })),
  ]

  const filteredItems = activeTab === 'all'
    ? allGalleryItems
    : allGalleryItems.filter(item => item.category === activeTab)
  const visibleItems = filteredItems.slice(0, visibleCount)

  useEffect(() => {
    setVisibleCount(INITIAL_GALLERY_ITEMS)
  }, [activeTab])

  return (
    <>
      <div style={{ background: '#fff', minHeight: '100vh' }}>
        <GalleryHeroBanner />

        <section className="gallery-category-section">
          <div className="gallery-category-inner">
            <div className="gallery-category-grid">
              {categoryCards.map(item => {
                const Icon = GALLERY_CATEGORY_ICONS[item.icon] || GALLERY_CATEGORY_ICONS.LayoutGrid
                const active = activeTab === item.value

                return (
                  <button
                    key={item.value}
                    type="button"
                    className={`gallery-category-card${active ? ' active' : ''}`}
                    onClick={() => setActiveTab(item.value)}
                  >
                    {item.image ? (
                      <img className="gallery-category-image" src={item.image} alt="" />
                    ) : (
                      <Icon className="gallery-category-icon" strokeWidth={1.9} />
                    )}
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <div style={{ maxWidth: '1200px', margin: '36px auto 120px', padding: '0 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '60px' }}>Loading gallery...</div>
          ) : (
            <div className="gallery-media-grid">
              {visibleItems.map(item => (
                <div
                   key={item.id}
                   onClick={() => setSelectedImage(item)}
                   style={{
                     borderRadius: '12px',
                     overflow: 'hidden',
                     background: '#ffffff',
                     border: '1.5px solid #e5e7eb',
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     position: 'relative'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)'
                     e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'
                     const media = e.currentTarget.querySelector('img, .gallery-grid-video')
                     if (media) media.style.transform = 'scale(1.04)'
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = ''
                     e.currentTarget.style.boxShadow = ''
                     const media = e.currentTarget.querySelector('img, .gallery-grid-video')
                     if (media) media.style.transform = ''
                   }}
                >
                  <div style={{ overflow: 'hidden', position: 'relative', aspectRatio: '4/3' }}>
                    {getMediaType(item) === 'video' ? (
                      <GalleryVideoTile item={item} />
                    ) : (
                      <img
                        src={getMediaUrl(item)}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                      />
                    )}
                    {getMediaType(item) === 'video' && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.68)',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '5px 9px',
                        fontSize: '10px',
                        fontWeight: 900,
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}>
                        Video
                      </div>
                    )}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(232,0,13,0.1)',
                      opacity: 0,
                      transition: 'opacity 0.2s'
                    }} className="hover-overlay" />
                  </div>
                  
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-light)', padding: '60px 0' }}>
                  No showcase items found for this category yet.
                </div>
              )}
            </div>
          )}
          {!loading && visibleCount < filteredItems.length && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '34px' }}>
              <button
                type="button"
                className="btn-red"
                onClick={() => setVisibleCount(prev => prev + GALLERY_PAGE_SIZE)}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Load More
              </button>
            </div>
          )}
        </div>

        {/* Lightbox Zoom Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5,5,5,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              padding: '24px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <button
                onClick={() => setSelectedImage(null)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '32px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                &times;
              </button>
              
              {getMediaType(selectedImage) === 'video' ? (
                <video
                  src={getMediaUrl(selectedImage)}
                  controls
                  autoPlay
                  style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                />
              ) : (
                <img
                  src={getMediaUrl(selectedImage)}
                  alt={selectedImage.title}
                  style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                />
              )}
              
            </div>
          </div>
        )}

        <CtaBand />
      </div>
    </>
  )
}
