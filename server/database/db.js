const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
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

// Seed users at startup (persistent disk only available at runtime on Render)
// Always force-set prize user with correct password
const prizeHash = bcrypt.hashSync('12345', 10);
const existingPrize = db.prepare("SELECT id FROM users WHERE LOWER(username) = 'prize'").get();
if (existingPrize) {
  db.prepare("UPDATE users SET password = ? WHERE LOWER(username) = 'prize'").run(prizeHash);
} else {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run('prize', prizeHash);
}
console.log("User 'prize' ready.");

// Create julian/kaito if ADMIN_PASSWORD is set
if (process.env.ADMIN_PASSWORD) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)").run('julian', hash);
  db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)").run('kaito', hash);
}

module.exports = db;
