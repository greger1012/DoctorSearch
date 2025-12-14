/**
 * Enhanced scraper that visits each NHS Inform condition page
 * to extract detailed information: symptoms, causes, treatments, related conditions
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Rate limiting - wait between requests
const DELAY_MS = 500; // 500ms between requests to be respectful

/**
 * Makes an HTTP/HTTPS request and returns the HTML content
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

/**
 * Extracts condition links from the A-Z index page
 */
function extractConditionLinks(html) {
  const links = new Set();
  
  // Pattern to match links to condition pages
  // NHS Inform uses URLs like: /illnesses-and-conditions/a-to-z/condition-name/
  const linkPattern = /href="(\/illnesses-and-conditions\/a-to-z\/[^"]+)"/gi;
  let match;
  
  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    // Filter out non-condition links
    if (href && !href.includes('#') && !href.includes('javascript')) {
      const fullUrl = `https://www.nhsinform.scot${href}`;
      links.add(fullUrl);
    }
  }
  
  // Also try to find links in list items
  const listPattern = /<li[^>]*>\s*<a[^>]*href="([^"]*illnesses-and-conditions[^"]*)"[^>]*>([^<]+)<\/a>/gi;
  while ((match = listPattern.exec(html)) !== null) {
    const href = match[1];
    const name = match[2].trim();
    if (href && name && !href.includes('#')) {
      const fullUrl = href.startsWith('http') ? href : `https://www.nhsinform.scot${href}`;
      links.add(fullUrl);
    }
  }
  
  return Array.from(links);
}

/**
 * Extracts detailed information from a condition page
 */
function extractConditionDetails(html, url) {
  const details = {
    url: url,
    name: '',
    symptoms: [],
    causes: [],
    treatments: [],
    relatedConditions: [],
    description: '',
    specialties: []
  };
  
  // Extract condition name from title or h1
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    details.name = titleMatch[1]
      .replace(/\s*-\s*NHS inform\s*/i, '')
      .trim();
  }
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match && !details.name) {
    details.name = h1Match[1].trim();
  }
  
  // Extract from URL if name not found
  if (!details.name) {
    const urlMatch = url.match(/\/([^/]+)\/?$/);
    if (urlMatch) {
      details.name = urlMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  // Extract symptoms - look for common patterns
  const symptomsPatterns = [
    /symptoms[^<]*<\/h2>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
    /symptoms[^<]*<\/h3>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
    /<h[23][^>]*>symptoms[^<]*<\/h[23]>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i
  ];
  
  for (const pattern of symptomsPatterns) {
    const match = html.match(pattern);
    if (match) {
      const listContent = match[1];
      const liMatches = listContent.match(/<li[^>]*>([^<]+)<\/li>/gi);
      if (liMatches) {
        details.symptoms = liMatches.map(li => {
          return li.replace(/<[^>]+>/g, '').trim();
        }).filter(s => s.length > 0);
        break;
      }
    }
  }
  
  // Extract causes
  const causesPatterns = [
    /causes[^<]*<\/h2>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
    /causes[^<]*<\/h3>[\s\S]*?<ul[^>]*>([\s\S]*?<\/ul>)/i,
    /<h[23][^>]*>causes[^<]*<\/h[23]>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i
  ];
  
  for (const pattern of causesPatterns) {
    const match = html.match(pattern);
    if (match) {
      const listContent = match[1];
      const liMatches = listContent.match(/<li[^>]*>([^<]+)<\/li>/gi);
      if (liMatches) {
        details.causes = liMatches.map(li => {
          return li.replace(/<[^>]+>/g, '').trim();
        }).filter(c => c.length > 0);
        break;
      }
    }
  }
  
  // Extract treatments
  const treatmentsPatterns = [
    /treatment[^<]*<\/h2>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
    /treatment[^<]*<\/h3>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
    /<h[23][^>]*>treatment[^<]*<\/h[23]>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i
  ];
  
  for (const pattern of treatmentsPatterns) {
    const match = html.match(pattern);
    if (match) {
      const listContent = match[1];
      const liMatches = listContent.match(/<li[^>]*>([^<]+)<\/li>/gi);
      if (liMatches) {
        details.treatments = liMatches.map(li => {
          return li.replace(/<[^>]+>/g, '').trim();
        }).filter(t => t.length > 0);
        break;
      }
    }
  }
  
  // Extract description/intro text
  const introMatch = html.match(/<div[^>]*class="[^"]*intro[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                     html.match(/<p[^>]*class="[^"]*intro[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  if (introMatch) {
    details.description = introMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500); // Limit length
  }
  
  // Extract related conditions from links
  const relatedPattern = /<a[^>]*href="[^"]*illnesses-and-conditions[^"]*"[^>]*>([^<]+)<\/a>/gi;
  const relatedMatches = [];
  let relatedMatch;
  while ((relatedMatch = relatedPattern.exec(html)) !== null) {
    const conditionName = relatedMatch[1].trim();
    if (conditionName && conditionName !== details.name && conditionName.length < 100) {
      relatedMatches.push(conditionName);
    }
  }
  details.relatedConditions = [...new Set(relatedMatches)].slice(0, 10); // Limit to 10
  
  return details;
}

/**
 * Maps condition details to medical specialties
 */
function mapToSpecialties(details) {
  const specialties = new Set();
  const allText = [
    details.name,
    details.description,
    ...details.symptoms,
    ...details.causes,
    ...details.treatments
  ].join(' ').toLowerCase();
  
  // Specialty keyword mappings
  const specialtyKeywords = {
    'Neurology': ['neurological', 'brain', 'nervous system', 'seizure', 'epilepsy', 'stroke', 'parkinson', 'alzheimer', 'dementia', 'migraine', 'headache', 'neuropathy', 'tremor', 'memory', 'cognitive'],
    'Cardiology': ['heart', 'cardiac', 'cardiovascular', 'chest pain', 'arrhythmia', 'hypertension', 'blood pressure', 'heart attack', 'heart failure', 'angina', 'palpitations'],
    'Oncology': ['cancer', 'tumor', 'tumour', 'malignant', 'chemotherapy', 'radiation', 'oncology', 'carcinoma'],
    'Orthopedics': ['bone', 'fracture', 'joint', 'arthritis', 'back pain', 'spine', 'knee', 'hip', 'shoulder', 'orthopedic'],
    'Gastroenterology': ['stomach', 'digestive', 'bowel', 'intestine', 'liver', 'pancreas', 'gallbladder', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'gastro'],
    'Endocrinology': ['diabetes', 'thyroid', 'hormone', 'endocrine', 'insulin', 'metabolic', 'adrenal'],
    'Pulmonology': ['lung', 'respiratory', 'breathing', 'asthma', 'copd', 'pneumonia', 'bronchitis', 'pulmonary'],
    'Nephrology': ['kidney', 'renal', 'dialysis', 'nephrology'],
    'Urology': ['urinary', 'bladder', 'prostate', 'kidney stones', 'incontinence', 'urology'],
    'Dermatology': ['skin', 'rash', 'eczema', 'psoriasis', 'dermatitis', 'mole', 'dermatology'],
    'Psychiatry': ['mental health', 'depression', 'anxiety', 'psychiatric', 'bipolar', 'schizophrenia', 'ptsd', 'ocd', 'adhd'],
    'Obstetrics & Gynecology': ['pregnancy', 'prenatal', 'maternity', 'menopause', 'endometriosis', 'ovarian', 'gynecological', 'obstetric'],
    'Pediatrics': ['child', 'children', 'pediatric', 'infant', 'newborn', 'adolescent'],
    'Infectious Disease': ['infection', 'bacterial', 'viral', 'fever', 'sepsis', 'hiv', 'tuberculosis'],
    'Ophthalmology': ['eye', 'vision', 'retinal', 'cataract', 'glaucoma', 'ophthalmology'],
    'Otolaryngology': ['ear', 'nose', 'throat', 'sinus', 'hearing', 'tinnitus', 'vertigo', 'ent'],
    'Rheumatology': ['arthritis', 'rheumatoid', 'lupus', 'autoimmune', 'fibromyalgia', 'gout', 'rheumatology'],
    'Hematology': ['blood', 'anemia', 'leukemia', 'lymphoma', 'clotting', 'hemophilia', 'hematology'],
    'Emergency Medicine': ['emergency', 'trauma', 'injury', 'accident', 'urgent'],
    'Internal Medicine': ['internal medicine', 'general medicine', 'primary care']
  };
  
  for (const [specialty, keywords] of Object.entries(specialtyKeywords)) {
    for (const keyword of keywords) {
      if (allText.includes(keyword)) {
        specialties.add(specialty);
        break;
      }
    }
  }
  
  // If no specialties found, default to Internal Medicine
  if (specialties.size === 0) {
    specialties.add('Internal Medicine');
  }
  
  return Array.from(specialties);
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to scrape all NHS conditions with detailed info
 */
async function scrapeNHSDetailed() {
  console.log('🔍 Starting NHS Inform detailed scraper...\n');
  
  try {
    // Step 1: Get the A-Z index page
    console.log('📋 Fetching A-Z index page...');
    const indexUrl = 'https://www.nhsinform.scot/illnesses-and-conditions/a-to-z/';
    const indexHtml = await fetchPage(indexUrl);
    
    // Step 2: Extract all condition links
    console.log('🔗 Extracting condition links...');
    const conditionLinks = extractConditionLinks(indexHtml);
    console.log(`   Found ${conditionLinks.length} condition pages\n`);
    
    if (conditionLinks.length === 0) {
      console.log('⚠️  No condition links found. The page structure may have changed.');
      console.log('   Trying alternative extraction method...\n');
      
      // Alternative: try to find links in a different format
      const altPattern = /<a[^>]*href="([^"]*\/a-to-z\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
      const altLinks = new Set();
      let altMatch;
      while ((altMatch = altPattern.exec(indexHtml)) !== null) {
        const href = altMatch[1];
        const name = altMatch[2].trim();
        if (href && name && !href.includes('#') && name.length > 1 && name.length < 100) {
          const fullUrl = href.startsWith('http') ? href : `https://www.nhsinform.scot${href}`;
          altLinks.add(fullUrl);
        }
      }
      
      if (altLinks.size > 0) {
        conditionLinks.push(...Array.from(altLinks));
        console.log(`   Found ${altLinks.size} additional links using alternative method\n`);
      }
    }
    
    // Step 3: Visit each condition page and extract details
    console.log(`📄 Scraping ${conditionLinks.length} condition pages...`);
    console.log(`   (This will take approximately ${Math.ceil(conditionLinks.length * DELAY_MS / 1000)} seconds)\n`);
    
    const conditions = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < conditionLinks.length; i++) {
      const link = conditionLinks[i];
      const progress = `[${i + 1}/${conditionLinks.length}]`;
      
      try {
        process.stdout.write(`${progress} Fetching: ${link.substring(0, 60)}... `);
        
        const pageHtml = await fetchPage(link);
        const details = extractConditionDetails(pageHtml, link);
        details.specialties = mapToSpecialties(details);
        
        if (details.name) {
          conditions.push(details);
          successCount++;
          console.log(`✅ ${details.name}`);
        } else {
          errorCount++;
          console.log(`⚠️  (No name extracted)`);
        }
        
        // Rate limiting
        if (i < conditionLinks.length - 1) {
          await sleep(DELAY_MS);
        }
      } catch (error) {
        errorCount++;
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Scraping complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total conditions: ${conditions.length}\n`);
    
    // Step 4: Build the disease database
    console.log('🏗️  Building disease database...');
    
    const diseaseToSpecialty = {};
    const diseaseDetails = {};
    
    for (const condition of conditions) {
      const name = condition.name.toLowerCase().trim();
      
      // Create multiple key variations
      const variations = [
        name,
        name.replace(/'/g, ''),
        name.replace(/'/g, 's'),
        name.replace(/\s+/g, '-'),
        name.replace(/\s+/g, ' '),
        name.replace(/[^a-z0-9\s-]/g, '')
      ];
      
      // Add main mapping
      diseaseToSpecialty[name] = condition.specialties;
      
      // Add variations
      for (const variation of variations) {
        if (variation && variation.length > 2 && variation !== name) {
          diseaseToSpecialty[variation] = condition.specialties;
        }
      }
      
      // Add symptoms as searchable terms
      for (const symptom of condition.symptoms) {
        const symptomKey = symptom.toLowerCase().trim();
        if (symptomKey && symptomKey.length > 3) {
          if (!diseaseToSpecialty[symptomKey]) {
            diseaseToSpecialty[symptomKey] = condition.specialties;
          }
        }
      }
      
      // Store detailed information
      diseaseDetails[name] = {
        name: condition.name,
        symptoms: condition.symptoms,
        causes: condition.causes,
        treatments: condition.treatments,
        relatedConditions: condition.relatedConditions,
        description: condition.description,
        specialties: condition.specialties,
        url: condition.url
      };
    }
    
    // Step 5: Generate output files
    const outputDir = path.join(__dirname);
    
    // Generate disease-to-specialty mapping
    const mappingCode = `// Auto-generated disease-to-specialty mapping database
// Source: NHS Inform A-Z (https://www.nhsinform.scot/illnesses-and-conditions/a-to-z/)
// Generated: ${new Date().toISOString()}
// Total conditions: ${conditions.length}
// Total mappings: ${Object.keys(diseaseToSpecialty).length}

const diseaseToSpecialty = ${JSON.stringify(diseaseToSpecialty, null, 2)};

module.exports = { diseaseToSpecialty };
`;
    
    fs.writeFileSync(
      path.join(outputDir, 'diseaseDatabase.js'),
      mappingCode,
      'utf8'
    );
    
    // Generate detailed disease information
    const detailsCode = `// Detailed disease information from NHS Inform
// Generated: ${new Date().toISOString()}
// Total conditions: ${conditions.length}

const diseaseDetails = ${JSON.stringify(diseaseDetails, null, 2)};

module.exports = { diseaseDetails };
`;
    
    fs.writeFileSync(
      path.join(outputDir, 'diseaseDetails.js'),
      detailsCode,
      'utf8'
    );
    
    // Generate summary report
    const report = `# NHS Inform Disease Database
Generated: ${new Date().toISOString()}

## Summary
- Total conditions scraped: ${conditions.length}
- Total disease mappings: ${Object.keys(diseaseToSpecialty).length}
- Conditions with symptoms: ${conditions.filter(c => c.symptoms.length > 0).length}
- Conditions with causes: ${conditions.filter(c => c.causes.length > 0).length}
- Conditions with treatments: ${conditions.filter(c => c.treatments.length > 0).length}

## Top Specialties
${Object.entries(
  conditions.reduce((acc, c) => {
    c.specialties.forEach(s => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {})
)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([spec, count]) => `- ${spec}: ${count} conditions`)
  .join('\n')}

## Files Generated
1. \`diseaseDatabase.js\` - Disease to specialty mappings (for search.js)
2. \`diseaseDetails.js\` - Detailed condition information (symptoms, causes, treatments)
`;
    
    fs.writeFileSync(
      path.join(outputDir, 'SCRAPING_REPORT.md'),
      report,
      'utf8'
    );
    
    console.log(`\n✅ Database files generated:`);
    console.log(`   1. diseaseDatabase.js (${Object.keys(diseaseToSpecialty).length} mappings)`);
    console.log(`   2. diseaseDetails.js (${conditions.length} detailed conditions)`);
    console.log(`   3. SCRAPING_REPORT.md (summary report)`);
    console.log(`\n📝 Next steps:`);
    console.log(`   - Review the generated files`);
    console.log(`   - Update server/routes/search.js to use diseaseDatabase.js`);
    console.log(`   - Consider using diseaseDetails.js for enhanced search explanations`);
    
    return { diseaseToSpecialty, diseaseDetails };
  } catch (error) {
    console.error('\n❌ Error during scraping:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  scrapeNHSDetailed()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { scrapeNHSDetailed, extractConditionDetails, mapToSpecialties };

