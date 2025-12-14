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
          accessibility: { type: 'text' }
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
          summary: { type: 'text' }
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
