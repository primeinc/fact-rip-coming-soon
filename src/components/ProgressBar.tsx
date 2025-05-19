import { motion } from "framer-motion";
import { ANIMATIONS } from "../constants/animations";

export function ProgressBar() {
  return (
    <div className="w-full flex justify-center px-8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={ANIMATIONS.progressBar}
        className="h-1 bg-red-600 max-w-[240px] sm:max-w-[320px]"
      />
    </div>
  );
}