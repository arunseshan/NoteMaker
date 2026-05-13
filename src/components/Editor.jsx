import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

function Editor({ note, onUpdate, folderName }) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note?.content_html || '',
    onUpdate: ({ editor }) => {
      if (!note) return;
      const html = editor.getHTML();
      const text = editor.getText();
      onUpdate({
        ...note,
        content_html: html,
        preview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      });
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] text-on-surface leading-relaxed',
      },
    },
  });
  const handleDeleteMedia = async (urlToDelete) => {
  if (!note) return;
  
  // 1. Remove from local state and database
  const updatedMedia = note.media.filter(url => url !== urlToDelete);
  onUpdate({ ...note, media: updatedMedia });
  
  // 2. Remove from the physical disk (Media folder)
  await window.electron.mediaDelete(urlToDelete);
};

  useEffect(() => {
    if (editor && note && editor.getHTML() !== note.content_html) {
      editor.commands.setContent(note.content_html);
    }
  }, [note?.id, editor]);

  const handleTitleChange = (e) => {
    if (!note) return;
    const newTitle = e.target.value;
    onUpdate({ ...note, title: newTitle });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && note) {
      const mediaUrl = await window.electron.mediaUpload(file.path);
      onUpdate({
        ...note,
        media: [...(note.media || []), mediaUrl],
      });
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && note) {
      const mediaUrl = await window.electron.mediaUpload(file.path);
      onUpdate({
        ...note,
        media: [...(note.media || []), mediaUrl],
      });
    }
  };

  if (!note) {
    return (
      <main className="flex-1 flex items-center justify-center text-gray-400 italic">
        Select a note to start editing
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--note-bg)' }}>
      {/* Top Toolbar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-outline-variant/10 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <span className="material-symbols-outlined">format_bold</span>
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <span className="material-symbols-outlined">format_italic</span>
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            <span className="material-symbols-outlined">format_list_bulleted</span>
          </button>
          <div className="w-px h-6 bg-outline-variant/30 mx-2"></div>
          <button 
            onClick={() => fileInputRef.current.click()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined">add_photo_alternate</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[14px] font-bold text-primary px-4 py-1.5 rounded-full border border-primary/20 hover:bg-primary/5 transition-all">
            Share
          </button>
        </div>
      </header>

      {/* Sheet of Paper */}
      <div 
        className="flex-1 overflow-y-auto flex flex-col items-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="w-full max-w-3xl px-12 py-16 bg-white shadow-[0_0_50px_rgba(0,0,0,0.02)] min-h-full">
          {/* Editor Header */}
          <div className="mb-12">
            <input 
              className="w-full bg-transparent border-none p-0 text-[32px] font-bold text-on-surface focus:ring-0 placeholder:text-gray-200" 
              placeholder="Title" 
              type="text" 
              value={note.title}
              onChange={handleTitleChange}
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-primary font-bold text-[11px] tracking-widest uppercase">{note.date}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 text-[13px]">{folderName}</span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="mb-12">
            <EditorContent editor={editor} />
          </div>

          {/* Media Assets Section */}
          <div className="bg-tertiary-container/5 rounded-2xl p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-[24px] text-on-surface">Media Assets</h4>
                <p className="text-[13px] text-gray-500 mt-1">Managed assets for this note</p>
              </div>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {(note.media || [])
                .filter(url => url && typeof url === 'string' && url.startsWith('media://'))
                .map((url) => (
                <div key={url} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm group relative">
                  <img src={url} alt="Note asset" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="material-symbols-outlined text-white text-[16px]">open_in_new</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMedia(url);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined !text-[12px]">close</span>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current.click()}
                className="w-20 h-20 bg-transparent rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Editor;
