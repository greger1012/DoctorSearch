const { Client } = require('@elastic/elasticsearch');
const setupIndices = require('./setupIndices');
const { seedData } = require('./seedData');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function waitForElasticsearch(maxRetries = 30, delay = 2000) {
  console.log('Waiting for Elasticsearch to be ready...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.ping();
      console.log('✅ Elasticsearch is ready!');
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for Elasticsearch... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('❌ Elasticsearch failed to start within the timeout period');
  return false;
}

async function startup() {
  try {
    console.log('🚀 Starting UCSF Unified Search setup...');
    
    // Wait for Elasticsearch to be ready
    const isReady = await waitForElasticsearch();
    if (!isReady) {
      process.exit(1);
    }
    
    // Setup indices
    console.log('📋 Setting up Elasticsearch indices...');
    await setupIndices();
    
    // Check if data already exists
    const response = await client.count({ index: 'doctors,locations,content' });
    
    if (response.body.count === 0) {
      console.log('🌱 Seeding with sample data...');
      await seedData();
    } else {
      console.log(`📊 Found ${response.body.count} existing documents, skipping seed`);
    }
    
    console.log('✅ Setup completed successfully!');
    console.log('');
    console.log('🔗 Access your application at:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:3001');
    console.log('   Kibana:   http://localhost:5601');
    console.log('');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startup();
}

module.exports = startup;
