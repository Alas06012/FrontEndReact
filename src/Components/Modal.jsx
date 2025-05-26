import React from 'react';

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-full',
};

const Modal = ({ isOpen, onClose, title, children, size = 'xl', height = '90vh' }) => {
  if (!isOpen) return null;

  const modalWidth = sizeMap[size] || sizeMap['xl'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${modalWidth} overflow-hidden flex flex-col border border-gray-200`}
        style={{ height }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
