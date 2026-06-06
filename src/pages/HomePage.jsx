import HeroSection from '../components/home/HeroSection'
import CategoriesSection from '../components/home/CategoriesSection'
import AboutSection from '../components/home/AboutSection'
import BentoSection from '../components/home/BentoSection'
import FeaturedWork from '../components/home/FeaturedWork'
import ServicesSection from '../components/home/ServicesSection'
import ProcessSection from '../components/home/ProcessSection'
import CtaBand from '../components/home/CtaBand'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <AboutSection />
      <ServicesSection />
      <FeaturedWork />
      <BentoSection />
      <ProcessSection />
      <CtaBand />
    </>
  )
}
