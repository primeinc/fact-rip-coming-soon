import { useCallback } from "react";
import { Title } from "./components/Title";
import { ProgressBar } from "./components/ProgressBar";
import { Pulse } from "./components/Pulse";
import { Seal } from "./components/Seal";
import { CTAButton } from "./components/CTAButton";
import { Modal } from "./components/Modal";
import { useViewportHeight } from "./hooks/useViewportHeight";
import { useTelemetry } from "./hooks/useTelemetry";
import { useUserJourney } from "./contexts/UserJourneyContext";

export default function App() {
  const { state, dispatch, joinWatchtower, reset } = useUserJourney();
  const { sendEvent } = useTelemetry();
  
  useViewportHeight();

  const handleJoinWatchtower = useCallback(async () => {
    const timestamp = new Date().toISOString();
    
    // Send telemetry event
    const eventData = {
      timestamp,
      action: 'watchtower_join',
      returning: state.hasVisited,
      user_agent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    await sendEvent(eventData);
    joinWatchtower(timestamp);
  }, [state.hasVisited, sendEvent, joinWatchtower]);

  const handleModalClose = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
    // After animation completes, hide the modal
    setTimeout(() => {
      dispatch({ type: 'MODAL_HIDDEN' });
    }, 300);
  }, [dispatch]);

  const handleReset = useCallback(async () => {
    await reset();
    // No reload needed - state is fully managed
  }, [reset]);

  const isModalOpen = state.modalState !== 'hidden';

  return (
    <main className="relative flex flex-col items-center justify-between min-h-[100vh] bg-black text-white" 
          style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      
      <div className="w-full flex flex-col items-center justify-center flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-sm sm:max-w-md md:max-w-lg mx-auto">
          <Title isReturning={state.hasVisited} />
          <ProgressBar />
          <Pulse />
          <Seal isReturning={state.hasVisited} />
        </div>
      </div>

      <CTAButton 
        onClick={handleJoinWatchtower}
        isLoading={state.isLoading}
      />
      
      <Modal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        hasJoined={!!state.joinedTimestamp}
        onReset={handleReset}
      />
    </main>
  );
}