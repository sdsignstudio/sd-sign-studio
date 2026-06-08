const DEFAULT_SETTINGS = {
  badge: "Why Partner With Us",
  title: "Built To Stand Out, Designed To Last",
  subtitle: "Glasgow's ultimate sign and wrap fabrication team combining quality materials, elite engineering, and custom graphics.",
  points: [
    {
      image: "/images/client-images/van_wrapping.jpg",
      title: "Fast & Reliable Turnaround",
      desc: "We understand that time is money. Our team works efficiently to design, fabricate, and install your signage on schedule, minimizing downtime."
    },
    {
      image: "/images/client-images/WhatsApp Image 2026-05-17 at 11.20.17 PM.jpeg",
      title: "10+ Years Experience",
      desc: "Our signwriters and wrap installers bring over a decade of industry expertise, delivering flawless installations that guarantee satisfaction."
    },
    {
      image: "/images/client-images/van_wrapping_2.webp",
      title: "High-Quality Materials",
      desc: "We use only premium, commercial-grade vinyls (like Hexis, 3M, Avery) and durable inks to ensure your signage stays vibrant and weather-resistant."
    },
    {
      image: "/images/client-images/car2.jpg",
      title: "Bespoke Custom Designs",
      desc: "No templates here. Every vehicle livery, shop front sign, or logo display is tailored to fit your brand identity and target audience perfectly."
    }
  ]
}

export function getWhyUsSettings() {
  try {
    const stored = localStorage.getItem('why_us_settings')
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
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
