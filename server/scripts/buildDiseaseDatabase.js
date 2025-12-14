/**
 * Script to build a comprehensive disease-to-specialty mapping database
 * Uses NHS Inform A-Z list as a source
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Specialty mapping rules - maps keywords/patterns to specialties
const specialtyMappingRules = {
  // Neurology
  neurology: ['parkinson', 'alzheimer', 'dementia', 'epilepsy', 'seizure', 'stroke', 'multiple sclerosis', 'ms', 'migraine', 'headache', 'als', 'huntington', 'tourette', 'tremor', 'neuropathy', 'bell', 'concussion', 'brain tumor', 'brain cancer', 'neurological'],
  
  // Cardiology
  cardiology: ['heart attack', 'myocardial infarction', 'chest pain', 'arrhythmia', 'atrial fibrillation', 'afib', 'heart failure', 'congestive heart failure', 'chf', 'hypertension', 'high blood pressure', 'coronary artery disease', 'cad', 'angina', 'valve disease', 'heart valve', 'aortic stenosis', 'mitral regurgitation', 'cardiomyopathy', 'palpitations', 'cardiac', 'cardiovascular'],
  
  // Oncology
  oncology: ['cancer', 'tumor', 'tumour', 'leukemia', 'lymphoma', 'breast cancer', 'lung cancer', 'colon cancer', 'colorectal cancer', 'prostate cancer', 'skin cancer', 'melanoma', 'chemotherapy', 'radiation', 'radiotherapy', 'oncology', 'carcinoma', 'sarcoma'],
  
  // Orthopedics
  orthopedics: ['fracture', 'broken bone', 'arthritis', 'osteoarthritis', 'rheumatoid arthritis', 'ra', 'back pain', 'neck pain', 'herniated disc', 'sciatica', 'torn acl', 'acl tear', 'rotator cuff', 'carpal tunnel', 'hip replacement', 'knee replacement', 'osteoporosis', 'bone', 'joint', 'spine', 'orthopedic'],
  
  // Gastroenterology
  gastroenterology: ['crohn', 'ulcerative colitis', 'uc', 'ibd', 'ibs', 'irritable bowel', 'celiac', 'hepatitis', 'cirrhosis', 'liver disease', 'pancreatitis', 'gallstones', 'gastritis', 'gerd', 'acid reflux', 'ulcer', 'peptic ulcer', 'digestive', 'stomach', 'bowel', 'intestinal'],
  
  // Endocrinology
  endocrinology: ['diabetes', 'type 1 diabetes', 'type 2 diabetes', 'diabetic', 'thyroid', 'hypothyroidism', 'hyperthyroidism', 'hashimoto', 'graves disease', 'adrenal', 'cushing', 'addison', 'hormone', 'endocrine'],
  
  // Pulmonology
  pulmonology: ['asthma', 'copd', 'chronic obstructive pulmonary disease', 'emphysema', 'bronchitis', 'pneumonia', 'sleep apnea', 'pulmonary fibrosis', 'sarcoidosis', 'respiratory', 'lung', 'breathing'],
  
  // Nephrology
  nephrology: ['kidney disease', 'kidney failure', 'renal failure', 'ckd', 'chronic kidney disease', 'dialysis', 'kidney stones', 'nephritis', 'renal', 'kidney'],
  
  // Urology
  urology: ['prostate', 'bph', 'benign prostatic hyperplasia', 'urinary tract infection', 'uti', 'incontinence', 'bladder cancer', 'testicular cancer', 'erectile dysfunction', 'ed', 'urinary', 'bladder', 'prostate'],
  
  // Dermatology
  dermatology: ['eczema', 'psoriasis', 'acne', 'rosacea', 'basal cell', 'squamous cell', 'mole', 'rash', 'hives', 'skin', 'dermatitis'],
  
  // Psychiatry
  psychiatry: ['depression', 'anxiety', 'bipolar', 'bipolar disorder', 'schizophrenia', 'ptsd', 'post traumatic stress', 'ocd', 'obsessive compulsive', 'adhd', 'attention deficit', 'autism', 'autism spectrum', 'eating disorder', 'anorexia', 'bulimia', 'mental health', 'psychiatric'],
  
  // Obstetrics & Gynecology
  'obstetrics & gynecology': ['pregnancy', 'prenatal', 'maternity', 'labor', 'delivery', 'menopause', 'endometriosis', 'fibroids', 'ovarian cyst', 'pcos', 'polycystic ovary', 'infertility', 'pap smear', 'mammogram', 'gynecological', 'obstetric', 'reproductive'],
  
  // Pediatrics
  pediatrics: ['pediatric', 'child', 'children', 'infant', 'newborn', 'adolescent', 'teen'],
  
  // Infectious Disease
  'infectious disease': ['hiv', 'aids', 'tuberculosis', 'tb', 'sepsis', 'mrsa', 'covid', 'coronavirus', 'flu', 'influenza', 'infection', 'bacterial', 'viral'],
  
  // Ophthalmology
  ophthalmology: ['cataract', 'glaucoma', 'macular degeneration', 'retinal detachment', 'diabetic retinopathy', 'eye infection', 'conjunctivitis', 'pink eye', 'eye', 'vision', 'retinal'],
  
  // Otolaryngology
  otolaryngology: ['sinusitis', 'sinus infection', 'tonsillitis', 'ear infection', 'otitis media', 'hearing loss', 'tinnitus', 'vertigo', 'meniere', 'ear', 'nose', 'throat', 'ent'],
  
  // Rheumatology
  rheumatology: ['lupus', 'sle', 'systemic lupus', 'rheumatoid arthritis', 'ra', 'fibromyalgia', 'gout', 'sjogren', 'scleroderma', 'rheumatoid', 'autoimmune'],
  
  // Emergency Medicine
  'emergency medicine': ['trauma', 'injury', 'accident', 'emergency', 'urgent'],
  
  // Internal Medicine
  'internal medicine': ['hypertension', 'high blood pressure', 'diabetes', 'cholesterol', 'high cholesterol', 'obesity', 'weight loss', 'fatigue', 'anemia', 'iron deficiency', 'general medicine'],
  
  // Hematology
  hematology: ['anemia', 'iron deficiency', 'leukemia', 'lymphoma', 'blood disorder', 'clotting', 'hemophilia', 'sickle cell'],
  
  // Critical Care
  'critical care': ['icu', 'intensive care', 'critical care', 'ventilator', 'life support'],
  
  // Allergy
  allergy: ['allergy', 'allergic', 'asthma', 'eczema', 'hives', 'anaphylaxis', 'hay fever'],
  
  // Sleep Medicine
  'sleep medicine': ['sleep apnea', 'insomnia', 'sleep disorder', 'narcolepsy'],
  
  // Physical Medicine
  'physical medicine': ['rehabilitation', 'physical therapy', 'occupational therapy', 'fibromyalgia']
};

/**
 * Maps a condition name to specialties based on keyword matching
 */
function mapConditionToSpecialties(conditionName) {
  const lowerName = conditionName.toLowerCase();
  const matchedSpecialties = new Set();
  
  // Check each specialty's keywords
  for (const [specialty, keywords] of Object.entries(specialtyMappingRules)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        matchedSpecialties.add(specialty);
        break; // Found a match for this specialty, move to next
      }
    }
  }
  
  // If no matches found, return common specialties
  if (matchedSpecialties.size === 0) {
    return ['Internal Medicine', 'Primary Care'];
  }
  
  return Array.from(matchedSpecialties);
}

/**
 * Fetches the NHS Inform A-Z page and extracts condition names
 */
async function fetchNHSConditions() {
  return new Promise((resolve, reject) => {
    const url = 'https://www.nhsinform.scot/illnesses-and-conditions/a-to-z/';
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Extract condition names from the HTML
        // The NHS site typically lists conditions in <a> tags or <li> elements
        const conditionPattern = /<a[^>]*href="[^"]*illnesses-and-conditions[^"]*"[^>]*>([^<]+)<\/a>/gi;
        const conditions = new Set();
        
        let match;
        while ((match = conditionPattern.exec(data)) !== null) {
          const conditionName = match[1].trim();
          if (conditionName && conditionName.length > 1 && conditionName.length < 100) {
            // Clean up the condition name
            const cleaned = conditionName
              .replace(/&amp;/g, '&')
              .replace(/&nbsp;/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            if (cleaned) {
              conditions.add(cleaned);
            }
          }
        }
        
        // Also try to find conditions in list items
        const liPattern = /<li[^>]*>([^<]+)<\/li>/gi;
        while ((match = liPattern.exec(data)) !== null) {
          const text = match[1].trim();
          if (text && text.length > 2 && text.length < 80 && !text.includes('<')) {
            conditions.add(text);
          }
        }
        
        resolve(Array.from(conditions).sort());
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Builds the disease database from NHS conditions
 */
async function buildDiseaseDatabase() {
  console.log('Fetching conditions from NHS Inform...');
  
  try {
    const conditions = await fetchNHSConditions();
    console.log(`Found ${conditions.length} conditions`);
    
    const diseaseToSpecialty = {};
    
    // Map each condition to specialties
    for (const condition of conditions) {
      const specialties = mapConditionToSpecialties(condition);
      const key = condition.toLowerCase().trim();
      
      // Create multiple key variations for better matching
      const variations = [
        key,
        key.replace(/'/g, ''),
        key.replace(/'/g, 's'),
        key.replace(/\s+/g, ' '),
        key.replace(/[^a-z0-9\s]/g, '')
      ];
      
      for (const variation of variations) {
        if (variation && variation.length > 2) {
          diseaseToSpecialty[variation] = specialties;
        }
      }
    }
    
    // Also add common abbreviations and variations
    const commonMappings = {
      'parkinson': ['Neurology', 'Movement Disorders'],
      'parkinsons': ['Neurology', 'Movement Disorders'],
      'parkinsons disease': ['Neurology', 'Movement Disorders'],
      'alzheimer': ['Neurology', 'Memory Disorders'],
      'alzheimers': ['Neurology', 'Memory Disorders'],
      'alzheimers disease': ['Neurology', 'Memory Disorders'],
      'ms': ['Neurology', 'Multiple Sclerosis'],
      'multiple sclerosis': ['Neurology', 'Multiple Sclerosis'],
      'copd': ['Pulmonology'],
      'ibd': ['Gastroenterology'],
      'ibs': ['Gastroenterology'],
      'uti': ['Urology', 'Infectious Disease'],
      'ckd': ['Nephrology'],
      'chf': ['Cardiology', 'Heart Failure'],
      'cad': ['Cardiology', 'Interventional Cardiology'],
      'afib': ['Cardiology', 'Electrophysiology'],
      'ra': ['Rheumatology'],
      'sle': ['Rheumatology'],
      'ptsd': ['Psychiatry', 'Mental Health'],
      'ocd': ['Psychiatry', 'Mental Health'],
      'adhd': ['Psychiatry', 'Mental Health', 'Pediatrics'],
      'pcos': ['Obstetrics & Gynecology', 'Endocrinology'],
      'bph': ['Urology'],
      'ed': ['Urology'],
      'gerd': ['Gastroenterology'],
      'tbi': ['Neurology', 'Trauma'],
      'mrsa': ['Infectious Disease']
    };
    
    for (const [key, specialties] of Object.entries(commonMappings)) {
      diseaseToSpecialty[key] = specialties;
    }
    
    // Generate the JavaScript code for the database
    const jsCode = `// Auto-generated disease-to-specialty mapping database
// Source: NHS Inform A-Z (https://www.nhsinform.scot/illnesses-and-conditions/a-to-z/)
// Generated: ${new Date().toISOString()}
// Total conditions: ${conditions.length}

const diseaseToSpecialty = ${JSON.stringify(diseaseToSpecialty, null, 2)};

module.exports = { diseaseToSpecialty };
`;
    
    // Write to file
    const outputPath = path.join(__dirname, 'diseaseDatabase.js');
    fs.writeFileSync(outputPath, jsCode, 'utf8');
    
    console.log(`\n✅ Disease database generated successfully!`);
    console.log(`   File: ${outputPath}`);
    console.log(`   Total mappings: ${Object.keys(diseaseToSpecialty).length}`);
    console.log(`\nTo use this database, replace the diseaseToSpecialty object in server/routes/search.js`);
    console.log(`with: const { diseaseToSpecialty } = require('./scripts/diseaseDatabase');`);
    
    return diseaseToSpecialty;
  } catch (error) {
    console.error('Error building disease database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  buildDiseaseDatabase()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = { buildDiseaseDatabase, mapConditionToSpecialties };


