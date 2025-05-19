import { motion } from "framer-motion";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasJoined: boolean;
}

export default function Modal({ isOpen, onClose, hasJoined }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-zinc-900 border border-red-600/50 rounded-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-red-500">
          {hasJoined ? "Already Watching" : "Watchtower Activated"}
        </h2>
        
        <p className="text-gray-300 mb-6">
          {hasJoined 
            ? "Your vigilance continues. The loop persists through observation."
            : "Your surveillance has begun. The accountability engine marks your witness."
          }
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
          >
            Continue
          </button>
          
          {hasJoined && (
            <button
              onClick={() => {
                localStorage.removeItem('fact.rip.joined');
                localStorage.removeItem('fact.rip.visited');
                window.location.reload();
              }}
              className="px-4 py-2 border border-red-600/50 text-red-500 hover:bg-red-600/10 rounded transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}