const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/guests.db'
  : path.join(__dirname, '..', '..', 'guests.db');

// Ensure the database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

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

// Seed all admin users at startup with ADMIN_PASSWORD env var
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminPassword) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  const upsert = db.prepare(
    'INSERT INTO users (username, password) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET password = ?'
  );
  upsert.run('prize', hash, hash);
  upsert.run('julian', hash, hash);
  upsert.run('kaito', hash, hash);
  console.log('Admin users ready (prize, julian, kaito).');
} else {
  console.warn('WARNING: ADMIN_PASSWORD not set — no admin users created');
}

module.exports = db;
