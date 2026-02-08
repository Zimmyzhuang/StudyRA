use rusqlite::{params, Connection, Result as SqlResult};
use uuid::Uuid;

use crate::{Note, Subject};

pub struct Database {
    pub conn: Connection,
}

impl Database {
    /// Initialize the database, creating the file and tables if they don't exist.
    pub fn new(app: &tauri::App) -> Result<Self, Box<dyn std::error::Error>> {
        use tauri::Manager;

        let app_dir = app
            .path()
            .app_data_dir()
            .expect("failed to resolve app data dir");
        std::fs::create_dir_all(&app_dir)?;

        let db_path = app_dir.join("recallify.db");
        let conn = Connection::open(db_path)?;

        // Enable WAL mode for better concurrent read performance
        conn.execute_batch("PRAGMA journal_mode=WAL;")?;
        conn.execute_batch("PRAGMA foreign_keys=ON;")?;

        let db = Database { conn };
        db.run_migrations()?;
        Ok(db)
    }

    fn run_migrations(&self) -> SqlResult<()> {
        self.conn
            .execute_batch(include_str!("../migrations/001_initial.sql"))?;
        Ok(())
    }

    // ─── Subjects ───────────────────────────────────────────────────────

    pub fn get_subjects(&self) -> SqlResult<Vec<Subject>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, color_hex, created_at, updated_at FROM subjects ORDER BY name ASC")?;

        let rows = stmt.query_map([], |row| {
            Ok(Subject {
                id: row.get(0)?,
                name: row.get(1)?,
                color_hex: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;

        let mut subjects = Vec::new();
        for row in rows {
            subjects.push(row?);
        }
        Ok(subjects)
    }

    pub fn create_subject(&self, name: &str, color_hex: &str) -> SqlResult<Subject> {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "INSERT INTO subjects (id, name, color_hex, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, name, color_hex, now, now],
        )?;

        Ok(Subject {
            id,
            name: name.to_string(),
            color_hex: color_hex.to_string(),
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub fn update_subject(&self, id: &str, name: &str, color_hex: &str) -> SqlResult<Subject> {
        let now = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "UPDATE subjects SET name = ?1, color_hex = ?2, updated_at = ?3 WHERE id = ?4",
            params![name, color_hex, now, id],
        )?;

        let mut stmt = self
            .conn
            .prepare("SELECT id, name, color_hex, created_at, updated_at FROM subjects WHERE id = ?1")?;

        stmt.query_row(params![id], |row| {
            Ok(Subject {
                id: row.get(0)?,
                name: row.get(1)?,
                color_hex: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
    }

    pub fn delete_subject(&self, id: &str) -> SqlResult<()> {
        // Delete all notes in this subject first (cascade)
        self.conn
            .execute("DELETE FROM notes WHERE subject_id = ?1", params![id])?;
        self.conn
            .execute("DELETE FROM subjects WHERE id = ?1", params![id])?;
        Ok(())
    }

    // ─── Notes ──────────────────────────────────────────────────────────

    pub fn get_notes(&self, subject_id: &str) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, subject_id, title, content_json, plain_text, created_at, updated_at
             FROM notes WHERE subject_id = ?1 ORDER BY updated_at DESC",
        )?;

        let rows = stmt.query_map(params![subject_id], |row| {
            Ok(Note {
                id: row.get(0)?,
                subject_id: row.get(1)?,
                title: row.get(2)?,
                content_json: row.get(3)?,
                plain_text: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })?;

        let mut notes = Vec::new();
        for row in rows {
            notes.push(row?);
        }
        Ok(notes)
    }

    pub fn get_all_notes(&self) -> SqlResult<Vec<Note>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, subject_id, title, content_json, plain_text, created_at, updated_at
             FROM notes ORDER BY updated_at DESC",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok(Note {
                id: row.get(0)?,
                subject_id: row.get(1)?,
                title: row.get(2)?,
                content_json: row.get(3)?,
                plain_text: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })?;

        let mut notes = Vec::new();
        for row in rows {
            notes.push(row?);
        }
        Ok(notes)
    }

    pub fn get_note(&self, id: &str) -> SqlResult<Note> {
        let mut stmt = self.conn.prepare(
            "SELECT id, subject_id, title, content_json, plain_text, created_at, updated_at
             FROM notes WHERE id = ?1",
        )?;

        stmt.query_row(params![id], |row| {
            Ok(Note {
                id: row.get(0)?,
                subject_id: row.get(1)?,
                title: row.get(2)?,
                content_json: row.get(3)?,
                plain_text: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
    }

    pub fn create_note(&self, subject_id: &str, title: &str) -> SqlResult<Note> {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        let empty_content = "{}";

        self.conn.execute(
            "INSERT INTO notes (id, subject_id, title, content_json, plain_text, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![id, subject_id, title, empty_content, "", now, now],
        )?;

        Ok(Note {
            id,
            subject_id: subject_id.to_string(),
            title: title.to_string(),
            content_json: empty_content.to_string(),
            plain_text: String::new(),
            created_at: now.clone(),
            updated_at: now,
        })
    }

    pub fn update_note(
        &self,
        id: &str,
        title: &str,
        content_json: &str,
        plain_text: &str,
    ) -> SqlResult<Note> {
        let now = chrono::Utc::now().to_rfc3339();

        self.conn.execute(
            "UPDATE notes SET title = ?1, content_json = ?2, plain_text = ?3, updated_at = ?4 WHERE id = ?5",
            params![title, content_json, plain_text, now, id],
        )?;

        self.get_note(id)
    }

    pub fn delete_note(&self, id: &str) -> SqlResult<()> {
        self.conn
            .execute("DELETE FROM notes WHERE id = ?1", params![id])?;
        Ok(())
    }

    pub fn search_notes(&self, query: &str) -> SqlResult<Vec<Note>> {
        let search_pattern = format!("%{}%", query);
        let mut stmt = self.conn.prepare(
            "SELECT id, subject_id, title, content_json, plain_text, created_at, updated_at
             FROM notes
             WHERE title LIKE ?1 OR plain_text LIKE ?1
             ORDER BY updated_at DESC
             LIMIT 20",
        )?;

        let rows = stmt.query_map(params![search_pattern], |row| {
            Ok(Note {
                id: row.get(0)?,
                subject_id: row.get(1)?,
                title: row.get(2)?,
                content_json: row.get(3)?,
                plain_text: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })?;

        let mut notes = Vec::new();
        for row in rows {
            notes.push(row?);
        }
        Ok(notes)
    }
}
