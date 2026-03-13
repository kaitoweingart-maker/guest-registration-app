const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set — using random secret (tokens will not survive restarts)');
}

function getJwtSecret() {
  return JWT_SECRET;
}

module.exports = { getJwtSecret };
