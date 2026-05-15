import React, { useState } from 'react';

function SettingsModal({ isOpen, onClose }) {
  const [exportStatus, setExportStatus] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    setExportStatus('Exporting...');
    const response = await window.electron.exportData();
    setExportStatus(response.message);
    setTimeout(() => setExportStatus(''), 5000); // Clear message after 5s
  };

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
        <div className="p-8 no-drag">
          <section className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Data Sovereignty</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-[20px]">database</span>
                <span className="font-semibold text-gray-700">Export Workspace</span>
              </div>
              <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
                Download all your notes as standard Markdown files. Folders will be preserved as directories.
              </p>
              <button 
                onClick={handleExport}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Export All Data
              </button>
              {exportStatus && (
                <p className="mt-3 text-[12px] font-medium text-center text-primary animate-pulse">
                  {exportStatus}
                </p>
              )}
            </div>
          </section>

          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-[13px] text-gray-400 flex items-center justify-center gap-1">
              Made with <span className="material-symbols-outlined text-red-400 text-[14px] fill-current">favorite</span> by Arun Seshan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
