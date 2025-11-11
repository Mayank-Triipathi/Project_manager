"use client"

import { useState } from "react"
import React from "react";
import { Button } from "./ui/button"; // relative path
import { Link } from "react-router-dom"; // if you’re using React Router
const API = import.meta.env.VITE_API_BASE_URL;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TaskSync
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="#" className="text-foreground/70 hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="#features" className="text-foreground/70 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link to="#pricing" className="text-foreground/70 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-foreground/70 hover:text-foreground transition-colors">
              Login
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex gap-3">
            <Link to="/signin">
              <Button variant="outline" className="border-border hover:bg-muted bg-transparent">
                Sign In
              </Button>
            </Link>

            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="#" className="block px-3 py-2 text-foreground/70 hover:text-foreground">
              Home
            </Link>
            <Link to="#features" className="block px-3 py-2 text-foreground/70 hover:text-foreground">
              Features
            </Link>
            <Link to="#pricing" className="block px-3 py-2 text-foreground/70 hover:text-foreground">
              Pricing
            </Link>
            <Button className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
