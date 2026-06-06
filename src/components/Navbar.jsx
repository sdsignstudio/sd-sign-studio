import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { cartCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('navbar')
      if (nav) {
        nav.style.boxShadow = window.scrollY > 10
          ? '0 2px 20px rgba(0,0,0,0.12)'
          : '0 2px 12px rgba(0,0,0,0.08)'
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const isHome = location.pathname === '/'

  const navItems = [
    { label: 'Home', to: '/', hash: '' },
    { label: 'Services', to: '/services', hash: '' },
    { label: 'Products', to: '/shop', hash: '' },
    { label: 'About Us', to: '/about', hash: '' },
    { label: 'Contact', to: '/contact', hash: '' },
  ]

  const handleNavClick = (item) => {
    setMenuOpen(false)
    if (item.hash && isHome) {
      const el = document.querySelector(item.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogout = async () => {
    setMenuOpen(false)
    await supabase.auth.signOut()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <>
      <nav className="navbar" id="navbar">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <img 
              src="/images/logo.png" 
              alt="SD Sign Studio" 
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
            />
          </Link>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to + item.hash}
                className={
                  (item.to === '/' && !item.hash && isHome) ||
                  (item.to === '/shop' && location.pathname === '/shop')
                    ? 'active' : ''
                }
                onClick={() => handleNavClick(item)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/cart" style={{ color: 'var(--black)', display: 'flex', alignItems: 'center', position: 'relative' }} aria-label="Shopping Bag">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--red)', color: '#fff', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to={user ? "/account" : "/login"} style={{ color: 'var(--red)', display: 'flex', alignItems: 'center' }} aria-label="Account">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            
            <Link to="/#contact" className="btn-red nav-cta-btn">Get a Quote</Link>
          </div>

          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to + item.hash}
            onClick={() => handleNavClick(item)}
          >
            {item.label}
          </Link>
        ))}
        {user ? (
          <>
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
            <button onClick={handleLogout} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '16px', fontSize: '18px', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        )}
        <Link to="/#contact" className="mob-cta" onClick={() => setMenuOpen(false)}>
          Get a Quote
        </Link>
      </div>
    </>
  )
}
