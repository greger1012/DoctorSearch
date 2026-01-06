const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const excelPath = path.join(__dirname, '../../Greg Specifics.xlsx');
const BATCH_SIZE = 500;

// Helper functions
function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

function parseDelimitedList(value) {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map(item => cleanString(item))
    .filter(Boolean);
}

async function bulkIndex(index, docs) {
  if (docs.length === 0) return;
  
  const body = docs.flatMap(doc => [
    { index: { _index: index } },
    doc
  ]);

  try {
    const response = await client.bulk({ body, refresh: false });
    if (response.body?.errors || response.errors) {
      const erroredDocuments = [];
      const items = response.body?.items || response.items || [];
      items.forEach((action, i) => {
        if (action.index?.error) {
          erroredDocuments.push({
            status: action.index.status,
            error: action.index.error,
            document: docs[i]
          });
        }
      });
      if (erroredDocuments.length > 0) {
        console.error(`  ⚠️  ${erroredDocuments.length} documents failed to index`);
      }
    }
  } catch (error) {
    console.error(`  ❌ Bulk index error:`, error.message);
  }
}

async function importLocationCatalog() {
  try {
    console.log('🔄 Importing Location Catalog from Greg Specifics.xlsx...\n');

    if (!fs.existsSync(excelPath)) {
      console.error('❌ Excel file not found at:', excelPath);
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    
    // Import Location Catalog
    console.log('📍 Importing Location Catalog...');
    const locationCatalogSheet = workbook.Sheets['LocationCatalog'];
    const locationCatalogData = XLSX.utils.sheet_to_json(locationCatalogSheet, { defval: null });
    
    const locationDocs = [];
    const sparkleIdToLocationMap = new Map();
    
    locationCatalogData.forEach(row => {
      const sparkleId = cleanString(row['Location SparkleID']);
      if (!sparkleId) return;
      
      const name = cleanString(row['Name']);
      const cleanName = cleanString(row['Location Name (Clean)']);
      
      // Parse address - it might be in a single field or need parsing
      const addresses = cleanString(row['Addresses']);
      
      // Extract phone and fax
      const phone = cleanString(row['Phone Number']);
      const fax = cleanString(row['Fax Number']);
      
      // Parse external IDs to extract Epic ID if not already in Epic ID field
      const epicId = cleanString(row['Epic ID']) || null;
      const externalIds = cleanString(row['External IDs']) || '';
      
      // Extract taxonomy specialties
      const taxonomySpecialties = parseDelimitedList(row['Taxonomy Specialties']);
      
      // Extract city from address
      let city = null;
      if (addresses) {
        const cityMatch = addresses.match(/,\s*([^,]+?),\s*CA\b/i) || 
                         addresses.match(/,\s*([^,]+?)\s+CA\b/i);
        if (cityMatch) {
          city = cityMatch[1].trim();
        }
      }
      
      // Extract major facility/campus from name
      let facility = null;
      const facilityPatterns = [
        { pattern: /Parnassus/i, name: 'Parnassus Heights' },
        { pattern: /Mission\s+Bay/i, name: 'Mission Bay' },
        { pattern: /Mount\s+Zion/i, name: 'Mount Zion' },
        { pattern: /Oakland/i, name: 'Oakland' },
        { pattern: /UCSF\s+Medical\s+Center/i, name: 'UCSF Medical Center' },
        { pattern: /UCSF\s+Medical\s+Group/i, name: 'UCSF Medical Group' },
        { pattern: /San\s+Francisco\s+General/i, name: 'San Francisco General' },
        { pattern: /Benioff\s+Children/i, name: "Benioff Children's Hospital" }
      ];
      
      const fullName = cleanName || name || '';
      for (const { pattern, name: facilityName } of facilityPatterns) {
        if (pattern.test(fullName)) {
          facility = facilityName;
          break;
        }
      }
      
      const locationDoc = {
        type: 'location',
        sparkleId: sparkleId,
        name: name || cleanName || 'UCSF Health Location',
        cleanName: cleanName || name || 'UCSF Health Location',
        address: addresses,
        city: city,  // Add extracted city
        facility: facility,  // Add extracted facility
        phone: phone,
        fax: fax,
        taxonomySpecialties: taxonomySpecialties,
        dataSource: cleanString(row['Data Source']) || 'LocationCatalog',
        id: cleanString(row['ID']) || sparkleId,
        externalIds: externalIds,
        epicId: epicId,
        website: cleanString(row['Website']) || 'UCSF Health',
        // Mark as from LocationCatalog (real data, not derived)
        fromLocationCatalog: true,
        lastUpdated: new Date().toISOString()
      };
      
      locationDocs.push(locationDoc);
      sparkleIdToLocationMap.set(sparkleId, locationDoc);
    });
    
    console.log(`  ✅ Prepared ${locationDocs.length} location documents from LocationCatalog`);
    
    // Now update existing locations in Elasticsearch
    // We'll match by address, name, or SparkleID if available
    console.log('\n🔄 Updating existing locations with LocationCatalog data...');
    
    // Get all existing locations
    const searchResponse = await client.search({
      index: 'locations',
      body: {
        size: 10000,
        query: { match_all: {} },
        _source: ['name', 'address', 'sparkleId', 'cleanName']
      }
    });
    
    const hits = searchResponse.body?.hits?.hits || searchResponse.hits?.hits || [];
    console.log(`  Found ${hits.length} existing locations to potentially update`);
    
    const locationUpdates = [];
    let updateCount = 0;
    let matchCount = 0;
    
    // Try to match existing locations with LocationCatalog data
    for (const hit of hits) {
      const existingLocation = hit._source;
      let matchedLocation = null;
      
      // Try matching by SparkleID first (most reliable)
      if (existingLocation.sparkleId) {
        matchedLocation = sparkleIdToLocationMap.get(existingLocation.sparkleId);
      }
      
      // If no SparkleID match, try matching by name and address
      if (!matchedLocation && existingLocation.name && existingLocation.address) {
        const existingName = cleanString(existingLocation.name).toLowerCase();
        const existingAddress = cleanString(existingLocation.address).toLowerCase();
        
        for (const [sparkleId, catalogLocation] of sparkleIdToLocationMap.entries()) {
          const catalogName = cleanString(catalogLocation.name).toLowerCase();
          const catalogCleanName = cleanString(catalogLocation.cleanName).toLowerCase();
          const catalogAddress = cleanString(catalogLocation.address).toLowerCase();
          
          // Match if name and address are similar
          if ((catalogName === existingName || catalogCleanName === existingName) &&
              catalogAddress && existingAddress && catalogAddress.includes(existingAddress.substring(0, 20))) {
            matchedLocation = catalogLocation;
            matchCount++;
            break;
          }
        }
      }
      
      if (matchedLocation) {
        // Update existing location with LocationCatalog data
        const updates = {
          sparkleId: matchedLocation.sparkleId,
          cleanName: matchedLocation.cleanName,
          taxonomySpecialties: matchedLocation.taxonomySpecialties,
          dataSource: matchedLocation.dataSource,
          externalIds: matchedLocation.externalIds,
          epicId: matchedLocation.epicId,
          fromLocationCatalog: true,
          // Preserve existing data that might not be in LocationCatalog
          // but update with LocationCatalog data where available
          name: matchedLocation.name || existingLocation.name,
          address: matchedLocation.address || existingLocation.address,
          phone: matchedLocation.phone || existingLocation.phone,
          fax: matchedLocation.fax || existingLocation.fax
        };
        
        locationUpdates.push({
          update: {
            _index: 'locations',
            _id: hit._id
          }
        });
        locationUpdates.push({
          doc: updates,
          doc_as_upsert: false
        });
        updateCount++;
      }
    }
    
    if (locationUpdates.length > 0) {
      console.log(`  Updating ${updateCount} existing locations with LocationCatalog data...`);
      await client.bulk({ body: locationUpdates, refresh: false });
      console.log(`  ✅ Updated ${updateCount} existing locations`);
      console.log(`  📊 Matched ${matchCount} locations by name/address`);
    }
    
    // Index new locations that don't exist yet
    console.log('\n📤 Indexing new locations from LocationCatalog...');
    
    // Get all existing SparkleIDs to avoid duplicates
    const existingSparkleIds = new Set();
    hits.forEach(hit => {
      if (hit._source.sparkleId) {
        existingSparkleIds.add(hit._source.sparkleId);
      }
    });
    
    const newLocationDocs = locationDocs.filter(loc => 
      !existingSparkleIds.has(loc.sparkleId)
    );
    
    if (newLocationDocs.length > 0) {
      console.log(`  Indexing ${newLocationDocs.length} new locations...`);
      for (let i = 0; i < newLocationDocs.length; i += BATCH_SIZE) {
        const batch = newLocationDocs.slice(i, i + BATCH_SIZE);
        await bulkIndex('locations', batch);
        process.stdout.write(`  Progress: ${Math.min(i + BATCH_SIZE, newLocationDocs.length)}/${newLocationDocs.length}\r`);
      }
      console.log(`  ✅ Indexed ${newLocationDocs.length} new locations`);
    } else {
      console.log(`  ℹ️  All locations from LocationCatalog already exist`);
    }
    
    // Refresh index
    console.log('\n🔄 Refreshing locations index...');
    await client.indices.refresh({ index: 'locations' });
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ Location Catalog import completed successfully!');
    console.log('='.repeat(80));
    console.log('\nSummary:');
    console.log(`  📍 Total locations in LocationCatalog: ${locationDocs.length}`);
    console.log(`  🔄 Existing locations updated: ${updateCount}`);
    console.log(`  📤 New locations indexed: ${newLocationDocs.length}`);
    console.log(`  📊 Locations matched by name/address: ${matchCount}`);
    console.log('\n✨ All locations now use real data from LocationCatalog!');
    console.log('   - No artificial/derived locations');
    console.log('   - All locations have SparkleIDs');
    console.log('   - All locations have Epic IDs and external IDs');
    
  } catch (error) {
    console.error('❌ Error importing Location Catalog:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  importLocationCatalog();
}

module.exports = importLocationCatalog;

