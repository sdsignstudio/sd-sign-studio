import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AboutSection from '../components/home/AboutSection'
import CtaBand from '../components/home/CtaBand'

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div className="shop-banner">
        <div className="shop-banner-inner">
          <h1 style={{ fontFamily: 'serif', fontWeight: 600 }}>About Us</h1>
          <p>Learn more about SD Sign Studio and our commitment to quality.</p>
          <div className="shop-breadcrumb" style={{ justifyContent: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.7)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
            <span className="sep" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>
            <span style={{ color: '#fff' }}>About Us</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '40px 0' }}>
        {/* Reusing Home About Section */}
        <AboutSection />
      </div>

      {/* Additional Professional Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          
          <div style={{ background: '#f9f9f9', padding: '40px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--black)', marginBottom: '16px' }}>Our Mission</h3>
            <p style={{ fontSize: '16px', color: 'var(--black)', lineHeight: 1.6 }}>
              At SD Sign Studio, our mission is to empower businesses with bold, high-quality visual branding. We believe that a strong first impression is the cornerstone of success, and we strive to provide innovative print and signage solutions that make our clients unforgettable.
            </p>
          </div>

          <div style={{ background: '#f9f9f9', padding: '40px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--black)', marginBottom: '16px' }}>Quality Craftsmanship</h3>
            <p style={{ fontSize: '16px', color: 'var(--black)', lineHeight: 1.6 }}>
              We don't cut corners. From premium Hexis wrap materials for vehicles to weather-resistant outdoor signs, our production process utilizes state-of-the-art technology to ensure durability, vivid colors, and a flawless finish every single time.
            </p>
          </div>

          <div style={{ background: '#f9f9f9', padding: '40px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--black)', marginBottom: '16px' }}>Customer First</h3>
            <p style={{ fontSize: '16px', color: 'var(--black)', lineHeight: 1.6 }}>
              Our clients are at the heart of everything we do. With over a decade of experience, our dedicated team offers expert guidance from initial design concepts to the final installation. Your satisfaction and business growth are our ultimate rewards.
            </p>
          </div>

        </div>
      </div>

      <CtaBand />
    </div>
  )
}
