import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }

const PAGES = [
  { slug: 'home',     label: 'Home Page',      path: '/' },
  { slug: 'shop',     label: 'Shop / Products', path: '/shop' },
  { slug: 'services', label: 'Services',        path: '/services' },
  { slug: 'about',    label: 'About Us',        path: '/about' },
  { slug: 'contact',  label: 'Contact',         path: '/contact' },
]

const EMPTY = { meta_title: '', meta_description: '', og_title: '', og_description: '', og_image: '', keywords: '' }

const SQL_SETUP = `CREATE TABLE seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  keywords TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`

export default function ManageSEO() {
  const [activeTab, setActiveTab] = useState('home')
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tableError, setTableError] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const { data: rows, error } = await supabase.from('seo_settings').select('*')
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setTableError(true)
          setLoading(false)
          return
        }
        throw error
      }
      const mapped = {}
      rows?.forEach(r => { mapped[r.page_slug] = r })
      setData(mapped)
    } catch {
      toast.error('Failed to load SEO settings')
    } finally {
      setLoading(false)
    }
  }

  const current = data[activeTab] || { ...EMPTY, page_slug: activeTab }

  const handleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [activeTab]: { ...(prev[activeTab] || { ...EMPTY, page_slug: activeTab }), [field]: value }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...current, page_slug: activeTab, updated_at: new Date().toISOString() }
      const { error } = await supabase.from('seo_settings').upsert([payload], { onConflict: 'page_slug' })
      if (error) throw error
      toast.success('SEO settings saved!')
    } catch (err) {
      toast.error('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const charCount = (str, max) => {
    const len = (str || '').length
    return { len, over: len > max, near: len > max * 0.85 }
  }

  if (tableError) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>SEO Settings</h1>
      <div style={{ ...card, padding: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d97706' }}>
            <Icon name="warning" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>SEO Settings Table Not Found</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>Create this table in your Supabase SQL Editor:</p>
            <pre style={{ background: '#1f2937', color: '#e5e7eb', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: 1.6 }}>{SQL_SETUP}</pre>
            <button onClick={fetchAll} className="btn-red" style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="refresh" size={14} /> Retry After Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>SEO Settings</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage meta titles, descriptions and Open Graph tags per page</p>
        </div>
      </div>

      {/* SEO Tips */}
      <div style={{ ...card, padding: '16px 20px', background: '#f0fdf4', display: 'flex', gap: '12px' }}>
        <div style={{ color: '#15803d', flexShrink: 0, marginTop: '1px' }}><Icon name="info" size={18} /></div>
        <div style={{ fontSize: '13px', color: '#14532d', lineHeight: 1.6 }}>
          <strong>SEO Tips:</strong> Meta title should be 50–60 characters. Meta description should be 150–160 characters.
          These settings will need to be integrated with your page components using a meta tag library like <code style={{ background: 'rgba(0,0,0,0.1)', padding: '1px 5px', borderRadius: '3px' }}>react-helmet-async</code>.
        </div>
      </div>

      {/* Page Tabs */}
      <div style={{ ...card, padding: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {PAGES.map(p => (
          <button key={p.slug} onClick={() => setActiveTab(p.slug)} style={{
            padding: '9px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === p.slug ? '#E8000D' : 'transparent',
            color: activeTab === p.slug ? '#fff' : '#6b7280',
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* SEO Form */}
      {loading ? (
        <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          Loading...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>

          {/* Form */}
          <div style={{ ...card, padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  {PAGES.find(p => p.slug === activeTab)?.label}
                </h3>
                <code style={{ fontSize: '12px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                  {PAGES.find(p => p.slug === activeTab)?.path}
                </code>
              </div>
              <button onClick={handleSave} disabled={saving} className="btn-red" style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
                <Icon name="save" size={14} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <fieldset style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
                <legend style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 8px' }}>Meta Tags (for search engines)</legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={labelStyle}>Meta Title</label>
                      {(() => { const { len, over, near } = charCount(current.meta_title, 60); return <span style={{ fontSize: '11px', fontWeight: 700, color: over ? '#dc2626' : near ? '#f59e0b' : '#9ca3af' }}>{len}/60</span> })()}
                    </div>
                    <input value={current.meta_title || ''} onChange={e => handleChange('meta_title', e.target.value)} style={inputStyle} placeholder="SD Sign Studio — Vehicle Wraps & Signage in London" maxLength={80} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <label style={labelStyle}>Meta Description</label>
                      {(() => { const { len, over, near } = charCount(current.meta_description, 160); return <span style={{ fontSize: '11px', fontWeight: 700, color: over ? '#dc2626' : near ? '#f59e0b' : '#9ca3af' }}>{len}/160</span> })()}
                    </div>
                    <textarea value={current.meta_description || ''} onChange={e => handleChange('meta_description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Professional vehicle wraps, signs, and graphics in London. Get a free quote today." maxLength={200} />
                  </div>
                  <div>
                    <label style={labelStyle}>Keywords <span style={{ fontWeight: 400, color: '#9ca3af' }}>(comma separated)</span></label>
                    <input value={current.keywords || ''} onChange={e => handleChange('keywords', e.target.value)} style={inputStyle} placeholder="vehicle wraps, car wrapping, signage london, van graphics" />
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '20px' }}>
                <legend style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 8px' }}>Open Graph (for social sharing)</legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                  <div>
                    <label style={labelStyle}>OG Title</label>
                    <input value={current.og_title || ''} onChange={e => handleChange('og_title', e.target.value)} style={inputStyle} placeholder="Same as meta title or a social-friendly version" />
                  </div>
                  <div>
                    <label style={labelStyle}>OG Description</label>
                    <textarea value={current.og_description || ''} onChange={e => handleChange('og_description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Description that appears when shared on Facebook, Twitter, etc." />
                  </div>
                  <div>
                    <label style={labelStyle}>OG Image URL <span style={{ fontWeight: 400, color: '#9ca3af' }}>(recommended: 1200×630px)</span></label>
                    <input value={current.og_image || ''} onChange={e => handleChange('og_image', e.target.value)} style={inputStyle} placeholder="https://..." />
                    {current.og_image && (
                      <img src={current.og_image} alt="OG preview" style={{ marginTop: '8px', width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} onError={e => e.target.style.display = 'none'} />
                    )}
                  </div>
                </div>
              </fieldset>

            </div>
          </div>

          {/* Preview Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ ...card, padding: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Search Preview</h4>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '14px', background: '#fff' }}>
                <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  sdsignstudio.co.uk{PAGES.find(p => p.slug === activeTab)?.path}
                </div>
                <div style={{ fontSize: '16px', color: '#1a0dab', fontWeight: 400, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {current.meta_title || 'Page Title Will Appear Here'}
                </div>
                <div style={{ fontSize: '13px', color: '#4d5156', lineHeight: 1.4 }}>
                  {current.meta_description || 'Your meta description will appear here. This text should summarise your page content for search engines...'}
                </div>
              </div>
            </div>

            <div style={{ ...card, padding: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Social Preview</h4>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                {current.og_image ? (
                  <img src={current.og_image} alt="OG" style={{ width: '100%', height: '140px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div style={{ height: '120px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    <Icon name="photo" size={32} />
                  </div>
                )}
                <div style={{ padding: '12px', background: '#f0f2f5' }}>
                  <div style={{ fontSize: '11px', color: '#606770', textTransform: 'uppercase', marginBottom: '4px' }}>SDSIGNSTUDIO.CO.UK</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c1e21', marginBottom: '4px' }}>{current.og_title || current.meta_title || 'Title'}</div>
                  <div style={{ fontSize: '12px', color: '#606770', lineHeight: 1.3 }}>{current.og_description || current.meta_description || 'Description'}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
