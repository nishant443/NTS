import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ open, onClose, title, children, footer }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-2xl sm:rounded-card shadow-soft w-full sm:max-w-lg max-h-[90vh] overflow-y-auto sm:w-full"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white sm:rounded-t-card">
            <h3 className="font-semibold text-secondary text-sm sm:text-base">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-secondary transition-colors">
              <FiX size={20} />
            </button>
          </div>
          <div className="p-4 sm:p-5">{children}</div>
          {footer && <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white">{footer}</div>}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;
