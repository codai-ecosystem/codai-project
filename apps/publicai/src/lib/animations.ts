// Page transition variants
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

export const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4,
};

// Slide in variants - Note: direction parameter should be passed at runtime
export const slideVariants = {
  enter: {
    x: 1000,
    opacity: 0,
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: {
    zIndex: 0,
    x: -1000,
    opacity: 0,
  },
};

// Fade variants
export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Scale variants
export const scaleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Stagger container
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
};

// Bounce variants
export const bounceVariants = {
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Modal variants
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.75,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.75,
  },
};

// Backdrop variants
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide up variants
export const slideUpVariants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
  },
};

// Navigation variants
export const navVariants = {
  hidden: {
    x: '-100%',
  },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '-100%',
  },
};

// Loading spinner variants
export const spinnerVariants = {
  start: {
    rotate: 0,
  },
  end: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Pulse variants
export const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Card hover variants
export const cardHoverVariants = {
  hover: {
    y: -5,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// Button variants
export const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.98,
  },
};

// Text reveal variants
export const textRevealVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

// List animation variants
export const listVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

export const listItemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

// Common transitions
export const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
};

export const easeInOut = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

export const fastEase = {
  duration: 0.2,
  ease: 'easeInOut',
};

export const slowEase = {
  duration: 0.6,
  ease: 'easeInOut',
};

// Presets for common animations
export const animationPresets = {
  fadeIn: {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    variants: fadeVariants,
  },
  scaleIn: {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    variants: scaleVariants,
  },
  slideUp: {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    variants: slideUpVariants,
  },
  stagger: {
    initial: 'hidden',
    animate: 'visible',
    variants: staggerContainer,
  },
};
