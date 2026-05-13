import React from 'react';

function NoteList({ notes, activeNoteId, setActiveNoteId, searchQuery, setSearchQuery }) {
  return (
    <section className="w-80 flex flex-col border-r border-outline-variant/30 z-20 bg-white">
      <div className="h-14 flex items-center px-4 border-b border-outline-variant/30 bg-surface/50 backdrop-blur-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
          <input 
            className="w-full bg-gray-100 border-none rounded-lg py-1.5 pl-9 pr-4 text-[13px] focus:ring-1 focus:ring-primary/30 placeholder:text-outline" 
            placeholder="Search notes..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {notes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`p-4 rounded-xl cursor-pointer transition-colors ${activeNoteId === note.id ? 'note-item-active' : 'hover:bg-gray-100'}`}
            >
              <h4 className={`text-body-md truncate ${activeNoteId === note.id ? 'font-semibold' : 'font-medium'}`}>{note.title || 'Untitled Note'}</h4>
              <p className="text-[13px] text-gray-500 mt-1">{note.date} • {note.preview}</p>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="p-4 text-center text-gray-400 text-sm italic">No notes found</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default NoteList;
