const express = require('express');
const iconv = require('iconv-lite');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const GUEST_FIELDS = [
  'familienname', 'vorname', 'geburtsdatum', 'geschlecht', 'geburtsort',
  'heimatort', 'nationalitaet', 'adresse', 'adresse2', 'plz', 'ort', 'land',
  'landeskennzeichen', 'beruf', 'fz_kennzeichen', 'ausweistyp', 'ausweis_nummer',
  'zimmer_nummer', 'personen_bis_16', 'personen_ab_16', 'ankunftsdatum',
  'abreisedatum', 'mailadresse', 'newsletter', 'hotel', 'id_photo'
];

// SiDAP CSV column headers (field names per specification)
const SIDAP_HEADERS = [
  'ERSTELLDATUM', 'FAMILIENNAME', 'VORNAME', 'GEBURTSDATUM', 'GESCHLECHT',
  'GEBURTSORT', 'HEIMATORT', 'NATIONALITAET', 'ADRESSE', 'ADRESSE2',
  'PLZ', 'ORT', 'LAND', 'LANDESKENNZEICHEN', 'BERUF', 'FZ_KENNZEICHEN',
  'AUSWEISTYP', 'AUSWEIS_NR', 'ZIMMER_NR', 'ANZPERS_BIS16', 'ANZPERS_AB16',
  'ANKUNFTSDATUM', 'ABREISEDATUM'
];

// SiDAP field mapping from DB columns
const SIDAP_DB_FIELDS = [
  'created_at', 'familienname', 'vorname', 'geburtsdatum', 'geschlecht',
  'geburtsort', 'heimatort', 'nationalitaet', 'adresse', 'adresse2',
  'plz', 'ort', 'land', 'landeskennzeichen', 'beruf', 'fz_kennzeichen',
  'ausweistyp', 'ausweis_nummer', 'zimmer_nummer', 'personen_bis_16',
  'personen_ab_16', 'ankunftsdatum', 'abreisedatum'
];

// Convert ISO date (YYYY-MM-DD) or datetime to dd.mm.yyyy
function formatDateSiDAP(val) {
  if (!val) return '';
  // Handle datetime format (2024-01-15 10:30:00)
  const dateStr = String(val).substring(0, 10);
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return val;
}

// POST /api/guests — public, no auth
router.post('/', (req, res) => {
  const {
    familienname, vorname, geburtsdatum, adresse, plz, ort, land,
    ausweistyp, ausweis_nummer, id_photo
  } = req.body;

  // Validate required fields
  const missing = [];
  if (!familienname?.trim()) missing.push('Familienname');
  if (!vorname?.trim()) missing.push('Vorname');
  if (!geburtsdatum) missing.push('Geburtsdatum');
  if (!req.body.geschlecht) missing.push('Geschlecht');
  if (!req.body.geburtsort?.trim()) missing.push('Geburtsort');
  if (!req.body.nationalitaet?.trim()) missing.push('Nationalität');
  if (!adresse?.trim()) missing.push('Adresse');
  if (!plz?.trim()) missing.push('PLZ');
  if (!ort?.trim()) missing.push('Ort');
  if (!land?.trim()) missing.push('Land');
  if (!ausweistyp) missing.push('Ausweistyp');
  if (!ausweis_nummer?.trim()) missing.push('Ausweis-Nr.');
  if (!req.body.ankunftsdatum) missing.push('Ankunftsdatum');
  if (!req.body.abreisedatum) missing.push('Abreisedatum');
  if (!req.body.mailadresse?.trim()) missing.push('E-Mail');

  if (missing.length > 0) {
    return res.status(400).json({
      error: `Pflichtfelder fehlen: ${missing.join(', ')}`
    });
  }

  // Save photo to disk if provided
  let photoFilename = '';
  if (id_photo && id_photo.startsWith('data:image')) {
    const photoDir = req.app.locals.photoDir;
    const base64Data = id_photo.replace(/^data:image\/\w+;base64,/, '');
    const timestamp = Date.now();
    photoFilename = `${timestamp}_${familienname.trim()}_${vorname.trim()}.jpg`
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = path.join(photoDir, photoFilename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  }

  const columns = GUEST_FIELDS.filter(f => f !== 'id_photo' && req.body[f] !== undefined);
  if (photoFilename) columns.push('id_photo');

  const values = columns.map(f => {
    if (f === 'id_photo') return photoFilename;
    if (f === 'newsletter') return req.body[f] ? 1 : 0;
    if (f === 'personen_bis_16' || f === 'personen_ab_16') return parseInt(req.body[f]) || 0;
    return req.body[f] || '';
  });

  const placeholders = columns.map(() => '?').join(', ');
  const stmt = db.prepare(
    `INSERT INTO guests (${columns.join(', ')}) VALUES (${placeholders})`
  );

  try {
    const result = stmt.run(...values);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Registrierung erfolgreich' });
  } catch (err) {
    console.error('Error inserting guest:', err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// GET /api/guests — admin only
router.get('/', authMiddleware, (req, res) => {
  const { from, to, hotel } = req.query;
  let query = 'SELECT * FROM guests WHERE 1=1';
  const params = [];

  if (from) {
    query += ' AND DATE(created_at) >= DATE(?)';
    params.push(from);
  }
  if (to) {
    query += ' AND DATE(created_at) <= DATE(?)';
    params.push(to);
  }
  if (hotel) {
    query += ' AND hotel = ?';
    params.push(hotel);
  }

  query += ' ORDER BY created_at DESC';

  const guests = db.prepare(query).all(...params);
  res.json(guests);
});

// GET /api/guests/export — admin only, SiDAP-compliant CSV download
router.get('/export', authMiddleware, (req, res) => {
  const { from, to, hotel } = req.query;
  let query = 'SELECT * FROM guests WHERE 1=1';
  const params = [];

  if (from) {
    query += ' AND DATE(created_at) >= DATE(?)';
    params.push(from);
  }
  if (to) {
    query += ' AND DATE(created_at) <= DATE(?)';
    params.push(to);
  }
  if (hotel) {
    query += ' AND hotel = ?';
    params.push(hotel);
  }

  query += ' ORDER BY created_at DESC';

  const guests = db.prepare(query).all(...params);

  // Build SiDAP-compliant CSV
  const separator = ';';
  let csv = SIDAP_HEADERS.join(separator) + '\r\n';

  const dateFields = ['created_at', 'geburtsdatum', 'ankunftsdatum', 'abreisedatum'];

  for (const guest of guests) {
    const row = SIDAP_DB_FIELDS.map(f => {
      let val = guest[f] ?? '';
      // Format date fields as dd.mm.yyyy
      if (dateFields.includes(f)) {
        val = formatDateSiDAP(val);
      }
      val = String(val);
      // Escape semicolons and quotes in values
      if (val.includes(separator) || val.includes('"') || val.includes('\n')) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    csv += row.join(separator) + '\r\n';
  }

  // Encode to ISO 8859-1
  const buffer = iconv.encode(csv, 'ISO-8859-1');

  // SiDAP filename: <Hotel-ID>_<ddmmyyyy>_<hhmm>_GEN_<SW>.csv
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  // Hotel-ID assigned by Kantonspolizei — placeholder 2402
  const filename = `2402_${dd}${mm}${yyyy}_${hh}${min}_GEN_SAP.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=ISO-8859-1');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

module.exports = router;
