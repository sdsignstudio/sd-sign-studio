import { Link } from 'react-router-dom'
import { HOME_GALLERY_PREVIEW } from '../../data/galleryMedia'

function PreviewCard({ item, index }) {
  return (
    <Link
      to={`/gallery?category=${encodeURIComponent(item.category)}`}
      className="gallery-preview-card"
      style={{ '--delay': `${index * 80}ms` }}
    >
      <div className="gallery-preview-media">
        <video
          src={item.src}
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
        <div className="gallery-preview-shade" />
        <div className="gallery-preview-label">
          <span>{item.category}</span>
        </div>
      </div>
    </Link>
  )
}

export default function GalleryPreview() {
  if (HOME_GALLERY_PREVIEW.length === 0) return null

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
          {HOME_GALLERY_PREVIEW.map((item, index) => (
            <PreviewCard key={item.src} item={item} index={index} />
          ))}
        </div>

        <div className="section-footer">
          <Link to="/gallery" className="btn-red">View Full Gallery</Link>
        </div>
      </div>
    </section>
  )
}
