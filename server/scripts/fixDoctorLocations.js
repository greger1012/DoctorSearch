const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Location mapping from import script
const locationMapping = {
  PARN: 'Parnassus Heights',
  MZB: 'Mission Bay',
  MTZ: 'Mount Zion',
  OAK: 'Oakland',
  SFGH: 'San Francisco General',
  CHILD: "Benioff Children's Hospital",
  UCNAC: 'UCSF Medical Center',
  CFMG: 'UCSF Medical Group'
};

function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

function determineLocation(subgroup, primaryLocation, city, address) {
  // First try location mapping
  if (subgroup && locationMapping[subgroup]) {
    return locationMapping[subgroup];
  }
  
  // Then try PRIMARY LOCATION
  if (primaryLocation) {
    return primaryLocation;
  }
  
  // Derive from city if available
  if (city) {
    const cityToLocation = {
      'Berkeley': 'Berkeley',
      'Oakland': 'Oakland',
      'Fremont': 'Fremont',
      'Walnut Creek': 'Walnut Creek',
      'San Francisco': 'San Francisco',
      'San Rafael': 'San Rafael',
      'Redwood Shores': 'Redwood Shores',
      'Monterey': 'Monterey',
      'Santa Rosa': 'Santa Rosa'
    };
    
    if (cityToLocation[city]) {
      return cityToLocation[city];
    }
    
    // If city is San Francisco, try to determine which campus from address
    if (city === 'San Francisco' && address) {
      const addressLower = address.toLowerCase();
      if (addressLower.includes('parnassus') || addressLower.includes('505 parnassus')) {
        return 'Parnassus Heights';
      } else if (addressLower.includes('mission bay') || addressLower.includes('1825 4th')) {
        return 'Mission Bay';
      } else if (addressLower.includes('mount zion') || addressLower.includes('1600 divisadero')) {
        return 'Mount Zion';
      } else if (addressLower.includes('san francisco general') || addressLower.includes('sfgh')) {
        return 'San Francisco General';
      }
    }
    
    // Return city name as location if no specific mapping
    return city;
  }
  
  // Last resort: try to extract from address
  if (address) {
    const addressLower = address.toLowerCase();
    if (addressLower.includes('parnassus') || addressLower.includes('505 parnassus')) {
      return 'Parnassus Heights';
    } else if (addressLower.includes('mission bay') || addressLower.includes('1825 4th')) {
      return 'Mission Bay';
    } else if (addressLower.includes('mount zion') || addressLower.includes('1600 divisadero')) {
      return 'Mount Zion';
    } else if (addressLower.includes('san francisco general') || addressLower.includes('sfgh')) {
      return 'San Francisco General';
    } else if (addressLower.includes('berkeley')) {
      return 'Berkeley';
    } else if (addressLower.includes('oakland')) {
      return 'Oakland';
    } else if (addressLower.includes('fremont')) {
      return 'Fremont';
    } else if (addressLower.includes('walnut creek')) {
      return 'Walnut Creek';
    }
  }
  
  // Final fallback - prefer city over generic "UCSF Medical Center"
  return city || 'UCSF Medical Center';
}

async function fixDoctorLocations() {
  try {
    console.log('🔄 Fixing doctor locations based on city and address...\n');

    // Get all doctors
    const searchResponse = await client.search({
      index: 'doctors',
      body: {
        size: 10000,
        query: { match_all: {} },
        _source: ['npi', 'name', 'location', 'locationCode', 'city', 'address']
      }
    });

    const hits = searchResponse.body?.hits?.hits || searchResponse.hits?.hits || [];
    console.log(`Found ${hits.length} doctors to check\n`);

    const updates = [];
    let updateCount = 0;
    let fixedCount = 0;

    for (const hit of hits) {
      const doctor = hit._source;
      const currentLocation = cleanString(doctor.location);
      const locationCode = cleanString(doctor.locationCode);
      const city = cleanString(doctor.city);
      const address = cleanString(doctor.address);

      // Calculate what the location should be
      const correctLocation = determineLocation(locationCode, null, city, address);

      // Only update if location needs to be changed
      if (currentLocation !== correctLocation && correctLocation !== 'UCSF Medical Center') {
        // Also update if current location is "UCSF Medical Center" but we have a city
        if (currentLocation === 'UCSF Medical Center' && city) {
          updates.push({
            update: {
              _index: 'doctors',
              _id: hit._id
            }
          });
          updates.push({
            doc: {
              location: correctLocation
            },
            doc_as_upsert: false
          });
          updateCount++;
          
          if (currentLocation !== correctLocation) {
            fixedCount++;
            console.log(`  Fixing: ${doctor.name}`);
            console.log(`    Current: "${currentLocation}" → Correct: "${correctLocation}"`);
            console.log(`    City: ${city}, Address: ${address ? address.substring(0, 50) + '...' : 'N/A'}\n`);
          }
        }
      }
    }

    if (updates.length > 0) {
      console.log(`\n📤 Updating ${updateCount} doctors with corrected locations...`);
      
      // Process in batches
      const BATCH_SIZE = 500;
      for (let i = 0; i < updates.length; i += BATCH_SIZE * 2) {
        const batch = updates.slice(i, i + BATCH_SIZE * 2);
        await client.bulk({ body: batch, refresh: false });
        process.stdout.write(`  Progress: ${Math.min(i + BATCH_SIZE * 2, updates.length)}/${updates.length}\r`);
      }
      
      console.log(`\n✅ Updated ${updateCount} doctors`);
      console.log(`   Fixed ${fixedCount} incorrect locations`);
    } else {
      console.log('✅ No location fixes needed - all locations are correct!');
    }

    // Refresh index
    console.log('\n🔄 Refreshing doctors index...');
    await client.indices.refresh({ index: 'doctors' });

    console.log('\n✅ Location fix completed!');

  } catch (error) {
    console.error('❌ Error fixing doctor locations:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  fixDoctorLocations();
}

module.exports = fixDoctorLocations;

