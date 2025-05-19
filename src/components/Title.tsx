import { motion } from "framer-motion";
import { ANIMATIONS } from "../constants/animations";

interface TitleProps {
  isReturning: boolean;
}

export function Title({ isReturning }: TitleProps) {
  return (
    <motion.h1
      initial={{ y: isReturning ? 40 : -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={ANIMATIONS.title}
      className="text-center text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] 
                 leading-[1.1] font-bold tracking-tight"
    >
      {isReturning ? "The Loop Persists." : "The Loop Closes."}
    </motion.h1>
  );
}