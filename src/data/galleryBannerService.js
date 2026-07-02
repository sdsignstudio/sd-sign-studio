const DEFAULT_GALLERY_BANNER_SETTINGS = {
  mediaType: 'slideshow',
  videoUrl: '',
  slides: [
    { image: '/images/client-images/van_wrapping.jpg' },
    { image: '/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg' },
    { image: '/images/client-images/car2.jpg' },
    { image: '/images/client-images/van_wrapping_2.webp' },
  ],
}

export function getGalleryBannerSettings() {
  try {
    const stored = localStorage.getItem('gallery_banner_settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        ...DEFAULT_GALLERY_BANNER_SETTINGS,
        ...parsed,
        slides: Array.isArray(parsed.slides) ? parsed.slides : DEFAULT_GALLERY_BANNER_SETTINGS.slides,
      }
    }
  } catch (e) {
    console.error('Failed to read gallery banner settings:', e)
  }
  return DEFAULT_GALLERY_BANNER_SETTINGS
}

export function saveGalleryBannerSettings(settings) {
  try {
    localStorage.setItem('gallery_banner_settings', JSON.stringify(settings))
    window.dispatchEvent(new Event('gallery-banner-settings-updated'))
    return true
  } catch (e) {
    console.error('Failed to save gallery banner settings:', e)
    return false
  }
}
