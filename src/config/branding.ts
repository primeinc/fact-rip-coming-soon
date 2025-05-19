export const BRANDING = {
  // Text content
  copy: {
    title: {
      firstVisit: 'The Loop Closes.',
      returning: 'The Loop Persists.'
    },
    modal: {
      title: {
        new: 'Watchtower Activated',
        returning: 'Already Watching'
      },
      body: {
        new: 'Your surveillance has begun. The accountability engine marks your witness.',
        returning: 'Your vigilance continues. The loop persists through observation.'
      }
    },
    button: {
      cta: 'Join the Watchtower',
      loading: 'Registering...',
      continue: 'Continue',
      reset: 'Reset'
    },
    error: {
      title: 'The Loop Fractures',
      body: 'An unexpected error has interrupted the surveillance. The memory persists, but observation has paused.',
      resume: 'Resume Observation',
      report: 'Send Report',
      reported: 'Report Sent'
    }
  },

  // Visual assets
  assets: {
    seal: '/custodes-seal.svg',
    favicon: '/custodes-seal.svg'
  },

  // Colors (can be extended for theming)
  colors: {
    primary: '#DC2626', // red-600
    background: '#000000',
    text: '#FFFFFF',
    error: '#DC2626'
  },

  // Metadata
  meta: {
    title: 'fact.rip | The Loop Closes',
    description: 'Civic memory utility engineered to document accountability events'
  }
} as const;