import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }

const SQL_SETUP = `CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  rating INTEGER DEFAULT 5,
  text TEXT NOT NULL,
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`

const EMPTY_FORM = { name: '', role: '', company: '', rating: '5', text: '', avatar: '', is_active: true }

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n.toString())}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '22px', color: n <= parseInt(value) ? '#f59e0b' : '#d1d5db' }}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => { fetchTestimonials() }, [])

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setTableError(true)
        } else throw error
      }
      setTestimonials(data || [])
    } catch {
      toast.error('Failed to load testimonials')
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => { setForm({ ...EMPTY_FORM }); setEditId(null); setShowForm(true) }
  const openEdit = (t) => { setForm({ name: t.name, role: t.role || '', company: t.company || '', rating: t.rating?.toString() || '5', text: t.text, avatar: t.avatar || '', is_active: t.is_active }); setEditId(t.id); setShowForm(true) }

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const payload = { ...form, rating: parseInt(form.rating) || 5 }
      if (editId) {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', editId)
        if (error) throw error
        setTestimonials(prev => prev.map(t => t.id === editId ? { ...t, ...payload } : t))
        toast.success('Testimonial updated!')
      } else {
        const { data, error } = await supabase.from('testimonials').insert([payload]).select().single()
        if (error) throw error
        setTestimonials(prev => [data, ...prev])
        toast.success('Testimonial added!')
      }
      setShowForm(false)
      setEditId(null)
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete testimonial from "${name}"?`)) return
    try {
      await supabase.from('testimonials').delete().eq('id', id)
      setTestimonials(prev => prev.filter(t => t.id !== id))
      toast.success('Testimonial deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleActive = async (id, current) => {
    try {
      await supabase.from('testimonials').update({ is_active: !current }).eq('id', id)
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, is_active: !current } : t))
      toast.success(`Testimonial ${!current ? 'shown' : 'hidden'}`)
    } catch {
      toast.error('Failed to update')
    }
  }

  if (tableError) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Testimonials</h1>
      <div style={{ ...card, padding: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d97706' }}>
            <Icon name="warning" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Testimonials Table Not Found</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>Create this table in your Supabase SQL Editor:</p>
            <pre style={{ background: '#1f2937', color: '#e5e7eb', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: 1.6 }}>{SQL_SETUP}</pre>
            <button onClick={fetchTestimonials} className="btn-red" style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="refresh" size={14} /> Retry After Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Testimonials</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{testimonials.length} testimonial{testimonials.length !== 1 ? 's' : ''} &bull; {testimonials.filter(t => t.is_active).length} active</p>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="btn-red" style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="plus" size={15} /> Add Testimonial
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
            {editId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Customer Name *</label>
                <input name="name" required value={form.name} onChange={handleChange} style={inputStyle} placeholder="John Smith" />
              </div>
              <div>
                <label style={labelStyle}>Role / Title</label>
                <input name="role" value={form.role} onChange={handleChange} style={inputStyle} placeholder="Business Owner" />
              </div>
              <div>
                <label style={labelStyle}>Company</label>
                <input name="company" value={form.company} onChange={handleChange} style={inputStyle} placeholder="Smith Ltd" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Rating</label>
              <StarRating value={form.rating} onChange={val => setForm(prev => ({ ...prev, rating: val }))} />
            </div>
            <div>
              <label style={labelStyle}>Review Text *</label>
              <textarea name="text" required value={form.text} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="The service was absolutely excellent..." />
            </div>
            <div>
              <label style={labelStyle}>Avatar Image URL <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
              <input name="avatar" value={form.avatar} onChange={handleChange} style={inputStyle} placeholder="https://..." type="url" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#f9fafb', borderRadius: '8px' }}>
              <input type="checkbox" name="is_active" id="t_active" checked={form.is_active} onChange={handleChange} style={{ width: '16px', height: '16px', accentColor: '#E8000D', cursor: 'pointer' }} />
              <label htmlFor="t_active" style={{ fontSize: '14px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Show on website</label>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={formLoading} className="btn-red" style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: formLoading ? 0.7 : 1 }}>
                <Icon name="save" size={14} /> {formLoading ? 'Saving...' : editId ? 'Update' : 'Add Testimonial'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} style={{ padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <Icon name="testimonials" size={40} />
            <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '12px' }}>No testimonials yet</p>
            <button onClick={openAdd} className="btn-red" style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="plus" size={14} /> Add First Testimonial
            </button>
          </div>
        ) : (
          <div>
            {testimonials.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', gap: '14px', padding: '16px 20px', borderBottom: i < testimonials.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'flex-start', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e5e7eb' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E8000D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontWeight: 800, fontSize: '18px' }}>
                    {t.name.charAt(0)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{t.name}</span>
                    {t.company && <span style={{ fontSize: '12px', color: '#9ca3af' }}>· {t.role ? `${t.role}, ` : ''}{t.company}</span>}
                    <span style={{ color: '#f59e0b', fontSize: '13px', letterSpacing: '1px' }}>{'★'.repeat(t.rating || 5)}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: t.is_active ? '#dcfce7' : '#f3f4f6', color: t.is_active ? '#15803d' : '#6b7280' }}>
                      {t.is_active ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    "{t.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => toggleActive(t.id, t.is_active)} style={{ background: t.is_active ? '#f3f4f6' : '#dcfce7', color: t.is_active ? '#6b7280' : '#15803d', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    {t.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => openEdit(t)} style={{ background: '#eff6ff', color: '#1d4ed8', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="edit" size={12} />
                  </button>
                  <button onClick={() => handleDelete(t.id, t.name)} style={{ background: '#fff1f2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
