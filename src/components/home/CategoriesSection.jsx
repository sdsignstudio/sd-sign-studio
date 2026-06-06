import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const BRAND_ICONS = {
  'Audi': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/audi.svg',
  'Bentley': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/bentley.svg',
  'BMW': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/bmw.svg',
  'BYD': 'https://upload.wikimedia.org/wikipedia/commons/2/23/BYD_Company%2C_Ltd._-_Logo.svg',
  'Hyundai': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/hyundai.svg',
  'Jaguar': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jaguar.svg',
  'Jeep': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jeep.svg',
  'Kia': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/kia.svg',
  'Land Rover': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/landrover.svg',
  'Lexus': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Lexus_logo.svg',
  'Mahindra': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mahindra.svg',
  'Maruti Suzuki': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/suzuki.svg',
  'Maserati': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/maserati.svg',
  'Renault': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/renault.svg',
  'Mercedes Benz': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mercedes.svg',
  'MG': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mg.svg',
  'Mini': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mini.svg',
  'Porsche': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/porsche.svg',
  'Skoda': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/skoda.svg',
  'Tata': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tata.svg',
  'Toyota': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/toyota.svg',
  'Vinfast': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/VinFast_logo.svg',
  'Volkswagen': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/volkswagen.svg',
  'Volvo': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/volvo.svg',
}

const STATIC_CATEGORIES = Object.keys(BRAND_ICONS).map(name => ({ name, icon: BRAND_ICONS[name] }))

export default function CategoriesSection() {
  const [categories, setCategories] = useState(STATIC_CATEGORIES)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true })
        if (!error && data && data.length > 0) {
          setCategories(data.map(c => ({
            ...c,
            icon: c.icon_url || BRAND_ICONS[c.name] || null,
          })))
        }
      } catch {
        // keep static fallback
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="section categories-section" id="products">
      <div className="section-inner">
        <div className="section-header">
          <span className="section-eyebrow">Our Services</span>
          <h2 className="section-title">Popular <span className="red">Categories</span></h2>
        </div>
        <div className="cat-grid">
          {categories.map((cat) => (
            <div className="cat-card" key={cat.id || cat.name}>
              <div className="cat-logo-circle">
                {cat.icon ? (
                  <img src={cat.icon} alt={cat.name} />
                ) : (
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#E8000D' }}>{cat.name.charAt(0)}</span>
                )}
              </div>
              <div className="cat-name">{cat.name}</div>
            </div>
          ))}
        </div>
        <div className="section-footer">
          <a href="/shop" className="btn-red">View All Products</a>
        </div>
      </div>
    </section>
  )
}

