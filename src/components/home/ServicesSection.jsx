import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const STATIC_SERVICES = [
  { title: '3D Lettering Signs', short_description: 'Put some pow into your brand with our carefully crafted 3D lettering. Made from robust materials like metal, wood, or acrylic, they can be flat-cut or built up into a hollow finish for extra depth and LED halo illumination.', image: '/images/client-images/car2.jpg' },
  { title: 'Shop Front Signs', short_description: 'We make exterior commercial and retail signs easy—from initial site survey to final installation. Creating the perfect storefront is crucial for exposing your brand and making a memorable first impression.', image: '/images/client-images/van_wrapping.jpg' },
  { title: 'Illuminated & Neon Signs', short_description: 'Day or night, give your office, shop, or café a stunning glow with bespoke illuminated and neon signs. We combine metal frameworks with long-lasting LEDs for pure electric magic.', image: '/images/client-images/van_wrapping_2.webp' },
  { title: 'Projecting Signs & Lightboxes', short_description: 'Projecting lightbox signs provide full-face illumination sitting right at an angle to your premises. Using energy-efficient LED modules and light-diffusing acrylic, they maximize visibility from up and down the street.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg' },
  { title: 'Vehicle Graphics & Wrapping', short_description: 'Vehicle vinyl wraps are available in striking matt or gloss finishes. Whether solid colours or printed bespoke artwork, our van sign writing completely changes the look of your vehicle while protecting the paint.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
  { title: 'Window Graphics', short_description: 'A wide range of window graphics, self-adhesive stickers, and poster holders to attract attention. All decals are printed in-house using the latest cutting and printing equipment.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg' },
  { title: 'Shop Awnings', short_description: 'We are the leading company for stylish shop awnings and canopies in London. Protect your storefront from the elements while providing a premium, classic look to your business.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg' },
  { title: 'Banner & Logo Printing', short_description: 'High-quality banner printing, logo design, stationery, and large-format printing. We offer free design services for all large printing orders to ensure your materials are perfect.', image: '/images/client-images/car2.jpg' },
  { title: 'Custom Workwear', short_description: 'Look professional in quality custom-branded workwear. From t-shirts to polo shirts, we can print or embroider your logo across our entire product range.', image: '/images/client-images/van_wrapping.jpg' },
  { title: 'Flyers & Brochures', short_description: '“The more you tell, the more you sell.” Let us help you tell the complete story of your company with professional brochures and flyers that drive real interest.', image: '/images/client-images/van_wrapping_2.webp' },
  { title: 'Exhibition Stands & Flags', short_description: 'We offer professional guidance to turn your ideas into a reality for exhibitions. Get portable feather flags and fully branded stands based around your budget and space.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (1).jpeg' },
  { title: 'Menu Displays', short_description: 'We start with modern, built-in menu designs and customize them to your heart’s content. Create something truly original that highlights your culinary offerings perfectly.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg' },
  { title: 'Safety & Interior Signs', short_description: 'From site safety signs to fully branded internal office signage. We design, print, manufacture, and install all forms of indoor signs to meet your brief exactly.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg' },
  { title: 'Food Truck/Trailer Wraps', short_description: 'We design and install bold food trailer wraps and signage that make your business stand out. From full wraps to dynamic menus, everything is built to last.', image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg' },
  { title: 'Heras Fence Banners', short_description: 'Make construction sites look great! Perfect for concealing ongoing work from public view while simultaneously advertising your brand to thousands of passersby.', image: '/images/client-images/car2.jpg' },
]

export default function ServicesSection() {
  const [services, setServices] = useState(STATIC_SERVICES)

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
          <p>Wrapping your vehicle with high impact imagery and colours using premium Hexis wrap materials will take your company to the next level of advertising, putting your business at the top of everyone's mind. Complete vehicle wraps protect your original paintwork from stone chips and have endless possibilities—let us give you the impact your company deserves!</p>
          <p>SD Sign Studio also provides comprehensive print services, specialising in large format banners, leaflets, business cards, posters, and more. We even include free design in our service when printing is ordered.</p>
        </div>

        <div className="services-grid">
          {services.map((srv, i) => (
            <div className="srv-card" key={srv.id || i}>
              <img className="srv-img" src={srv.image} alt={srv.title} />
              <div className="srv-content">
                <h3 className="srv-title">{srv.title}</h3>
                <p className="srv-desc">{srv.short_description || srv.description}</p>
                <a href="https://wa.me/447715669077" target="_blank" rel="noopener noreferrer" className="srv-btn">Book Now</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
