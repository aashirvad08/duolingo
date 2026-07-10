import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isVisible,
  onClose,
  type = "success"
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const bgColors = {
    success: "bg-feather-green border-tree-frog text-white",
    error: "bg-cardinal border-fire-ant text-white",
    info: "bg-macaw border-blue-jay text-white"
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 flex items-center justify-between gap-4 border-b-4 rounded-2xl p-4 shadow-lg min-w-[280px] font-bold ${bgColors[type]}`}
        >
          <span>{message}</span>
          <button
            onClick={onClose}
            className="hover:opacity-80 text-xl font-bold cursor-pointer ml-auto"
            aria-label="Close notification"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
