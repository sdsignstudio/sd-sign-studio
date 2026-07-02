import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getGalleryCategories, saveGalleryCategories } from '../../data/galleryCategoriesService'
import { GALLERY_CATEGORY_ICON_OPTIONS, GALLERY_CATEGORY_ICONS } from '../../data/galleryCategoryIcons'
import { uploadToCloudinary } from '../../lib/cloudinary'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111', boxSizing: 'border-box' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }

export default function ManageGalleryCategories() {
  const [categories, setCategories] = useState([])
  const [uploading, setUploading] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCategories(getGalleryCategories())
  }, [])

  const updateCategory = (id, patch) => {
    setCategories(prev => prev.map(category => (
      category.id === id ? { ...category, ...patch } : category
    )))
  }

  const addCategory = () => {
    setCategories(prev => [
      ...prev,
      {
        id: `gallery-category-${Date.now()}`,
        name: 'New Gallery Category',
        icon: 'LayoutGrid',
        image: '',
      },
    ])
  }

  const removeCategory = (id) => {
    if (!window.confirm('Delete this gallery category?')) return
    const updated = categories.filter(category => category.id !== id)
    setCategories(updated)
    if (saveGalleryCategories(updated)) {
      toast.success('Gallery category deleted')
    } else {
      toast.error('Failed to delete gallery category')
    }
  }

  const handleImageUpload = async (e, id) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(id)
    toast.loading('Uploading category image...', { id: 'gallery-category-upload' })

    try {
      const url = await uploadToCloudinary(file)
      updateCategory(id, { image: url })
      toast.success('Category image uploaded', { id: 'gallery-category-upload' })
    } catch (err) {
      toast.error('Upload failed: ' + err.message, { id: 'gallery-category-upload' })
    } finally {
      setUploading(null)
      e.target.value = ''
    }
  }

  const handleSave = () => {
    setSaving(true)
    const success = saveGalleryCategories(categories)
    if (success) toast.success('Gallery categories saved')
    else toast.error('Failed to save gallery categories')
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Gallery Categories</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            Manage the category cards shown on the public Gallery page.
          </p>
        </div>
        <button type="button" onClick={addCategory} className="btn-red" style={{ border: 'none', cursor: 'pointer' }}>
          Add Category
        </button>
      </div>

      <div style={{ ...card, padding: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
          {categories.map((category) => {
            const CategoryIcon = GALLERY_CATEGORY_ICONS[category.icon] || GALLERY_CATEGORY_ICONS.LayoutGrid

            return (
              <div key={category.id} style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '16px', background: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    {category.image ? (
                      <img src={category.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <CategoryIcon size={34} color="#E8000D" strokeWidth={1.9} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Preview</div>
                    <div style={{ fontSize: '15px', color: '#111827', fontWeight: 800, lineHeight: 1.25, marginTop: '3px' }}>{category.name}</div>
                  </div>
                  <button type="button" onClick={() => removeCategory(category.id)} style={{ border: 'none', background: '#fff1f2', color: '#dc2626', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Category Name</label>
                    <input
                      value={category.name}
                      onChange={e => updateCategory(category.id, { name: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Lucide Icon</label>
                    <select
                      value={category.icon}
                      onChange={e => updateCategory(category.id, { icon: e.target.value })}
                      style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}
                    >
                      {GALLERY_CATEGORY_ICON_OPTIONS.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Category Image</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        id={`gallery-category-image-${category.id}`}
                        type="file"
                        accept="image/*"
                        onChange={e => handleImageUpload(e, category.id)}
                        disabled={uploading !== null}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`gallery-category-image-${category.id}`} style={{ border: '1.5px solid #d1d5db', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', fontWeight: 800, color: '#374151', cursor: uploading ? 'not-allowed' : 'pointer', background: '#fff' }}>
                        {uploading === category.id ? 'Uploading...' : 'Upload Image'}
                      </label>
                      {category.image && (
                        <button type="button" onClick={() => updateCategory(category.id, { image: '' })} style={{ border: 'none', background: '#fff1f2', color: '#dc2626', borderRadius: '8px', padding: '9px 12px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                          Clear Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-red" style={{ border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save Gallery Categories'}
        </button>
      </div>
    </div>
  )
}
