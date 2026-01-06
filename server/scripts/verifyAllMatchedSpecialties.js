const { Client } = require('@elastic/elasticsearch');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const excelPath = path.join(__dirname, '../../Greg Specifics.xlsx');

function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

async function verifyAllMatchedSpecialties() {
  try {
    console.log('🔍 Verifying all matched specialties are searchable...\n');
    
    // Get all matched specialties from Excel
    const workbook = XLSX.readFile(excelPath);
    const serviceProvidersSheet = workbook.Sheets['ServiceProviders'];
    const serviceProvidersData = XLSX.utils.sheet_to_json(serviceProvidersSheet, { defval: null });
    
    const allMatchedSpecialties = new Set();
    serviceProvidersData.forEach(row => {
      const specialty = cleanString(row['Matched Specialty (Sitecore)']);
      if (specialty) {
        allMatchedSpecialties.add(specialty);
      }
    });
    
    console.log(`Total unique matched specialties in Excel: ${allMatchedSpecialties.size}\n`);
    
    // Test searching for each specialty
    console.log('Testing search for each matched specialty...\n');
    let foundCount = 0;
    let notFoundCount = 0;
    const notFound = [];
    
    for (const specialty of Array.from(allMatchedSpecialties).slice(0, 20)) { // Test first 20
      const response = await client.search({
        index: 'content',
        body: {
          query: {
            bool: {
              should: [
                { match: { name: specialty } },
                { match: { specialties: specialty } },
                { match: { primarySpecialties: specialty } },
                { match: { relatedSpecialties: specialty } }
              ]
            }
          },
          size: 1
        }
      });
      
      const hits = response.body?.hits?.hits || response.hits?.hits || [];
      if (hits.length > 0) {
        foundCount++;
        console.log(`  ✅ "${specialty}" - Found in: ${hits[0]._source.name}`);
      } else {
        notFoundCount++;
        notFound.push(specialty);
        console.log(`  ❌ "${specialty}" - NOT FOUND`);
      }
    }
    
    console.log(`\n\nSummary:`);
    console.log(`  Found: ${foundCount}`);
    console.log(`  Not found: ${notFoundCount}`);
    if (notFound.length > 0) {
      console.log(`\n  Not found specialties:`);
      notFound.forEach(s => console.log(`    - ${s}`));
    }
    
    // Test "movement disorders" specifically
    console.log('\n\n🔍 Testing "movement disorders" search specifically...');
    const movementResponse = await client.search({
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
                match: {
                  name: 'movement disorders'
                }
              },
              {
                match: {
                  specialties: 'movement disorders'
                }
              },
              {
                match: {
                  primarySpecialties: 'movement disorders'
                }
              },
              {
                match: {
                  relatedSpecialties: 'movement disorders'
                }
              }
            ]
          }
        },
        size: 10
      }
    });
    
    const movementHits = movementResponse.body?.hits?.hits || movementResponse.hits?.hits || [];
    console.log(`\n  Results for "movement disorders": ${movementHits.length}`);
    movementHits.forEach((hit, idx) => {
      console.log(`    ${idx + 1}. ${hit._source.name} (score: ${hit._score})`);
      console.log(`       Specialties: ${hit._source.specialties?.join(', ') || 'none'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyAllMatchedSpecialties();
}

module.exports = verifyAllMatchedSpecialties;

