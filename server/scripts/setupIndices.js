const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function setupIndices() {
  try {
    console.log('Setting up Elasticsearch indices...');

    // Doctors index mapping
    const doctorsMapping = {
      mappings: {
        properties: {
          type: { type: 'keyword' },
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          },
          specialty: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          },
          description: { type: 'text' },
          location: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          },
          acceptingPatients: { type: 'boolean' },
          phone: { type: 'keyword' },
          email: { type: 'keyword' },
          languages: { type: 'keyword' },
          education: { type: 'text' },
          experience: { type: 'integer' },
          rating: { type: 'float' },
          reviews: { type: 'integer' },
          profileImage: { type: 'keyword' },
          schedule: {
            type: 'object',
            properties: {
              monday: { type: 'text' },
              tuesday: { type: 'text' },
              wednesday: { type: 'text' },
              thursday: { type: 'text' },
              friday: { type: 'text' },
              saturday: { type: 'text' },
              sunday: { type: 'text' }
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
    };

    // Locations index mapping
    const locationsMapping = {
      mappings: {
        properties: {
          type: { type: 'keyword' },
          name: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          },
          location: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          },
          address: { type: 'text' },
          description: { type: 'text' },
          services: { type: 'keyword' },
          phone: { type: 'keyword' },
          email: { type: 'keyword' },
          website: { type: 'keyword' },
          hours: {
            type: 'object',
            properties: {
              monday: { type: 'text' },
              tuesday: { type: 'text' },
              wednesday: { type: 'text' },
              thursday: { type: 'text' },
              friday: { type: 'text' },
              saturday: { type: 'text' },
              sunday: { type: 'text' }
            }
          },
          coordinates: {
            type: 'geo_point'
          },
          parking: { type: 'text' },
          accessibility: { type: 'text' },
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
    };

    // Content index mapping
    const contentMapping = {
      mappings: {
        properties: {
          type: { type: 'keyword' },
          title: { 
            type: 'text',
            fields: {
              keyword: { type: 'keyword' }
            }
          },
          content: { type: 'text' },
          category: { type: 'keyword' },
          tags: { type: 'keyword' },
          url: { type: 'keyword' },
          publishedDate: { type: 'date' },
          author: { type: 'keyword' },
          summary: { type: 'text' },
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
    };

    // Create indices
    await client.indices.create({
      index: 'doctors',
      body: doctorsMapping
    });
    console.log('Created doctors index');

    await client.indices.create({
      index: 'locations',
      body: locationsMapping
    });
    console.log('Created locations index');

    await client.indices.create({
      index: 'content',
      body: contentMapping
    });
    console.log('Created content index');

    console.log('All indices created successfully!');

  } catch (error) {
    if (error.meta && error.meta.statusCode === 400) {
      console.log('Indices already exist, skipping creation');
    } else {
      console.error('Error setting up indices:', error);
    }
  }
}

if (require.main === module) {
  setupIndices();
}

module.exports = setupIndices;
