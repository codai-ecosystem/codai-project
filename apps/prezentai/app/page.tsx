import { Suspense, lazy } from 'react'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { HeroSection } from '@/components/sections/HeroSection'
import { Footer } from '@/components/layout/Footer'

// Lazy load non-critical sections
const AboutSection = lazy(() => import('@/components/sections/AboutSection').then(mod => ({ default: mod.AboutSection })))
const EcosystemShowcase = lazy(() => import('@/components/sections/EcosystemShowcase').then(mod => ({ default: mod.EcosystemShowcase })))
const TechnicalExpertise = lazy(() => import('@/components/sections/TechnicalExpertise').then(mod => ({ default: mod.TechnicalExpertise })))
const ContactSection = lazy(() => import('@/components/sections/ContactSection').then(mod => ({ default: mod.ContactSection })))

// Loading components
const SectionLoading = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
)

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <NavigationBar />
            <HeroSection />
            
            <Suspense fallback={<SectionLoading />}>
                <AboutSection />
            </Suspense>
            
            <Suspense fallback={<SectionLoading />}>
                <EcosystemShowcase />
            </Suspense>
            
            <Suspense fallback={<SectionLoading />}>
                <TechnicalExpertise />
            </Suspense>
            
            <Suspense fallback={<SectionLoading />}>
                <ContactSection />
            </Suspense>
            
            <Footer />
        </main>
    )
}
