export const DEFAULT_GALLERY_CATEGORIES = [
  { id: '3d-lettering-signs', name: '3D Lettering Signs', icon: 'Type', image: '' },
  { id: 'shop-front-signs', name: 'Shop Front Signs', icon: 'Store', image: '' },
  { id: 'illuminated-neon-signs', name: 'Illuminated & Neon Signs', icon: 'Lightbulb', image: '' },
  { id: 'projecting-signs-lightboxes', name: 'Projecting Signs & Lightboxes', icon: 'BadgeDollarSign', image: '' },
  { id: 'vehicle-graphics-wrapping', name: 'Vehicle Graphics & Wrapping', icon: 'Car', image: '' },
  { id: 'window-graphics', name: 'Window Graphics', icon: 'PanelsTopLeft', image: '' },
  { id: 'shop-awnings', name: 'Shop Awnings', icon: 'Tent', image: '' },
  { id: 'banner-logo-printing', name: 'Banner & Logo Printing', icon: 'Flag', image: '' },
  { id: 'custom-workwear', name: 'Custom Workwear', icon: 'Shirt', image: '' },
  { id: 'flyers-brochures', name: 'Flyers & Brochures', icon: 'FileText', image: '' },
  { id: 'exhibition-stands-flags', name: 'Exhibition Stands & Flags', icon: 'Presentation', image: '' },
  { id: 'menu-displays', name: 'Menu Displays', icon: 'Monitor', image: '' },
  { id: 'safety-interior-signs', name: 'Safety & Interior Signs', icon: 'TriangleAlert', image: '' },
  { id: 'food-truck-trailer-wraps', name: 'Food Truck/Trailer Wraps', icon: 'Truck', image: '' },
  { id: 'heras-fence-banners', name: 'Heras Fence Banners', icon: 'Fence', image: '' },
]

const STORAGE_KEY = 'gallery_categories'

const normalizeCategories = (categories) => (
  categories
    .filter(category => category.name?.trim())
    .map((category, index) => ({
      id: category.id || `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`,
      name: category.name.trim(),
      icon: category.icon || 'LayoutGrid',
      image: category.image || '',
    }))
)

export function getGalleryCategories() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return normalizeCategories(parsed)
    }
  } catch (e) {
    console.error('Failed to read gallery categories:', e)
  }
  return DEFAULT_GALLERY_CATEGORIES
}

export function saveGalleryCategories(categories) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeCategories(categories)))
    window.dispatchEvent(new Event('gallery-categories-updated'))
    return true
  } catch (e) {
    console.error('Failed to save gallery categories:', e)
    return false
  }
}
