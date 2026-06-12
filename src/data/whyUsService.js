const DEFAULT_SETTINGS = {
  badge: "Why Partner With Us",
  title: "Built To Stand Out, Designed To Last",
  subtitle: "Glasgow's ultimate sign and wrap fabrication team combining quality materials, elite engineering, and custom graphics.",
  points: [
    {
      image: "/images/client-images/van_wrapping.jpg",
      title: "Shop Front Signs",
      desc: "We make exterior commercial and retail signs easy—from initial site survey to final installation. Creating the perfect storefront is crucial for exposing your brand and making a memorable first impression."
    },
    {
      image: "/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM (2).jpeg",
      title: "Vehicle Graphics & Wrapping",
      desc: "Vehicle vinyl wraps are available in striking matt or gloss finishes. Whether solid colours or printed bespoke artwork, our van sign writing completely changes the look of your vehicle while protecting the paint."
    },
    {
      image: "/images/client-images/car2.jpg",
      title: "3D Lettering Signs",
      desc: "Put some pow into your brand with our carefully crafted 3D lettering. Made from robust materials like metal, wood, or acrylic, they can be flat-cut or built up into a hollow finish for extra depth and LED halo illumination."
    },
    {
      image: "/images/client-images/van_wrapping_2.webp",
      title: "Illuminated & Neon Signs",
      desc: "Day or night, give your office, shop, or café a stunning glow with bespoke illuminated and neon signs. We combine metal frameworks with long-lasting LEDs for pure electric magic."
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
