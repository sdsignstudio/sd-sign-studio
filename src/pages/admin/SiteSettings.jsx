import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', background: '#fff', color: '#111' }
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' }

const SQL_SETUP = `CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`

const DEFAULTS = {
  business_name: 'SD Sign Studio',
  tagline: 'Professional Vehicle Wraps & Signage',
  description: '',
  phone: '',
  email: '',
  address: '',
  whatsapp: '',
  facebook: '',
  instagram: '',
  twitter: '',
  tiktok: '',
  hours_weekday: 'Monday – Friday: 9am – 6pm',
  hours_weekend: 'Saturday: 10am – 4pm',
  hours_sunday: 'Sunday: Closed',
  google_maps_embed: '',
  google_analytics_id: '',
}

export default function SiteSettings() {
  const [settings, setSettings] = useState({ ...DEFAULTS })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tableError, setTableError] = useState(false)
  const [activeSection, setActiveSection] = useState('business')

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('site_settings').select('key, value')
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setTableError(true)
          setLoading(false)
          return
        }
        throw error
      }
      const mapped = { ...DEFAULTS }
      data?.forEach(row => { if (row.key in mapped) mapped[row.key] = row.value || '' })
      setSettings(mapped)
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({
        key, value: value || '', updated_at: new Date().toISOString()
      }))
      const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' })
      if (error) throw error
      toast.success('Settings saved successfully!')
    } catch (err) {
      toast.error('Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const SECTIONS = [
    { id: 'business', label: 'Business Info', icon: 'info' },
    { id: 'contact',  label: 'Contact',       icon: 'phone' },
    { id: 'social',   label: 'Social Media',  icon: 'link' },
    { id: 'hours',    label: 'Opening Hours', icon: 'clock' },
    { id: 'advanced', label: 'Advanced',      icon: 'settings' },
  ]

  if (tableError) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Site Settings</h1>
      <div style={{ ...card, padding: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d97706' }}>
            <Icon name="warning" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Site Settings Table Not Found</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>Create this table in your Supabase SQL Editor:</p>
            <pre style={{ background: '#1f2937', color: '#e5e7eb', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: 1.6 }}>{SQL_SETUP}</pre>
            <button onClick={fetchSettings} className="btn-red" style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Site Settings</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Manage your business information and site configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-red" style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
          <Icon name="save" size={15} /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Sidebar Nav */}
        <div style={{ ...card, padding: '8px' }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeSection === s.id ? 700 : 500, background: activeSection === s.id ? '#fff1f2' : 'transparent', color: activeSection === s.id ? '#E8000D' : '#374151', textAlign: 'left', transition: 'all 0.15s' }}
            >
              <Icon name={s.icon} size={15} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            Loading settings...
          </div>
        ) : (
          <div style={{ ...card, padding: '28px' }}>

            {activeSection === 'business' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>Business Information</h3>
                <div>
                  <label style={labelStyle}>Business Name</label>
                  <input value={settings.business_name} onChange={e => handleChange('business_name', e.target.value)} style={inputStyle} placeholder="SD Sign Studio" />
                </div>
                <div>
                  <label style={labelStyle}>Tagline</label>
                  <input value={settings.tagline} onChange={e => handleChange('tagline', e.target.value)} style={inputStyle} placeholder="Professional Vehicle Wraps & Signage" />
                </div>
                <div>
                  <label style={labelStyle}>Business Description</label>
                  <textarea value={settings.description} onChange={e => handleChange('description', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="A brief description of your business..." />
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>Contact Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input value={settings.phone} onChange={e => handleChange('phone', e.target.value)} style={inputStyle} placeholder="+44 7XXX XXXXXX" type="tel" />
                  </div>
                  <div>
                    <label style={labelStyle}>WhatsApp Number</label>
                    <input value={settings.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} style={inputStyle} placeholder="+44 7XXX XXXXXX" type="tel" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input value={settings.email} onChange={e => handleChange('email', e.target.value)} style={inputStyle} placeholder="info@sdsignstudio.co.uk" type="email" />
                </div>
                <div>
                  <label style={labelStyle}>Business Address</label>
                  <textarea value={settings.address} onChange={e => handleChange('address', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="123 High Street, London, E1 1AA" />
                </div>
                <div>
                  <label style={labelStyle}>Google Maps Embed URL</label>
                  <textarea value={settings.google_maps_embed} onChange={e => handleChange('google_maps_embed', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} placeholder="Paste the embed iframe src URL from Google Maps..." />
                </div>
              </div>
            )}

            {activeSection === 'social' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>Social Media Links</h3>
                {[
                  { key: 'facebook',  label: 'Facebook URL',  placeholder: 'https://facebook.com/sdsignstudio' },
                  { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/sdsignstudio' },
                  { key: 'twitter',   label: 'Twitter/X URL', placeholder: 'https://twitter.com/sdsignstudio' },
                  { key: 'tiktok',    label: 'TikTok URL',    placeholder: 'https://tiktok.com/@sdsignstudio' },
                ].map(s => (
                  <div key={s.key}>
                    <label style={labelStyle}>{s.label}</label>
                    <input value={settings[s.key]} onChange={e => handleChange(s.key, e.target.value)} style={inputStyle} placeholder={s.placeholder} type="url" />
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'hours' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>Opening Hours</h3>
                <div>
                  <label style={labelStyle}>Weekday Hours</label>
                  <input value={settings.hours_weekday} onChange={e => handleChange('hours_weekday', e.target.value)} style={inputStyle} placeholder="Monday – Friday: 9am – 6pm" />
                </div>
                <div>
                  <label style={labelStyle}>Saturday Hours</label>
                  <input value={settings.hours_weekend} onChange={e => handleChange('hours_weekend', e.target.value)} style={inputStyle} placeholder="Saturday: 10am – 4pm" />
                </div>
                <div>
                  <label style={labelStyle}>Sunday Hours</label>
                  <input value={settings.hours_sunday} onChange={e => handleChange('hours_sunday', e.target.value)} style={inputStyle} placeholder="Sunday: Closed" />
                </div>
                <div style={{ padding: '14px', borderRadius: '8px', background: '#f9fafb', fontSize: '13px', color: '#6b7280' }}>
                  <strong>Tip:</strong> To use these settings on your website, fetch them from Supabase or integrate them directly into your Footer and Contact components.
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>Advanced Settings</h3>
                <div>
                  <label style={labelStyle}>Google Analytics ID</label>
                  <input value={settings.google_analytics_id} onChange={e => handleChange('google_analytics_id', e.target.value)} style={inputStyle} placeholder="G-XXXXXXXXXX" />
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>Enter your GA4 Measurement ID to enable Google Analytics tracking.</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '8px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <p style={{ fontSize: '13px', color: '#9a3412', fontWeight: 600, marginBottom: '8px' }}>⚠️ Advanced settings require code integration</p>
                  <p style={{ fontSize: '13px', color: '#9a3412', lineHeight: 1.6 }}>
                    Settings saved here are stored in Supabase. To use them on your website, you'll need to fetch and apply them in your React components or index.html.
                  </p>
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSave} disabled={saving} className="btn-red" style={{ padding: '10px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
                <Icon name="save" size={15} /> {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
