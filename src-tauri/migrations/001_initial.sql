-- Recallify Database Schema v1
-- Subjects are the top-level organizational unit (e.g., "Math 101", "Biology")

CREATE TABLE IF NOT EXISTS subjects (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    color_hex   TEXT NOT NULL DEFAULT '#6366f1',
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- Notes belong to subjects and store TipTap JSON content

CREATE TABLE IF NOT EXISTS notes (
    id            TEXT PRIMARY KEY,
    subject_id    TEXT NOT NULL REFERENCES subjects(id),
    title         TEXT NOT NULL DEFAULT 'Untitled',
    content_json  TEXT NOT NULL DEFAULT '{}',
    plain_text    TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL
);

-- Flashcards / Recall items are generated from notes (Phase 2+)

CREATE TABLE IF NOT EXISTS cards (
    id            TEXT PRIMARY KEY,
    note_id       TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    front         TEXT NOT NULL,
    back          TEXT NOT NULL,
    next_review   TEXT NOT NULL,
    interval      INTEGER NOT NULL DEFAULT 0,
    ease_factor   REAL NOT NULL DEFAULT 2.5,
    created_at    TEXT NOT NULL
);

-- Tasks for the Kanban planner (Phase 2+)

CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    subject_id  TEXT NOT NULL REFERENCES subjects(id),
    note_id     TEXT REFERENCES notes(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'doing', 'done')),
    due_date    TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- Focus sessions linked to tasks (Phase 2+)

CREATE TABLE IF NOT EXISTS sessions (
    id                TEXT PRIMARY KEY,
    task_id           TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    start_time        TEXT NOT NULL,
    duration_seconds  INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT NOT NULL
);

-- Indexes for common queries

CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_cards_note ON cards(note_id);
CREATE INDEX IF NOT EXISTS idx_cards_review ON cards(next_review);
CREATE INDEX IF NOT EXISTS idx_tasks_subject ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
