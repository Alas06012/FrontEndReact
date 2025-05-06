import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-sm bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-center mb-6 text-black">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;