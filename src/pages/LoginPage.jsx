import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message); setLoading(false); return }
    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', data.user.id).single()
    toast.success('Logged in successfully!')
    navigate(roleData?.role === 'admin' ? '/admin' : '/shop')
  }

  const onFocus = e => { e.target.style.borderColor = 'var(--red)'; e.target.style.boxShadow = '0 0 0 3px rgba(232,0,13,0.08)' }
  const onBlur  = e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }

  const inp = {
    width: '100%', padding: '13px 16px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '15px', fontFamily: 'var(--font)',
    outline: 'none', color: '#111827', background: '#fff',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
  }

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
              Welcome Back
            </h1>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>
              Sign in to your SD Sign Studio account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

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
                  placeholder="••••••••" required
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

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#e5e7eb' : 'var(--red)',
              color: loading ? '#9ca3af' : '#fff',
              border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800,
              letterSpacing: '1px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)', transition: 'all 0.2s', marginTop: '4px',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(232,0,13,0.22)'
            }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--red)', fontWeight: 700, textDecoration: 'none' }}>
              Create one here
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}
