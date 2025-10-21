"use client"

import { useEffect, useState } from "react"
import analyticimage from "@/images/homepage_analytics_2.png"
export default function ShowcaseSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })

    const element = document.getElementById("showcase-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="showcase-section" className="py-20 sm:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">See TaskSync in Action</h2>
          <p className="text-xl text-foreground/70">
            Explore our intuitive dashboard and powerful project management tools.
          </p>
        </div>

        {/* Showcase Image */}
        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 ${
            isVisible ? "animate-scale-in" : "opacity-0"
          }`}
        >
          <img src={analyticimage} alt="TaskSync Dashboard Showcase" className="w-full h-auto" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />

          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
