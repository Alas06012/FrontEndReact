import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  '5xl': 'max-w-7xl',
  full: 'max-w-full',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 30 },
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'full',
  height = '100vh',
  closeOnOverlayClick = true,
}) => {
  const modalWidth = sizeMap[size] || sizeMap['full'];

  // Bloquear scroll al abrir
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Overlay oscuro */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            variants={backdropVariants}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          {/* Contenedor del modal */}
          <motion.div
            className={`relative bg-white shadow-xl w-full ${modalWidth} h-full overflow-hidden flex flex-col border border-gray-200`}
            variants={modalVariants}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h2
                id="modal-title"
                className="text-xl sm:text-2xl font-bold text-gray-800 truncate max-w-[80%]"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cerrar modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body con scroll */}
            <div className="p-4 pt-2 sm:p-6 overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
