import { GALLERY_IMAGES, GALLERY_VIDEOS } from './galleryMedia.generated'

const FALLBACK_POSTERS = [
  '/images/client-images/van_wrapping_2.webp',
  '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg',
  '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.18 PM.jpeg',
  '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg',
]

const categoryForIndex = (index) => {
  const categories = [
    '3D Lettering Signs',
    'Shop Front Signs',
    'Illuminated & Neon Signs',
    'Projecting Signs & Lightboxes',
    'Vehicle Graphics & Wrapping',
    'Window Graphics',
    'Shop Awnings',
    'Banner & Logo Printing',
    'Custom Workwear',
    'Flyers & Brochures',
    'Exhibition Stands & Flags',
    'Menu Displays',
    'Safety & Interior Signs',
    'Food Truck/Trailer Wraps',
    'Heras Fence Banners',
  ]
  return categories[index % categories.length]
}

export const HOME_GALLERY_PREVIEW = GALLERY_VIDEOS.slice(0, 4).map((item, index) => ({
  ...item,
  category: categoryForIndex(index),
  title: categoryForIndex(index),
  fallback: GALLERY_IMAGES[index % GALLERY_IMAGES.length]?.src || FALLBACK_POSTERS[index],
}))

export const ALL_LOCAL_GALLERY_MEDIA = [
  ...GALLERY_VIDEOS.map((item, index) => ({
    ...item,
    id: `local-video-${index}`,
    mediaType: 'video',
    category: categoryForIndex(index),
    title: categoryForIndex(index),
  })),
  ...GALLERY_IMAGES.map((item, index) => ({
    ...item,
    id: `local-image-${index}`,
    mediaType: 'image',
    category: categoryForIndex(index),
    title: categoryForIndex(index),
  })),
]
