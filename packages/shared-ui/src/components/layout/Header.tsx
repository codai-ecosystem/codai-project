import * as React from "react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"
import { Menu, X, Sun, Moon, Globe } from "lucide-react"

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  showMenu?: boolean
  showThemeToggle?: boolean
  showLanguageToggle?: boolean
  onMenuToggle?: () => void
  onThemeToggle?: () => void
  onLanguageToggle?: () => void
  theme?: 'light' | 'dark'
  language?: 'en' | 'ro'
  navigation?: Array<{
    label: string
    href: string
    active?: boolean
    icon?: React.ReactNode
  }>
  actions?: React.ReactNode
  variant?: 'default' | 'minimal' | 'glass' | 'elevated'
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({
    className,
    title = "CODAI",
    subtitle,
    showMenu = true,
    showThemeToggle = true,
    showLanguageToggle = true,
    onMenuToggle,
    onThemeToggle,
    onLanguageToggle,
    theme = 'light',
    language = 'en',
    navigation = [],
    actions,
    variant = 'default',
    ...props
  }, ref) => {
    const baseClasses = "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60"

    const variantClasses = {
      default: "bg-background/95 border-border",
      minimal: "bg-transparent border-transparent",
      glass: "glass border-white/20",
      elevated: "bg-background shadow-lg border-border"
    }

    return (
      <header
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left section - Logo and Navigation */}
          <div className="flex items-center gap-6">
            {/* Menu toggle for mobile */}
            {showMenu && onMenuToggle && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onMenuToggle}
                className="md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-codai-500 to-codai-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold gradient-text">{title}</h1>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground hidden sm:block">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            {navigation.length > 0 && (
              <nav className="hidden md:flex items-center gap-1">
                {navigation.map((item, index) => (
                  <Button
                    key={index}
                    variant={item.active ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a href={item.href}>
                      {item.icon}
                      {item.label}
                    </a>
                  </Button>
                ))}
              </nav>
            )}
          </div>

          {/* Right section - Actions and Controls */}
          <div className="flex items-center gap-2">
            {/* Custom actions */}
            {actions}

            {/* Language Toggle */}
            {showLanguageToggle && onLanguageToggle && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onLanguageToggle}
                className="gap-1"
                aria-label={`Switch to ${language === 'en' ? 'Romanian' : 'English'}`}
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {language.toUpperCase()}
                </span>
              </Button>
            )}

            {/* Theme Toggle */}
            {showThemeToggle && onThemeToggle && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onThemeToggle}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </header>
    )
  }
)

Header.displayName = "Header"

export { Header }
