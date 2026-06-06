import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)' }

const ROLE_STYLES = {
  admin:    { bg: '#fff1f2', color: '#E8000D' },
  customer: { bg: '#eff6ff', color: '#1d4ed8' },
}

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      toast.error('Failed to load customers: ' + (err.message || 'unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (userId, newRole) => {
    try {
      await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId)
      setCustomers(prev => prev.map(c => c.user_id === userId ? { ...c, role: newRole } : c))
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  const filtered = search
    ? customers.filter(c => c.user_id?.toLowerCase().includes(search.toLowerCase()) || c.role?.toLowerCase().includes(search.toLowerCase()))
    : customers

  const adminCount = customers.filter(c => c.role === 'admin').length
  const customerCount = customers.filter(c => c.role === 'customer').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Customers</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{customers.length} registered users</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '480px' }}>
        {[
          { label: 'Total Users',  value: customers.length, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Admins',       value: adminCount,        color: '#E8000D', bg: '#fff1f2' },
          { label: 'Customers',    value: customerCount,     color: '#3b82f6', bg: '#eff6ff' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 20px' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>{s.value}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div style={{ ...card, padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#eff6ff' }}>
        <div style={{ color: '#3b82f6', flexShrink: 0, marginTop: '1px' }}><Icon name="info" size={18} /></div>
        <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
          <strong>Note:</strong> User emails are managed by Supabase Auth and aren't directly accessible from this view. To see full customer details including emails, visit your <strong>Supabase Dashboard → Authentication → Users</strong>.
          This panel shows user IDs and their assigned roles from the <code style={{ background: 'rgba(0,0,0,0.08)', padding: '1px 5px', borderRadius: '3px' }}>user_roles</code> table.
        </div>
      </div>

      {/* Search */}
      <div style={{ ...card, padding: '14px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
            <Icon name="search" size={15} />
          </span>
          <input
            type="text"
            placeholder="Search by user ID or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 14px 9px 36px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--font)', outline: 'none', color: '#111' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e5e7eb', borderTopColor: '#E8000D', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            Loading customers...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {['#', 'User ID', 'Role', 'Joined', 'Change Role'].map((h, i) => (
                    <th key={h} style={{ padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                      <Icon name="customers" size={36} />
                      <p style={{ marginTop: '10px', fontWeight: 600 }}>No customers found</p>
                    </td>
                  </tr>
                ) : filtered.map((customer, i) => {
                  const rs = ROLE_STYLES[customer.role] || ROLE_STYLES.customer
                  return (
                    <tr key={customer.user_id} style={{ borderBottom: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#9ca3af', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#9ca3af' }}>
                            <Icon name="customers" size={16} />
                          </div>
                          <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#374151', fontWeight: 600 }}>{customer.user_id}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: rs.bg, color: rs.color, textTransform: 'capitalize' }}>
                          {customer.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6b7280' }}>
                        {customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <select
                          value={customer.role}
                          onChange={e => updateRole(customer.user_id, e.target.value)}
                          style={{ padding: '6px 10px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--font)', outline: 'none', cursor: 'pointer', background: '#fff', color: '#111' }}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
