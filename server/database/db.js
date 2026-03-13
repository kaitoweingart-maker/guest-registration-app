const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/guests.db'
  : path.join(__dirname, '..', '..', 'guests.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Ensure schema exists
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// Migration: add id_photo column if missing
try {
  db.prepare("SELECT id_photo FROM guests LIMIT 1").get();
} catch {
  db.exec("ALTER TABLE guests ADD COLUMN id_photo TEXT");
}

module.exports = db;
