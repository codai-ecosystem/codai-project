// CONSOLIDATED: This component has been replaced by @codai/shared-ui Button component
// The shared-ui Button provides comprehensive functionality including:
// - 16+ variants with app-specific theming
// - Advanced features: loading states, icons, tooltips, pulse effects
// - Touch-friendly sizes and accessibility features
// - Animated effects and gradient variants

// Use the shared Button component instead:
// import { Button } from "@codai/shared-ui"

import { Button } from "@codai/shared-ui"

// Re-export for backward compatibility
export { Button, buttonVariants } from "@codai/shared-ui"
export type { ButtonProps } from "@codai/shared-ui"

// For existing imports to continue working
export default Button
