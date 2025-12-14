/**
 * Enhanced NHS Inform scraper using Puppeteer to handle JavaScript-rendered content
 * and extract detailed information from each condition page
 * 
 * Install Puppeteer first: npm install puppeteer
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is available
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.error('❌ Puppeteer not installed. Please run: npm install puppeteer');
  console.error('   Or use the manual database building approach.');
  process.exit(1);
}

/**
 * Extracts detailed information from a condition page
 */
async function extractConditionDetails(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    
    // Extract condition name
    const name = await page.evaluate(() => {
      // Try h1 first
      const h1 = document.querySelector('h1');
      if (h1) return h1.textContent.trim();
      
      // Try title
      const title = document.title;
      if (title) {
        return title.replace(/\s*-\s*NHS inform\s*/i, '').trim();
      }
      
      return '';
    });
    details.name = name;
    
    // Extract description/intro
    const description = await page.evaluate(() => {
      const intro = document.querySelector('.intro, .lead, [class*="intro"], [class*="summary"]');
      if (intro) {
        return intro.textContent.trim().substring(0, 500);
      }
      return '';
    });
    details.description = description;
    
    // Extract symptoms
    const symptoms = await page.evaluate(() => {
      const symptoms = [];
      
      // Look for sections with "symptom" in heading
      const headings = Array.from(document.querySelectorAll('h2, h3'));
      const symptomHeading = headings.find(h => 
        h.textContent.toLowerCase().includes('symptom')
      );
      
      if (symptomHeading) {
        let current = symptomHeading.nextElementSibling;
        while (current && !current.matches('h2, h3')) {
          if (current.matches('ul, ol')) {
            const items = current.querySelectorAll('li');
            items.forEach(li => {
              const text = li.textContent.trim();
              if (text) symptoms.push(text);
            });
          } else if (current.matches('p')) {
            const text = current.textContent.trim();
            if (text && text.length < 200) symptoms.push(text);
          }
          current = current.nextElementSibling;
        }
      }
      
      return symptoms;
    });
    details.symptoms = symptoms;
    
    // Extract causes
    const causes = await page.evaluate(() => {
      const causes = [];
      
      const headings = Array.from(document.querySelectorAll('h2, h3'));
      const causeHeading = headings.find(h => 
        h.textContent.toLowerCase().includes('cause')
      );
      
      if (causeHeading) {
        let current = causeHeading.nextElementSibling;
        while (current && !current.matches('h2, h3')) {
          if (current.matches('ul, ol')) {
            const items = current.querySelectorAll('li');
            items.forEach(li => {
              const text = li.textContent.trim();
              if (text) causes.push(text);
            });
          } else if (current.matches('p')) {
            const text = current.textContent.trim();
            if (text && text.length < 200) causes.push(text);
          }
          current = current.nextElementSibling;
        }
      }
      
      return causes;
    });
    details.causes = causes;
    
    // Extract treatments
    const treatments = await page.evaluate(() => {
      const treatments = [];
      
      const headings = Array.from(document.querySelectorAll('h2, h3'));
      const treatmentHeading = headings.find(h => 
        h.textContent.toLowerCase().includes('treat') || 
        h.textContent.toLowerCase().includes('manag')
      );
      
      if (treatmentHeading) {
        let current = treatmentHeading.nextElementSibling;
        while (current && !current.matches('h2, h3')) {
          if (current.matches('ul, ol')) {
            const items = current.querySelectorAll('li');
            items.forEach(li => {
              const text = li.textContent.trim();
              if (text) treatments.push(text);
            });
          } else if (current.matches('p')) {
            const text = current.textContent.trim();
            if (text && text.length < 200) treatments.push(text);
          }
          current = current.nextElementSibling;
        }
      }
      
      return treatments;
    });
    details.treatments = treatments;
    
    // Extract related conditions
    const relatedConditions = await page.evaluate(() => {
      const related = [];
      const links = document.querySelectorAll('a[href*="illnesses-and-conditions"]');
      
      links.forEach(link => {
        const text = link.textContent.trim();
        if (text && text.length > 2 && text.length < 100) {
          related.push(text);
        }
      });
      
      return [...new Set(related)].slice(0, 10);
    });
    details.relatedConditions = relatedConditions;
    
    return details;
  } catch (error) {
    console.error(`Error extracting details from ${url}:`, error.message);
    return null;
  }
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
  
  if (specialties.size === 0) {
    specialties.add('Internal Medicine');
  }
  
  return Array.from(specialties);
}

/**
 * Extracts condition links from the A-Z index page
 */
async function extractConditionLinks(page) {
  await page.goto('https://www.nhsinform.scot/illnesses-and-conditions/a-to-z/', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
  
  const links = await page.evaluate(() => {
    const conditionLinks = new Set();
    
    // Find all links that point to condition pages
    const allLinks = document.querySelectorAll('a[href*="illnesses-and-conditions"]');
    
    allLinks.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent.trim();
      
      if (href && text && 
          href.includes('/a-to-z/') && 
          !href.includes('#') &&
          text.length > 1 && 
          text.length < 100) {
        const fullUrl = href.startsWith('http') ? href : `https://www.nhsinform.scot${href}`;
        conditionLinks.add(fullUrl);
      }
    });
    
    return Array.from(conditionLinks);
  });
  
  return links;
}

/**
 * Main scraping function
 */
async function scrapeNHSWithPuppeteer() {
  console.log('🚀 Starting NHS Inform scraper with Puppeteer...\n');
  
  let browser;
  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent to appear more like a real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Step 1: Get all condition links
    console.log('📋 Extracting condition links from A-Z index...');
    const conditionLinks = await extractConditionLinks(page);
    console.log(`   Found ${conditionLinks.length} condition pages\n`);
    
    if (conditionLinks.length === 0) {
      console.log('⚠️  No links found. The page structure may have changed.');
      console.log('   You may need to manually inspect the NHS site structure.');
      await browser.close();
      return;
    }
    
    // Step 2: Scrape each condition page
    console.log(`📄 Scraping ${conditionLinks.length} condition pages...`);
    console.log(`   (This will take approximately ${Math.ceil(conditionLinks.length * 2 / 60)} minutes)\n`);
    
    const conditions = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < conditionLinks.length; i++) {
      const link = conditionLinks[i];
      const progress = `[${i + 1}/${conditionLinks.length}]`;
      
      try {
        process.stdout.write(`${progress} ${link.substring(link.lastIndexOf('/') + 1)}... `);
        
        const details = await extractConditionDetails(page, link);
        
        if (details && details.name) {
          details.specialties = mapToSpecialties(details);
          conditions.push(details);
          successCount++;
          console.log(`✅ ${details.name}`);
        } else {
          errorCount++;
          console.log(`⚠️  (No details extracted)`);
        }
        
        // Rate limiting - wait 2 seconds between requests
        if (i < conditionLinks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
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
    
    // Step 3: Build database
    console.log('🏗️  Building disease database...');
    
    const diseaseToSpecialty = {};
    const diseaseDetails = {};
    
    for (const condition of conditions) {
      const name = condition.name.toLowerCase().trim();
      
      // Create key variations
      const variations = [
        name,
        name.replace(/'/g, ''),
        name.replace(/'/g, 's'),
        name.replace(/\s+/g, '-'),
        name.replace(/\s+/g, ' '),
        name.replace(/[^a-z0-9\s-]/g, '')
      ];
      
      diseaseToSpecialty[name] = condition.specialties;
      
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
    
    // Step 4: Save files
    const outputDir = path.join(__dirname);
    
    const mappingCode = `// Auto-generated disease-to-specialty mapping
// Source: NHS Inform A-Z
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
    
    console.log(`\n✅ Database files generated:`);
    console.log(`   1. diseaseDatabase.js (${Object.keys(diseaseToSpecialty).length} mappings)`);
    console.log(`   2. diseaseDetails.js (${conditions.length} detailed conditions)`);
    console.log(`\n📝 Next steps:`);
    console.log(`   - Review the generated files`);
    console.log(`   - Update server/routes/search.js to use diseaseDatabase.js`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  scrapeNHSWithPuppeteer()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { scrapeNHSWithPuppeteer };

