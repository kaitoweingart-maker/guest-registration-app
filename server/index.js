require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const guestRoutes = require('./routes/guests');

const app = express();
const PORT = process.env.PORT || 3001;

// Create photo directory
const photoDir = process.env.NODE_ENV === 'production'
  ? '/data/photos'
  : path.join(__dirname, '..', 'photos');
if (!fs.existsSync(photoDir)) {
  fs.mkdirSync(photoDir, { recursive: true });
}
app.locals.photoDir = photoDir;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/guests', guestRoutes);

// Serve frontend
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const indexHtml = path.join(clientDist, 'index.html');

if (fs.existsSync(indexHtml)) {
  console.log('Serving static files from', clientDist);
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(indexHtml);
  });
} else {
  console.warn('WARNING: client/dist not found at', clientDist);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
});
