import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the global electron bridge so React components don't crash in Node
global.window.electron = {
  dbRead: vi.fn().mockResolvedValue({ folders: [], notes: [] }),
  dbSaveNote: vi.fn(),
  dbTrashNote: vi.fn(),
  dbRestoreNote: vi.fn(),
  dbHardDeleteNote: vi.fn(),
  dbSaveFolders: vi.fn(),
  dbTrashFolder: vi.fn(),
  dbRestoreFolder: vi.fn(),
  dbHardDeleteFolder: vi.fn(),
  mediaUpload: vi.fn(),
  mediaDelete: vi.fn(),
  onNewNote: vi.fn(),
  onDeleteNote: vi.fn(),
  onSearchNotes: vi.fn(),
  onCommandPalette: vi.fn(),
  exportData: vi.fn()
};