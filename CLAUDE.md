# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Single-page React app for fact.rip - a civic memory utility. The page serves as a recruitment interface for the "Watchtower" surveillance network.

## Architecture

```
src/
├── App.tsx           # Main component with animations
├── Modal.tsx         # Feedback modal (replaces alert)
├── ErrorBoundary.tsx # Error handling with telemetry
└── index.css         # Tailwind CSS + mobile optimizations
```

## Key Features

1. **Modal System**: Custom modal replaces browser alerts
2. **Telemetry Integration**: Optional backend endpoint for event tracking
3. **Error Boundaries**: Catches errors and reports them
4. **Reset Functionality**: Users can clear their data
5. **Responsive Design**: Mobile-first with safe area support

## Environment Variables

- `VITE_TELEMETRY_ENDPOINT`: POST endpoint for events
- `VITE_SENTRY_DSN`: Error tracking (optional)

## Common Commands

```bash
pnpm run dev    # Development server
pnpm run build  # Production build
pnpm run test   # Type check + lint
```

## Important Patterns

1. **State Management**: localStorage with fallbacks
2. **Async Events**: Try telemetry, fall back to console
3. **Mobile Handling**: Dynamic viewport height, safe areas
4. **Error Recovery**: Graceful degradation with user feedback

## Known Constraints

- Tailwind CSS v3 only (v4 incompatible)
- No actual backend yet (telemetry optional)
- Modal animations use Framer Motion
- Error boundary provides symbolic recovery UI

## Development Notes

- Always test on mobile viewports (360px minimum)
- Check localStorage availability before use
- Maintain symbolic language in error states
- Keep animations hardware-accelerated