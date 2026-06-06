import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadToCloudinary } from '../../lib/cloudinary'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }

function ImageUploadBox({ value, onChange, size = 80 }) {
  const ref = useRef()
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)

  const handle = async (file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Please select an image file')
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      onChange(url)
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label style={labelStyle}>Service Image</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: size, height: size, borderRadius: '10px', border: '2px dashed #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {uploading ? (
            <div style={{ width: '22px', height: '22px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : value ? (
            <img src={value} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Icon name="photo" size={24} />
          )}
        </div>
        <div
          onClick={() => !uploading && ref.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]) }}
          style={{ flex: 1, border: `2px dashed ${drag ? '#E8000D' : '#e5e7eb'}`, borderRadius: '10px', padding: '14px', cursor: uploading ? 'not-allowed' : 'pointer', textAlign: 'center', background: drag ? '#fff1f2' : '#fafafa', transition: 'all 0.15s' }}
        >
          <div style={{ color: '#9ca3af', marginBottom: '4px' }}><Icon name="upload" size={18} /></div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>
            {uploading ? 'Uploading…' : 'Click or drag to upload'}
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>PNG, JPG, WebP</p>
          <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handle(e.target.files[0])} />
        </div>
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ background: '#fff1f2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', flexShrink: 0 }} title="Remove">
            <Icon name="trash" size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

function ServiceForm({ onSave, onCancel, initial = {} }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    short_description: initial.short_description || '',
    description: initial.description || '',
    image: initial.image || '',
    price_from: initial.price_from?.toString() || '',
    is_active: initial.is_active ?? true,
    sort_order: initial.sort_order?.toString() || '0',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        title: form.title,
        short_description: form.short_description,
        description: form.description,
        image: form.image || null,
        price_from: form.price_from ? parseFloat(form.price_from) : null,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order) || 0,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Service Title *</label>
          <input name="title" required value={form.title} onChange={handleChange} style={inputStyle} placeholder="e.g. Vehicle Wrapping" />
        </div>
        <div>
          <label style={labelStyle}>Starting Price (£)</label>
          <input type="number" step="0.01" name="price_from" value={form.price_from} onChange={handleChange} style={inputStyle} placeholder="0.00" min="0" />
        </div>
        <div>
          <label style={labelStyle}>Display Order</label>
          <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} style={inputStyle} min="0" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <ImageUploadBox value={form.image} onChange={url => setForm(prev => ({ ...prev, image: url }))} size={80} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Short Description</label>
          <textarea name="short_description" rows={2} value={form.short_description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief description shown on cards…" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Full Description</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Detailed service description…" />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#f9fafb', borderRadius: '8px' }}>
          <input type="checkbox" name="is_active" id="is_active_form" checked={form.is_active} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: '#E8000D', cursor: 'pointer' }} />
          <label htmlFor="is_active_form" style={{ fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Active (visible on website)</label>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <button type="submit" disabled={saving} className="btn-red" style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
          <Icon name="save" size={14} /> {saving ? 'Saving…' : 'Save Service'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function ManageServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editId, setEditId] = useState(null)

  useEffect(() => { fetchServices() }, [])

  const fetchServices = async () => {
    setLoading(true)
    setTableError(false)
    try {
      const { data, error } = await supabase.from('services').select('*').order('sort_order').order('created_at')
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setTableError(true)
        } else throw error
      }
      setServices(data || [])
    } catch {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (payload) => {
    try {
      const { data, error } = await supabase.from('services').insert([payload]).select().single()
      if (error) throw error
      toast.success('Service added!')
      setServices(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order))
      setShowAddForm(false)
    } catch (err) {
      toast.error('Failed to add service: ' + err.message)
    }
  }

  const handleUpdate = async (id, payload) => {
    try {
      const { error } = await supabase.from('services').update(payload).eq('id', id)
      if (error) throw error
      toast.success('Service updated!')
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...payload } : s))
      setEditId(null)
    } catch (err) {
      toast.error('Failed to update service: ' + err.message)
    }
  }

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete service "${title}"?`)) return
    try {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      toast.success('Service deleted')
      setServices(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error('Failed to delete service')
    }
  }

  const toggleActive = async (id, current) => {
    try {
      await supabase.from('services').update({ is_active: !current }).eq('id', id)
      setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
      toast.success(`Service ${!current ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (tableError) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Services</h1>
      <div style={{ ...card, padding: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d97706' }}>
            <Icon name="warning" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Services Table Not Found</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px' }}>
              The <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>services</code> table doesn't exist yet.
            </p>
            <button onClick={fetchServices} className="btn-red" style={{ padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="refresh" size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Services</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{services.length} service{services.length !== 1 ? 's' : ''}</p>
        </div>
        {!showAddForm && (
          <button onClick={() => setShowAddForm(true)} className="btn-red" style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="plus" size={15} /> Add Service
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ ...card, padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>New Service</h3>
          <ServiceForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {/* List */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            Loading services…
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <Icon name="services" size={40} />
            <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '12px' }}>No services yet</p>
            <button onClick={() => setShowAddForm(true)} className="btn-red" style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="plus" size={14} /> Add First Service
            </button>
          </div>
        ) : (
          <div>
            {services.map((service, i) => (
              <div key={service.id} style={{ borderBottom: i < services.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                {editId === service.id ? (
                  <div style={{ padding: '20px 24px', background: '#fafafa' }}>
                    <ServiceForm
                      initial={service}
                      onSave={payload => handleUpdate(service.id, payload)}
                      onCancel={() => setEditId(null)}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '16px', padding: '16px 24px', alignItems: 'center', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {service.image ? (
                      <img src={service.image} alt={service.title} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid #e5e7eb' }} />
                    ) : (
                      <div style={{ width: '64px', height: '64px', background: '#f3f4f6', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <Icon name="services" size={24} />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{service.title}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: service.is_active ? '#dcfce7' : '#f3f4f6', color: service.is_active ? '#15803d' : '#6b7280' }}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {service.price_from && (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280' }}>From £{Number(service.price_from).toFixed(2)}</span>
                        )}
                        {!service.image && (
                          <span style={{ fontSize: '10px', color: '#f59e0b', background: '#fffbeb', padding: '1px 6px', borderRadius: '6px', fontWeight: 600 }}>No image</span>
                        )}
                      </div>
                      {service.short_description && (
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                          {service.short_description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => toggleActive(service.id, service.is_active)}
                        style={{ background: service.is_active ? '#fff1f2' : '#dcfce7', color: service.is_active ? '#dc2626' : '#15803d', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {service.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => setEditId(service.id)}
                        style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Icon name="edit" size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.title)}
                        style={{ background: '#fff1f2', color: '#dc2626', border: 'none', padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Icon name="trash" size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
