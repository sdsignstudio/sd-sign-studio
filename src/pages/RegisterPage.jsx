import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match.'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Account created! Welcome to SD Sign Studio.')
    navigate('/shop')
  }

  const onFocus = e => { e.target.style.borderColor = 'var(--red)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,0,13,0.08)' }
  const onBlur  = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }

  const inp = {
    width: '100%', padding: '13px 16px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '15px', fontFamily: 'var(--font)',
    outline: 'none', color: '#111827', background: '#fff',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const passwordsMatch = confirm === '' || password === confirm

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', paddingTop: 'calc(var(--nav-h) + 24px)', fontFamily: 'var(--font)' }}>
      <div style={{ width: '100%', maxWidth: '460px', background: '#fff', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* Top accent bar */}
        <div style={{ height: '4px', background: 'linear-gradient(to right, var(--red), #ff4d4d, var(--red))' }} />

        <div style={{ padding: 'clamp(32px, 6vw, 48px)' }}>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <Link to="/">
              <img src="/images/logo.png" alt="SD Sign Studio" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '50%' }} />
            </Link>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: '#0a0a0a', margin: '0 0 8px', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              Create Account
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
              Join SD Sign Studio and manage your orders
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '7px', letterSpacing: '0.2px' }}>
                Email Address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={inp} onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '7px', letterSpacing: '0.2px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters" required
                  style={{ ...inp, paddingRight: '46px' }} onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                  fontSize: '16px', padding: 0, display: 'flex', alignItems: 'center'
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '7px', letterSpacing: '0.2px' }}>
                Confirm Password
              </label>
              <input
                type={showPass ? 'text' : 'password'} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter your password" required
                style={{ ...inp, borderColor: !passwordsMatch ? '#ef4444' : '#e5e7eb' }}
                onFocus={onFocus} onBlur={onBlur}
              />
              {!passwordsMatch && (
                <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0', fontWeight: 600 }}>
                  Passwords do not match
                </p>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#e5e7eb' : 'var(--red)',
              color: loading ? '#9ca3af' : '#fff',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800,
              letterSpacing: '1px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)', transition: 'all 0.2s', marginTop: '4px',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(232,0,13,0.22)'
            }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--red)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
