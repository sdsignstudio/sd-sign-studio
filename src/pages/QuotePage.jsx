import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ContactForm from '../components/ContactForm'

export default function QuotePage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ background: 'var(--black)', minHeight: '100vh', paddingTop: 'calc(var(--nav-h) + 40px)', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 800, 
            color: 'var(--red)', 
            textTransform: 'uppercase', 
            letterSpacing: '2px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(232,0,13,0.08)',
            border: '1px solid rgba(232,0,13,0.15)',
            display: 'inline-block',
            marginBottom: '16px'
          }}>
            Booking &amp; Quotes
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Request a Free <span style={{ color: 'var(--red)' }}>Estimate</span>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-light)', lineHeight: 1.6, margin: 0, maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
            Provide your vehicle specifications, storefront details, or upload print artwork and our Glasgow team will compile a custom estimate.
          </p>
        </div>

        {/* Form Container */}
        <div style={{
          background: 'var(--gray)',
          padding: 'clamp(20px, 5vw, 40px)',
          borderRadius: '24px',
          border: '1.5px solid rgba(255,255,255,0.05)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <ContactForm isHome={false} />
        </div>

      </div>
    </div>
  )
}
