const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
// Load environment variables from config.env
require('dotenv').config({ path: './config.env' });

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Elasticsearch URL: ${process.env.ELASTICSEARCH_URL || 'http://localhost:9200'}`);
});
