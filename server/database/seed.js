const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.NODE_ENV === 'production'
  ? '/data/guests.db'
  : path.join(__dirname, '..', '..', 'guests.db');

// In production, /data/ might not exist during build — skip seeding
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  console.log(`Seed: directory ${dbDir} does not exist (build phase?) — skipping. Users will be seeded at server startup.`);
  process.exit(0);
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Run schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const insert = db.prepare(
  'INSERT OR REPLACE INTO users (username, password) VALUES (?, ?)'
);

// Create all admin users with ADMIN_PASSWORD
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminPassword) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  insert.run('prize', hash);
  insert.run('julian', hash);
  insert.run('kaito', hash);
  console.log("Admin users 'prize', 'julian', 'kaito' seeded.");
} else {
  console.warn('WARNING: ADMIN_PASSWORD not set — no admin users created');
}

db.close();
console.log('Database seeded successfully.');
