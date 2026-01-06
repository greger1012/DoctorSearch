const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '../../Greg Specifics.xlsx');

function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

async function checkMatchedSpecialties() {
  try {
    console.log('🔍 Analyzing Matched Specialty Column from ServiceProviders...\n');

    if (!fs.existsSync(excelPath)) {
      console.error('❌ Excel file not found at:', excelPath);
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    const serviceProvidersSheet = workbook.Sheets['ServiceProviders'];
    const serviceProvidersData = XLSX.utils.sheet_to_json(serviceProvidersSheet, { defval: null });
    
    console.log(`Total rows in ServiceProviders: ${serviceProvidersData.length}\n`);
    
    // Collect all unique matched specialties
    const matchedSpecialties = new Set();
    const specialtyCounts = new Map();
    
    serviceProvidersData.forEach(row => {
      const specialty = cleanString(row['Matched Specialty (Sitecore)']);
      const specialtyColumn = cleanString(row['Matched Specialty Column']);
      
      if (specialty) {
        matchedSpecialties.add(specialty);
        specialtyCounts.set(specialty, (specialtyCounts.get(specialty) || 0) + 1);
      }
    });
    
    console.log(`Unique Matched Specialties: ${matchedSpecialties.size}\n`);
    
    // Check for "movement disorders" or similar
    const movementDisorderVariants = Array.from(matchedSpecialties).filter(s => 
      s.toLowerCase().includes('movement') || 
      s.toLowerCase().includes('disorder')
    );
    
    console.log('Specialties containing "movement" or "disorder":');
    movementDisorderVariants.forEach(s => {
      console.log(`  - ${s} (${specialtyCounts.get(s)} occurrences)`);
    });
    
    // Show all specialties sorted by frequency
    console.log('\n\nAll Matched Specialties (sorted by frequency):');
    const sortedSpecialties = Array.from(specialtyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50); // Top 50
    
    sortedSpecialties.forEach(([specialty, count]) => {
      console.log(`  ${specialty}: ${count} occurrences`);
    });
    
    // Check what's in Elasticsearch
    console.log('\n\n🔍 Checking Elasticsearch for services with these specialties...');
    const { Client } = require('@elastic/elasticsearch');
    const client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    });
    
    // Search for movement disorders
    const searchResponse = await client.search({
      index: 'content',
      body: {
        query: {
          bool: {
            should: [
              { match: { name: 'movement disorders' } },
              { match: { specialties: 'movement disorders' } },
              { match: { primarySpecialties: 'movement disorders' } },
              { match: { relatedSpecialties: 'movement disorders' } }
            ]
          }
        },
        size: 10
      }
    });
    
    const hits = searchResponse.body?.hits?.hits || searchResponse.hits?.hits || [];
    console.log(`\nSearch results for "movement disorders": ${hits.length} found`);
    hits.forEach((hit, idx) => {
      console.log(`  ${idx + 1}. ${hit._source.name}`);
      console.log(`     Specialties: ${hit._source.specialties?.join(', ') || 'none'}`);
    });
    
    // Check doctors with movement disorders in their services
    const doctorSearchResponse = await client.search({
      index: 'doctors',
      body: {
        query: {
          bool: {
            should: [
              { match: { 'services.name': 'movement disorders' } },
              { match: { 'services.specialties': 'movement disorders' } },
              { match: { 'serviceDetails.specialty': 'movement disorders' } }
            ]
          }
        },
        size: 10
      }
    });
    
    const doctorHits = doctorSearchResponse.body?.hits?.hits || doctorSearchResponse.hits?.hits || [];
    console.log(`\nDoctors with "movement disorders" in services: ${doctorHits.length} found`);
    doctorHits.forEach((hit, idx) => {
      console.log(`  ${idx + 1}. ${hit._source.name}`);
      if (hit._source.services) {
        const movementServices = hit._source.services.filter(s => 
          s.name?.toLowerCase().includes('movement') ||
          s.specialties?.some(sp => sp.toLowerCase().includes('movement'))
        );
        console.log(`     Services: ${movementServices.map(s => s.name).join(', ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  checkMatchedSpecialties();
}

module.exports = checkMatchedSpecialties;

