import React, { useState, useEffect } from 'react';

function CommandPalette({ isOpen, onClose, notes, onSelectNote, onCreateNote }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredNotes = notes.filter(note => 
    (note.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (note.preview || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10">
          <span className="material-symbols-outlined text-outline">search</span>
          <input 
            autoFocus
            className="flex-1 bg-transparent border-none text-[18px] focus:ring-0 placeholder:text-outline/50" 
            placeholder="Search notes or actions..." 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
             <span className="text-[10px] font-bold text-outline">ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Actions Section */}
          <div className="px-3 py-2 bg-gray-50/50">
            <h3 className="px-3 py-1 text-[11px] font-bold text-outline/60 uppercase tracking-widest">Actions</h3>
            <div 
              onClick={() => { onCreateNote(); onClose(); }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 cursor-pointer group transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </div>
              <span className="text-body-md font-medium text-on-surface">Create New Note</span>
            </div>
          </div>

          {/* Notes Section */}
          <div className="p-2">
            <h3 className="px-4 py-2 text-[11px] font-bold text-outline/60 uppercase tracking-widest">Notes</h3>
            {filteredNotes.length === 0 ? (
              <div className="px-4 py-8 text-center text-outline text-sm italic">
                No matching notes found
              </div>
            ) : (
              <div className="grid gap-1">
                {filteredNotes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => { onSelectNote(note.id); onClose(); }}
                    className="flex flex-col px-4 py-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <span className="text-body-md font-semibold text-on-surface truncate">{note.title || 'Untitled Note'}</span>
                    <span className="text-[12px] text-outline truncate mt-0.5">{note.preview}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Hint */}
        <div className="px-6 py-3 border-t border-outline-variant/10 bg-gray-50 flex items-center justify-between text-[11px] text-outline">
          <div className="flex gap-4">
             <span><span className="font-bold">↑↓</span> to navigate</span>
             <span><span className="font-bold">Enter</span> to select</span>
          </div>
          <span>{filteredNotes.length} notes found</span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
