import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import Editor from './components/Editor';
import CommandPalette from './components/CommandPalette';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash.debounce';

function App() {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('1');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);

  const loadData = async () => {
    const data = await window.electron.dbRead();
    setFolders(data.folders || []);
    setNotes(data.notes || []);
    if (!activeNoteId && data.notes?.length > 0) {
      setActiveNoteId(data.notes[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    window.electron.onCommandPalette(() => {
      setIsCmdKOpen(prev => !prev);
    });
  }, []);

  useEffect(() => {
    const activeFolder = folders.find(f => f.id === selectedFolder);
    if (activeFolder) {
      document.documentElement.style.setProperty('--sidebar-accent', activeFolder.color + '33');
    }
  }, [selectedFolder, folders]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    if (activeNote) {
      document.documentElement.style.setProperty('--note-bg', activeNote.bg_color || '#ffffff');
    }
  }, [activeNote]);

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : 0;
    const dateB = b.createdAt ? new Date(b.createdAt) : 0;
    return dateB - dateA;
  });

  const debouncedSave = useCallback(
    debounce(async (updatedNote) => {
      await window.electron.dbSaveNote(updatedNote);
      // We don't loadData here to avoid jitter during typing
    }, 500),
    []
  );

  const handleUpdateNote = (updatedNote) => {
    // Immediate React state update for responsiveness
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));
    // Debounced database persistence
    debouncedSave(updatedNote);
  };

  const handleCreateNote = async () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content_html: '',
      preview: '',
      folderId: selectedFolder === 'trash' ? '1' : selectedFolder,
      createdAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      bg_color: '#ffffff',
      media: []
    };
    
    await window.electron.dbSaveNote(newNote);
    await loadData();
    setActiveNoteId(newNote.id);
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar 
        folders={folders} 
        notes={notes}
        selectedFolder={selectedFolder} 
        setSelectedFolder={setSelectedFolder} 
        refresh={loadData}
      />
      <NoteList 
        notes={sortedNotes} 
        folders={folders}
        selectedFolder={selectedFolder}
        activeNoteId={activeNoteId} 
        setActiveNoteId={setActiveNoteId} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        refresh={loadData}
        onCreateNote={handleCreateNote}
      />
      <Editor 
        note={activeNote} 
        onUpdate={handleUpdateNote} 
        folderName={folders.find(f => f.id === activeNote?.folderId)?.name || (activeNote?.folderId === 'trash' ? 'Trash' : '')}
      />
      <CommandPalette 
        isOpen={isCmdKOpen}
        onClose={() => setIsCmdKOpen(false)}
        notes={notes}
        onSelectNote={(id) => setActiveNoteId(id)}
        onCreateNote={handleCreateNote}
      />
    </div>
  );
}

export default App;
