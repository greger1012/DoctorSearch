const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function updateIndicesForExcelData() {
  try {
    console.log('🔄 Updating Elasticsearch indices for Excel data...\n');

    // Update doctors index
    console.log('Updating doctors index...');
    try {
      await client.indices.putMapping({
        index: 'doctors',
        body: {
          properties: {
            specialties: { 
              type: 'text',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            schedulingDEPs: { type: 'keyword' },
            depLinks: {
              type: 'nested',
              properties: {
                dep: { type: 'keyword' },
                sparkleId: { type: 'keyword' },
                locationName: { type: 'text' },
                address: { type: 'text' },
                phone: { type: 'keyword' },
                fax: { type: 'keyword' },
                url: { type: 'keyword' }
              }
            },
            services: {
              type: 'nested',
              properties: {
                name: { type: 'text' },
                url: { type: 'keyword' },
                specialties: { type: 'keyword' }
              }
            },
            serviceUrls: { type: 'keyword' },
            serviceDetails: {
              type: 'nested',
              properties: {
                serviceUrl: { type: 'keyword' },
                specialty: { type: 'text' },
                deps: { type: 'keyword' },
                providersMode: { type: 'keyword' }
              }
            },
            serviceDEPRelationships: {
              type: 'nested',
              properties: {
                serviceUrl: { type: 'keyword' },
                dep: { type: 'keyword' },
                specialty: { type: 'text' },
                providersMode: { type: 'keyword' }
              }
            }
          }
        }
      });
      console.log('  ✅ Doctors index updated');
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.log('  ⚠️  Doctors index does not exist yet. Run setupIndices.js first.');
      } else {
        console.error('  ❌ Error updating doctors index:', error.message);
      }
    }

    // Update locations index
    console.log('\nUpdating locations index...');
    try {
      await client.indices.putMapping({
        index: 'locations',
        body: {
          properties: {
            sparkleId: { type: 'keyword' },
            cleanName: { type: 'text' },
            taxonomySpecialties: { type: 'keyword' },
            dataSource: { type: 'keyword' },
            externalIds: { type: 'text' },
            epicId: { type: 'keyword' },
            fromLocationCatalog: { type: 'boolean' },
            city: { type: 'keyword' },
            facility: { type: 'keyword' }
          }
        }
      });
      console.log('  ✅ Locations index updated');
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.log('  ⚠️  Locations index does not exist yet. Run setupIndices.js first.');
      } else {
        console.error('  ❌ Error updating locations index:', error.message);
      }
    }

    // Update content index
    console.log('\nUpdating content index...');
    try {
      await client.indices.putMapping({
        index: 'content',
        body: {
          properties: {
            name: { 
              type: 'text',
              fields: {
                keyword: { type: 'keyword' },
                suggest: { type: 'completion' }
              }
            },
            specialties: { type: 'keyword' },
            primarySpecialties: { type: 'keyword' },
            relatedSpecialties: { type: 'keyword' },
            locations: { type: 'keyword' },
            providers: { type: 'keyword' },
            providerNames: { type: 'text' },
            providerIds: { type: 'keyword' },
            fullPath: { type: 'keyword' },
            deps: { type: 'keyword' },
            depCount: { type: 'integer' },
            providerCount: { type: 'integer' }
          }
        }
      });
      console.log('  ✅ Content index updated');
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.log('  ⚠️  Content index does not exist yet. Run setupIndices.js first.');
      } else {
        console.error('  ❌ Error updating content index:', error.message);
      }
    }

    console.log('\n✅ Index mapping updates completed!');
    console.log('\nYou can now run: node server/scripts/importExcelData.js');

  } catch (error) {
    console.error('❌ Error updating indices:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateIndicesForExcelData();
}

module.exports = updateIndicesForExcelData;

