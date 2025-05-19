export const ANIMATIONS = {
  title: {
    duration: 1.2,
    ease: "easeOut"
  },

  progressBar: {
    duration: 0.7,
    delay: 0.6
  },

  pulse: {
    duration: 1.8,
    ease: "easeInOut",
    repeat: Infinity
  },

  seal: {
    returningDelay: 2,
    newVisitorDelay: 5,
    duration: 1,
    ease: "easeInOut"
  },

  button: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    transition: { duration: 0.2 }
  },

  modal: {
    overlay: { duration: 0.3 },
    content: { type: "spring", damping: 25 }
  }
} as const;