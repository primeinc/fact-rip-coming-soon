/**
 * Central timing constants for animations and transitions
 * This is the ONLY place where timing values should be defined
 */

export const TIMINGS = {
  // Modal animations
  modalFadeOut: 300,
  modalStateCleanup: 300,
  
  // Component animations  
  titleFade: 1000,
  sealAppear: 2000,
  pulseDelay: 500,
  buttonReveal: 3000,
  progressComplete: 2500,
  
  // Transitions
  defaultTransition: 300,
  fastTransition: 150,
  slowTransition: 500
} as const;