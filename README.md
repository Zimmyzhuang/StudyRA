# Recallify

A desktop-first study and note-taking app built with **Tauri 2** and **React 18**. Recallify features a block-based editor, subject management, and offline-first local storage — designed for students who want a fast, keyboard-driven workflow.

## Features

- **Block-based editor** — Rich text editing powered by TipTap with headings, lists, tasks, highlights, and code blocks
- **Hover & Handle UX** — Ghost handles appear on hover to convert, reorder, or delete blocks
- **Subject management** — Color-coded subjects to organize your notes
- **Spotlight search** — Quick-access command palette via `Cmd+K`
- **Auto-save** — Debounced writes so you never lose work
- **Keyboard-first** — Navigate, create, and edit without touching the mouse
- **Offline-first** — SQLite storage on desktop, localStorage fallback in the browser

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Rust** >= 1.70 (via [rustup.rs](https://rustup.rs))
- **Tauri prerequisites**: see [Tauri v2 docs](https://v2.tauri.app/start/prerequisites/)

### Installation

```bash
git clone https://github.com/Zimmyzhuang/StudyRA.git
cd StudyRA
npm install
```

### Usage

```bash
# Run in browser (development)
npm run dev

# Run as desktop app (development)
npm run tauri dev

# Build for production
npm run build
npm run tauri build
```

## Project Structure

```
.
├── docs                    # Documentation files
├── src                     # React frontend source code
│   ├── components          # UI components (editor, layout)
│   ├── hooks               # Custom React hooks
│   ├── lib                 # Database abstraction & types
│   └── stores              # Zustand state management
├── src-tauri               # Rust / Tauri backend
│   ├── migrations          # SQLite schema migrations
│   └── src                 # Rust source (commands, DB ops)
├── tests                   # Automated tests
│   ├── unit                # Unit tests
│   ├── integration         # Integration tests
│   └── e2e                 # End-to-end tests
├── tools                   # Tools and utilities
├── LICENSE
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a detailed system overview.

## Tech Stack

| Layer      | Technology                     |
| ---------- | ------------------------------ |
| Frontend   | React 18, TypeScript, TipTap   |
| Styling    | Tailwind CSS                   |
| State      | Zustand                        |
| Backend    | Tauri 2 (Rust)                 |
| Database   | SQLite (local)                 |
| Bundler    | Vite                           |

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
