import { motion } from "framer-motion";
import { ANIMATIONS } from "../constants/animations";
import { BRANDING } from "../config/branding";

interface CTAButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function CTAButton({ onClick, isLoading }: CTAButtonProps) {
  return (
    <div className="w-full px-4 sm:px-6 pb-[env(safe-area-inset-bottom)]">
      <div className="mb-6 sm:mb-8">
        <motion.button
          whileHover={ANIMATIONS.button.hover}
          whileTap={ANIMATIONS.button.tap}
          transition={ANIMATIONS.button.transition}
          onClick={onClick}
          disabled={isLoading}
          className={`w-full sm:w-auto sm:min-w-[280px] 
                     flex items-center justify-center mx-auto
                     px-6 py-4 sm:px-8 sm:py-4
                     ${isLoading ? 'bg-red-600' : 'bg-white'} 
                     ${isLoading ? 'text-white' : 'text-black'} 
                     font-bold rounded-full tracking-wide uppercase 
                     text-[14px] sm:text-[16px]
                     disabled:cursor-not-allowed transition-all
                     shadow-lg ${isLoading ? 'shadow-red-600/40' : 'shadow-white/20'}`}
        >
          {isLoading ? BRANDING.copy.button.loading : BRANDING.copy.button.cta}
        </motion.button>
      </div>
    </div>
  );
}