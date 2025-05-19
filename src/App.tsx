import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function App() {
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);
  const [ctaClicked, setCtaClicked] = useState(false);
  
  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('fact.rip.visited');
    if (hasVisited) {
      setIsReturningVisitor(true);
    } else {
      localStorage.setItem('fact.rip.visited', 'true');
    }
    
    // Add viewport height fix for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  const handleJoinWatchtower = () => {
    setCtaClicked(true);
    
    // Track the interaction
    const timestamp = new Date().toISOString();
    localStorage.setItem('fact.rip.joined', timestamp);
    console.log('[FACT.RIP] Watchtower recruitment attempt:', { timestamp, isReturningVisitor });
    
    // For now, show modal or redirect
    // TODO: Actual implementation pending
    setTimeout(() => {
      alert('The Watchtower is being established. Your vigilance has been recorded.');
      setCtaClicked(false);
    }, 300);
  };

  return (
    <main className="relative flex flex-col items-center justify-between min-h-[100vh] bg-black text-white" 
          style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      
      {/* Content wrapper with dynamic spacing */}
      <div className="w-full flex flex-col items-center justify-center flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-sm sm:max-w-md md:max-w-lg mx-auto">
          
          {/* Primary Loop Closure Message */}
          <motion.h1
            initial={{ y: isReturningVisitor ? 40 : -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] 
                       leading-[1.1] font-bold tracking-tight"
          >
            {isReturningVisitor ? "The Loop Persists." : "The Loop Closes."}
          </motion.h1>

          {/* Visual Closure Bar */}
          <div className="w-full flex justify-center px-8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="h-1 bg-red-600 max-w-[240px] sm:max-w-[320px]"
            />
          </div>

          {/* EchoIndex Pulse */}
          <div className="flex justify-center py-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ 
                duration: 1.8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                         bg-red-500 rounded-full 
                         shadow-lg shadow-red-500/25"
              aria-label="Actor monitoring in progress"
            />
          </div>

          {/* Custodes Seal Logo */}
          <div className="flex justify-center">
            <motion.img
              src="/custodes-seal.svg"
              alt="Custodes Engine Verified Seal"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: isReturningVisitor ? 2 : 5, 
                duration: 1,
                ease: "easeInOut"
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
            />
          </div>
        </div>
      </div>

      {/* CTA Fixed to Bottom with proper safe area handling */}
      <div className="w-full px-4 sm:px-6 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-6 sm:mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={handleJoinWatchtower}
            disabled={ctaClicked}
            className={`w-full sm:w-auto sm:min-w-[280px] 
                       flex items-center justify-center mx-auto
                       px-6 py-4 sm:px-8 sm:py-4
                       ${ctaClicked ? 'bg-red-600' : 'bg-white'} 
                       ${ctaClicked ? 'text-white' : 'text-black'} 
                       font-bold rounded-full tracking-wide uppercase 
                       text-[14px] sm:text-[16px]
                       disabled:cursor-not-allowed transition-all
                       shadow-lg ${ctaClicked ? 'shadow-red-600/40' : 'shadow-white/20'}`}
          >
            {ctaClicked ? "Registering..." : "Join the Watchtower"}
          </motion.button>
        </div>
      </div>
    </main>
  );
}