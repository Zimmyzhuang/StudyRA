mod db;

use db::Database;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// ─── Data Models ────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Subject {
    pub id: String,
    pub name: String,
    pub color_hex: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub subject_id: String,
    pub title: String,
    pub content_json: String,
    pub plain_text: String,
    pub created_at: String,
    pub updated_at: String,
}

// ─── Subject Commands ───────────────────────────────────────────────────────

#[tauri::command]
fn get_subjects(db: State<'_, Mutex<Database>>) -> Result<Vec<Subject>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_subjects().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_subject(
    db: State<'_, Mutex<Database>>,
    name: String,
    color_hex: String,
) -> Result<Subject, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.create_subject(&name, &color_hex)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_subject(
    db: State<'_, Mutex<Database>>,
    id: String,
    name: String,
    color_hex: String,
) -> Result<Subject, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.update_subject(&id, &name, &color_hex)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_subject(db: State<'_, Mutex<Database>>, id: String) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.delete_subject(&id).map_err(|e| e.to_string())
}

// ─── Note Commands ──────────────────────────────────────────────────────────

#[tauri::command]
fn get_notes(db: State<'_, Mutex<Database>>, subject_id: String) -> Result<Vec<Note>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_notes(&subject_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_notes(db: State<'_, Mutex<Database>>) -> Result<Vec<Note>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_all_notes().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_note(db: State<'_, Mutex<Database>>, id: String) -> Result<Note, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_note(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_note(
    db: State<'_, Mutex<Database>>,
    subject_id: String,
    title: String,
) -> Result<Note, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.create_note(&subject_id, &title)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_note(
    db: State<'_, Mutex<Database>>,
    id: String,
    title: String,
    content_json: String,
    plain_text: String,
) -> Result<Note, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.update_note(&id, &title, &content_json, &plain_text)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note(db: State<'_, Mutex<Database>>, id: String) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.delete_note(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn search_notes(db: State<'_, Mutex<Database>>, query: String) -> Result<Vec<Note>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.search_notes(&query).map_err(|e| e.to_string())
}

// ─── App Entry ──────────────────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db = Database::new(app).expect("Failed to initialize database");
            app.manage(Mutex::new(db));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_subjects,
            create_subject,
            update_subject,
            delete_subject,
            get_notes,
            get_all_notes,
            get_note,
            create_note,
            update_note,
            delete_note,
            search_notes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
