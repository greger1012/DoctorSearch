const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '../../Greg Specifics.xlsx');

function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

async function debugMatchedSpecialties() {
  try {
    console.log('🔍 Debugging matched specialties...\n');

    const workbook = XLSX.readFile(excelPath);
    
    // Get services
    const servicesSheet = workbook.Sheets['Services'];
    const servicesData = XLSX.utils.sheet_to_json(servicesSheet, { defval: null });
    
    // Get service providers
    const serviceProvidersSheet = workbook.Sheets['ServiceProviders'];
    const serviceProvidersData = XLSX.utils.sheet_to_json(serviceProvidersSheet, { defval: null });
    
    // Find Movement Disorders service
    const movementDisordersService = servicesData.find(row => {
      const name = cleanString(row['Medical Services Name (Sitecore)']);
      return name && name.toLowerCase().includes('movement');
    });
    
    if (movementDisordersService) {
      const serviceUrl = cleanString(movementDisordersService['URL']);
      console.log(`Found Movement Disorders service:`);
      console.log(`  Name: ${cleanString(movementDisordersService['Medical Services Name (Sitecore)'])}`);
      console.log(`  URL: ${serviceUrl}`);
      console.log(`  Current specialties: ${[
        cleanString(movementDisordersService['Primary Specialty 1 (Sitecore)']),
        cleanString(movementDisordersService['Related Specialty 1 (Sitecore)'])
      ].filter(Boolean).join(', ')}`);
      
      // Find matched specialties for this service
      const matchedSpecialties = new Set();
      serviceProvidersData.forEach(row => {
        const url = cleanString(row['URL']);
        const specialty = cleanString(row['Matched Specialty (Sitecore)']);
        if (url === serviceUrl && specialty) {
          matchedSpecialties.add(specialty);
        }
      });
      
      console.log(`\n  Matched specialties from ServiceProviders: ${Array.from(matchedSpecialties).join(', ')}`);
      console.log(`  Count: ${matchedSpecialties.size}`);
    } else {
      console.log('❌ Movement Disorders service not found in Services sheet');
    }
    
    // Check all services and their matched specialties
    console.log('\n\nChecking all services...');
    const serviceUrlMap = new Map();
    servicesData.forEach(row => {
      const url = cleanString(row['URL']);
      const name = cleanString(row['Medical Services Name (Sitecore)']);
      if (url && name && name !== '*') {
        serviceUrlMap.set(url, name);
      }
    });
    
    console.log(`Total services with URLs: ${serviceUrlMap.size}`);
    
    // Count matched specialties per service
    const serviceMatchedSpecialties = new Map();
    serviceProvidersData.forEach(row => {
      const url = cleanString(row['URL']);
      const specialty = cleanString(row['Matched Specialty (Sitecore)']);
      if (url && specialty) {
        if (!serviceMatchedSpecialties.has(url)) {
          serviceMatchedSpecialties.set(url, new Set());
        }
        serviceMatchedSpecialties.get(url).add(specialty);
      }
    });
    
    console.log(`Services with matched specialties: ${serviceMatchedSpecialties.size}`);
    
    // Check overlap
    let servicesWithBoth = 0;
    let totalNewSpecialties = 0;
    serviceUrlMap.forEach((name, url) => {
      if (serviceMatchedSpecialties.has(url)) {
        servicesWithBoth++;
        const matched = serviceMatchedSpecialties.get(url);
        totalNewSpecialties += matched.size;
      }
    });
    
    console.log(`Services that have both URL and matched specialties: ${servicesWithBoth}`);
    console.log(`Total matched specialties to add: ${totalNewSpecialties}`);
    
    // Show a few examples
    console.log('\n\nExamples of services with matched specialties:');
    let count = 0;
    serviceUrlMap.forEach((name, url) => {
      if (serviceMatchedSpecialties.has(url) && count < 5) {
        const matched = Array.from(serviceMatchedSpecialties.get(url));
        console.log(`  ${name}: ${matched.join(', ')}`);
        count++;
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  debugMatchedSpecialties();
}

module.exports = debugMatchedSpecialties;

