import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }

const STATUS_STYLES = {
  pending:    { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  processing: { bg: '#dbeafe', color: '#1e40af', label: 'Processing' },
  completed:  { bg: '#dcfce7', color: '#15803d', label: 'Completed' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
}

const SQL_SETUP = `CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB,
  total DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableError, setTableError] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setTableError(true)
        } else throw error
      }
      setOrders(data || [])
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await supabase.from('orders').update({ status }).eq('id', id)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return
    try {
      await supabase.from('orders').delete().eq('id', id)
      setOrders(prev => prev.filter(o => o.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Order deleted')
    } catch {
      toast.error('Failed to delete order')
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  if (tableError) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '720px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Orders</h1>
      <div style={{ ...card, padding: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '44px', height: '44px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#d97706' }}>
            <Icon name="warning" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Orders Table Not Found</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
              The <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>orders</code> table doesn't exist yet. Since your shop currently uses WhatsApp for orders, you can create this table to manually log and track orders:
            </p>
            <pre style={{ background: '#1f2937', color: '#e5e7eb', padding: '16px', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', overflow: 'auto', lineHeight: 1.6 }}>{SQL_SETUP}</pre>
            <button onClick={fetchOrders} className="btn-red" style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Orders</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{orders.length} total orders</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {Object.entries(STATUS_STYLES).map(([key, { bg, color, label }]) => (
          <div key={key} style={{ ...card, padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>{counts[key] || 0}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ ...card, padding: '4px', display: 'flex', gap: '4px' }}>
        {['all', 'pending', 'processing', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            flex: 1, padding: '9px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            background: filter === f ? '#E8000D' : 'transparent',
            color: filter === f ? '#fff' : '#6b7280',
          }}>
            {f === 'all' ? `All (${orders.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {/* Orders Table + Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '16px', alignItems: 'start' }}>
        <div style={{ ...card, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
              <Icon name="orders" size={40} />
              <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '12px' }}>No {filter !== 'all' ? filter : ''} orders</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Order', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i === 5 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending
                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: selected?.id === order.id ? '#fafafa' : '' }}
                        onClick={() => setSelected(s => s?.id === order.id ? null : order)}
                        onMouseEnter={e => { if (selected?.id !== order.id) e.currentTarget.style.background = '#fafafa' }}
                        onMouseLeave={e => { if (selected?.id !== order.id) e.currentTarget.style.background = '' }}
                      >
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{order.customer_name || '—'}</div>
                          {order.customer_email && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{order.customer_email}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>
                          {order.total ? `£${Number(order.total).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(order.id) }}
                            style={{ background: '#fff1f2', color: '#dc2626', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Detail Panel */}
        {selected && (
          <div style={{ ...card, padding: '20px', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: 0 }}>Order #{selected.id.slice(0, 8).toUpperCase()}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <p style={{ color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>CUSTOMER</p>
                <p style={{ fontWeight: 700, color: '#111827' }}>{selected.customer_name || '—'}</p>
                <p style={{ color: '#6b7280' }}>{selected.customer_email || '—'}</p>
                <p style={{ color: '#6b7280' }}>{selected.customer_phone || '—'}</p>
              </div>
              {selected.items && (
                <div>
                  <p style={{ color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>ITEMS</p>
                  <pre style={{ fontSize: '11px', background: '#f9fafb', padding: '8px', borderRadius: '6px', overflow: 'auto', color: '#374151' }}>
                    {JSON.stringify(selected.items, null, 2)}
                  </pre>
                </div>
              )}
              <div>
                <p style={{ color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>TOTAL</p>
                <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>{selected.total ? `£${Number(selected.total).toFixed(2)}` : '—'}</p>
              </div>
              {selected.notes && (
                <div>
                  <p style={{ color: '#9ca3af', fontWeight: 600, marginBottom: '4px' }}>NOTES</p>
                  <p style={{ color: '#374151', background: '#f9fafb', padding: '8px', borderRadius: '6px', lineHeight: 1.5 }}>{selected.notes}</p>
                </div>
              )}
              <div>
                <p style={{ color: '#9ca3af', fontWeight: 600, marginBottom: '8px' }}>UPDATE STATUS</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(STATUS_STYLES).map(([key, { label, bg, color }]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(selected.id, key)}
                      style={{ padding: '8px 14px', borderRadius: '6px', border: selected.status === key ? `2px solid ${color}` : '2px solid transparent', background: selected.status === key ? bg : '#f9fafb', color: selected.status === key ? color : '#374151', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                    >
                      {label} {selected.status === key ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
