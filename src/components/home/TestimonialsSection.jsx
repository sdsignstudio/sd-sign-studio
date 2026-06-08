import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .limit(3)
        if (!error && data && data.length > 0) {
          setReviews(data)
        }
      } catch (err) {
        console.error("Testimonial fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    loadReviews()
  }, [])

  if (loading) return null
  if (reviews.length === 0) return null

  return (
    <section className="section" id="testimonials" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)', borderTop: '1px solid #fecaca', borderBottom: '1px solid #fecaca', padding: '90px 0' }}>
      <div className="section-inner" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div className="section-header" style={{ marginBottom: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span className="section-eyebrow" style={{ background: 'rgba(232,0,13,0.06)', border: '1px solid rgba(232,0,13,0.12)', color: 'var(--red)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px', display: 'inline-block' }}>
            Reviews &amp; Testimonials
          </span>
          <h2 className="section-title" style={{ fontSize: 'clamp(32px, 4.5vw, 44px)', fontWeight: 900, color: '#111827', lineHeight: 1.15, margin: 0, letterSpacing: '-1.5px' }}>
            What Our Customers <span className="red" style={{ color: 'var(--red)' }}>Say About Us</span>
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {reviews.map((rev, i) => (
            <div
              key={rev.id || i}
              style={{
                background: '#ffffff',
                padding: '32px',
                borderRadius: '16px',
                border: '1.5px solid #e5e7eb',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.borderColor = 'rgba(232,0,13,0.3)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(232,0,13,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.02)'
              }}
            >
              {/* Quote Mark */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '64px',
                fontFamily: 'serif',
                lineHeight: 1,
                color: 'rgba(232,0,13,0.08)',
                pointerEvents: 'none',
                userSelect: 'none'
              }}>
                &ldquo;
              </div>

              <div>
                {/* Rating stars */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: '#f59e0b', fontSize: '18px' }}>
                  {"★".repeat(rev.rating || 5)}
                </div>
                
                <p style={{
                  fontSize: '15px',
                  color: '#4b5563',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  marginBottom: '24px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  "{rev.text || rev.content}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--red)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '14px'
                }}>
                  {rev.name?.[0] || 'C'}
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '0 0 2px' }}>
                    {rev.name}
                  </h4>
                  {rev.company && (
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                      {rev.company}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
