const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function testSearch() {
  try {
    console.log('🔍 Testing search for "movement disorders"...\n');
    
    // Test 1: Exact match
    console.log('Test 1: Searching for "movement disorders"');
    const response1 = await client.search({
      index: 'content',
      body: {
        query: {
          multi_match: {
            query: 'movement disorders',
            fields: ['name^5', 'specialties^3', 'primarySpecialties^4', 'relatedSpecialties^2'],
            type: 'best_fields',
            fuzziness: 1,
            prefix_length: 2
          }
        },
        size: 10
      }
    });
    
    const hits1 = response1.body?.hits?.hits || response1.hits?.hits || [];
    console.log(`  Found ${hits1.length} results`);
    hits1.forEach((hit, idx) => {
      console.log(`  ${idx + 1}. ${hit._source.name}`);
      console.log(`     Specialties: ${hit._source.specialties?.join(', ') || 'none'}`);
      console.log(`     Score: ${hit._score}`);
    });
    
    // Test 2: Check what's actually in the Movement Disorders service
    console.log('\n\nTest 2: Checking Movement Disorders Center service directly');
    const response2 = await client.search({
      index: 'content',
      body: {
        query: {
          match: {
            name: 'Movement Disorders Center'
          }
        },
        size: 1
      }
    });
    
    const hits2 = response2.body?.hits?.hits || response2.hits?.hits || [];
    if (hits2.length > 0) {
      const service = hits2[0]._source;
      console.log(`  Service: ${service.name}`);
      console.log(`  URL: ${service.url}`);
      console.log(`  All specialties: ${service.specialties?.join(', ') || 'none'}`);
      console.log(`  Primary specialties: ${service.primarySpecialties?.join(', ') || 'none'}`);
      console.log(`  Related specialties: ${service.relatedSpecialties?.join(', ') || 'none'}`);
    }
    
    // Test 3: Search with match_phrase
    console.log('\n\nTest 3: Searching with match_phrase');
    const response3 = await client.search({
      index: 'content',
      body: {
        query: {
          bool: {
            should: [
              {
                match_phrase: {
                  name: {
                    query: 'movement disorders',
                    boost: 6
                  }
                }
              },
              {
                match_phrase: {
                  specialties: {
                    query: 'movement disorders',
                    boost: 5
                  }
                }
              },
              {
                multi_match: {
                  query: 'movement disorders',
                  fields: ['name^5', 'specialties^3', 'primarySpecialties^4', 'relatedSpecialties^2'],
                  type: 'best_fields',
                  fuzziness: 1
                }
              }
            ]
          }
        },
        size: 10
      }
    });
    
    const hits3 = response3.body?.hits?.hits || response3.hits?.hits || [];
    console.log(`  Found ${hits3.length} results`);
    hits3.forEach((hit, idx) => {
      console.log(`  ${idx + 1}. ${hit._source.name} (score: ${hit._score})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testSearch();
}

module.exports = testSearch;

