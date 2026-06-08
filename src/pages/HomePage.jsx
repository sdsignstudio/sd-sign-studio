import { useEffect } from 'react'
import HeroSection from '../components/home/HeroSection'
import CategoriesSection from '../components/home/CategoriesSection'
import AboutSection from '../components/home/AboutSection'
import FeaturedWork from '../components/home/FeaturedWork'
import ServicesSection from '../components/home/ServicesSection'
import ProcessSection from '../components/home/ProcessSection'
import CtaBand from '../components/home/CtaBand'
import WhyChooseUs from '../components/home/WhyChooseUs'
import TestimonialsSection from '../components/home/TestimonialsSection'
import ContactForm from '../components/ContactForm'

export default function HomePage() {
  useEffect(() => {
    // Show pop up contact form after 6 seconds (every time user visits home page)
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('open-quote-modal'))
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <AboutSection />
      <WhyChooseUs />
      <ServicesSection />
      <FeaturedWork />
      <TestimonialsSection />
      <ProcessSection />
      
      {/* Home Page Contact Form Section */}
      <section className="section" id="contact" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)', borderTop: '1px solid #e5e7eb' }}>
        <div className="section-inner" style={{ maxWidth: '800px' }}>
          <div className="section-header" style={{ marginBottom: '44px' }}>
            <span className="section-eyebrow" style={{ background: 'rgba(232,0,13,0.06)', border: '1px solid rgba(232,0,13,0.12)', color: 'var(--red)' }}>Get a Quote</span>
            <h2 className="section-title" style={{ color: '#111827' }}>Request a Free <span className="red">Consultation</span></h2>
            <p style={{ fontSize: '15px', color: '#4b5563', marginTop: '8px', lineHeight: 1.6 }}>
              Fill out the form below, upload your logo or design assets, and our Glasgow team will compile a custom pricing estimate within 24 hours.
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            padding: 'clamp(20px, 5vw, 40px)',
            borderRadius: '24px',
            border: '1.5px solid #e5e7eb',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.01)'
          }}>
            <ContactForm isHome={true} theme="light" />
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
