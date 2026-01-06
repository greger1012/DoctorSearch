const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

// Load environment variables - try config.env first, then fall back to .env
const configEnvPath = path.join(__dirname, '../config.env');
if (fs.existsSync(configEnvPath)) {
  require('dotenv').config({ path: configEnvPath });
} else {
  require('dotenv').config(); // Falls back to .env or system env vars
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Elasticsearch client
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Routes
app.use('/api/search', require('./routes/search'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/locations', require('./routes/locations'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Health check
app.get('/health', async (req, res) => {
  try {
    await client.ping();
    res.json({ status: 'healthy', elasticsearch: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Auto-setup check on startup (non-blocking)
if (process.env.NODE_ENV === 'production') {
  const autoSetup = require('./scripts/autoSetup');
  autoSetup().catch(err => {
    console.error('Auto-setup check failed:', err);
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Elasticsearch URL: ${process.env.ELASTICSEARCH_URL || 'http://localhost:9200'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
