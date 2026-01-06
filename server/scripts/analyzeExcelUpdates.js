const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const excelPath = path.join(__dirname, '../../Greg Specifics.xlsx');

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

async function analyzeUpdates() {
  try {
    console.log('📊 Analyzing updated Excel data...\n');

    if (!fs.existsSync(excelPath)) {
      console.error('❌ Excel file not found at:', excelPath);
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    
    // Analyze Services sheet
    console.log('📋 Analyzing Services sheet...');
    const servicesSheet = workbook.Sheets['Services'];
    const servicesData = XLSX.utils.sheet_to_json(servicesSheet, { defval: null });
    
    console.log(`  Total rows: ${servicesData.length}`);
    
    // Count non-empty fields
    const fieldStats = {};
    servicesData.forEach(row => {
      Object.keys(row).forEach(key => {
        if (!fieldStats[key]) {
          fieldStats[key] = { total: 0, populated: 0 };
        }
        fieldStats[key].total++;
        if (row[key] && cleanString(row[key])) {
          fieldStats[key].populated++;
        }
      });
    });
    
    console.log('\n  Field Population Statistics:');
    Object.entries(fieldStats).forEach(([key, stats]) => {
      const percentage = ((stats.populated / stats.total) * 100).toFixed(1);
      console.log(`    ${key}: ${stats.populated}/${stats.total} (${percentage}%)`);
    });
    
    // Count unique services
    const uniqueServices = new Set();
    const servicesWithSpecialties = new Set();
    const servicesWithProviders = new Set();
    const servicesWithLocations = new Set();
    
    servicesData.forEach(row => {
      const serviceName = cleanString(row['Medical Services Name (Sitecore)']);
      const url = cleanString(row['URL']);
      
      if (serviceName && serviceName !== '*') {
        uniqueServices.add(url || serviceName);
        
        // Check if has specialties
        const hasSpecialty = [
          row['Primary Specialty 1 (Sitecore)'],
          row['Primary Specialty 2 (Sitecore)'],
          row['Related Specialty 1 (Sitecore)'],
          row['Related Specialty 2 (Sitecore)'],
          row['Related Specialty 3 (Sitecore)'],
          row['Related Specialty 4 (Sitecore)'],
          row['Related Specialty 5 (Sitecore)'],
          row['Related Specialty 6 (Sitecore)']
        ].some(s => s && cleanString(s));
        
        if (hasSpecialty) {
          servicesWithSpecialties.add(url || serviceName);
        }
        
        // Check if has providers
        const providers = parseDelimitedList(row['Providers']);
        if (providers.length > 0) {
          servicesWithProviders.add(url || serviceName);
        }
        
        // Check if has locations
        const locations = parseDelimitedList(row['Locations']);
        if (locations.length > 0) {
          servicesWithLocations.add(url || serviceName);
        }
      }
    });
    
    console.log(`\n  Unique services: ${uniqueServices.size}`);
    console.log(`  Services with specialties: ${servicesWithSpecialties.size}`);
    console.log(`  Services with providers: ${servicesWithProviders.size}`);
    console.log(`  Services with locations: ${servicesWithLocations.size}`);
    
    // Analyze ServiceProviders sheet
    console.log('\n\n👨‍⚕️  Analyzing ServiceProviders sheet...');
    const serviceProvidersSheet = workbook.Sheets['ServiceProviders'];
    const serviceProvidersData = XLSX.utils.sheet_to_json(serviceProvidersSheet, { defval: null });
    
    console.log(`  Total rows: ${serviceProvidersData.length}`);
    
    // Count providers per service
    const serviceProviderCounts = new Map();
    const npiCounts = new Map();
    const servicesWithDEPs = new Set();
    
    serviceProvidersData.forEach(row => {
      const url = cleanString(row['URL']);
      const npi = cleanString(row['Provider NPI']);
      const deps = [
        cleanString(row['Scheduling DEP 1']),
        cleanString(row['Scheduling DEP 2']),
        cleanString(row['Scheduling DEP 3']),
        cleanString(row['Scheduling DEP 4']),
        cleanString(row['Scheduling DEP 5']),
        cleanString(row['Scheduling DEP 6'])
      ].filter(Boolean);
      
      if (url) {
        serviceProviderCounts.set(url, (serviceProviderCounts.get(url) || 0) + 1);
      }
      
      if (npi) {
        npiCounts.set(npi, (npiCounts.get(npi) || 0) + 1);
      }
      
      if (deps.length > 0) {
        servicesWithDEPs.add(url);
      }
    });
    
    console.log(`  Unique service URLs: ${serviceProviderCounts.size}`);
    console.log(`  Unique provider NPIs: ${npiCounts.size}`);
    console.log(`  Services with DEPs: ${servicesWithDEPs.size}`);
    console.log(`  Average providers per service: ${(serviceProvidersData.length / serviceProviderCounts.size).toFixed(1)}`);
    
    // Check what's currently in Elasticsearch
    console.log('\n\n🔍 Checking current Elasticsearch data...');
    
    try {
      const servicesResponse = await client.search({
        index: 'content',
        body: {
          size: 0,
          query: { term: { type: 'service' } }
        }
      });
      
      const currentServiceCount = servicesResponse.body?.hits?.total?.value || 
                                   servicesResponse.hits?.total?.value || 0;
      console.log(`  Current services in Elasticsearch: ${currentServiceCount}`);
      console.log(`  New services to add: ${Math.max(0, uniqueServices.size - currentServiceCount)}`);
      
      // Check doctors with services
      const doctorsWithServicesResponse = await client.search({
        index: 'doctors',
        body: {
          size: 0,
          query: {
            bool: {
              must: [
                { exists: { field: 'services' } }
              ]
            }
          }
        }
      });
      
      const doctorsWithServices = doctorsWithServicesResponse.body?.hits?.total?.value || 
                                   doctorsWithServicesResponse.hits?.total?.value || 0;
      console.log(`  Doctors with services linked: ${doctorsWithServices}`);
      
    } catch (error) {
      console.log(`  ⚠️  Could not check Elasticsearch: ${error.message}`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Summary of Updates:');
    console.log('='.repeat(80));
    console.log(`\nServices Sheet:`);
    console.log(`  - Total rows: ${servicesData.length}`);
    console.log(`  - Unique services: ${uniqueServices.size}`);
    console.log(`  - Services with specialties: ${servicesWithSpecialties.size}`);
    console.log(`  - Services with providers: ${servicesWithProviders.size}`);
    console.log(`  - Services with locations: ${servicesWithLocations.size}`);
    
    console.log(`\nServiceProviders Sheet:`);
    console.log(`  - Total rows: ${serviceProvidersData.length}`);
    console.log(`  - Unique service URLs: ${serviceProviderCounts.size}`);
    console.log(`  - Unique provider NPIs: ${npiCounts.size}`);
    console.log(`  - Services with DEPs: ${servicesWithDEPs.size}`);
    
    console.log('\n✅ Analysis complete!');
    console.log('\n💡 Next step: Run the import script to update Elasticsearch with this data.');
    
  } catch (error) {
    console.error('❌ Error analyzing Excel data:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  analyzeUpdates();
}

module.exports = analyzeUpdates;

