# Architecture Inventory & Analysis Report

## Current Codebase Structure

### App Router Structure (Next.js 15)
```
src/app/
├── layout.tsx           ✅ Keep - Root layout with metadata and theming
├── page.tsx             🔄 Replace - Current homepage (non-scrollytelling)
├── globals.css          🔄 Modify - Update for new design system
├── api/                 ✅ Keep - API routes for functionality
├── robots.ts            ✅ Keep - SEO configuration
├── sitemap.ts           ✅ Keep - SEO sitemap generation
└── viewport.ts          ✅ Keep - Viewport configuration
```

### Components Structure
```
src/components/
├── ui/                  🔄 Replace - Generic UI components (need redesign)
├── layout/              🔄 Replace - Navigation, header, footer (need redesign)  
├── sections/            ❌ Remove - Current static sections
├── animations/          🔄 Partial Keep - Some animation utilities may be reusable
├── common/              🔄 Evaluate - Typography, buttons, cards need redesign
└── providers/           ✅ Keep - Theme, i18n providers are good
```

### Current Tech Stack Analysis
#### ✅ KEEP - Already Aligned
- **Next.js 15** with App Router - Perfect for scrollytelling
- **TypeScript** - Essential for type safety
- **TailwindCSS** - Ideal for utility-first styling
- **GSAP 3.12.2** - Already included, perfect for animations
- **Framer Motion 11.0** - Good for micro-interactions
- **React i18next** - Good for EN/RO internationalization

#### 🔄 NEED TO ADD - Missing Requirements
- **@gsap/scrolltrigger** - Essential for scroll-based animations
- **@studio-freight/lenis** or **lenis** - Smooth scrolling
- **flubber** - SVG morphing (if MorphSVG unavailable)
- **three.js** - Optional for 3D elements (lazy loaded)
- **@vitest/coverage-v8** - For 100% coverage requirement

#### ❌ POTENTIALLY REMOVE - May Not Be Needed
- **react-intersection-observer** - ScrollTrigger handles this
- **@heroicons/react** - Using Lucide React already

### Data Structure Analysis
#### ✅ EXCELLENT - Projects Data
- **47 total projects** organized in 5 tiers
- Well-structured with categories, descriptions, tech stacks
- Rich metadata including gradients, icons, status
- Perfect foundation for chapter creation

#### Current Project Distribution:
- **Tier 1 (Foundation)**: 8 projects - Core services
- **Tier 2 (New Generation)**: 3 projects - Market expansion  
- **Tier 3 (Infrastructure)**: 10 projects - Support services
- **Tier 4 (Specialized)**: 6 projects - Unique value props
- **Tier 5 (Emerging)**: 20 projects - Future platforms

### i18n Structure Analysis
#### ✅ GOOD FOUNDATION
- English and Romanian locale files exist
- Well-organized JSON structure
- Navigation, hero, ecosystem sections covered
- Need expansion for scrollytelling content

#### Areas Needing Enhancement:
- Chapter-specific content keys
- Taglines and microcopy for each project
- Scrollytelling narrative text
- Animation and interaction labels

## What Must Be Replaced

### 🚫 COMPLETE REMOVAL
1. **Current homepage design** - Static layout incompatible with scrollytelling
2. **Existing UI components** - Not designed for cinematic experience
3. **Static project cards** - Need dynamic, animated equivalents
4. **Current navigation** - Incompatible with pinned scrolling
5. **Existing sections** - Hero, ecosystem, projects need complete redesign

### 🔄 MAJOR REFACTORING
1. **Layout components** - Keep structure, redesign aesthetics
2. **Animation system** - Expand GSAP usage significantly
3. **Theme system** - Adapt for chapter-specific color palettes
4. **Component library** - Rebuild for scrollytelling needs

## What Can Be Migrated

### ✅ PRESERVE & ENHANCE
1. **Projects data structure** - Perfect foundation for chapters
2. **i18n system** - Extend for new content
3. **TypeScript configuration** - Already well-configured
4. **Build and deployment setup** - Working Vercel integration
5. **Testing infrastructure** - Good foundation to expand

### 🔧 TECHNICAL DEBT ANALYSIS

#### High Priority Issues:
1. **No ScrollTrigger integration** - Essential for scrollytelling
2. **Missing smooth scrolling** - Required for cinematic experience
3. **Static color system** - Need dynamic chapter-based theming
4. **Limited animation system** - Need comprehensive GSAP timeline management
5. **No SVG morphing** - Required for visual transitions

#### Medium Priority Issues:
1. **Performance optimization** - Need lazy loading for heavy animations
2. **Accessibility gaps** - Need prefers-reduced-motion handling
3. **Test coverage** - Currently partial, need 100%

## Resource Audit

### Assets That Can Be Reused:
- Project icons (Lucide React icons are perfect)
- Basic SVG assets
- Font configurations
- Color palette as starting point

### Assets That Need Creation:
- Chapter-specific illustrations/animations
- SVG morphing paths
- Custom icons for scrollytelling UI
- Background patterns/textures
- 3D models (if using Three.js)

## Migration Strategy

### Phase 1: Foundation Cleanup
1. Archive current components to `src/legacy/`
2. Clean up unused dependencies  
3. Add required scrollytelling packages
4. Set up new design system structure

### Phase 2: Core Infrastructure
1. Implement smooth scrolling (Lenis)
2. Set up ScrollTrigger integration
3. Create chapter-based theming system
4. Implement SVG morphing utilities

### Phase 3: Component Rebuild
1. Build scrollytelling layout system
2. Create chapter components from scratch
3. Implement animation timelines
4. Add accessibility features

### Phase 4: Content Migration
1. Transform project data into chapter narratives
2. Expand i18n files for new content
3. Create taglines and microcopy
4. Implement CTAs and interaction points

## Conclusion

The current codebase provides an **excellent technical foundation** but requires a **complete UI/UX redesign**. The project data structure is **outstanding** and will serve as the perfect basis for the scrollytelling chapters. 

**Key Strengths:**
- Solid technical architecture (Next.js 15, TypeScript, TailwindCSS)
- Rich, well-structured project data (47 projects)
- Good i18n foundation
- GSAP already included

**Key Challenges:**
- Complete UI rebuild required
- Need major animation system expansion
- Missing scrollytelling dependencies
- 100% test coverage requirement

**Estimated Effort:** Major refactoring with selective preservation of data and infrastructure.