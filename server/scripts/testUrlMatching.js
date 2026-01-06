const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, '../../Greg Specifics.xlsx');

function cleanString(str) {
  if (!str) return '';
  return String(str).trim().replace(/\s+/g, ' ');
}

async function testUrlMatching() {
  try {
    const workbook = XLSX.readFile(excelPath);
    
    const servicesSheet = workbook.Sheets['Services'];
    const servicesData = XLSX.utils.sheet_to_json(servicesSheet, { defval: null });
    
    const serviceProvidersSheet = workbook.Sheets['ServiceProviders'];
    const serviceProvidersData = XLSX.utils.sheet_to_json(serviceProvidersSheet, { defval: null });
    
    // Get a service URL from Services sheet
    const testService = servicesData.find(row => {
      const name = cleanString(row['Medical Services Name (Sitecore)']);
      return name && name.toLowerCase().includes('movement');
    });
    
    if (testService) {
      const serviceUrl = cleanString(testService['URL']);
      console.log(`Service URL from Services sheet: "${serviceUrl}"`);
      
      // Find matching URLs in ServiceProviders
      const matchingProviders = serviceProvidersData.filter(row => {
        const url = cleanString(row['URL']);
        return url === serviceUrl;
      });
      
      console.log(`\nMatching rows in ServiceProviders: ${matchingProviders.length}`);
      if (matchingProviders.length > 0) {
        console.log(`First match URL: "${cleanString(matchingProviders[0]['URL'])}"`);
        console.log(`Matched Specialty: "${cleanString(matchingProviders[0]['Matched Specialty (Sitecore)'])}"`);
      }
      
      // Check if URLs match exactly
      const allServiceUrls = new Set();
      servicesData.forEach(row => {
        const url = cleanString(row['URL']);
        if (url) allServiceUrls.add(url);
      });
      
      const allProviderUrls = new Set();
      serviceProvidersData.forEach(row => {
        const url = cleanString(row['URL']);
        if (url) allProviderUrls.add(url);
      });
      
      console.log(`\nUnique URLs in Services sheet: ${allServiceUrls.size}`);
      console.log(`Unique URLs in ServiceProviders sheet: ${allProviderUrls.size}`);
      
      // Find URLs that are in both
      const commonUrls = [...allServiceUrls].filter(url => allProviderUrls.has(url));
      console.log(`URLs in both sheets: ${commonUrls.length}`);
      
      // Find URLs only in ServiceProviders
      const onlyInProviders = [...allProviderUrls].filter(url => !allServiceUrls.has(url));
      console.log(`URLs only in ServiceProviders: ${onlyInProviders.length}`);
      if (onlyInProviders.length > 0) {
        console.log(`\nFirst 5 URLs only in ServiceProviders:`);
        onlyInProviders.slice(0, 5).forEach(url => console.log(`  ${url}`));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testUrlMatching();
}

module.exports = testUrlMatching;

