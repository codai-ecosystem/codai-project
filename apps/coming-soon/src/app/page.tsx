'use client'

import { Suspense } from 'react'
import Navigation from '@/components/layout/ResponsiveNavigation'
import { CleanHero } from '@/components/sections/CleanHero'
import { UnifiedProjectGallery } from '@/components/sections/UnifiedProjectGallery'
import AboutSection from '@/components/sections/AboutSection'
import ContactSection from '@/components/sections/ContactSection'
import TechnologyStack from '@/components/sections/TechnologyStack'
import { AnimatedSection } from '@/components/animations/AnimatedSection'
import { ParallaxContainer } from '@/components/animations/ParallaxContainer'
import ModernFooter from '@/components/layout/ModernFooter'
import { ScrollAnimationProvider, ScrollIndicator } from '@/components/animations/ScrollAnimationProvider'
import { useTheme } from '@/contexts/ThemeContext'
import { CODAIHomePageSchemas } from '@/components/seo/StructuredData'
import EnhancedStructuredData from '@/components/seo/EnhancedStructuredData'
import { SocialMediaProvider, SocialMediaFollow, SocialShareButtons, SocialProof } from '@/components/seo/SocialMediaIntegration'
import { AccessibilityTester } from '@/lib/accessibility/AccessibilityChecker'
import { DevelopmentDashboard } from '@/components/development/DevelopmentDashboard'
import React from 'react'

// Loading components for Suspense boundaries
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
)

const SectionLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="h-96 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  }>
    {children}
  </Suspense>
)

export default function HomePage() {
  const { theme } = useTheme()

  return (
    <SocialMediaProvider>
      <CODAIHomePageSchemas />
      <EnhancedStructuredData type="home" />
      <ScrollAnimationProvider>
        <main id="main" className="min-h-screen bg-black text-white overflow-x-hidden">
          {/* Scroll Progress Indicator */}
          <ScrollIndicator position="top" />

          {/* Navigation */}
          <Navigation />

          {/* Revolutionary Clean Hero Section */}
          <SectionLoader>
            <CleanHero />
          </SectionLoader>

          {/* Unified Project Gallery - All 42 CODAI Projects */}
          <SectionLoader>
            <UnifiedProjectGallery />
          </SectionLoader>

          {/* About Section - Vision, Mission, Values */}
          <SectionLoader>
            <AboutSection />
          </SectionLoader>

          {/* Technology Stack Showcase */}
          <SectionLoader>
            <TechnologyStack />
          </SectionLoader>

          {/* Contact & Early Access Signup */}
          <SectionLoader>
            <ContactSection />
          </SectionLoader>

          {/* Social Media Integration Section */}
          <SectionLoader>
            <AnimatedSection
              animationType="fade-in"
              duration={1.0}
              className="py-20 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900"
            >
              <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent'
                    : 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent'
                    }`}>
                    Join Our Community
                  </h2>
                  <p className={`text-xl max-w-3xl mx-auto mb-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    Connect with us across social platforms and be part of the AI revolution
                  </p>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  <SocialProof />
                  <SocialMediaFollow />
                  <SocialShareButtons />
                </div>
              </div>
            </AnimatedSection>
          </SectionLoader>

          {/* Footer */}
          <SectionLoader>
            <ModernFooter />
          </SectionLoader>

          {/* Development Tools (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <AccessibilityTester />
              <DevelopmentDashboard />
            </>
          )}
        </main>
      </ScrollAnimationProvider>
    </SocialMediaProvider>
  )
}