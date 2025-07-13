import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { EcosystemShowcase } from '@/components/sections/EcosystemShowcase'
import { TechnicalExpertise } from '@/components/sections/TechnicalExpertise'
import { ContactSection } from '@/components/sections/ContactSection'
import { NavigationBar } from '@/components/layout/NavigationBar'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <NavigationBar />
            <HeroSection />
            <AboutSection />
            <EcosystemShowcase />
            <TechnicalExpertise />
            <ContactSection />
            <Footer />
        </main>
    )
}
