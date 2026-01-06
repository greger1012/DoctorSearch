const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');
const path = require('path');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Check if indices exist
async function checkIndices() {
  try {
    const indices = ['doctors', 'locations', 'content'];
    const existingIndices = [];
    
    for (const index of indices) {
      try {
        const exists = await client.indices.exists({ index });
        if (exists) {
          existingIndices.push(index);
        }
      } catch (error) {
        // Index doesn't exist
      }
    }
    
    return existingIndices;
  } catch (error) {
    console.error('Error checking indices:', error);
    return [];
  }
}

// Check if data exists in indices
async function checkDataExists() {
  try {
    const doctorsCount = await client.count({ index: 'doctors' });
    const locationsCount = await client.count({ index: 'locations' });
    const contentCount = await client.count({ index: 'content' });
    
    return {
      doctors: doctorsCount.body?.count || doctorsCount.count || 0,
      locations: locationsCount.body?.count || locationsCount.count || 0,
      content: contentCount.body?.count || contentCount.count || 0
    };
  } catch (error) {
    // Indices don't exist yet
    return { doctors: 0, locations: 0, content: 0 };
  }
}

async function autoSetup() {
  try {
    console.log('🔍 Checking if setup is needed...');
    
    // Check Elasticsearch connection
    try {
      await client.ping();
      console.log('✅ Elasticsearch is connected');
    } catch (error) {
      console.error('❌ Cannot connect to Elasticsearch:', error.message);
      console.log('⚠️  Please ensure Elasticsearch is running and ELASTICSEARCH_URL is set');
      console.log(`⚠️  Current ELASTICSEARCH_URL: ${process.env.ELASTICSEARCH_URL || 'not set'}`);
      // Don't exit in production - let the app start and show errors in health check
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    }
    
    // Check if indices exist
    const existingIndices = await checkIndices();
    console.log(`📊 Existing indices: ${existingIndices.length > 0 ? existingIndices.join(', ') : 'none'}`);
    
    // Check if data exists
    const dataCounts = await checkDataExists();
    console.log(`📊 Data counts:`, dataCounts);
    
    const hasData = dataCounts.doctors > 0 || dataCounts.locations > 0 || dataCounts.content > 0;
    
    if (!hasData) {
      console.log('\n⚠️  No data found. Setup is needed.');
      console.log('📝 To initialize data, run:');
      console.log('   1. npm run startup (creates indices and imports doctors)');
      console.log('   2. npm run import:excel (imports services and Excel data)');
      console.log('   3. npm run import:locations (imports locations)');
      console.log('\n💡 Or run all at once: npm run startup && npm run import:excel && npm run import:locations');
      return false;
    } else {
      console.log('\n✅ Data is already loaded. Setup complete!');
      return true;
    }
  } catch (error) {
    console.error('❌ Error during auto-setup check:', error);
    return false;
  }
}

if (require.main === module) {
  autoSetup().then(needsSetup => {
    process.exit(needsSetup ? 0 : 1);
  });
}

module.exports = autoSetup;

