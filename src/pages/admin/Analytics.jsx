import { Icon } from './icon'

const card = { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.03)', padding: '24px' }

export default function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Track your website performance and visitor behaviour</p>
      </div>

      <div style={{ ...card, display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#eff6ff' }}>
        <div style={{ color: '#3b82f6', flexShrink: 0, marginTop: '1px' }}><Icon name="info" size={18} /></div>
        <div style={{ fontSize: '14px', color: '#1e40af', lineHeight: 1.7 }}>
          <strong>Set up Google Analytics to track visitors, conversions, and more.</strong>
          <br />
          1. Create a GA4 property at <strong>analytics.google.com</strong><br />
          2. Add your Measurement ID in <strong>Site Settings → Advanced</strong><br />
          3. Add the GA4 script to your <code style={{ background: 'rgba(0,0,0,0.1)', padding: '1px 5px', borderRadius: '3px' }}>index.html</code>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Page Views',    value: '—', icon: 'eye',       color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Unique Visitors', value: '—', icon: 'customers', color: '#10b981', bg: '#f0fdf4' },
          { label: 'Bounce Rate',   value: '—', icon: 'analytics', color: '#f59e0b', bg: '#fffbeb' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <Icon name={s.icon} size={20} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#9ca3af' }}>{s.value}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginTop: '6px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: '60px', textAlign: 'center' }}>
        <div style={{ color: '#d1d5db', marginBottom: '16px' }}><Icon name="analytics" size={48} /></div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#9ca3af', marginBottom: '8px' }}>Analytics Not Connected</h3>
        <p style={{ fontSize: '14px', color: '#9ca3af', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
          Connect Google Analytics to see visitor data, popular pages, traffic sources, and conversion metrics.
        </p>
      </div>
    </div>
  )
}
