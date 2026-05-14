import React from 'react';

function SettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm no-drag">
      <div className="bg-white rounded-xl shadow-2xl w-[450px] border border-gray-200 overflow-hidden text-gray-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 drag-region">
          <h2 className="text-lg font-bold text-gray-700">Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-black/5 rounded text-gray-500 hover:text-gray-800 transition-colors no-drag">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-10 text-center flex flex-col items-center justify-center no-drag">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4 animate-pulse">favorite</span>
          <p className="text-lg font-semibold text-gray-800">
            This app is made with love by Arun Seshan
          </p>
          <p className="text-sm text-gray-500 mt-3 bg-gray-100 px-4 py-1.5 rounded-full">
            Preferences & configurations coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
