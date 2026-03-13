CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  familienname TEXT NOT NULL,
  vorname TEXT NOT NULL,
  geburtsdatum TEXT,
  geschlecht TEXT,
  geburtsort TEXT,
  heimatort TEXT,
  nationalitaet TEXT,
  adresse TEXT,
  adresse2 TEXT,
  plz TEXT,
  ort TEXT,
  land TEXT,
  landeskennzeichen TEXT,
  beruf TEXT,
  fz_kennzeichen TEXT,
  ausweistyp TEXT,
  ausweis_nummer TEXT,
  zimmer_nummer TEXT,
  personen_bis_16 INTEGER DEFAULT 0,
  personen_ab_16 INTEGER DEFAULT 1,
  ankunftsdatum TEXT,
  abreisedatum TEXT,
  mailadresse TEXT,
  newsletter INTEGER DEFAULT 0,
  hotel TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
