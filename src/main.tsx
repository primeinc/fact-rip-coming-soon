import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { StorageProvider } from './contexts/StorageContext.tsx'
import { UserJourneyProvider } from './contexts/UserJourneyContext.tsx'
import { installStorageGuards } from './utils/runtime-guards'

// Install runtime guards in development
installStorageGuards()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <StorageProvider>
        <UserJourneyProvider>
          <App />
        </UserJourneyProvider>
      </StorageProvider>
    </ErrorBoundary>
  </StrictMode>,
)
