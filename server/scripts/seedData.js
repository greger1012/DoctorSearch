const { Client } = require('@elastic/elasticsearch');
const { faker } = require('@faker-js/faker');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// UCSF Health specialties and locations
const specialties = [
  'Neurology', 'Cardiology', 'Oncology', 'Pediatrics', 'Orthopedics',
  'Dermatology', 'Gastroenterology', 'Pulmonology', 'Endocrinology',
  'Psychiatry', 'Radiology', 'Surgery', 'Anesthesiology', 'Emergency Medicine',
  'Family Medicine', 'Internal Medicine', 'Obstetrics & Gynecology',
  'Ophthalmology', 'Otolaryngology', 'Urology', 'Nephrology', 'Rheumatology'
];

const ucsfLocations = [
  'Parnassus Heights', 'Mission Bay', 'Mount Zion', 'Oakland',
  'San Francisco General', 'Benioff Children\'s Hospital'
];

const services = [
  'Primary Care', 'Specialty Care', 'Emergency Services', 'Surgery',
  'Diagnostic Imaging', 'Laboratory Services', 'Pharmacy', 'Physical Therapy',
  'Mental Health', 'Cancer Care', 'Pediatric Care', 'Women\'s Health'
];

async function generateDoctors(count = 100) {
  const doctors = [];
  
  for (let i = 0; i < count; i++) {
    const doctor = {
      type: 'doctor',
      name: faker.name.findName(),
      specialty: faker.random.arrayElement(specialties),
      description: `Dr. ${faker.name.lastName()} is a board-certified ${faker.random.arrayElement(specialties).toLowerCase()} specialist with extensive experience in patient care.`,
      location: faker.random.arrayElement(ucsfLocations),
      acceptingPatients: faker.random.boolean(),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      languages: faker.random.arrayElements(['English', 'Spanish', 'Mandarin', 'Cantonese', 'French'], faker.random.number({ min: 1, max: 3 })),
      education: `MD from ${faker.address.state()} Medical School`,
      experience: faker.random.number({ min: 2, max: 30 }),
      // Note: Rating and reviews removed - not using fake data
      rating: null,
      reviews: null,
      profileImage: `https://via.placeholder.com/150?text=${faker.name.firstName().charAt(0)}`,
      schedule: {
        monday: '9:00 AM - 5:00 PM',
        tuesday: '9:00 AM - 5:00 PM',
        wednesday: '9:00 AM - 5:00 PM',
        thursday: '9:00 AM - 5:00 PM',
        friday: '9:00 AM - 3:00 PM',
        saturday: 'Closed',
        sunday: 'Closed'
      }
    };
    doctors.push(doctor);
  }
  
  return doctors;
}

async function generateLocations(count = 20) {
  const locations = [];
  
  for (let i = 0; i < count; i++) {
    const location = {
      type: 'location',
      name: `${ucsfLocations[i % ucsfLocations.length]} ${faker.company.companySuffix()}`,
      location: ucsfLocations[i % ucsfLocations.length],
      address: `${faker.address.streetAddress()}, San Francisco, CA ${faker.address.zipCode()}`,
      description: `UCSF Health facility providing comprehensive medical care in ${ucsfLocations[i % ucsfLocations.length]}.`,
      services: faker.random.arrayElements(services, faker.random.number({ min: 3, max: 8 })),
      phone: faker.phone.phoneNumber(),
      email: faker.internet.email(),
      website: faker.internet.url(),
      hours: {
        monday: '7:00 AM - 7:00 PM',
        tuesday: '7:00 AM - 7:00 PM',
        wednesday: '7:00 AM - 7:00 PM',
        thursday: '7:00 AM - 7:00 PM',
        friday: '7:00 AM - 5:00 PM',
        saturday: '8:00 AM - 2:00 PM',
        sunday: 'Closed'
      },
      coordinates: {
        lat: parseFloat(faker.address.latitude()),
        lon: parseFloat(faker.address.longitude())
      },
      parking: faker.random.arrayElement(['Free parking available', 'Valet parking', 'Street parking', 'Parking garage']),
      accessibility: 'Wheelchair accessible with ADA compliant facilities'
    };
    locations.push(location);
  }
  
  return locations;
}

async function generateContent(count = 50) {
  const content = [];
  
  const categories = ['Health Tips', 'Research News', 'Patient Stories', 'Medical Breakthroughs', 'Wellness'];
  
  for (let i = 0; i < count; i++) {
    const article = {
      type: 'content',
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(faker.random.number({ min: 3, max: 10 })),
      category: faker.random.arrayElement(categories),
      tags: faker.random.arrayElements(specialties.concat(['Health', 'Wellness', 'Research']), faker.random.number({ min: 1, max: 4 })),
      url: faker.internet.url(),
      publishedDate: faker.date.past(),
      author: faker.name.findName(),
      summary: faker.lorem.sentences(2)
    };
    content.push(article);
  }
  
  return content;
}

async function seedData() {
  try {
    console.log('⚠️  WARNING: This script generates FAKE/TEST data using Faker.js');
    console.log('⚠️  This data is for testing purposes only and should NOT be used in production!');
    console.log('');
    console.log('📝 For real doctor data, use: node server/scripts/importDoctorsCSV.js');
    console.log('');
    console.log('Starting fake data generation...');

    // Generate FAKE sample data (for testing only)
    const doctors = await generateDoctors(100);
    const locations = await generateLocations(20);
    const content = await generateContent(50);

    // Index doctors
    console.log('Indexing doctors...');
    for (const doctor of doctors) {
      await client.index({
        index: 'doctors',
        body: doctor
      });
    }

    // Index locations
    console.log('Indexing locations...');
    for (const location of locations) {
      await client.index({
        index: 'locations',
        body: location
      });
    }

    // Index content
    console.log('Indexing content...');
    for (const article of content) {
      await client.index({
        index: 'content',
        body: article
      });
    }

    // Refresh indices
    await client.indices.refresh({ index: 'doctors,locations,content' });

    console.log(`⚠️  Seeded ${doctors.length} FAKE doctors, ${locations.length} locations, and ${content.length} content articles`);
    console.log('⚠️  Remember: This is TEST data only. Use importDoctorsCSV.js for real data!');
    console.log('Fake data generation completed.');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { generateDoctors, generateLocations, generateContent, seedData };
