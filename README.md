# fact.rip Coming Soon Page

Live surveillance infrastructure for civic memory. The loop closes.

## Quick Start

```bash
git clone https://github.com/yourusername/fact-rip-coming-soon.git
cd fact-rip-coming-soon
pnpm install
pnpm run dev
```

## Features

- **State Persistence**: Tracks visits and joins via localStorage
- **Dynamic Animations**: Different behaviors for returning visitors  
- **Mobile Optimized**: 360px+ responsive with safe area support
- **Error Resilient**: Error boundaries with telemetry integration
- **Backend Ready**: Optional telemetry endpoint for real tracking

## Configuration

```bash
cp .env.example .env
```

Optional environment variables:
- `VITE_TELEMETRY_ENDPOINT`: POST endpoint for event tracking
- `VITE_SENTRY_DSN`: Error tracking integration

## Architecture

```
src/
├── App.tsx          # Main component with animations
├── Modal.tsx        # Interaction feedback modal
├── ErrorBoundary.tsx # Error handling with telemetry
└── index.css        # Tailwind + mobile optimizations
```

### Key Interactions

1. **First Visit**: Shows "The Loop Closes" with upward animation
2. **Return Visit**: Shows "The Loop Persists" with downward animation
3. **Join Action**: Opens modal, sends telemetry, stores timestamp
4. **Reset Option**: Available in modal for returning users

## Development

```bash
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run test         # Type check + lint
pnpm run ci           # Full CI pipeline
```

## Deployment

```bash
pnpm run build
# Deploy dist/ to any static host
```

### Telemetry Events

Events sent to `VITE_TELEMETRY_ENDPOINT`:

```json
{
  "action": "watchtower_join",
  "timestamp": "2024-01-01T00:00:00Z",
  "returning": false,
  "user_agent": "...",
  "viewport": { "width": 390, "height": 844 }
}
```

## Mobile Optimizations

- Dynamic viewport height (--vh custom property)
- Safe area insets for notch devices
- Touch targets minimum 48px
- Disabled iOS tap highlights
- Prevented overscroll bounce

## License

© 2024 fact.rip