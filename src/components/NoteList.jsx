import React, { useState, useRef, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

function NoteList({ notes, folders, selectedFolder, activeNoteId, setActiveNoteId, searchQuery, setSearchQuery, refresh, onCreateNote }) {
  const [dialog, setDialog] = useState({ isOpen: false, message: "", icon: "", action: null });
  const searchInputRef = useRef(null);

  const createNoteRef = useRef(onCreateNote);
  createNoteRef.current = onCreateNote;

  useEffect(() => {
    window.electron.onSearchNotes(() => {
      searchInputRef.current?.focus();
    });

    window.electron.onNewNote(() => {
      createNoteRef.current();
    });
  }, []);

  const handleToggleTrash = async (e, noteId, isTrash) => {
    e.stopPropagation();
    if (isTrash) {
      setDialog({
        isOpen: true,
        message: "Move this note to Trash?",
        icon: "edit_document",
        action: async () => {
          await window.electron.dbTrashNote(noteId);
          refresh();
        }
      });
    } else {
      await window.electron.dbRestoreNote(noteId);
      refresh();
    }
  };

  const handleHardDelete = async (e, noteId) => {
    e.stopPropagation();
    setDialog({
      isOpen: true,
      message: "Permanently delete this note? This cannot be undone.",
      icon: "delete_forever",
      action: async () => {
        await window.electron.dbHardDeleteNote(noteId);
        refresh();
      }
    });
  };

  const handleRestoreFolder = async (e, folderId) => {
    e.stopPropagation();
    await window.electron.dbRestoreFolder(folderId);
    refresh();
  };

  const handleHardDeleteFolder = async (e, folderId) => {
    e.stopPropagation();
    setDialog({
      isOpen: true,
      message: "Permanently delete this folder and all its notes? This cannot be undone.",
      icon: "delete_forever",
      action: async () => {
        await window.electron.dbHardDeleteFolder(folderId);
        refresh();
      }
    });
  };

  const isTrashView = selectedFolder === 'trash';
  
  const displayNotes = notes.filter(n => {
    const isNoteTrashed = n.isTrash || folders.find(f => f.id === n.folderId)?.isTrash;
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.preview || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (isTrashView) {
      return isNoteTrashed;
    } else {
      if (isNoteTrashed) return false;
      if (selectedFolder === 'all') return true;
      return n.folderId === selectedFolder;
    }
  });

  const trashedFolders = isTrashView ? folders.filter(f => f.isTrash) : [];

  return (
    <section className="w-80 flex flex-col border-r border-outline-variant/30 z-20 bg-white">
      <div className="h-14 flex items-center justify-between px-4 border-b border-outline-variant/30 bg-surface/50 backdrop-blur-md drag-region">
        <h2 className="text-body-md font-bold text-on-surface">Notes</h2>
        <button 
          onClick={onCreateNote}
          className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors flex items-center gap-2 no-drag"
          title="New Note"
        >
          <span className="material-symbols-outlined text-[20px]">edit_square</span>
        </button>
      </div>
      <div className="p-3 border-b border-outline-variant/10">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
          <input 
            ref={searchInputRef}
            className="w-full bg-gray-100 border-none rounded-lg py-1.5 pl-9 pr-4 text-[13px] focus:ring-1 focus:ring-primary/30 placeholder:text-outline" 
            placeholder="Search notes..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Section 1: Trashed Folders (Only visible in Trash view) */}
        {isTrashView && trashedFolders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">Deleted Folders</h3>
            <div className="grid gap-2">
              {trashedFolders.map(folder => (
                <div key={folder.id} className="group relative p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400">folder</span>
                    <span className="text-body-md font-medium text-gray-600 truncate pr-16">{folder.name}</span>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleRestoreFolder(e, folder.id)}
                      className="p-1.5 rounded-md hover:bg-black/5 text-gray-400 hover:text-primary transition-colors"
                      title="Restore Folder"
                    >
                      <span className="material-symbols-outlined text-[18px]">undo</span>
                    </button>
                    <button 
                      onClick={(e) => handleHardDeleteFolder(e, folder.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete Permanently"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Notes (Visible in all views) */}
        <div>
          {isTrashView && displayNotes.length > 0 && (
            <h3 className="text-xs font-bold text-gray-400 mb-3 px-2 uppercase tracking-wider">Deleted Notes</h3>
          )}
          <div className="grid gap-2">
            {displayNotes.map(note => (
              <div 
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-4 rounded-xl cursor-pointer transition-colors group relative ${activeNoteId === note.id ? 'note-item-active' : 'hover:bg-gray-100 border border-transparent'}`}
              >
                <h4 className={`text-body-md truncate pr-8 ${activeNoteId === note.id ? 'font-semibold' : 'font-medium'}`}>{note.title || 'Untitled Note'}</h4>
                <p className="text-[13px] text-gray-500 mt-1">{note.date} • {note.preview}</p>
                
                <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {isTrashView ? (
                    <>
                      <button 
                        onClick={(e) => handleToggleTrash(e, note.id, false)}
                        className="p-1 rounded-md hover:bg-black/5 text-gray-400 hover:text-primary transition-colors"
                        title="Restore Note"
                      >
                        <span className="material-symbols-outlined text-[18px]">undo</span>
                      </button>
                      <button 
                        onClick={(e) => handleHardDelete(e, note.id)}
                        className="p-1 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        title="Delete Permanently"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={(e) => handleToggleTrash(e, note.id, true)}
                      className="p-1.5 rounded-full hover:bg-black/5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Move to Trash"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Empty State Fallback */}
          {displayNotes.length === 0 && (!isTrashView || trashedFolders.length === 0) && (
            <div className="text-center text-gray-500 mt-10">
              No notes here.
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={dialog.isOpen} 
        message={dialog.message} 
        icon={dialog.icon} 
        onConfirm={() => { dialog.action(); setDialog({ ...dialog, isOpen: false }); }} 
        onCancel={() => setDialog({ ...dialog, isOpen: false })} 
      />
    </section>
  );
}

export default NoteList;
