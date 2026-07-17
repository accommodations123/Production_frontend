/**
 * Centralized Framer Motion presets to maintain animation consistency.
 */

export const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 300,
  damping: 25
};

export const EASE_TRANSITION = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1], // easeOutExpo
  duration: 0.4
};

export const FADE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

export const MODAL_VARIANTS = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: EASE_TRANSITION 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 12,
    transition: { duration: 0.2 }
  }
};

export const DROPDOWN_VARIANTS = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.97, 
    y: 6,
    transition: { duration: 0.15 }
  }
};

export const TOOLTIP_VARIANTS = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const SLIDE_IN_RIGHT = {
  initial: { x: "100%" },
  animate: { x: 0, transition: SPRING_TRANSITION },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } }
};

export const PAGE_TRANSITION_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: EASE_TRANSITION },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};
