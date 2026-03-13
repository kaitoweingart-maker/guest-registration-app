require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check — always works, even if DB fails
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), node_env: process.env.NODE_ENV });
});

// Load routes with error handling
let startupError = null;
try {
  // Create photo directory
  const photoDir = process.env.NODE_ENV === 'production'
    ? '/data/photos'
    : path.join(__dirname, '..', 'photos');
  if (!fs.existsSync(photoDir)) {
    fs.mkdirSync(photoDir, { recursive: true });
  }
  app.locals.photoDir = photoDir;

  const authRoutes = require('./routes/auth');
  const guestRoutes = require('./routes/guests');

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/guests', guestRoutes);
  console.log('All routes loaded successfully');
} catch (err) {
  startupError = err;
  console.error('STARTUP ERROR:', err.message);
  console.error(err.stack);
  // Return the error on any API call
  app.use('/api', (req, res) => {
    res.status(500).json({ error: 'Server startup failed', details: err.message });
  });
}

// Serve frontend — try multiple possible paths
const possiblePaths = [
  path.join(__dirname, '..', 'client', 'dist'),
  path.join(process.cwd(), 'client', 'dist'),
  '/opt/render/project/src/client/dist',
];

let clientDist = null;
for (const p of possiblePaths) {
  const idx = path.join(p, 'index.html');
  console.log(`Checking for frontend at: ${p} => exists: ${fs.existsSync(idx)}`);
  if (fs.existsSync(idx)) {
    clientDist = p;
    break;
  }
}

if (clientDist) {
  const indexHtml = path.join(clientDist, 'index.html');
  console.log('Serving static files from', clientDist);
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  console.error('ERROR: client/dist not found at any of:', possiblePaths);
  // Fallback: show debug info
  app.get('*', (req, res) => {
    res.status(503).send(`
      <h2>Frontend not built</h2>
      <p>The server is running but client/dist was not found.</p>
      <p>Checked paths:</p>
      <ul>${possiblePaths.map(p => `<li>${p} — ${fs.existsSync(p) ? 'EXISTS' : 'NOT FOUND'}</li>`).join('')}</ul>
      <p>__dirname: ${__dirname}</p>
      <p>cwd: ${process.cwd()}</p>
      <p>Contents of parent dir:</p>
      <pre>${JSON.stringify(fs.readdirSync(path.join(__dirname, '..')), null, 2)}</pre>
    `);
  });
}

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
  if (startupError) {
    console.error('WARNING: Server started with errors — API will not work');
  }
});
