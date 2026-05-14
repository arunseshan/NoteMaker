import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import SettingsModal from './SettingsModal';

function Sidebar({ folders, notes, selectedFolder, setSelectedFolder, refresh }) {
  const [editState, setEditState] = useState({ id: null, name: '', color: '#6750A4' });
  const [dialog, setDialog] = useState({ isOpen: false, message: "", icon: "", action: null });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveFolder = async () => {
    if (!editState.name.trim()) return;

    let updatedFolders;
    if (editState.id === 'NEW') {
      const newFolder = {
        id: Date.now().toString(),
        name: editState.name,
        color: editState.color,
        isTrash: false
      };
      updatedFolders = [...folders, newFolder];
    } else {
      updatedFolders = folders.map(f => f.id === editState.id ? { ...f, name: editState.name, color: editState.color } : f);
    }

    await window.electron.dbSaveFolders(updatedFolders);
    setEditState({ id: null, name: '', color: '#6750A4' });
    refresh();
  };

  const handleDeleteFolder = async (e, folder) => {
    e.stopPropagation();
    setDialog({
      isOpen: true,
      message: "Move this folder and its notes to Trash?",
      icon: "folder_delete",
      action: async () => {
        await window.electron.dbTrashFolder(folder.id);
        if (selectedFolder === folder.id) {
          setSelectedFolder('1');
        }
        refresh();
      }
    });
  };

  return (
    <aside className="w-64 flex flex-col border-r border-outline-variant/30 z-30" style={{ backgroundColor: 'var(--folder-bg)' }}>
      <div className="p-6 flex justify-between items-center drag-region">
        <div className="flex items-center gap-2">
          <h2 className="text-label-caps font-label-caps text-on-surface-variant tracking-wider uppercase text-[11px] font-bold">FOLDERS</h2>
          <button 
            onClick={() => setEditState({ id: 'NEW', name: 'New Folder', color: '#6750A4' })}
            className="p-0.5 hover:bg-surface-container rounded transition-colors no-drag"
            title="Add Folder"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">create_new_folder</span>
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {editState.id === 'NEW' && (
          <div className="px-3 py-2 mb-2 bg-surface-container-low rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="color" 
                value={editState.color} 
                onChange={(e) => setEditState({ ...editState, color: e.target.value })}
                className="w-6 h-6 rounded-full overflow-hidden border-none p-0 cursor-pointer"
              />
              <input 
                type="text" 
                autoFocus
                value={editState.name}
                onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                className="flex-1 bg-transparent border-none text-body-md font-medium focus:ring-0 p-0"
              />
            </div>
            <div className="flex justify-end gap-1">
              <button onClick={() => setEditState({ id: null, name: '', color: '#6750A4' })} className="p-1 hover:bg-black/5 rounded">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <button onClick={handleSaveFolder} className="p-1 hover:bg-primary/10 text-primary rounded">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setSelectedFolder('all')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors group ${selectedFolder === 'all' ? 'sidebar-item-active' : ''}`}
        >
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="text-body-md font-medium">All Notes</span>
        </button>

        {folders.filter(f => !f.isTrash).map(folder => (
          <div key={folder.id} className="group relative">
            {editState.id === folder.id ? (
              <div className="px-3 py-2 bg-surface-container-low rounded-lg border border-primary/20 my-1">
                <div className="flex items-center gap-2 mb-2">
                  <input 
                    type="color" 
                    value={editState.color} 
                    onChange={(e) => setEditState({ ...editState, color: e.target.value })}
                    className="w-6 h-6 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                  />
                  <input 
                    type="text" 
                    autoFocus
                    value={editState.name}
                    onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                    className="flex-1 bg-transparent border-none text-body-md font-medium focus:ring-0 p-0"
                  />
                </div>
                <div className="flex justify-end gap-1">
                  <button onClick={() => setEditState({ id: null, name: '', color: '#6750A4' })} className="p-1 hover:bg-black/5 rounded">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                  <button onClick={handleSaveFolder} className="p-1 hover:bg-primary/10 text-primary rounded">
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors ${selectedFolder === folder.id ? 'sidebar-item-active' : ''}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }}></span>
                  <span className="text-body-md font-medium truncate pr-12">{folder.name}</span>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditState({ id: folder.id, name: folder.name, color: folder.color }); }}
                    className="p-1 hover:bg-black/5 rounded text-on-surface-variant hover:text-on-surface transition-colors"
                    title="Edit Folder"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteFolder(e, folder)}
                    className="p-1 hover:bg-black/5 rounded text-on-surface-variant hover:text-red-500 transition-colors"
                    title="Delete Folder"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        
        <div className="pt-4 mt-4 border-t border-outline-variant/10">
          <button 
            onClick={() => setSelectedFolder('trash')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors group ${selectedFolder === 'trash' ? 'sidebar-item-active' : ''}`}
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-on-surface">delete</span>
            <span className="text-body-md font-medium">Trash</span>
          </button>
        </div>
      </nav>
      <div className="p-4 border-t border-outline-variant/20">
        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="w-full flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface hover:bg-black/5 rounded-lg transition-colors no-drag"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-body-sm font-medium">Settings</span>
        </button>
      </div>

      <ConfirmModal 
        isOpen={dialog.isOpen} 
        message={dialog.message} 
        icon={dialog.icon} 
        onConfirm={() => { dialog.action(); setDialog({ ...dialog, isOpen: false }); }} 
        onCancel={() => setDialog({ ...dialog, isOpen: false })} 
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </aside>
  );
}

export default Sidebar;
