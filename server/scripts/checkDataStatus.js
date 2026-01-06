const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function checkDataStatus() {
  try {
    console.log('🔍 Checking data status...\n');
    console.log(`Elasticsearch URL: ${process.env.ELASTICSEARCH_URL || 'http://localhost:9200'}\n`);
    
    // Check connection
    try {
      await client.ping();
      console.log('✅ Elasticsearch is connected\n');
    } catch (error) {
      console.error('❌ Cannot connect to Elasticsearch:', error.message);
      console.log('\n⚠️  Please set ELASTICSEARCH_URL environment variable in Railway');
      process.exit(1);
    }
    
    // Check indices
    const indices = ['doctors', 'locations', 'content'];
    const indexStatus = {};
    
    for (const index of indices) {
      try {
        const exists = await client.indices.exists({ index });
        if (exists) {
          const count = await client.count({ index });
          const docCount = count.body?.count || count.count || 0;
          indexStatus[index] = { exists: true, count: docCount };
        } else {
          indexStatus[index] = { exists: false, count: 0 };
        }
      } catch (error) {
        indexStatus[index] = { exists: false, count: 0, error: error.message };
      }
    }
    
    console.log('📊 Index Status:');
    console.log('='.repeat(50));
    Object.entries(indexStatus).forEach(([index, status]) => {
      if (status.exists) {
        console.log(`  ${index}: ✅ EXISTS (${status.count} documents)`);
      } else {
        console.log(`  ${index}: ❌ NOT FOUND`);
      }
    });
    
    const totalDocs = Object.values(indexStatus).reduce((sum, status) => sum + (status.count || 0), 0);
    
    console.log('\n' + '='.repeat(50));
    console.log(`Total documents: ${totalDocs}`);
    
    if (totalDocs === 0) {
      console.log('\n⚠️  No data found! You need to import data.\n');
      console.log('📝 To import data, run these commands:');
      console.log('   1. npm run startup');
      console.log('   2. npm run import:excel');
      console.log('   3. npm run import:locations');
      console.log('\n💡 Or run all at once:');
      console.log('   npm run startup && npm run import:excel && npm run import:locations');
      process.exit(1);
    } else {
      console.log('\n✅ Data is loaded!');
      
      // Show sample data
      if (indexStatus.doctors.count > 0) {
        console.log('\n📋 Sample doctor:');
        const sample = await client.search({
          index: 'doctors',
          size: 1
        });
        const doctor = sample.body?.hits?.hits?.[0]?._source || sample.hits?.hits?.[0]?._source;
        if (doctor) {
          console.log(`   Name: ${doctor.name}`);
          console.log(`   Specialty: ${doctor.specialty || 'N/A'}`);
        }
      }
      
      if (indexStatus.content.count > 0) {
        console.log('\n📋 Sample service:');
        const sample = await client.search({
          index: 'content',
          body: {
            query: { term: { type: 'service' } },
            size: 1
          }
        });
        const service = sample.body?.hits?.hits?.[0]?._source || sample.hits?.hits?.[0]?._source;
        if (service) {
          console.log(`   Name: ${service.name}`);
          console.log(`   Specialties: ${service.specialties?.join(', ') || 'N/A'}`);
        }
      }
      
      console.log('\n✨ Your app should be working! Try searching for "UCSF doctors"');
    }
    
  } catch (error) {
    console.error('❌ Error checking data status:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  checkDataStatus();
}

module.exports = checkDataStatus;

