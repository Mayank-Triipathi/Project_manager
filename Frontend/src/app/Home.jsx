"use client"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import ShowcaseSection from "@/components/showcase-section"
import TestimonialsSection from "@/components/testimonials-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar/>
      <HeroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}