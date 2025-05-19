import { useState, useCallback, useEffect } from "react";
import { Title } from "./components/Title";
import { ProgressBar } from "./components/ProgressBar";
import { Pulse } from "./components/Pulse";
import { Seal } from "./components/Seal";
import { CTAButton } from "./components/CTAButton";
import { Modal } from "./components/Modal";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useViewportHeight } from "./hooks/useViewportHeight";
import { useTelemetry } from "./hooks/useTelemetry";

export default function App() {
  const [hasVisited, setHasVisited] = useLocalStorage('fact.rip.visited', false);
  const [joinedTimestamp, setJoinedTimestamp] = useLocalStorage<string | null>('fact.rip.joined', null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { sendEvent } = useTelemetry();
  
  useViewportHeight();

  // Set visited flag on first render
  useEffect(() => {
    if (!hasVisited) {
      setHasVisited(true);
    }
  }, [hasVisited, setHasVisited]);

  const handleJoinWatchtower = useCallback(async () => {
    setIsLoading(true);
    
    const timestamp = new Date().toISOString();
    const eventData = {
      timestamp,
      action: 'watchtower_join',
      returning: hasVisited,
      user_agent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    await sendEvent(eventData);
    setJoinedTimestamp(timestamp);
    
    setTimeout(() => {
      setModalOpen(true);
      setIsLoading(false);
    }, 300);
  }, [hasVisited, sendEvent, setJoinedTimestamp]);

  const handleReset = useCallback(() => {
    setHasVisited(false);
    setJoinedTimestamp(null);
    window.location.reload();
  }, [setHasVisited, setJoinedTimestamp]);

  return (
    <main className="relative flex flex-col items-center justify-between min-h-[100vh] bg-black text-white" 
          style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      
      <div className="w-full flex flex-col items-center justify-center flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-sm sm:max-w-md md:max-w-lg mx-auto">
          <Title isReturning={hasVisited} />
          <ProgressBar />
          <Pulse />
          <Seal isReturning={hasVisited} />
        </div>
      </div>

      <CTAButton 
        onClick={handleJoinWatchtower}
        isLoading={isLoading}
      />
      
      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        hasJoined={!!joinedTimestamp}
        onReset={handleReset}
      />
    </main>
  );
}