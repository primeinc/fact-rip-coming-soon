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
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 sm:p-6 max-w-lg mx-auto">
      {/* Primary Loop Closure Message */}
      <motion.h1
        initial={{ y: isReturningVisitor ? 40 : -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
      >
        {isReturningVisitor ? "The Loop Persists." : "The Loop Closes."}
      </motion.h1>

      {/* Visual Closure Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "80%" }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="h-1 bg-red-600 mt-4"
      />

      {/* EchoIndex Pulse */}
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1, 1.4, 1], 
          opacity: [0.8, 1, 0.8, 1, 0.8] 
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          // Accelerate over time
          ease: [0.4, 0, 0.6, 1]
        }}
        className="mt-10 w-10 h-10 bg-red-500 rounded-full shadow-md"
        aria-label="Actor monitoring in progress"
      />

      {/* Custodes Seal Logo */}
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
        className="mt-12 w-20"
      />

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={handleJoinWatchtower}
        disabled={ctaClicked}
        className={`mt-10 px-6 py-3 ${ctaClicked ? 'bg-red-600' : 'bg-white'} ${ctaClicked ? 'text-white' : 'text-black'} font-bold rounded-full tracking-wide uppercase text-sm transition-colors`}
      >
        {ctaClicked ? "Registering..." : "Join the Watchtower"}
      </motion.button>
    </main>
  );
}