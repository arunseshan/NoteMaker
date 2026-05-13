# NoteMaker

A high-performance, privacy-focused desktop note-taking application built with Electron and React. **NoteMaker** offers a seamless experience for organizing thoughts, managing folders, and handling media assets with a specialized local protocol.

## 🚀 Features

- **Local-First Privacy:** All notes and media are stored locally on your machine using a JSON-based database.
- **Dynamic Media Management:** Drag and drop or upload images directly into your notes. Includes a custom 'media://' protocol for secure, high-speed asset rendering.
- **Workspace Organization:** Create and manage folders with custom color coding to categorize your projects and ideas.
- **Optimized Performance:** Lightweight footprint designed for efficiency on both modern and legacy hardware (optimized for MacBook Air 2014+).
- **Responsive Editor:** A clean, minimalist writing environment with real-time saving and asset deletion.

## 🛠️ Tech Stack

### Frontend
- **React.js**: For a component-based, reactive user interface.
- **Tailwind CSS**: For modern, utility-first styling.
- **Vite**: Serving as the next-generation frontend tool for lightning-fast bundling.

### Desktop & Backend
- **Electron**: Providing the cross-platform desktop environment and native file system access.
- **Node.js**: Powering the main process and secure IPC (Inter-Process Communication).
- **Lowdb**: A simple, local JSON database for reliable data persistence.

## 📂 Project Structure

NoteMaker/
├── main.js             # Electron Main Process (System & Protocols)
├── preload.js          # Secure Bridge (IPC Communication)
├── index.html          # Entry point for the Renderer
├── src/                # React Source Code
│   ├── components/     # UI Components (Sidebar, Editor, NoteList)
│   ├── main.jsx        # React Initialization
│   └── App.jsx         # Root Component
├── dist/               # Production Build (Generated)
└── vite.config.js      # Vite Configuration

## ⚙️ Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
   git clone https://github.com/arunseshan/NoteMaker.git
   cd NoteMaker

2. Install dependencies:
   npm install

### Running the App
For production build and launch:
npm run build
npm start

## 👤 Author
**Arun Raghunathan Seshan**

---

## 📄 License
This project is licensed under the MIT License.
