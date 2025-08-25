// CONSOLIDATED: This component has been replaced by @codai/shared-ui Card component
// The shared-ui Card provides comprehensive functionality including:
// - 7+ variants: default, elevated, ghost, outline, gradient, glass, neon
// - Advanced features: app-specific theming, interactive states, loading states
// - Size variants: sm, default, lg, xl with proper spacing
// - Enhanced compositions: MetricCard, FeatureCard with built-in features
// - Better accessibility and responsive design

// Use the shared Card component instead:
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@codai/shared-ui"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard, FeatureCard, cardVariants } from "@codai/shared-ui"

// Re-export for backward compatibility
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard, FeatureCard, cardVariants }
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from "@codai/shared-ui"

// For existing default exports to continue working
export default Card
