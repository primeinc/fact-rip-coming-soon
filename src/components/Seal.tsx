import { motion } from "framer-motion";
import { ANIMATIONS } from "../constants/animations";
import { BRANDING } from "../config/branding";

interface SealProps {
  isReturning: boolean;
}

export function Seal({ isReturning }: SealProps) {
  return (
    <div className="flex justify-center">
      <motion.img
        src={BRANDING.assets.seal}
        alt="Custodes Engine Verified Seal"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          delay: isReturning ? ANIMATIONS.seal.returningDelay : ANIMATIONS.seal.newVisitorDelay, 
          duration: ANIMATIONS.seal.duration,
          ease: ANIMATIONS.seal.ease
        }}
        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
      />
    </div>
  );
}