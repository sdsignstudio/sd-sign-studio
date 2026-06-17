import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const STATIC_SERVICES = [
  { title: '3D Lettering Signs', short_description: 'Eye-catching 3D letters in metal, wood, or acrylic with optional LED halo illumination.', image: '/images/client-images/car2.jpg' },
  { title: 'Shop Front Signs', short_description: 'From site survey to installation — stunning exterior signs that make your storefront unmissable.', image: '/images/client-images/van_wrapping.jpg' },
  { title: 'Illuminated & Neon Signs', short_description: 'Bespoke LED and neon signs that give your premises a stunning glow day and night.', image: '/images/client-images/van_wrapping_2.webp' },
  { title: 'Projecting Signs & Lightboxes', short_description: 'Full-face illuminated lightboxes that maximise your visibility from up and down the street.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg' },
  { title: 'Vehicle Graphics & Wrapping', short_description: 'Bold matt or gloss vinyl wraps that transform your vehicle while protecting the paintwork.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
  { title: 'Window Graphics', short_description: 'Custom window decals, frosted films, and poster holders printed in-house for maximum impact.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg' },
  { title: 'Shop Awnings', short_description: 'Stylish branded awnings that protect your storefront and add a premium look to your business.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg' },
  { title: 'Banner & Logo Printing', short_description: 'High-quality large-format banners and print with free design included on every order.', image: '/images/client-images/car2.jpg' },
  { title: 'Custom Workwear', short_description: 'Professionally printed or embroidered branded workwear across our full clothing range.', image: '/images/client-images/van_wrapping.jpg' },
  { title: 'Flyers & Brochures', short_description: 'Professional flyers and brochures that tell your brand story and drive real customer interest.', image: '/images/client-images/van_wrapping_2.webp' },
  { title: 'Exhibition Stands & Flags', short_description: 'Fully branded exhibition stands and feather flags tailored to your budget and space.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg' },
  { title: 'Menu Displays', short_description: 'Custom-designed menu boards that highlight your offerings and elevate your venue\'s look.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
  { title: 'Safety & Interior Signs', short_description: 'From safety signage to fully branded interior office signs — designed, printed, and installed.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg' },
  { title: 'Food Truck/Trailer Wraps', short_description: 'Bold food trailer wraps and signage that make your mobile business impossible to miss.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg' },
  { title: 'Heras Fence Banners', short_description: 'Turn construction site hoardings into powerful brand advertising visible to thousands daily.', image: '/images/client-images/car2.jpg' },
]

export default function ServicesSection() {
  const [services, setServices] = useState(STATIC_SERVICES)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (!error && data && data.length > 0) {
          setServices(data)
        }
      } catch {
        // keep static fallback
      }
    }
    fetchServices()
  }, [])

  return (
    <section className="full-services-section" id="services">
      <div className="section-inner">
        <div className="section-header" style={{ marginBottom: '32px' }}>
          <span className="section-eyebrow">Services We Provide</span>
          <h2 className="section-title">Creative Print <span className="red">Production Agency</span></h2>
        </div>
        <div className="services-intro">
          <p>Premium Hexis vehicle wraps that elevate your brand, protect your paintwork, and turn heads wherever you go.</p>
          <p>We also specialise in large-format print — banners, leaflets, posters, and more — with free design included on every order.</p>
        </div>

        <div className="services-grid">
          {services.map((srv, i) => (
            <div
              className="srv-card"
              key={srv.id || i}
              onClick={() => navigate(`/gallery?category=${encodeURIComponent(srv.title)}`)}
              style={{ cursor: 'pointer' }}
            >
              <img className="srv-img" src={srv.image} alt={srv.title} />
              <div className="srv-content">
                <h3 className="srv-title">{srv.title}</h3>
                <p className="srv-desc">{srv.short_description || srv.description}</p>
                <a href="https://wa.me/919676112750" target="_blank" rel="noopener noreferrer" className="srv-btn" onClick={e => e.stopPropagation()}>Book Now</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
