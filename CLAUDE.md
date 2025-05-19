# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a single-page React coming soon app for fact.rip, a civic memory utility for documenting accountability events. The app is built with:

- React 19.1.0 + TypeScript 5.8.3
- Vite 6.3.5 as the build tool
- Framer Motion 12.12.1 for animations
- Tailwind CSS 3.4.17 for styling (NOTE: v4 is incompatible with current PostCSS setup)
- pnpm as the package manager (globally available per user preferences)

## Common Commands

```bash
# Development server (runs on http://localhost:5173)
pnpm run dev

# Build for production (outputs to dist/)
pnpm run build

# Preview production build (runs on http://localhost:4173)
pnpm run preview

# Run linting
pnpm run lint
```

## Architecture

### Core Files
- `src/App.tsx` - Main component with all animations and UI elements
- `src/index.css` - Tailwind CSS directives (must use @tailwind base/components/utilities)
- `public/custodes-seal.svg` - Placeholder logo (consider replacing with actual asset)

### Design Specifications
The app implements specific symbolic animations:
1. "The Loop Closes" title - Entry animation (y: -40 to 0, 1.2s duration)
2. Red progress bar - Width animation (0 to 80%, 0.7s duration, 0.6s delay)
3. EchoIndex pulse - Infinite scale/opacity animation (2s duration)
4. Custodes seal - Delayed appearance (5s delay, scale 0.6 to 1)
5. CTA button - Hover/tap interactions

### Critical Configuration Notes

1. **Tailwind CSS Version**: Must use v3, not v4. The PostCSS configuration is incompatible with v4.
2. **Deployment Configs**: Both `vercel.json` and `netlify.toml` are preconfigured
3. **Build Output**: The production build outputs to `dist/` directory

### Implemented Features

1. **Functional CTA Button**: Click handler logs to console and localStorage
2. **State Persistence**: Tracks first-time vs returning visitors
3. **Dynamic Animations**: Different entry animations based on visit history
4. **Responsive Design**: Proper mobile breakpoints (375px+)
5. **Symbolic Timing**: Animations reflect epistemic weight, not defaults

### Outstanding Issues

1. Tailwind CSS v4 causes PostCSS errors - must stay on v3
2. The custodes-seal.svg is a placeholder and should be replaced with actual branding
3. No actual Watchtower integration (currently shows alert)
4. Deployment requires manual Vercel authentication

### Development Guidelines

- Always use pnpm (per user's global preferences)
- Test builds with `pnpm run build` before claiming features work
- The app is mobile-first, optimized for 375x667px and above
- Black background (#000) with red accents (#DC2626, #EF4444) per fact.rip branding
- All animations have symbolic meaning tied to the platform's accountability mission