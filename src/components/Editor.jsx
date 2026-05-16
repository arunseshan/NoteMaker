import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Node } from '@tiptap/core';

// Custom Tiptap Node Extension for Native HTML5 Video
const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,
  addAttributes() { return { src: { default: null } }; },
  parseHTML() { return [{ tag: 'video' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'my-4 video-container' }, ['video', { controls: true, src: HTMLAttributes.src, class: 'w-full max-h-[380px] rounded-xl border border-gray-200 bg-black' }]];
  }
});

// Custom Tiptap Node Extension for Native HTML5 Audio
const AudioExtension = Node.create({
  name: 'audio',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,
  addAttributes() { return { src: { default: null } }; },
  parseHTML() { return [{ tag: 'audio' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'my-3 audio-container bg-gray-50 p-3 rounded-xl border border-gray-200' }, ['audio', { controls: true, src: HTMLAttributes.src, class: 'w-full' }]];
  }
});

function Editor({ note, onUpdate, folderName }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ attributes: { class: 'rounded-xl max-w-full my-4 border border-gray-100 shadow-sm' } }),
      Link.configure({ openOnClick: true, HTMLAttributes: { class: 'text-primary underline cursor-pointer hover:text-red-700' } }),
      VideoExtension,
      AudioExtension
    ],
    content: note?.content_html || '',
    onUpdate: ({ editor }) => {
      if (!note) return;
      onUpdate({
        ...note,
        content_html: editor.getHTML(),
        preview: editor.getText().substring(0, 60)
      });
    },
    editorProps: { attributes: { class: 'focus:outline-none min-h-[450px] text-gray-800 p-1' } }
  });

  useEffect(() => {
    if (editor && note && editor.getHTML() !== note.content_html) {
      editor.commands.setContent(note.content_html || '', false);
    }
  }, [note?.id, editor]);

  const handleInsertMedia = async (type) => {
    const url = await window.electron.mediaChoose(type);
    if (!url) return;

    if (type === 'image') {
      editor.chain().focus().setImage({ src: url }).run();
    } else if (type === 'video') {
      editor.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
    } else if (type === 'audio') {
      editor.chain().focus().insertContent({ type: 'audio', attrs: { src: url } }).run();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter hyperlink URL:');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
        <span className="material-symbols-outlined text-[48px] mb-2">edit_note</span>
        <p className="text-sm font-medium">Select a note or create a new one to start writing.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <style>{`
        .ProseMirror h1 { font-size: 1.6rem; font-weight: 700; margin-top: 1.2rem; margin-bottom: 0.6rem; }
        .ProseMirror h2 { font-size: 1.3rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.6rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.6rem; }
        .ProseMirror p { margin-bottom: 0.5rem; line-height: 1.6; }
        .ProseMirror code { background-color: #f3f4f6; padding: 0.15rem 0.3rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.9em; color: #b43b2f; }
        .ProseMirror pre { background-color: #f3f4f6; padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; margin: 0.75rem 0; overflow-x: auto; }
      `}</style>

      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-gray-50/50">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
          {folderName || 'Uncategorized'}
        </span>
      </div>

      {/* Formatting and Media Toolbar */}
      <div className="border-b border-gray-100 p-2 flex flex-wrap gap-1 bg-gray-50/30 items-center">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200 text-primary font-bold' : 'text-gray-600'}`} title="Bold"><span className="material-symbols-outlined text-[18px]">format_bold</span></button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200 text-primary italic' : 'text-gray-600'}`} title="Italic"><span className="material-symbols-outlined text-[18px]">format_italic</span></button>
        
        <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
        
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-2 py-1 rounded text-xs font-bold hover:bg-gray-200 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-primary' : 'text-gray-600'}`}>H1</button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 rounded text-xs font-bold hover:bg-gray-200 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-primary' : 'text-gray-600'}`}>H2</button>
        
        <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
        
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-1.5 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-200 text-primary' : 'text-gray-600'}`} title="Bullet List"><span className="material-symbols-outlined text-[18px]">format_list_bulleted</span></button>
        
        <div className="w-[1px] h-4 bg-gray-300 mx-2"></div>
        
        {/* Media Input Actions */}
        <button onClick={() => handleInsertMedia('image')} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 flex items-center" title="Insert Image"><span className="material-symbols-outlined text-[18px]">image</span></button>
        <button onClick={() => handleInsertMedia('audio')} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 flex items-center" title="Insert Audio/Voice"><span className="material-symbols-outlined text-[18px]">audio_file</span></button>
        <button onClick={() => handleInsertMedia('video')} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 flex items-center" title="Insert Video"><span className="material-symbols-outlined text-[18px]">movie</span></button>
        <button onClick={handleInsertLink} className={`p-1.5 rounded hover:bg-gray-200 flex items-center ${editor?.isActive('link') ? 'bg-gray-200 text-primary' : 'text-gray-600'}`} title="Insert Link"><span className="material-symbols-outlined text-[18px]">link</span></button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <input 
          type="text" 
          value={note.title || ''}
          onChange={(e) => onUpdate({ ...note, title: e.target.value })}
          className="w-full border-none outline-none text-2xl font-bold mb-4 text-gray-800 placeholder:text-gray-300 focus:ring-0 p-0"
          placeholder="Untitled Note"
        />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default Editor;