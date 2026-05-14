import React from 'react';

function ConfirmModal({ isOpen, message, icon, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-drag">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-96 border border-gray-700 text-gray-100">
        <div className="flex items-start gap-4 mb-6">
          <span className="material-symbols-outlined text-red-400 text-3xl shrink-0">{icon}</span>
          <p className="text-base font-medium leading-relaxed mt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-semibold"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow-lg text-sm font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
