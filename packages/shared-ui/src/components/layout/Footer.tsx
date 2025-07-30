import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Github, Twitter, Mail, Heart, ExternalLink } from "lucide-react"

export interface FooterLink {
  label: string
  href: string
  external?: boolean
  icon?: React.ReactNode
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'minimal' | 'glass'
  showBranding?: boolean
  showSocial?: boolean
  brandText?: string
  copyrightText?: string
  sections?: FooterSection[]
  socialLinks?: FooterLink[]
  bottomText?: React.ReactNode
}

const defaultSections: FooterSection[] = [
  {
    title: "Products",
    links: [
      { label: "CODAI Platform", href: "https://codai.ro" },
      { label: "MEMORAI", href: "https://memorai.ro" },
      { label: "BANCAI", href: "https://bancai.ro" },
      { label: "STOCAI", href: "https://stocai.ro" },
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://docs.codai.ro", external: true },
      { label: "API Reference", href: "https://api.codai.ro", external: true },
      { label: "Support", href: "https://ajutai.ro", external: true },
      { label: "Status", href: "https://status.codai.ro", external: true },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "https://talentai.ro", external: true },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ]
  }
]

const defaultSocialLinks: FooterLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/codai-ecosystem",
    external: true,
    icon: <Github className="h-5 w-5" />
  },
  {
    label: "Twitter",
    href: "https://twitter.com/codai_ro",
    external: true,
    icon: <Twitter className="h-5 w-5" />
  },
  {
    label: "Contact",
    href: "mailto:contact@codai.ro",
    external: true,
    icon: <Mail className="h-5 w-5" />
  },
]

const Footer = React.forwardRef<HTMLDivElement, FooterProps>(
  ({
    className,
    variant = 'default',
    showBranding = true,
    showSocial = true,
    brandText = "CODAI",
    copyrightText,
    sections = defaultSections,
    socialLinks = defaultSocialLinks,
    bottomText,
    ...props
  }, ref) => {
    const currentYear = new Date().getFullYear()
    const defaultCopyright = `© ${currentYear} ${brandText}. All rights reserved.`

    const baseClasses = "border-t mt-auto"

    const variantClasses = {
      default: "bg-background border-border",
      minimal: "bg-transparent border-border/50",
      glass: "glass border-white/20"
    }

    return (
      <footer
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        <div className="container px-4 py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Brand section */}
            {showBranding && (
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-codai-500 to-codai-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">C</span>
                  </div>
                  <span className="text-lg font-bold gradient-text">{brandText}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  AI-native operating system for the next generation of intelligent applications.
                </p>

                {/* Social links */}
                {showSocial && socialLinks.length > 0 && (
                  <div className="flex items-center gap-2">
                    {socialLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        className="hover:text-codai-500"
                      >
                        <a
                          href={link.href}
                          target={link.external ? "_blank" : undefined}
                          rel={link.external ? "noopener noreferrer" : undefined}
                          aria-label={link.label}
                        >
                          {link.icon}
                        </a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Links sections */}
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="lg:col-span-1">
                <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {link.icon}
                        {link.label}
                        {link.external && <ExternalLink className="h-3 w-3" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom section */}
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                {copyrightText || defaultCopyright}
              </p>

              {bottomText && (
                <div className="text-xs text-muted-foreground">
                  {bottomText}
                </div>
              )}

              {!bottomText && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Made with</span>
                  <Heart className="h-3 w-3 text-red-500 fill-current" />
                  <span>by the CODAI team</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    )
  }
)

Footer.displayName = "Footer"

export { Footer }
