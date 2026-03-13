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

// Seed admin users (passwords from env vars)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  console.warn('WARNING: ADMIN_PASSWORD not set. Skipping user seed. Set it in Render env vars.');
  db.close();
  process.exit(0);
}

const admins = [
  { username: 'julian', password: adminPassword },
  { username: 'kaito', password: adminPassword },
  { username: 'prize', password: '12345' }
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)'
);

for (const admin of admins) {
  const hash = bcrypt.hashSync(admin.password, 10);
  insert.run(admin.username, hash);
  console.log(`Admin user '${admin.username}' seeded.`);
}

db.close();
console.log('Database seeded successfully.');
