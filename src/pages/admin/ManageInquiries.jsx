import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }

const SQL_SETUP = `CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`

export default function ManageInquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchInquiries() }, [])

  const fetchInquiries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setTableError(true)
        } else throw error
      }
      setInquiries(data || [])
    } catch {
      toast.error('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id, isRead) => {
    try {
      await supabase.from('contact_submissions').update({ is_read: isRead }).eq('id', id)
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, is_read: isRead } : i))
      if (selected?.id === id) setSelected(prev => ({ ...prev, is_read: isRead }))
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return
    try {
      await supabase.from('contact_submissions').delete().eq('id', id)
      setInquiries(prev => prev.filter(i => i.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Inquiry deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const openInquiry = async (inquiry) => {
    setSelected(inquiry)
    if (!inquiry.is_read) {
      await markRead(inquiry.id, true)
    }
  }

  const filtered = filter === 'all' ? inquiries : filter === 'unread' ? inquiries.filter(i => !i.is_read) : inquiries.filter(i => i.is_read)
  const unreadCount = inquiries.filter(i => !i.is_read).length

  if (tableError) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Inquiries</h1>
      <div style={{ ...card, padding: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d97706' }}>
            <Icon name="warning" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Contact Submissions Table Not Found</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
              Create this table and integrate it with your Contact page form to receive and manage inquiries here:
            </p>
            <pre style={{ background: '#1f2937', color: '#e5e7eb', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: 1.6 }}>{SQL_SETUP}</pre>
            <div style={{ marginTop: '12px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
              <strong>Also:</strong> Update your ContactPage form to insert submissions into this table via Supabase instead of (or in addition to) email.
            </div>
            <button onClick={fetchInquiries} className="btn-red" style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Inquiries
            {unreadCount > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 800, background: '#E8000D', color: '#fff', padding: '2px 10px', borderRadius: '20px' }}>{unreadCount} new</span>
            )}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{inquiries.length} total · {unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={async () => {
              const ids = inquiries.filter(i => !i.is_read).map(i => i.id)
              await supabase.from('contact_submissions').update({ is_read: true }).in('id', ids)
              setInquiries(prev => prev.map(i => ({ ...i, is_read: true })))
              toast.success('All marked as read')
            }}
            style={{ padding: '9px 16px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#374151', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="check" size={14} /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ ...card, padding: '4px', display: 'flex', gap: '4px', width: 'fit-content' }}>
        {[
          { key: 'all',    label: `All (${inquiries.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read',   label: `Read (${inquiries.length - unreadCount})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', background: filter === f.key ? '#E8000D' : 'transparent', color: filter === f.key ? '#fff' : '#6b7280',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '16px', alignItems: 'start' }}>

        {/* Inquiries List */}
        <div style={{ ...card, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              Loading inquiries...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
              <Icon name="inquiries" size={40} />
              <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '12px' }}>No {filter !== 'all' ? filter : ''} inquiries</p>
            </div>
          ) : (
            filtered.map((inquiry, i) => (
              <div
                key={inquiry.id}
                onClick={() => openInquiry(inquiry)}
                style={{
                  display: 'flex', gap: '14px', padding: '16px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                  cursor: 'pointer',
                  background: selected?.id === inquiry.id ? '#f9fafb' : !inquiry.is_read ? '#fefce8' : '#fff',
                  borderLeft: !inquiry.is_read ? '4px solid #E8000D' : '4px solid transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (selected?.id !== inquiry.id) e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { if (selected?.id !== inquiry.id) e.currentTarget.style.background = !inquiry.is_read ? '#fefce8' : '#fff' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: !inquiry.is_read ? '#E8000D' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: !inquiry.is_read ? '#fff' : '#9ca3af', fontWeight: 800, fontSize: '16px' }}>
                  {inquiry.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: !inquiry.is_read ? 800 : 600, color: '#111827' }}>{inquiry.name}</span>
                    {!inquiry.is_read && <span style={{ fontSize: '10px', fontWeight: 800, background: '#E8000D', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>NEW</span>}
                    <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                      {new Date(inquiry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', fontWeight: 600 }}>{inquiry.email} {inquiry.phone && `· ${inquiry.phone}`}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {inquiry.subject && <span style={{ color: '#E8000D', fontWeight: 700, marginRight: '4px' }}>[{inquiry.subject}]</span>}{inquiry.message}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(inquiry.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '4px', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ ...card, padding: '24px', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>Inquiry Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#6b7280', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: '#f9fafb' }}>
                <p style={{ fontWeight: 800, color: '#111827', marginBottom: '2px' }}>{selected.name}</p>
                <p style={{ color: '#6b7280', marginBottom: '2px' }}>{selected.email}</p>
                {selected.phone && <p style={{ color: '#6b7280' }}>{selected.phone}</p>}
              </div>

              {selected.subject && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Service Interested In</p>
                  <p style={{ color: '#111827', fontWeight: 700 }}>{selected.subject}</p>
                </div>
              )}

              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Message</p>
                <p style={{ color: '#374151', lineHeight: 1.7, padding: '14px', background: '#f9fafb', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>{selected.message}</p>
              </div>

              <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                Received: {new Date(selected.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your inquiry'}`}
                  className="btn-red"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}
                >
                  <Icon name="mail" size={14} /> Reply via Email
                </a>
                <button
                  onClick={() => markRead(selected.id, !selected.is_read)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '9px 20px', border: '1.5px solid #e5e7eb', borderRadius: '6px', background: '#fff', fontSize: '13px', fontWeight: 700, color: '#374151', cursor: 'pointer' }}
                >
                  <Icon name={selected.is_read ? 'eye' : 'check'} size={14} />
                  Mark as {selected.is_read ? 'Unread' : 'Read'}
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '9px 20px', border: '1.5px solid #fee2e2', borderRadius: '6px', background: '#fff1f2', fontSize: '13px', fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}
                >
                  <Icon name="trash" size={14} /> Delete Inquiry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
