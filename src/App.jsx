import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import Editor from './components/Editor';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash.debounce';

function App() {
  const [folders, setFolders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState('1');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    const activeFolder = folders.find(f => f.id === activeFolderId);
    if (activeFolder) {
      document.documentElement.style.setProperty('--sidebar-accent', activeFolder.color + '33');
    }
  }, [activeFolderId, folders]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    if (activeNote) {
      document.documentElement.style.setProperty('--note-bg', activeNote.bg_color || '#ffffff');
    }
  }, [activeNote]);

  const filteredNotes = notes.filter(n => {
    const matchesFolder = activeFolderId === 'all' || n.folderId === activeFolderId;
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (n.preview || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
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

  const handleNewNote = async () => {
    const newNote = {
      id: uuidv4(),
      folderId: activeFolderId === 'all' ? '1' : activeFolderId,
      title: 'New Note',
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      content_html: '',
      preview: '',
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
        activeFolderId={activeFolderId} 
        setActiveFolderId={setActiveFolderId} 
        onNewNote={handleNewNote}
      />
      <NoteList 
        notes={filteredNotes} 
        activeNoteId={activeNoteId} 
        setActiveNoteId={setActiveNoteId} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Editor 
        note={activeNote} 
        onUpdate={handleUpdateNote} 
        folderName={folders.find(f => f.id === activeNote?.folderId)?.name}
      />
    </div>
  );
}

export default App;
