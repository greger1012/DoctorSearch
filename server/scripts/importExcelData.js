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

async function importExcelData() {
  try {
    console.log('🔄 Starting Excel data import from Greg Specifics.xlsx...\n');

    if (!fs.existsSync(excelPath)) {
      console.error('❌ Excel file not found at:', excelPath);
      process.exit(1);
    }

    const workbook = XLSX.readFile(excelPath);
    
    // 1. Import Medical Services
    console.log('📋 Importing Medical Services...');
    const servicesSheet = workbook.Sheets['Services'];
    const servicesData = XLSX.utils.sheet_to_json(servicesSheet, { defval: null });
    
    const serviceDocs = [];
    const serviceMap = new Map(); // URL -> Service data
    
    servicesData.forEach(row => {
      const serviceName = cleanString(row['Medical Services Name (Sitecore)']);
      if (!serviceName || serviceName === '*') return;
      
      const url = cleanString(row['URL']);
      if (!url) return; // Skip if no URL
      
      const specialties = [
        cleanString(row['Primary Specialty 1 (Sitecore)']),
        cleanString(row['Primary Specialty 2 (Sitecore)']),
        cleanString(row['Related Specialty 1 (Sitecore)']),
        cleanString(row['Related Specialty 2 (Sitecore)']),
        cleanString(row['Related Specialty 3 (Sitecore)']),
        cleanString(row['Related Specialty 4 (Sitecore)']),
        cleanString(row['Related Specialty 5 (Sitecore)']),
        cleanString(row['Related Specialty 6 (Sitecore)'])
      ].filter(Boolean);
      
      if (!serviceMap.has(url)) {
        // Build specialty hierarchy:
        // - primarySpecialties: Main specialties (Primary Specialty 1 & 2) - highest priority
        // - relatedSpecialties: Subspecialties/related specialties (Related Specialty 1-6) - secondary priority
        // - specialties: Combined list of all specialties for general search
        const primarySpecialties = [
          cleanString(row['Primary Specialty 1 (Sitecore)']),
          cleanString(row['Primary Specialty 2 (Sitecore)'])
        ].filter(Boolean);
        
        const relatedSpecialties = [
          cleanString(row['Related Specialty 1 (Sitecore)']),
          cleanString(row['Related Specialty 2 (Sitecore)']),
          cleanString(row['Related Specialty 3 (Sitecore)']),
          cleanString(row['Related Specialty 4 (Sitecore)']),
          cleanString(row['Related Specialty 5 (Sitecore)']),
          cleanString(row['Related Specialty 6 (Sitecore)'])
        ].filter(Boolean);
        
        const serviceDoc = {
          type: 'service',
          name: serviceName,
          url: url,
          fullPath: cleanString(row['Full Path']),
          // Combined specialties for general search (includes both primary and related)
          specialties: [...new Set([...primarySpecialties, ...relatedSpecialties])],
          // Primary specialties - main connections (higher search priority)
          primarySpecialties: primarySpecialties,
          // Related specialties - subspecialty connections (secondary search priority)
          relatedSpecialties: relatedSpecialties,
          locations: parseDelimitedList(row['Locations']),
          providers: parseDelimitedList(row['Providers']),
          providerNames: parseDelimitedList(row['Provider FullName']),
          providerIds: parseDelimitedList(row['Provider KyruusID']),
          lastUpdated: new Date().toISOString()
        };
        
        serviceDocs.push(serviceDoc);
        serviceMap.set(url, serviceDoc);
      } else {
        // If service already exists, merge specialties to avoid duplicates
        const existingService = serviceMap.get(url);
        const existingSpecialties = new Set(existingService.specialties || []);
        specialties.forEach(spec => existingSpecialties.add(spec));
        existingService.specialties = Array.from(existingSpecialties);
      }
    });
    
    console.log(`  ✅ Prepared ${serviceDocs.length} service documents`);
    
    // Note: Services will be enriched with provider NPIs after we process ServiceProviders sheet
    
    // 2. Import Provider-DEP mappings
    console.log('\n👨‍⚕️  Importing Provider-DEP mappings...');
    const providerDEPsSheet = workbook.Sheets['ProviderDEPs'];
    const providerDEPsData = XLSX.utils.sheet_to_json(providerDEPsSheet, { defval: null });
    
    const providerDEPMap = new Map(); // NPI -> [DEPs]
    const providerIdToNpiMap = new Map(); // Provider ID -> NPI (for linking ServiceProviderDEPServices)
    
    providerDEPsData.forEach(row => {
      const npi = cleanString(row['Provider NPI']);
      const providerId = cleanString(row['Provider ID']);
      const dep = cleanString(row['DEP']);
      if (!npi || !dep) return;
      
      if (!providerDEPMap.has(npi)) {
        providerDEPMap.set(npi, []);
      }
      providerDEPMap.get(npi).push(dep);
      
      // Build Provider ID -> NPI map for ServiceProviderDEPServices linking
      if (providerId) {
        providerIdToNpiMap.set(providerId, npi);
      }
    });
    
    console.log(`  ✅ Mapped ${providerDEPMap.size} providers to DEPs`);
    console.log(`  ✅ Built ${providerIdToNpiMap.size} Provider ID to NPI mappings`);
    
    // 3. Import Location Catalog (for reference, but use dedicated import script for actual import)
    console.log('\n📍 Reading Location Catalog (for reference)...');
    const locationCatalogSheet = workbook.Sheets['LocationCatalog'];
    const locationCatalogData = XLSX.utils.sheet_to_json(locationCatalogSheet, { defval: null });
    
    const locationMap = new Map(); // SparkleID -> Location data (for reference in this script)
    
    locationCatalogData.forEach(row => {
      const sparkleId = cleanString(row['Location SparkleID']);
      if (!sparkleId) return;
      
      locationMap.set(sparkleId, {
        sparkleId: sparkleId,
        name: cleanString(row['Name']),
        cleanName: cleanString(row['Location Name (Clean)']),
        address: cleanString(row['Addresses']),
        phone: cleanString(row['Phone Number']),
        fax: cleanString(row['Fax Number']),
        taxonomySpecialties: parseDelimitedList(row['Taxonomy Specialties']),
        dataSource: cleanString(row['Data Source']),
        id: cleanString(row['ID']),
        externalIds: cleanString(row['External IDs']),
        epicId: cleanString(row['Epic ID']),
        website: cleanString(row['Website'])
      });
    });
    
    console.log(`  ✅ Loaded ${locationMap.size} locations from LocationCatalog (for reference)`);
    console.log(`  ℹ️  Note: Use 'node server/scripts/importLocationCatalog.js' to import locations as primary source`);
    
    // 4. Import Service-Provider relationships (NPI-based)
    console.log('\n🔗 Importing Service-Provider relationships (NPI-based)...');
    const serviceProvidersSheet = workbook.Sheets['ServiceProviders'];
    const serviceProvidersData = XLSX.utils.sheet_to_json(serviceProvidersSheet, { defval: null });
    
    // Service URL -> [Providers with NPI]
    const serviceProviderMap = new Map();
    // Service URL -> [Matched Specialties] - collect all matched specialties per service
    const serviceMatchedSpecialtiesMap = new Map();
    // NPI -> [Services] - for enriching doctor documents
    const npiToServicesMap = new Map();
    // NPI -> [Service details] - comprehensive service info per NPI
    const npiToServiceDetailsMap = new Map();
    
    serviceProvidersData.forEach(row => {
      const url = cleanString(row['URL']);
      const npi = cleanString(row['Provider NPI']);
      const providerName = cleanString(row['Provider Name']);
      const providerId = cleanString(row['Provider ID']);
      const specialty = cleanString(row['Matched Specialty (Sitecore)']);
      const matchedSpecialtyColumn = cleanString(row['Matched Specialty Column']);
      const deps = [
        cleanString(row['Scheduling DEP 1']),
        cleanString(row['Scheduling DEP 2']),
        cleanString(row['Scheduling DEP 3']),
        cleanString(row['Scheduling DEP 4']),
        cleanString(row['Scheduling DEP 5']),
        cleanString(row['Scheduling DEP 6'])
      ].filter(Boolean);
      
      if (!url || !npi) return;
      
      // Collect matched specialties for each service
      if (specialty) {
        if (!serviceMatchedSpecialtiesMap.has(url)) {
          serviceMatchedSpecialtiesMap.set(url, new Set());
        }
        serviceMatchedSpecialtiesMap.get(url).add(specialty);
      }
      
      // Build service -> providers map
      if (!serviceProviderMap.has(url)) {
        serviceProviderMap.set(url, []);
      }
      serviceProviderMap.get(url).push({
        npi,
        providerId,
        providerName,
        specialty,
        matchedSpecialtyColumn,
        deps,
        providersMode: cleanString(row['Providers Mode'])
      });
      
      // Build NPI -> services map (for doctor enrichment)
      if (!npiToServicesMap.has(npi)) {
        npiToServicesMap.set(npi, []);
      }
      npiToServicesMap.get(npi).push(url);
      
      // Build NPI -> service details map
      if (!npiToServiceDetailsMap.has(npi)) {
        npiToServiceDetailsMap.set(npi, []);
      }
      npiToServiceDetailsMap.get(npi).push({
        serviceUrl: url,
        specialty: specialty,
        matchedSpecialtyColumn: matchedSpecialtyColumn,
        deps: deps,
        providersMode: cleanString(row['Providers Mode'])
      });
    });
    
    console.log(`  ✅ Mapped ${serviceProviderMap.size} services to providers`);
    console.log(`  ✅ Mapped ${npiToServicesMap.size} NPIs to their services`);
    
    // Enrich services with provider NPIs and matched specialties from ServiceProviders sheet
    // Note: DEPs will be added after we process ServiceProviderDEPServices
    console.log('\n🔗 Enriching services with provider NPIs and matched specialties...');
    let enrichedServicesCount = 0;
    let specialtiesAddedCount = 0;
    serviceDocs.forEach(service => {
      const serviceProviders = serviceProviderMap.get(service.url) || [];
      if (serviceProviders.length > 0) {
        // Update provider lists with NPIs from ServiceProviders sheet (more accurate)
        service.providers = [...new Set(serviceProviders.map(p => p.npi).filter(Boolean))];
        service.providerNames = [...new Set(serviceProviders.map(p => p.providerName).filter(Boolean))];
        service.providerIds = [...new Set(serviceProviders.map(p => p.providerId).filter(Boolean))];
        service.providerCount = serviceProviders.length;
        enrichedServicesCount++;
      }
      
      // Add matched specialties from ServiceProviders sheet to service specialties
      // This ensures ALL matched specialties from ServiceProviders are included
      const matchedSpecialties = serviceMatchedSpecialtiesMap.get(service.url);
      if (matchedSpecialties && matchedSpecialties.size > 0) {
        const existingSpecialties = new Set(service.specialties || []);
        const matchedSpecialtiesArray = Array.from(matchedSpecialties);
        
        // Add all matched specialties to the main specialties array (deduplicated)
        matchedSpecialtiesArray.forEach(spec => existingSpecialties.add(spec));
        service.specialties = Array.from(existingSpecialties);
        
        // Also add to relatedSpecialties if not already there
        const existingRelated = new Set(service.relatedSpecialties || []);
        matchedSpecialtiesArray.forEach(spec => existingRelated.add(spec));
        service.relatedSpecialties = Array.from(existingRelated);
        
        // Track how many were actually new
        const newSpecialties = matchedSpecialtiesArray.filter(s => {
          const normalized = s.toLowerCase().trim();
          return !Array.from(existingSpecialties).some(existing => 
            existing.toLowerCase().trim() === normalized
          );
        });
        specialtiesAddedCount += newSpecialties.length;
      }
    });
    console.log(`  ✅ Enriched ${enrichedServicesCount} services with provider NPIs`);
    console.log(`  ✅ Added ${specialtiesAddedCount} matched specialties from ServiceProviders`);
    
    // 4b. Import ServiceProviderDEPServices (Provider ID -> DEP -> Service relationships)
    console.log('\n🔗 Importing ServiceProviderDEPServices relationships...');
    const serviceProviderDEPServicesSheet = workbook.Sheets['ServiceProviderDEPServices'];
    const serviceProviderDEPServicesData = XLSX.utils.sheet_to_json(serviceProviderDEPServicesSheet, { defval: null });
    
    // NPI -> [Service-DEP combinations] - for more granular service-DEP linking
    const npiToServiceDEPMap = new Map();
    // Service URL -> [DEPs] - which DEPs are associated with each service
    const serviceToDEPsMap = new Map();
    
    serviceProviderDEPServicesData.forEach(row => {
      const providerId = cleanString(row['Provider ID']);
      const dep = cleanString(row['DEP']);
      const serviceUrl = cleanString(row['Service URL']);
      const specialty = cleanString(row['Matched Specialty (Sitecore)']);
      const providersMode = cleanString(row['Providers Mode']);
      
      if (!providerId || !dep || !serviceUrl) return;
      
      // Get NPI from Provider ID
      const npi = providerIdToNpiMap.get(providerId);
      if (!npi) return; // Skip if we can't find NPI for this Provider ID
      
      // Build NPI -> Service-DEP map
      if (!npiToServiceDEPMap.has(npi)) {
        npiToServiceDEPMap.set(npi, []);
      }
      npiToServiceDEPMap.get(npi).push({
        serviceUrl,
        dep,
        specialty,
        providersMode,
        matchedSpecialtyColumn: null // Not available in ServiceProviderDEPServices sheet
      });
      
      // Build Service -> DEPs map
      if (!serviceToDEPsMap.has(serviceUrl)) {
        serviceToDEPsMap.set(serviceUrl, new Set());
      }
      serviceToDEPsMap.get(serviceUrl).add(dep);
    });
    
    console.log(`  ✅ Mapped ${npiToServiceDEPMap.size} NPIs to service-DEP combinations`);
    console.log(`  ✅ Mapped ${serviceToDEPsMap.size} services to their DEPs`);
    
    // Enrich services with DEPs from ServiceProviderDEPServices
    console.log('\n🔗 Enriching services with DEP information...');
    let servicesWithDEPsCount = 0;
    serviceDocs.forEach(service => {
      if (serviceToDEPsMap.has(service.url)) {
        service.deps = Array.from(serviceToDEPsMap.get(service.url));
        service.depCount = service.deps.length;
        servicesWithDEPsCount++;
      }
    });
    console.log(`  ✅ Enriched ${servicesWithDEPsCount} services with DEP information`);
    
    // 5. Import DEP Links (Provider-Location-DEP relationships)
    console.log('\n🔗 Importing DEP Links...');
    const depLinksSheet = workbook.Sheets['DEPLinks'];
    const depLinksData = XLSX.utils.sheet_to_json(depLinksSheet, { defval: null });
    
    const depLinkMap = new Map(); // NPI -> [DEP Links]
    
    depLinksData.forEach(row => {
      const npi = cleanString(row['Provider NPI']);
      const dep = cleanString(row['DEP']);
      const sparkleId = cleanString(row['Location SparkleID']);
      const locationName = cleanString(row['Location Name (Clean)']);
      
      if (!npi || !dep) return;
      
      if (!depLinkMap.has(npi)) {
        depLinkMap.set(npi, []);
      }
      
      depLinkMap.get(npi).push({
        dep,
        sparkleId,
        locationName,
        address: cleanString(row['Addresses']),
        phone: cleanString(row['Phone Number']),
        fax: cleanString(row['Fax Number']),
        url: cleanString(row['URL'])
      });
    });
    
    console.log(`  ✅ Mapped ${depLinkMap.size} providers to DEP links`);
    
    // 6. Update existing doctor documents with DEP and service information
    console.log('\n🔄 Updating existing doctor documents with new data...');
    
    // Get all existing doctors
    const searchResponse = await client.search({
      index: 'doctors',
      body: {
        size: 10000,
        query: { match_all: {} },
        _source: ['npi', 'name']
      }
    });
    
    const hits = searchResponse.body?.hits?.hits || searchResponse.hits?.hits || [];
    console.log(`  Found ${hits.length} existing doctors to update`);
    
    const doctorUpdates = [];
    let updateCount = 0;
    
    for (const hit of hits) {
      const npi = hit._source.npi;
      if (!npi) continue;
      
      const updates = {};
      let hasUpdates = false;
      
      // Add DEP IDs (from ProviderDEPs sheet)
      if (providerDEPMap.has(npi)) {
        updates.schedulingDEPs = [...new Set(providerDEPMap.get(npi))];
        hasUpdates = true;
      }
      
      // Add DEP Links (location-specific DEPs from DEPLinks sheet)
      if (depLinkMap.has(npi)) {
        updates.depLinks = depLinkMap.get(npi);
        hasUpdates = true;
      }
      
      // Add services this doctor provides (NPI-based matching)
      if (npiToServicesMap.has(npi)) {
        const serviceUrls = npiToServicesMap.get(npi);
        const serviceDetails = npiToServiceDetailsMap.get(npi) || [];
        
        // Collect all matched specialties from ServiceProviders for this doctor
        const matchedSpecialtiesSet = new Set();
        serviceDetails.forEach(detail => {
          if (detail.specialty) {
            matchedSpecialtiesSet.add(detail.specialty);
          }
        });
        
        // Also get specialties from serviceDEPRelationships
        if (npiToServiceDEPMap.has(npi)) {
          npiToServiceDEPMap.get(npi).forEach(rel => {
            if (rel.specialty) {
              matchedSpecialtiesSet.add(rel.specialty);
            }
          });
        }
        
        // Get service names from serviceMap
        const services = serviceUrls
          .map(url => {
            const service = serviceMap.get(url);
            // Get DEPs for this service from ServiceProviderDEPServices
            const serviceDEPs = serviceToDEPsMap.has(url) 
              ? Array.from(serviceToDEPsMap.get(url))
              : [];
            
            // Also collect specialties from services
            if (service && service.specialties) {
              service.specialties.forEach(spec => matchedSpecialtiesSet.add(spec));
            }
            
            return service ? {
              name: service.name,
              url: service.url,
              specialties: service.specialties,
              deps: serviceDEPs
            } : null;
          })
          .filter(Boolean);
        
        updates.services = services;
        updates.serviceUrls = serviceUrls;
        updates.serviceDetails = serviceDetails;
        
        // Add granular service-DEP relationships from ServiceProviderDEPServices
        if (npiToServiceDEPMap.has(npi)) {
          updates.serviceDEPRelationships = npiToServiceDEPMap.get(npi);
        }
        
        // Add all matched specialties to doctor's main specialties field for searchability
        if (matchedSpecialtiesSet.size > 0) {
          // Get existing specialties from the doctor document
          const existingSpecialties = new Set(hit._source.specialties || []);
          // Add all matched specialties
          matchedSpecialtiesSet.forEach(spec => existingSpecialties.add(spec));
          // Merge with existing specialties - this makes them directly searchable
          updates.specialties = Array.from(existingSpecialties);
          hasUpdates = true;
        }
        
        hasUpdates = true;
      }
      
      if (hasUpdates) {
        doctorUpdates.push({
          update: {
            _index: 'doctors',
            _id: hit._id
          }
        });
        doctorUpdates.push({
          doc: updates,
          doc_as_upsert: false
        });
        updateCount++;
      }
    }
    
    if (doctorUpdates.length > 0) {
      console.log(`  Updating ${updateCount} doctors with DEP information...`);
      await client.bulk({ body: doctorUpdates, refresh: false });
      console.log(`  ✅ Updated ${updateCount} doctors`);
    }
    
    // 7. Delete old service documents and index new ones
    console.log('\n📤 Indexing new documents to Elasticsearch...');
    
    // Delete old service documents first to avoid duplicates
    if (serviceDocs.length > 0) {
      console.log('  Deleting old service documents...');
      try {
        await client.deleteByQuery({
          index: 'content',
          body: {
            query: {
              term: { type: 'service' }
            }
          },
          refresh: true
        });
        console.log('  ✅ Deleted old service documents');
      } catch (error) {
        console.log(`  ⚠️  Could not delete old services (may not exist): ${error.message}`);
      }
      
      console.log(`  Indexing ${serviceDocs.length} services...`);
      for (let i = 0; i < serviceDocs.length; i += BATCH_SIZE) {
        const batch = serviceDocs.slice(i, i + BATCH_SIZE);
        await bulkIndex('content', batch);
        process.stdout.write(`  Progress: ${Math.min(i + BATCH_SIZE, serviceDocs.length)}/${serviceDocs.length}\r`);
      }
      console.log(`  ✅ Indexed ${serviceDocs.length} services`);
    }
    
    // Note: Location import is handled by dedicated script
    // (importLocationCatalog.js) to ensure LocationCatalog is the source of truth
    
    // Refresh indices
    console.log('\n🔄 Refreshing indices...');
    await Promise.all([
      client.indices.refresh({ index: 'doctors' }),
      client.indices.refresh({ index: 'locations' }),
      client.indices.refresh({ index: 'content' })
    ]);
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ Excel data import completed successfully!');
    console.log('='.repeat(80));
    console.log('\nSummary:');
    console.log(`  📋 Services indexed: ${serviceDocs.length}`);
    console.log(`  👨‍⚕️  Providers mapped to DEPs: ${providerDEPMap.size}`);
    console.log(`  📍 LocationCatalog locations loaded: ${locationMap.size} (use importLocationCatalog.js to import)`);
    console.log(`  🔗 Service-provider relationships: ${serviceProviderMap.size}`);
    console.log(`  🔗 DEP links mapped: ${depLinkMap.size}`);
    console.log(`  🔄 Doctors updated: ${updateCount}`);
    
    // Show matching statistics
    const matchedNPIs = new Set();
    hits.forEach(hit => {
      if (hit._source.npi && (providerDEPMap.has(hit._source.npi) || depLinkMap.has(hit._source.npi) || npiToServicesMap.has(hit._source.npi) || npiToServiceDEPMap.has(hit._source.npi))) {
        matchedNPIs.add(hit._source.npi);
      }
    });
    console.log(`  📊 NPIs matched between CSV and Excel: ${matchedNPIs.size}`);
    console.log(`  📊 Service-DEP relationships mapped: ${npiToServiceDEPMap.size} NPIs`);
    
    console.log('\n✨ Search functionality has been enhanced with:');
    console.log('   - Medical services search');
    console.log('   - Scheduling DEP IDs for appointment booking');
    console.log('   - Enhanced location details');
    console.log('   - Service-provider-location relationships');
    console.log('   - Doctor-service linkages (NPI-based)');
    console.log('   - Complete data integration between CSV and Excel');
    
  } catch (error) {
    console.error('❌ Error importing Excel data:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  importExcelData();
}

module.exports = importExcelData;

