import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getWhyUsSettings, saveWhyUsSettings } from '../../data/whyUsService'
import { uploadToCloudinary } from '../../lib/cloudinary'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }

export default function ManageWhyUs() {
  const [settings, setSettings] = useState({
    badge: '',
    title: '',
    subtitle: '',
    points: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(null) // index of the point being uploaded

  useEffect(() => {
    const data = getWhyUsSettings()
    setSettings(data)
    setLoading(false)
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handlePointChange = (index, field, value) => {
    const updatedPoints = [...settings.points]
    updatedPoints[index] = { ...updatedPoints[index], [field]: value }
    handleChange('points', updatedPoints)
  }

  const handleFileUpload = async (e, index) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(index)
    toast.loading('Uploading image to Cloudinary...', { id: 'upload' })
    
    try {
      const url = await uploadToCloudinary(file)
      handlePointChange(index, 'image', url)
      toast.success(`Point ${index + 1} image uploaded!`, { id: 'upload' })
    } catch (err) {
      toast.error('Upload failed: ' + err.message, { id: 'upload' })
    } finally {
      setUploading(null)
    }
  }

  const handleSave = () => {
    setSaving(true)
    const success = saveWhyUsSettings(settings)
    if (success) {
      toast.success('Why Choose Us settings saved successfully!')
    } else {
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        Loading settings...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Manage Why Partner With Us</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Configure the marketing copy and 4 feature cards inside the "Why Partner With Us" section on the homepage.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        
        {/* Editor form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Section Header Settings */}
          <div style={{ ...card, padding: '28px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
              Section Header Copy
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Section Badge</label>
                <input
                  value={settings.badge}
                  onChange={e => handleChange('badge', e.target.value)}
                  style={inputStyle}
                  placeholder="Why Partner With Us"
                />
              </div>

              <div>
                <label style={labelStyle}>Section Title (Use a comma to split red text, e.g. "Built To Stand Out, Designed To Last")</label>
                <input
                  value={settings.title}
                  onChange={e => handleChange('title', e.target.value)}
                  style={inputStyle}
                  placeholder="Built To Stand Out, Designed To Last"
                />
              </div>
              
              <div>
                <label style={labelStyle}>Section Subtitle</label>
                <textarea
                  value={settings.subtitle}
                  onChange={e => handleChange('subtitle', e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Glasgow's ultimate sign and wrap fabrication team combining quality materials, elite engineering, and custom graphics."
                />
              </div>
            </div>
          </div>

          {/* Points Cards Grid Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '10px 0 4px' }}>Points / Feature Cards (Exactly 4 Cards)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {settings.points.map((point, idx) => (
                <div key={idx} style={{ ...card, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--red)' }}>Card {idx + 1}</span>
                  </div>

                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px', marginBottom: '4px' }}>Card Title</label>
                    <input
                      value={point.title || ''}
                      onChange={e => handlePointChange(idx, 'title', e.target.value)}
                      style={{ ...inputStyle, padding: '8px 12px' }}
                      placeholder="e.g. Fast & Reliable Turnaround"
                    />
                  </div>

                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px', marginBottom: '4px' }}>Card Description</label>
                    <textarea
                      value={point.desc || ''}
                      onChange={e => handlePointChange(idx, 'desc', e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px', resize: 'vertical' }}
                      placeholder="Enter description copy..."
                    />
                  </div>

                  <div>
                    <label style={{ ...labelStyle, fontSize: '12px', marginBottom: '4px' }}>Card Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                      {point.image ? (
                        <img
                          src={point.image}
                          alt={`Card ${idx + 1}`}
                          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                        />
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>No image</span>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ position: 'relative', marginTop: '4px' }}>
                          <input
                            id={`point-upload-${idx}`}
                            type="file"
                            accept="image/*"
                            onChange={e => handleFileUpload(e, idx)}
                            disabled={uploading !== null}
                            style={{ display: 'none' }}
                          />
                          <label
                            htmlFor={`point-upload-${idx}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: uploading === idx ? '#f3f4f6' : '#ffffff',
                              border: '1.5px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: uploading !== null ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#374151',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                              if (uploading === null) {
                                e.currentTarget.style.borderColor = 'var(--red)';
                                e.currentTarget.style.background = '#fcf8f8';
                              }
                            }}
                            onMouseLeave={e => {
                              if (uploading === null) {
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.background = '#ffffff';
                              }
                            }}
                          >
                            <span>{uploading === idx ? '⏳ Uploading...' : '🖼️ Upload Card Image'}</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-red"
              style={{ padding: '12px 32px', fontSize: '14px', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Section Settings'}
            </button>
          </div>

        </div>

        {/* Sidebar Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ ...card, padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Live Preview (First Card)</h4>
            <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6' }}>
                {settings.points?.[0]?.image ? (
                  <img src={settings.points[0].image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#e5e7eb' }} />
                )}
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '30px', height: '30px', background: '#fff', borderRadius: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--red)' }}>⏱️</span>
                </div>
              </div>
              <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: 0 }}>
                {settings.points?.[0]?.title || 'Card Title'}
              </h5>
              <p style={{ fontSize: '12px', color: '#4b5563', margin: 0, lineHeight: 1.4 }}>
                {settings.points?.[0]?.desc || 'Card description text.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
