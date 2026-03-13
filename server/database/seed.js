const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/guests.db'
  : path.join(__dirname, '..', '..', 'guests.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Run schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const insert = db.prepare(
  'INSERT OR REPLACE INTO users (username, password) VALUES (?, ?)'
);

// Always create prize user
const prizeHash = bcrypt.hashSync('12345', 10);
insert.run('prize', prizeHash);
console.log("Admin user 'prize' seeded.");

// Create julian/kaito if ADMIN_PASSWORD is set
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminPassword) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  insert.run('julian', hash);
  insert.run('kaito', hash);
  console.log("Admin users 'julian' and 'kaito' seeded.");
}

db.close();
console.log('Database seeded successfully.');
