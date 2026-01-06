const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function testDoctorSpecialtySearch() {
  try {
    console.log('🔍 Testing doctor specialty search...\n');
    
    // Test 1: Search for Simon Little
    console.log('Test 1: Searching for "simon little"');
    const response1 = await client.search({
      index: 'doctors',
      body: {
        query: {
          bool: {
            should: [
              { match: { name: 'simon little' } }
            ]
          }
        },
        size: 1
      }
    });
    
    const hits1 = response1.body?.hits?.hits || response1.hits?.hits || [];
    if (hits1.length > 0) {
      const doctor = hits1[0]._source;
      console.log(`  Found: ${doctor.name}`);
      console.log(`  Specialty: ${doctor.specialty || 'none'}`);
      console.log(`  Specialties (plural): ${doctor.specialties?.join(', ') || 'none'}`);
      console.log(`  Services: ${doctor.services?.length || 0}`);
      if (doctor.services && doctor.services.length > 0) {
        console.log(`  First service: ${doctor.services[0].name}`);
        console.log(`  Service specialties: ${doctor.services[0].specialties?.join(', ') || 'none'}`);
      }
      if (doctor.serviceDetails && doctor.serviceDetails.length > 0) {
        console.log(`  Service details specialties: ${doctor.serviceDetails.map(s => s.specialty).filter(Boolean).join(', ')}`);
      }
    }
    
    // Test 2: Search for "movement disorders"
    console.log('\n\nTest 2: Searching for "movement disorders" in doctors');
    const response2 = await client.search({
      index: 'doctors',
      body: {
        query: {
          bool: {
            should: [
              { match: { specialty: 'movement disorders' } },
              { match: { specialties: 'movement disorders' } }
            ]
          }
        },
        size: 10
      }
    });
    
    const hits2 = response2.body?.hits?.hits || response2.hits?.hits || [];
    console.log(`  Found ${hits2.length} doctors`);
    hits2.forEach((hit, idx) => {
      console.log(`  ${idx + 1}. ${hit._source.name} (score: ${hit._score})`);
      console.log(`     Specialty: ${hit._source.specialty || 'none'}`);
      console.log(`     Specialties: ${hit._source.specialties?.join(', ') || 'none'}`);
    });
    
    // Test 3: Search for "Movement Disorders Neurology"
    console.log('\n\nTest 3: Searching for "Movement Disorders Neurology"');
    const response3 = await client.search({
      index: 'doctors',
      body: {
        query: {
          bool: {
            should: [
              { match: { specialty: 'Movement Disorders Neurology' } },
              { match: { specialties: 'Movement Disorders Neurology' } }
            ]
          }
        },
        size: 10
      }
    });
    
    const hits3 = response3.body?.hits?.hits || response3.hits?.hits || [];
    console.log(`  Found ${hits3.length} doctors`);
    hits3.forEach((hit, idx) => {
      console.log(`  ${idx + 1}. ${hit._source.name} (score: ${hit._score})`);
      console.log(`     Specialties: ${hit._source.specialties?.join(', ') || 'none'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testDoctorSpecialtySearch();
}

module.exports = testDoctorSpecialtySearch;

