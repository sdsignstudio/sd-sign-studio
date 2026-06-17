const DEFAULT_SETTINGS = {
  badge: "Why Partner With Us",
  title: "Built To Stand Out, Designed To Last",
  subtitle: "Glasgow's ultimate sign and wrap fabrication team combining quality materials, elite engineering, and custom graphics.",
  points: [
    {
      image: "/images/client-images/van_wrapping.jpg",
      title: "Shop Front Signs",
      desc: "From site survey to installation, we create stunning exterior signs that make your storefront impossible to ignore."
    },
    {
      image: "/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg",
      title: "Vehicle Graphics & Wrapping",
      desc: "Bold matt or gloss vinyl wraps that transform your vehicle's look and protect the paintwork underneath."
    },
    {
      image: "/images/client-images/car2.jpg",
      title: "3D Lettering Signs",
      desc: "Eye-catching 3D letters in metal, wood, or acrylic — flat-cut or built up with LED halo illumination."
    },
    {
      image: "/images/client-images/van_wrapping_2.webp",
      title: "Illuminated & Neon Signs",
      desc: "Bespoke illuminated and neon signs that give your premises a stunning glow day and night."
    }
  ]
}

export function getWhyUsSettings() {
  try {
    const stored = localStorage.getItem('why_us_settings')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Reset if it contains any old Why Choose Us text, or the temporary Services headers
      if (parsed.points && parsed.points.some(pt => pt.title === "Fast & Reliable Turnaround" || pt.title === "10+ Years Experience") || parsed.badge === "Services" || parsed.title === "Creative Print, Production Agency") {
        localStorage.removeItem('why_us_settings')
        return DEFAULT_SETTINGS
      }
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (e) {
    console.error("Failed to read why us settings:", e)
  }
  return DEFAULT_SETTINGS
}

export function saveWhyUsSettings(settings) {
  try {
    localStorage.setItem('why_us_settings', JSON.stringify(settings))
    window.dispatchEvent(new Event('why-us-settings-updated'))
    return true
  } catch (e) {
    console.error("Failed to save why us settings:", e)
    return false
  }
}
