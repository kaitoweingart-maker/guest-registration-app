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
const insertUser = db.prepare(
  'INSERT OR REPLACE INTO users (username, password) VALUES (?, ?)'
);

// Always ensure prize user exists
const existingPrize = db.prepare("SELECT id FROM users WHERE LOWER(username) = 'prize'").get();
if (!existingPrize) {
  insertUser.run('prize', bcrypt.hashSync('12345', 10));
  console.log("User 'prize' created.");
}

// Create julian/kaito if ADMIN_PASSWORD is set
if (process.env.ADMIN_PASSWORD) {
  const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
  const existingJulian = db.prepare("SELECT id FROM users WHERE LOWER(username) = 'julian'").get();
  if (!existingJulian) {
    insertUser.run('julian', hash);
    console.log("User 'julian' created.");
  }
  const existingKaito = db.prepare("SELECT id FROM users WHERE LOWER(username) = 'kaito'").get();
  if (!existingKaito) {
    insertUser.run('kaito', hash);
    console.log("User 'kaito' created.");
  }
}

module.exports = db;
