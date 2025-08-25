// CONSOLIDATED: This component has been replaced by @codai/shared-ui Modal component
// The shared-ui Modal provides comprehensive functionality including:
// - Advanced modal system with overlay, content, header, footer, and close button components
// - Size variants: sm, default, lg, xl, fullscreen with responsive behavior
// - App-specific theming and customization support  
// - Enhanced animations and transitions using Framer Motion
// - Accessibility features: focus management, escape key, click outside
// - Portal rendering for proper z-index management
// - Loading states and confirmation dialog patterns

// Use the shared Modal component instead:
// import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalCloseButton } from "@codai/shared-ui"

import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalCloseButton, ConfirmationModal, LoadingModal } from "@codai/shared-ui"

// Re-export for backward compatibility
export { Modal, ModalOverlay, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalCloseButton, ConfirmationModal, LoadingModal }
export type { ModalProps, ModalOverlayProps, ModalContentProps, ModalHeaderProps, ModalTitleProps, ModalDescriptionProps, ModalFooterProps, ModalCloseButtonProps } from "@codai/shared-ui"

// For existing default exports to continue working
export default Modal
