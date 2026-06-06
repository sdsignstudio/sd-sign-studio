import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CtaBand from '../components/home/CtaBand'

const SERVICES = [
  'Vehicle Wrapping',
  'Shop Front Signs',
  'Print & Banners',
  'Window Graphics',
  'Fleet Branding',
  'Commercial Signage',
  'Design Services',
  'Other',
]

const inp = {
  width: '100%',
  padding: '13px 16px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '10px',
  fontSize: '15px',
  fontFamily: 'var(--font)',
  outline: 'none',
  background: '#fff',
  color: '#111',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const lbl = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#111',
  marginBottom: '7px',
}

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', service: SERVICES[0], message: '' }

const CONTACT_ITEMS = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>,
    title: 'Our Location',
    content: 'Unit 2, 100 Main Street\nGlasgow, G1 1AB\nUnited Kingdom',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/></svg>,
    title: 'Phone Number',
    content: '+44 7715 669077',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/></svg>,
    title: 'Email Address',
    content: 'hello@sdsignstudio.co.uk',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/><path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/></svg>,
    title: 'Opening Hours',
    content: 'Mon – Sat: 9:00 AM – 6:00 PM\nSunday: Closed',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSending(true)
    setError('')
    try {
      const { error: dbErr } = await supabase.from('contact_submissions').insert([{
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        subject: form.service,
        message: form.message.trim(),
        is_read: false,
      }])
      if (dbErr) throw dbErr
      setSent(true)
      setForm(EMPTY)
    } catch (err) {
      setError('Something went wrong. Please try again or call us directly.')
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }
        .contact-name-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .contact-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 36px;
        }
        .contact-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px 60px;
        }
        @media (max-width: 768px) {
          .contact-wrap { padding: 44px 16px 48px; }
          .contact-grid { grid-template-columns: 1fr; gap: 36px; }
          .contact-name-row { grid-template-columns: 1fr 1fr; gap: 12px; }
          .contact-info-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
        }
        @media (max-width: 480px) {
          .contact-name-row { grid-template-columns: 1fr; gap: 0; }
          .contact-info-grid { grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>

      <div style={{ background: '#fff', minHeight: '100vh' }}>
        {/* Hero Banner */}
        <div className="shop-banner">
          <div className="shop-banner-inner">
            <h1 style={{ fontFamily: 'serif', fontWeight: 600 }}>Contact Us</h1>
            <p>Get in touch with our team for quotes, questions, and collaborations.</p>
            <div className="shop-breadcrumb" style={{ justifyContent: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
              <span className="sep" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
              <span style={{ color: '#fff' }}>Contact</span>
            </div>
          </div>
        </div>

        <div className="contact-wrap">
          <div className="contact-grid">

            {/* ── Contact Info ── */}
            <div>
              <h2 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800, color: '#111', marginBottom: '16px', fontFamily: 'serif' }}>
                Let's Build Something Great
              </h2>
              <p style={{ fontSize: '16px', color: '#555', lineHeight: 1.7, marginBottom: '32px' }}>
                Whether you need a full fleet wrapped, a new shop front sign, or custom workwear — our team is ready to help with a free consultation and quote.
              </p>

              {/* Info cards grid */}
              <div className="contact-info-grid">
                {CONTACT_ITEMS.map(({ icon, title, content }) => (
                  <div
                    key={title}
                    style={{ padding: '18px 16px', background: '#f9fafb', border: '1.5px solid #f3f4f6', borderRadius: '14px' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(232,0,13,0.1)', color: '#E8000D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      {icon}
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>{title}</h4>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Contact Form ── */}
            <div style={{ background: '#f9fafb', padding: 'clamp(20px, 5vw, 40px)', borderRadius: '20px', border: '1.5px solid #e5e7eb' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>
                    ✓
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111', marginBottom: '10px' }}>Message Sent!</h3>
                  <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, marginBottom: '28px' }}>
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    style={{ padding: '12px 28px', background: '#E8000D', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '4px' }}>Send a Message</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>Fields marked * are required.</p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="contact-name-row">
                      <div>
                        <label style={lbl}>First Name *</label>
                        <input name="firstName" type="text" value={form.firstName} onChange={handleChange}
                          placeholder="John" required style={inp}
                          onFocus={e => e.target.style.borderColor = '#E8000D'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                      </div>
                      <div>
                        <label style={lbl}>Last Name</label>
                        <input name="lastName" type="text" value={form.lastName} onChange={handleChange}
                          placeholder="Doe" style={inp}
                          onFocus={e => e.target.style.borderColor = '#E8000D'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                      </div>
                    </div>

                    <div>
                      <label style={lbl}>Email Address *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        placeholder="john@company.com" required style={inp}
                        onFocus={e => e.target.style.borderColor = '#E8000D'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    </div>

                    <div>
                      <label style={lbl}>Phone Number</label>
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                        placeholder="+44 7700 000000" style={inp}
                        onFocus={e => e.target.style.borderColor = '#E8000D'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    </div>

                    <div>
                      <label style={lbl}>Service Interested In</label>
                      <select name="service" value={form.service} onChange={handleChange}
                        style={{ ...inp, cursor: 'pointer', appearance: 'auto' }}
                        onFocus={e => e.target.style.borderColor = '#E8000D'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={lbl}>Your Message *</label>
                      <textarea name="message" value={form.message} onChange={handleChange}
                        placeholder="Tell us about your project — size, timeline, budget..."
                        rows={5} required style={{ ...inp, resize: 'vertical', minHeight: '120px' }}
                        onFocus={e => e.target.style.borderColor = '#E8000D'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                    </div>

                    {error && (
                      <div style={{ padding: '12px 16px', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '8px', fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: sending ? '#9ca3af' : '#E8000D',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '15px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font)',
                        transition: 'background 0.15s',
                      }}
                    >
                      {sending ? 'Sending…' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>

        <CtaBand />
      </div>
    </>
  )
}
