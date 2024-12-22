// Popup.js
import React from 'react';
import '../App.css';

function Popup({ isOpen, onClose, children }) {
  if (!isOpen) return null; // If not open, return nothing

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close rounded-lg hover:bg-zinc-600" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
}

export default Popup;
