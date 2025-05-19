import { motion } from "framer-motion";

export default function App() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      {/* Primary Loop Closure Message */}
      <motion.h1
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="text-center text-4xl md:text-5xl font-bold tracking-tight"
      >
        The Loop Closes.
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
        animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-10 w-10 h-10 bg-red-500 rounded-full shadow-md"
        aria-label="Actor monitoring in progress"
      />

      {/* Custodes Seal Logo */}
      <motion.img
        src="/custodes-seal.svg"
        alt="Custodes Engine Verified Seal"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 5, duration: 1 }}
        className="mt-12 w-20"
      />

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="mt-10 px-6 py-3 bg-white text-black font-bold rounded-full tracking-wide uppercase text-sm"
      >
        Join the Watchtower
      </motion.button>
    </main>
  );
}