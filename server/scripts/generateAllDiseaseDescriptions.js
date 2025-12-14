/**
 * Script to generate descriptions for ALL conditions in diseaseToSpecialty mapping
 * This ensures every condition has at least a basic description
 */

const fs = require('fs');
const path = require('path');

// Load the existing comprehensive descriptions
let existingDescriptions = {};
try {
  const compModule = require('./comprehensiveDiseaseDescriptions');
  existingDescriptions = compModule.comprehensiveDiseaseDescriptions || {};
} catch (e) {
  // Start fresh
}

// Load diseaseToSpecialty mapping from search.js
// We'll read it from the file
const searchJsPath = path.join(__dirname, '..', 'routes', 'search.js');
const searchJsContent = fs.readFileSync(searchJsPath, 'utf8');

// Extract diseaseToSpecialty object (simplified extraction)
const diseaseToSpecialtyMatch = searchJsContent.match(/const diseaseToSpecialty = \{([\s\S]*?)\};/);
if (!diseaseToSpecialtyMatch) {
  console.error('Could not find diseaseToSpecialty in search.js');
  process.exit(1);
}

// Parse the disease keys (simplified - just get the keys)
const diseaseKeys = [];
const keyPattern = /['"]([^'"]+)['"]:\s*\[/g;
let match;
while ((match = keyPattern.exec(diseaseToSpecialtyMatch[1])) !== null) {
  diseaseKeys.push(match[1]);
}

// Function to generate a basic description based on condition name and specialty
function generateDescription(conditionName, specialties) {
  const lowerName = conditionName.toLowerCase();
  const name = conditionName.charAt(0).toUpperCase() + conditionName.slice(1);
  
  // Check if we already have a detailed description
  if (existingDescriptions[lowerName] || existingDescriptions[conditionName]) {
    return null; // Skip, we already have it
  }
  
  // Generate basic description based on specialty and condition type
  let description = '';
  let symptoms = [];
  let treatments = [];
  
  // Specialty-based descriptions
  if (specialties.includes('Neurology')) {
    description = `${name} is a neurological condition that affects the brain or nervous system.`;
    symptoms = ['headaches', 'dizziness', 'numbness or tingling', 'muscle weakness'];
  } else if (specialties.includes('Cardiology')) {
    description = `${name} is a cardiovascular condition that affects the heart or blood vessels.`;
    symptoms = ['chest pain', 'shortness of breath', 'irregular heartbeat', 'fatigue'];
  } else if (specialties.includes('Oncology')) {
    description = `${name} is a type of cancer that requires specialized oncology care.`;
    symptoms = ['unexplained weight loss', 'fatigue', 'persistent pain', 'changes in skin or moles'];
  } else if (specialties.includes('Orthopedics')) {
    description = `${name} is a condition affecting bones, joints, or muscles.`;
    symptoms = ['pain', 'stiffness', 'swelling', 'limited range of motion'];
  } else if (specialties.includes('Gastroenterology')) {
    description = `${name} is a digestive system condition affecting the stomach, intestines, or related organs.`;
    symptoms = ['abdominal pain', 'nausea', 'diarrhea or constipation', 'bloating'];
  } else if (specialties.includes('Endocrinology')) {
    description = `${name} is an endocrine disorder affecting hormone production or regulation.`;
    symptoms = ['fatigue', 'weight changes', 'mood changes', 'temperature sensitivity'];
  } else if (specialties.includes('Pulmonology')) {
    description = `${name} is a respiratory condition affecting the lungs or breathing.`;
    symptoms = ['shortness of breath', 'coughing', 'chest tightness', 'wheezing'];
  } else if (specialties.includes('Dermatology')) {
    description = `${name} is a skin condition that may require dermatological evaluation and treatment.`;
    symptoms = ['skin rash', 'itching', 'redness', 'skin changes'];
  } else if (specialties.includes('Psychiatry')) {
    description = `${name} is a mental health condition that may require psychiatric evaluation and treatment.`;
    symptoms = ['mood changes', 'anxiety', 'difficulty concentrating', 'sleep disturbances'];
  } else if (specialties.includes('Urology')) {
    description = `${name} is a urological condition affecting the urinary system or male reproductive organs.`;
    symptoms = ['urinary changes', 'pain during urination', 'frequent urination', 'pelvic discomfort'];
  } else if (specialties.includes('Rheumatology')) {
    description = `${name} is a rheumatic condition that may involve inflammation, pain, or autoimmune processes.`;
    symptoms = ['joint pain', 'stiffness', 'swelling', 'fatigue'];
  } else if (specialties.includes('Infectious Disease')) {
    description = `${name} is an infectious condition caused by bacteria, viruses, or other pathogens.`;
    symptoms = ['fever', 'fatigue', 'body aches', 'infection-related symptoms'];
  } else {
    description = `${name} is a medical condition that may require specialized care.`;
    symptoms = ['varies by condition'];
  }
  
  // Condition-specific enhancements
  if (lowerName.includes('pain')) {
    description = `${name} refers to discomfort or pain that may require medical evaluation.`;
    symptoms = ['pain', 'discomfort', 'tenderness'];
  } else if (lowerName.includes('infection')) {
    description = `${name} is an infection that may require antibiotic or antiviral treatment.`;
    symptoms = ['fever', 'inflammation', 'pain at infection site', 'fatigue'];
  } else if (lowerName.includes('cancer') || lowerName.includes('tumor')) {
    description = `${name} is a type of cancer that requires comprehensive oncology care including diagnosis, treatment planning, and ongoing management.`;
    symptoms = ['unexplained weight loss', 'fatigue', 'persistent symptoms', 'changes in affected area'];
    treatments = ['surgery', 'chemotherapy', 'radiation therapy', 'targeted therapy'];
  } else if (lowerName.includes('disease')) {
    // Already handled by specialty
  } else if (lowerName.includes('syndrome')) {
    description = `${name} is a syndrome characterized by a specific set of symptoms and signs.`;
  }
  
  // Generate basic treatments if not specified
  if (treatments.length === 0) {
    if (specialties.includes('Surgery')) {
      treatments = ['surgical evaluation', 'surgical intervention if needed', 'post-operative care'];
    } else {
      treatments = ['medications', 'lifestyle modifications', 'specialized treatment as needed'];
    }
  }
  
  return {
    name: name,
    description: description,
    symptoms: symptoms,
    treatments: treatments,
    specialties: specialties
  };
}

// Generate descriptions for all conditions
const allDescriptions = { ...existingDescriptions };

for (const conditionKey of diseaseKeys) {
  const lowerKey = conditionKey.toLowerCase();
  
  // Skip if we already have it
  if (allDescriptions[lowerKey] || allDescriptions[conditionKey]) {
    continue;
  }
  
  // Get specialties from diseaseToSpecialty (we'll need to parse this better)
  // For now, use a simplified approach - extract from the original string
  const specialtyMatch = searchJsContent.match(
    new RegExp(`['"]${conditionKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]:\\s*\\[([^\\]]+)\\]`, 'i')
  );
  
  let specialties = ['Internal Medicine']; // Default
  if (specialtyMatch) {
    specialties = specialtyMatch[1]
      .split(',')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(s => s);
  }
  
  const description = generateDescription(conditionKey, specialties);
  if (description) {
    allDescriptions[lowerKey] = description;
    
    // Also add variations
    const variations = [
      conditionKey.replace(/'/g, ''),
      conditionKey.replace(/'/g, 's'),
      conditionKey + ' disease',
      conditionKey + 's disease'
    ];
    
    for (const variation of variations) {
      if (variation !== lowerKey && !allDescriptions[variation.toLowerCase()]) {
        allDescriptions[variation.toLowerCase()] = description;
      }
    }
  }
}

// Generate output file
const outputCode = `// Comprehensive disease descriptions database for ALL conditions
// Auto-generated from diseaseToSpecialty mapping
// Generated: ${new Date().toISOString()}
// Total conditions: ${Object.keys(allDescriptions).length}

const comprehensiveDiseaseDescriptions = ${JSON.stringify(allDescriptions, null, 2)};

module.exports = { comprehensiveDiseaseDescriptions };
`;

const outputPath = path.join(__dirname, 'comprehensiveDiseaseDescriptions.js');
fs.writeFileSync(outputPath, outputCode, 'utf8');

console.log(`✅ Generated comprehensive disease database with ${Object.keys(allDescriptions).length} conditions`);
console.log(`   File: ${outputPath}`);
console.log(`   New conditions added: ${Object.keys(allDescriptions).length - Object.keys(existingDescriptions).length}`);

