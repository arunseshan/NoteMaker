import React from 'react';

function Sidebar({ folders, activeFolderId, setActiveFolderId, onNewNote }) {
  return (
    <aside className="w-64 flex flex-col border-r border-outline-variant/30 z-30" style={{ backgroundColor: 'var(--folder-bg)' }}>
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-label-caps font-label-caps text-on-surface-variant tracking-wider uppercase text-[11px] font-bold">FOLDERS</h2>
        <button 
          onClick={onNewNote}
          className="p-1 hover:bg-surface-container rounded-md transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">add</span>
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        <button 
          onClick={() => setActiveFolderId('all')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors group ${activeFolderId === 'all' ? 'sidebar-item-active' : ''}`}
        >
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="text-body-md font-medium">All Notes</span>
        </button>
        {folders.map(folder => (
          <button 
            key={folder.id}
            onClick={() => setActiveFolderId(folder.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-low transition-colors group ${activeFolderId === folder.id ? 'sidebar-item-active' : ''}`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }}></span>
            <span className="text-body-md font-medium">{folder.name}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-outline-variant/20">
        <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:text-on-surface" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-body-sm">Settings</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
