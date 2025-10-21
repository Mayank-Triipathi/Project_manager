"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

const features = [
  {
    icon: "⚡",
    title: "Real-time Task Tracking",
    description: "Track every task in real-time with instant updates across your team.",
  },
  {
    icon: "👥",
    title: "Team Collaboration & Invites",
    description: "Invite team members with smart permissions and seamless collaboration.",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    description: "Get insights into project progress with comprehensive analytics.",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    description: "Stay informed with intelligent notifications tailored to your role.",
  },
]

export default function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })

    const element = document.getElementById("features-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-20 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features for Modern Teams</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Everything you need to manage projects efficiently and keep your team aligned.
          </p>
        </div>

        {/* Features Grid */}
        <div id="features-section" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`p-8 border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
