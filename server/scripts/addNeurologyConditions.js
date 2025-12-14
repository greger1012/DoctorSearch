// Script to add neurology conditions from email to comprehensiveDiseaseDescriptions
const fs = require('fs');
const path = require('path');

// Read the email file (it's in the project root)
// Try multiple possible paths
const possiblePaths = [
  path.join(__dirname, '../../email.txt'),
  path.join(process.cwd(), 'email.txt'),
  path.resolve(__dirname, '../../../email.txt')
];

let emailPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    emailPath = p;
    break;
  }
}

if (!emailPath) {
  console.error('Email file not found. Tried:', possiblePaths);
  process.exit(1);
}

console.log(`Reading email from: ${emailPath}`);
const stats = fs.statSync(emailPath);
console.log(`File size: ${stats.size} bytes`);
const emailContent = fs.readFileSync(emailPath, 'utf8');
console.log(`Read email file, ${emailContent.length} characters`);
if (emailContent.length === 0) {
  console.error('File appears to be empty or encoding issue');
  process.exit(1);
}

// Parse conditions from email
const lines = emailContent.split('\n');
const conditions = [];
let inConditionsSection = false;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  
  // Check if we've reached the Procedures section
  if (line.includes('Procedures & Treatments')) {
    break;
  }
  
  // Mark when we enter conditions section
  if (line.includes('Conditions & Symptoms')) {
    inConditionsSection = true;
    continue;
  }
  
  if (!inConditionsSection) continue;
  
  // Skip empty lines, URLs, page numbers, headers
  if (!line || 
      line.includes('http') || 
      line.match(/^\d+\/\d+$/) ||
      line.includes('Gmail') ||
      line.includes('Clinical Keywords') ||
      line === 'Searchable' ||
      line === 'Promoted Searchable' ||
      line.match(/^\d+$/)) {
    continue;
  }
  
  // Handle broken lines (like "f" followed by "latback syndrome")
  if (line === 'f' && i + 1 < lines.length) {
    const nextLine = lines[i + 1].trim();
    if (nextLine === 'latback syndrome') {
      conditions.push('flatback syndrome');
      i++; // Skip next line
      continue;
    }
    if (nextLine.includes('low diversion')) {
      // Skip this, it's a procedure
      i++;
      continue;
    }
  }
  
  // Check if next line is "Searchable" or "Promoted Searchable"
  if (i + 1 < lines.length) {
    const nextLine = lines[i + 1].trim();
    if (nextLine === 'Searchable' || nextLine === 'Promoted Searchable') {
      // This line is a condition
      if (line && 
          !line.includes('http') && 
          !line.match(/^\d+\/\d+$/) &&
          !line.includes('Gmail') &&
          !line.includes('Clinical Keywords') &&
          line !== 'Searchable' &&
          line !== 'Promoted Searchable' &&
          line !== 'Conditions & Symptoms' &&
          !line.match(/^\d+$/)) {
        conditions.push(line.toLowerCase());
      }
    }
  }
}

// Debug: show first few conditions found
if (conditions.length === 0) {
  console.log('Debug: No conditions found. Checking first 20 lines after "Conditions & Symptoms":');
  let foundSection = false;
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    if (lines[i].includes('Conditions & Symptoms')) {
      foundSection = true;
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        console.log(`Line ${j}: "${lines[j]}"`);
      }
      break;
    }
  }
}

// Remove duplicates and sort
const uniqueConditions = [...new Set(conditions)].sort();

console.log(`Found ${uniqueConditions.length} unique conditions`);

// Read existing comprehensiveDiseaseDescriptions
const dbPath = path.join(__dirname, 'comprehensiveDiseaseDescriptions.js');
let dbContent = fs.readFileSync(dbPath, 'utf8');

// Use require to load existing database
let existingDb = {};
try {
  const dbModule = require('./comprehensiveDiseaseDescriptions');
  existingDb = dbModule.comprehensiveDiseaseDescriptions || {};
} catch (e) {
  console.error('Could not load existing database:', e.message);
  process.exit(1);
}

// Generate descriptions for new conditions
const newEntries = {};
let addedCount = 0;
let skippedCount = 0;

uniqueConditions.forEach(condition => {
  // Skip if already exists
  if (existingDb[condition] || existingDb[condition.replace(/\s+/g, '-')] || existingDb[condition.replace(/\s+/g, '')]) {
    skippedCount++;
    return;
  }
  
  // Generate a basic description based on condition name
  const name = condition.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  let description = '';
  let symptoms = [];
  let treatments = [];
  
  // Generate context-aware descriptions
  if (condition.includes('tumor') || condition.includes('neoplasm') || condition.includes('cancer')) {
    description = `${name} is a type of brain or nervous system tumor that requires specialized neurological evaluation and treatment.`;
    symptoms = ['headaches', 'seizures', 'neurological deficits', 'cognitive changes'];
    treatments = ['surgical resection', 'radiation therapy', 'chemotherapy', 'targeted therapy'];
  } else if (condition.includes('aneurysm')) {
    description = `${name} is an abnormal bulging or ballooning of a blood vessel in the brain that can lead to serious complications if ruptured.`;
    symptoms = ['severe headache', 'vision changes', 'nausea', 'stiff neck'];
    treatments = ['surgical clipping', 'endovascular coiling', 'flow diversion', 'monitoring'];
  } else if (condition.includes('fracture') || condition.includes('injury')) {
    description = `${name} is a traumatic injury to the spine or nervous system that requires immediate medical attention.`;
    symptoms = ['pain', 'loss of sensation', 'weakness', 'difficulty moving'];
    treatments = ['immobilization', 'surgical stabilization', 'rehabilitation', 'pain management'];
  } else if (condition.includes('stenosis')) {
    description = `${name} is a narrowing of the spinal canal or neural foramina that can compress nerves and cause symptoms.`;
    symptoms = ['pain', 'numbness', 'weakness', 'difficulty walking'];
    treatments = ['physical therapy', 'medications', 'epidural injections', 'surgical decompression'];
  } else if (condition.includes('hernia') || condition.includes('herniated') || condition.includes('bulging')) {
    description = `${name} involves displacement of disc material that can compress spinal nerves.`;
    symptoms = ['back pain', 'radiating pain', 'numbness', 'weakness'];
    treatments = ['physical therapy', 'medications', 'epidural injections', 'surgical discectomy'];
  } else if (condition.includes('hemorrhage') || condition.includes('hematoma')) {
    description = `${name} is bleeding within or around the brain that requires urgent medical evaluation.`;
    symptoms = ['severe headache', 'altered consciousness', 'neurological deficits', 'nausea'];
    treatments = ['surgical evacuation', 'medical management', 'monitoring', 'rehabilitation'];
  } else if (condition.includes('hydrocephalus')) {
    description = `${name} is a condition where excess cerebrospinal fluid accumulates in the brain, causing increased pressure.`;
    symptoms = ['headaches', 'nausea', 'vision problems', 'cognitive changes'];
    treatments = ['shunt placement', 'endoscopic third ventriculostomy', 'medications', 'monitoring'];
  } else if (condition.includes('neuralgia') || condition.includes('neural')) {
    description = `${name} is a condition involving nerve pain or dysfunction that can cause significant discomfort.`;
    symptoms = ['sharp pain', 'burning sensation', 'numbness', 'tingling'];
    treatments = ['medications', 'nerve blocks', 'surgical decompression', 'physical therapy'];
  } else if (condition.includes('malformation') || condition.includes('avm')) {
    description = `${name} is an abnormal development of blood vessels in the brain or spine that may require treatment.`;
    symptoms = ['headaches', 'seizures', 'neurological deficits', 'bleeding'];
    treatments = ['surgical resection', 'endovascular embolization', 'stereotactic radiosurgery', 'monitoring'];
  } else if (condition.includes('syndrome')) {
    description = `${name} is a neurological syndrome that may involve multiple symptoms and requires comprehensive evaluation.`;
    symptoms = ['various neurological symptoms', 'pain', 'weakness', 'sensory changes'];
    treatments = ['symptom management', 'medications', 'physical therapy', 'surgical intervention when indicated'];
  } else if (condition.includes('cyst')) {
    description = `${name} is a fluid-filled sac in the brain or spine that may cause symptoms depending on size and location.`;
    symptoms = ['headaches', 'neurological deficits', 'seizures', 'vision problems'];
    treatments = ['monitoring', 'surgical drainage', 'surgical resection', 'symptom management'];
  } else if (condition.includes('infection') || condition.includes('abscess')) {
    description = `${name} is an infection of the central nervous system that requires prompt medical treatment.`;
    symptoms = ['fever', 'headaches', 'altered consciousness', 'neurological deficits'];
    treatments = ['antibiotics', 'antifungals', 'surgical drainage', 'supportive care'];
  } else if (condition.includes('sclerosis') || condition.includes('neurofibromatosis')) {
    description = `${name} is a genetic or acquired neurological condition that affects the nervous system.`;
    symptoms = ['various neurological symptoms', 'skin changes', 'tumors', 'cognitive changes'];
    treatments = ['symptom management', 'medications', 'surgical intervention', 'genetic counseling'];
  } else if (condition.includes('myelopathy') || condition.includes('radiculopathy')) {
    description = `${name} involves compression or dysfunction of the spinal cord or nerve roots.`;
    symptoms = ['weakness', 'numbness', 'difficulty walking', 'loss of coordination'];
    treatments = ['surgical decompression', 'medications', 'physical therapy', 'rehabilitation'];
  } else if (condition.includes('scoliosis') || condition.includes('kyphosis')) {
    description = `${name} is an abnormal curvature of the spine that may require treatment depending on severity.`;
    symptoms = ['back pain', 'postural changes', 'breathing difficulties', 'reduced mobility'];
    treatments = ['bracing', 'physical therapy', 'surgical correction', 'pain management'];
  } else {
    // Generic description for other conditions
    description = `${name} is a neurological condition that requires evaluation and treatment by a specialist.`;
    symptoms = ['various neurological symptoms', 'pain', 'weakness', 'sensory changes'];
    treatments = ['evaluation and diagnosis', 'medications', 'surgical intervention when indicated', 'rehabilitation'];
  }
  
  newEntries[condition] = {
    name: name,
    description: description,
    symptoms: symptoms,
    treatments: treatments,
    specialties: ['Neurology', 'Neurosurgery']
  };
  
  addedCount++;
});

console.log(`Adding ${addedCount} new conditions`);
console.log(`Skipping ${skippedCount} existing conditions`);

// Merge with existing database
const updatedDb = { ...existingDb, ...newEntries };

// Generate new file content
const newContent = `// Comprehensive disease descriptions database
// Includes specific diseases from NHS Inform
// Generated: ${new Date().toISOString()}
// Total conditions: ${Object.keys(updatedDb).length}

const comprehensiveDiseaseDescriptions = ${JSON.stringify(updatedDb, null, 2)};

module.exports = { comprehensiveDiseaseDescriptions };
`;

// Write back to file
fs.writeFileSync(dbPath, newContent, 'utf8');

console.log(`\nDone! Added ${addedCount} new conditions.`);
console.log(`Total conditions in database: ${Object.keys(updatedDb).length}`);

