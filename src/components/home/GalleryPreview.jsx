import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { HOME_GALLERY_PREVIEW } from '../../data/galleryMedia'

const getMediaUrl = (item) => item.src || item.image || item.media_url
const getMediaType = (item) => {
  if (item.mediaType || item.media_type) return item.mediaType || item.media_type
  const url = getMediaUrl(item) || ''
  return /\.(mp4|webm|ogg|mov)$/i.test(url) ? 'video' : 'image'
}

function PreviewCard({ item, index }) {
  const isVideo = getMediaType(item) === 'video'
  const mediaUrl = getMediaUrl(item)

  return (
    <Link
      to={`/gallery?category=${encodeURIComponent(item.category)}`}
      className="gallery-preview-card"
      style={{ '--delay': `${index * 80}ms` }}
    >
      <div className="gallery-preview-media">
        {isVideo ? (
          <>
            <video
              src={mediaUrl}
              poster={item.fallback}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling.style.display = 'block'
              }}
            />
            <img src={item.fallback} alt="" style={{ display: 'none' }} />
          </>
        ) : (
          <img src={mediaUrl || item.fallback} alt="" />
        )}
        <div className="gallery-preview-shade" />
        <div className="gallery-preview-label">
          <span>{item.category}</span>
        </div>
      </div>
    </Link>
  )
}

export default function GalleryPreview() {
  const [previewItems, setPreviewItems] = useState(HOME_GALLERY_PREVIEW)

  useEffect(() => {
    let cancelled = false

    async function loadPreview() {
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      if (!cancelled && data?.length > 0) {
        setPreviewItems(data.map(item => ({
          ...item,
          src: item.media_url || item.image,
          mediaType: item.media_type,
          fallback: item.media_type === 'image' ? (item.media_url || item.image) : HOME_GALLERY_PREVIEW[0]?.fallback,
        })))
      }
    }

    loadPreview()
    return () => { cancelled = true }
  }, [])

  if (previewItems.length === 0) return null

  return (
    <section className="gallery-preview-section">
      <div className="gallery-preview-inner">
        <div className="gallery-preview-heading">
          <span className="section-eyebrow">Latest Work</span>
          <h2 className="section-title">Gallery <span className="red">Preview</span></h2>
          <p>
            A quick look at recent wraps, shopfronts, sign boards, and illuminated installations.
          </p>
        </div>

        <div className="gallery-preview-grid">
          {previewItems.map((item, index) => (
            <PreviewCard key={getMediaUrl(item) || item.id} item={item} index={index} />
          ))}
        </div>

        <div className="section-footer">
          <Link to="/gallery" className="btn-red">View Full Gallery</Link>
        </div>
      </div>
    </section>
  )
}
