/**
 * Test script to examine NHS Inform page structure
 */

const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  try {
    const html = await fetchPage('https://www.nhsinform.scot/illnesses-and-conditions/a-to-z/');
    
    // Save raw HTML for inspection
    const fs = require('fs');
    fs.writeFileSync('nhs-page.html', html, 'utf8');
    console.log('✅ Saved page HTML to nhs-page.html');
    
    // Try different patterns
    console.log('\n🔍 Testing link patterns...\n');
    
    // Pattern 1: Standard href links
    const pattern1 = /href="([^"]*illnesses-and-conditions[^"]*)"[^>]*>([^<]+)<\/a>/gi;
    const matches1 = [];
    let m;
    while ((m = pattern1.exec(html)) !== null) {
      matches1.push({ href: m[1], text: m[2].trim() });
    }
    console.log(`Pattern 1 (href with illnesses-and-conditions): ${matches1.length} matches`);
    if (matches1.length > 0) {
      console.log('   First 5:', matches1.slice(0, 5).map(m => m.text));
    }
    
    // Pattern 2: Links in list items
    const pattern2 = /<li[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    const matches2 = [];
    while ((m = pattern2.exec(html)) !== null) {
      if (m[1].includes('illnesses-and-conditions')) {
        matches2.push({ href: m[1], text: m[2].trim() });
      }
    }
    console.log(`\nPattern 2 (li > a with illnesses-and-conditions): ${matches2.length} matches`);
    if (matches2.length > 0) {
      console.log('   First 5:', matches2.slice(0, 5).map(m => m.text));
    }
    
    // Pattern 3: Look for data attributes or specific classes
    const pattern3 = /<a[^>]*data-[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    const matches3 = [];
    while ((m = pattern3.exec(html)) !== null) {
      if (m[1].includes('illnesses-and-conditions')) {
        matches3.push({ href: m[1], text: m[2].trim() });
      }
    }
    console.log(`\nPattern 3 (data attributes): ${matches3.length} matches`);
    
    // Pattern 4: Look for specific structure around condition names
    const pattern4 = /<a[^>]*class="[^"]*"[^>]*href="([^"]+)"[^>]*>([A-Z][^<]+)<\/a>/gi;
    const matches4 = [];
    while ((m = pattern4.exec(html)) !== null) {
      if (m[1].includes('illnesses-and-conditions') || m[1].includes('a-to-z')) {
        matches4.push({ href: m[1], text: m[2].trim() });
      }
    }
    console.log(`\nPattern 4 (capitalized links): ${matches4.length} matches`);
    if (matches4.length > 0) {
      console.log('   First 5:', matches4.slice(0, 5).map(m => m.text));
    }
    
    // Show a sample of the HTML structure
    console.log('\n📄 Sample HTML structure (first 2000 chars around "illnesses"):');
    const index = html.toLowerCase().indexOf('illnesses');
    if (index > -1) {
      console.log(html.substring(Math.max(0, index - 500), index + 1500));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();

