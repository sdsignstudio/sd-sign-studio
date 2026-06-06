import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ServicesSection from '../components/home/ServicesSection'
import CtaBand from '../components/home/CtaBand'

export default function ServicesPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Hero Banner (Same style as Shop Page) */}
      <div className="shop-banner">
        <div className="shop-banner-inner">
          <h1 style={{ fontFamily: 'serif', fontWeight: 600 }}>Our Services</h1>
          <p>Explore our comprehensive range of custom branding and signage solutions</p>
          <div className="shop-breadcrumb" style={{ justifyContent: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <span className="sep" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ color: '#fff' }}>Services</span>
          </div>
        </div>
      </div>

      {/* Services Grid (Reusing the component from Home) */}
      <div style={{ paddingBottom: '40px' }}>
        <ServicesSection />
      </div>

      {/* CTA Band at the end */}
      <CtaBand />
    </div>
  )
}
