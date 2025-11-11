"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
const API = import.meta.env.VITE_API_BASE_URL;

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })

    const element = document.getElementById("cta-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="cta-section" className="py-20 sm:py-32 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className={`space-y-8 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-4xl sm:text-5xl font-bold">Start Managing Smarter Today</h2>

          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Join thousands of teams already using TaskSync to deliver projects faster and collaborate better.
          </p>

          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground text-lg h-14 px-10">
            Sign Up Free
          </Button>

          <p className="text-sm text-foreground/50">14-day free trial. No credit card required. Cancel anytime.</p>
        </div>
      </div>
    </section>
  )
}
