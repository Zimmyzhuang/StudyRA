# Architecture

This document describes the high-level architecture of **Recallify**.

## Overview

Recallify is a desktop-first productivity app built with **Tauri 2** (Rust backend) and **React 18** (TypeScript frontend). It follows an offline-first approach with local SQLite storage.

## System Diagram

```
┌──────────────────────────────────────────┐
│               Tauri Shell                │
│  ┌────────────────┐ ┌─────────────────┐  │
│  │  React Frontend │ │  Rust Backend   │  │
│  │  (WebView)      │ │  (Tauri Core)   │  │
│  │                 │ │                 │  │
│  │  - TipTap Editor│ │  - SQLite DB    │  │
│  │  - Zustand State│ │  - CRUD Commands│  │
│  │  - TailwindCSS  │ │  - Migrations   │  │
│  └────────┬───────┘ └───────┬─────────┘  │
│           │    IPC Bridge    │            │
│           └──────────────────┘            │
└──────────────────────────────────────────┘
```

## Frontend (src/)

| Directory       | Purpose                                  |
| --------------- | ---------------------------------------- |
| components/     | React UI components                      |
| components/editor/ | TipTap block editor + handles         |
| components/layout/ | Sidebar, TopBar, EmptyState            |
| hooks/          | Custom React hooks (keyboard shortcuts)  |
| lib/            | Database abstraction, TypeScript types   |
| stores/         | Zustand state management                 |

## Backend (src-tauri/)

| File             | Purpose                                 |
| ---------------- | --------------------------------------- |
| src/main.rs      | Application entry point                 |
| src/lib.rs       | Tauri command handlers (CRUD)           |
| src/db.rs        | SQLite database operations              |
| migrations/      | SQL schema migration files              |

## Data Flow

1. User interacts with the React UI
2. React components dispatch actions to Zustand stores
3. Stores invoke Tauri IPC commands (@tauri-apps/api)
4. Rust backend processes commands and reads/writes to SQLite
5. Results are returned to the frontend via IPC
