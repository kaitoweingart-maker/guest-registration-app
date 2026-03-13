const express = require('express');
const iconv = require('iconv-lite');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const GUEST_FIELDS = [
  'familienname', 'vorname', 'geburtsdatum', 'geschlecht', 'geburtsort',
  'heimatort', 'nationalitaet', 'adresse', 'adresse2', 'plz', 'ort', 'land',
  'landeskennzeichen', 'beruf', 'fz_kennzeichen', 'ausweistyp', 'ausweis_nummer',
  'zimmer_nummer', 'personen_bis_16', 'personen_ab_16', 'ankunftsdatum',
  'abreisedatum', 'mailadresse', 'newsletter', 'hotel'
];

const CSV_HEADERS = [
  'Familienname', 'Vorname', 'Geburtsdatum', 'Geschlecht', 'Geburtsort',
  'Heimatort', 'Nationalität', 'Adresse', 'Adresse 2', 'PLZ', 'Ort', 'Land',
  'Landeskennzeichen', 'Beruf', 'FZ-Kennzeichen', 'Ausweistyp', 'Ausweis-Nr.',
  'Zimmer-Nr.', 'Personen bis 16', 'Personen ab 16', 'Ankunftsdatum',
  'Abreisedatum', 'E-Mail', 'Newsletter', 'Hotel'
];

// POST /api/guests — public, no auth
router.post('/', (req, res) => {
  const { familienname, vorname } = req.body;
  if (!familienname || !vorname) {
    return res.status(400).json({ error: 'Familienname und Vorname sind erforderlich' });
  }

  const columns = GUEST_FIELDS.filter(f => req.body[f] !== undefined);
  const values = columns.map(f => {
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

// GET /api/guests/export — admin only, CSV download
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

  // Build CSV content
  const separator = ';';
  let csv = CSV_HEADERS.join(separator) + '\r\n';

  for (const guest of guests) {
    const row = GUEST_FIELDS.map(f => {
      let val = guest[f] ?? '';
      if (f === 'newsletter') val = val ? 'Ja' : 'Nein';
      // Escape semicolons and quotes in values
      val = String(val);
      if (val.includes(separator) || val.includes('"') || val.includes('\n')) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    csv += row.join(separator) + '\r\n';
  }

  // Encode to ISO 8859-1
  const buffer = iconv.encode(csv, 'ISO-8859-1');

  // Filename: 2402_DDMMYYYY_HHMM_GEN_SAP.csv
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const filename = `2402_${dd}${mm}${yyyy}_${hh}${min}_GEN_SAP.csv`;

  res.setHeader('Content-Type', 'text/csv; charset=ISO-8859-1');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

module.exports = router;
