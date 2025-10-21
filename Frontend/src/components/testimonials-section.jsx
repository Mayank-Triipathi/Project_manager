"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at TechCorp",
    content: "TaskSync transformed how our team collaborates. We've cut project delivery time by 40%.",
    avatar: "👩‍💼",
  },
  {
    name: "Marcus Johnson",
    role: "CEO at StartupHub",
    content: "The best project management tool we've used. Simple, powerful, and exactly what we needed.",
    avatar: "👨‍💼",
  },
  {
    name: "Emily Rodriguez",
    role: "Team Lead at DesignStudio",
    content: "Real-time collaboration features are game-changing. Our team is more productive than ever.",
    avatar: "👩‍🎨",
  },
]

export default function TestimonialsSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })

    const element = document.getElementById("testimonials-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="testimonials-section" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Loved by Teams Worldwide</h2>
          <p className="text-xl text-foreground/70">See what our customers have to say about TaskSync.</p>
        </div>

        {/* Testimonials Grid */}
        <div id="testimonials-section" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className={`p-8 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed italic">"{testimonial.content}"</p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-lg">
                    ⭐
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
