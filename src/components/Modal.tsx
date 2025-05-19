import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ANIMATIONS } from "../constants/animations";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasJoined: boolean;
  onReset?: () => void;
}

export function Modal({ isOpen, onClose, hasJoined, onReset }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      // Focus delay to ensure modal is mounted
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      (previousActiveElement.current as HTMLElement)?.focus();
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={ANIMATIONS.modal.overlay}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={ANIMATIONS.modal.content}
        className="bg-zinc-900 border border-red-600/50 rounded-lg p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="text-xl font-bold mb-4 text-red-500">
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
          
          {hasJoined && onReset && (
            <button
              onClick={onReset}
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