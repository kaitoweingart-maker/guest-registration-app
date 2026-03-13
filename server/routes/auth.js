const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { getJwtSecret } = require('../middleware/jwtSecret');

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
    }

    const user = db.prepare(
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?)'
    ).get(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Anmeldung fehlgeschlagen' });
  }
});

module.exports = router;
