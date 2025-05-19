import { motion } from "framer-motion";
import { ANIMATIONS } from "../constants/animations";

export function Pulse() {
  return (
    <div className="flex justify-center py-4">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.7, 1, 0.7] 
        }}
        transition={ANIMATIONS.pulse}
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                   bg-red-500 rounded-full 
                   shadow-lg shadow-red-500/25"
        aria-label="Actor monitoring in progress"
      />
    </div>
  );
}