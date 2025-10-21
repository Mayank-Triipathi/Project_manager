"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import analyticsImg1 from "@/images/homepage_analytics.png"

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-32">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-6 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                ✨ Introducing TaskSync Pro
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-balance leading-tight">
              Manage Projects.{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Collaborate.
              </span>{" "}
              Deliver Faster.
            </h1>

            <p className="text-xl text-foreground/70 text-balance leading-relaxed">
              Simplify your workflow with real-time collaboration, smart invites, and task automation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground text-base h-12 px-8">
                Get Started Free
              </Button>
              <Button variant="outline" className="border-border hover:bg-muted text-base h-12 px-8 bg-transparent">
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-foreground/50 pt-4">No credit card required. Start free for 14 days.</p>
          </div>

          {/* Right Image */}
          <div className={`relative ${isVisible ? "animate-scale-in" : "opacity-0"}`}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              <img src={analyticsImg1} alt="TaskSync Dashboard Preview" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>

            {/* Floating Card */}
            <div
              className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border border-border/50 backdrop-blur-sm max-w-xs animate-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent" />
                <div>
                  <p className="font-semibold text-sm">Team Collaboration</p>
                  <p className="text-xs text-foreground/60">Real-time updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
