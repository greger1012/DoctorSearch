// Disease service - handles loading disease info from multiple sources
// TODO: maybe consolidate these databases at some point, they're getting a bit messy

// Lazy load to avoid startup errors if files don't exist
let diseaseDetails = null;
let comprehensiveDiseaseDescriptions = null;

// Load detailed disease DB from NHS scraper (if available)
function loadDiseaseDetails() {
  if (diseaseDetails !== null) return diseaseDetails;
  
  try {
    const diseaseDetailsModule = require('../scripts/diseaseDetails');
    diseaseDetails = diseaseDetailsModule.diseaseDetails || {};
  } catch (e) {
    // File doesn't exist - that's fine, we have fallbacks
    diseaseDetails = {};
  }
  
  return diseaseDetails;
}

// Load comprehensive descriptions (the big merged database)
function loadComprehensiveDescriptions() {
  if (comprehensiveDiseaseDescriptions !== null) return comprehensiveDiseaseDescriptions;
  
  try {
    const comprehensiveModule = require('../scripts/comprehensiveDiseaseDescriptions');
    comprehensiveDiseaseDescriptions = comprehensiveModule.comprehensiveDiseaseDescriptions || {};
  } catch (e) {
    console.log('Note: Comprehensive disease descriptions not available.');
    comprehensiveDiseaseDescriptions = {};
  }
  
  return comprehensiveDiseaseDescriptions;
}

// Fallback descriptions for common diseases (in case detailed DB doesn't have them)
// This is a quick lookup for the most common searches
const commonDiseaseDescriptions = {
  "addison's": {
    name: "Addison's disease",
    description: "Addison's disease, also known as primary adrenal insufficiency, is a rare disorder where the adrenal glands don't produce enough cortisol and often aldosterone. This occurs when the adrenal cortex is damaged, usually by an autoimmune response.",
    symptoms: ["fatigue and weakness", "weight loss and decreased appetite", "darkening of the skin (hyperpigmentation)", "low blood pressure", "salt craving", "nausea and vomiting", "muscle and joint pain"],
    causes: ["autoimmune disease (most common)", "infections such as tuberculosis", "cancer", "bleeding into the adrenal glands"],
    treatments: ["hormone replacement therapy with corticosteroids", "lifelong medication to replace missing hormones", "dietary adjustments including increased salt intake"],
    specialties: ["Endocrinology"]
  },
  "addisons": {
    name: "Addison's disease",
    description: "Addison's disease, also known as primary adrenal insufficiency, is a rare disorder where the adrenal glands don't produce enough cortisol and often aldosterone.",
    symptoms: ["fatigue", "weight loss", "darkening of the skin", "low blood pressure"],
    treatments: ["hormone replacement therapy"],
    specialties: ["Endocrinology"]
  },
  "addison disease": {
    name: "Addison's disease",
    description: "Addison's disease is a rare disorder where the adrenal glands don't produce enough hormones, particularly cortisol and aldosterone.",
    symptoms: ["fatigue", "weight loss", "darkening of the skin", "low blood pressure"],
    treatments: ["hormone replacement therapy"],
    specialties: ["Endocrinology"]
  },
  "parkinson's": {
    name: "Parkinson's disease",
    description: "Parkinson's disease is a progressive neurological disorder that affects movement. It occurs when nerve cells in the brain that produce dopamine die or become impaired.",
    symptoms: ["tremors or shaking", "slowed movement (bradykinesia)", "rigid muscles", "impaired posture and balance", "loss of automatic movements", "speech changes", "writing changes"],
    treatments: ["medications to increase dopamine levels", "physical therapy", "speech therapy", "deep brain stimulation in advanced cases"],
    specialties: ["Neurology", "Movement Disorders"]
  },
  "parkinsons": {
    name: "Parkinson's disease",
    description: "Parkinson's disease is a progressive neurological disorder that affects movement and is caused by the loss of dopamine-producing cells in the brain.",
    symptoms: ["tremors", "slowed movement", "rigid muscles", "balance problems"],
    treatments: ["medications", "physical therapy", "deep brain stimulation"],
    specialties: ["Neurology"]
  },
  "alzheimer's": {
    name: "Alzheimer's disease",
    description: "Alzheimer's disease is a progressive brain disorder that slowly destroys memory and thinking skills, and eventually the ability to carry out simple tasks. It is the most common cause of dementia.",
    symptoms: ["memory loss", "difficulty with problem-solving", "confusion about time and place", "trouble understanding visual images", "problems with words in speaking or writing", "misplacing things", "poor judgment", "withdrawal from social activities"],
    treatments: ["medications to slow progression", "cognitive training", "supportive care", "lifestyle modifications"],
    specialties: ["Neurology", "Geriatrics"]
  },
  "alzheimers": {
    name: "Alzheimer's disease",
    description: "Alzheimer's disease is a progressive brain disorder that causes memory loss and cognitive decline, and is the most common form of dementia.",
    symptoms: ["memory loss", "confusion", "difficulty with daily tasks"],
    treatments: ["medications", "cognitive support"],
    specialties: ["Neurology"]
  },
  "crohn's": {
    name: "Crohn's disease",
    description: "Crohn's disease is a type of inflammatory bowel disease (IBD) that causes inflammation of the digestive tract, leading to abdominal pain, severe diarrhea, fatigue, weight loss, and malnutrition.",
    symptoms: ["abdominal pain and cramping", "diarrhea", "fatigue", "weight loss", "blood in stool", "mouth sores", "reduced appetite"],
    treatments: ["anti-inflammatory medications", "immune system suppressors", "antibiotics", "nutrition therapy", "surgery in severe cases"],
    specialties: ["Gastroenterology"]
  },
  "crohns": {
    name: "Crohn's disease",
    description: "Crohn's disease is an inflammatory bowel disease that causes chronic inflammation of the digestive tract.",
    symptoms: ["abdominal pain", "diarrhea", "weight loss"],
    treatments: ["medications", "dietary changes", "surgery"],
    specialties: ["Gastroenterology"]
  }
};

// Get disease details from detailed DB, trying various name formats
function getDiseaseDetails(diseaseName) {
  if (!diseaseName) return null;
  
  const details = loadDiseaseDetails();
  const lowerName = diseaseName.toLowerCase().trim();
  
  // Try exact match first
  if (details[lowerName]) {
    return details[lowerName];
  }
  
  // Try different variations (apostrophes, spaces, etc)
  const variations = [
    lowerName,
    lowerName.replace(/'/g, ''),
    lowerName.replace(/'/g, 's'),
    lowerName.replace(/\s+/g, '-'),
    lowerName.replace(/\s+/g, ' '),
    lowerName.replace(/[^a-z0-9\s-]/g, '')
  ];
  
  for (const variation of variations) {
    if (details[variation]) {
      return details[variation];
    }
  }
  
  // Last resort: partial match
  for (const [key, value] of Object.entries(details)) {
    if (key.includes(lowerName) || lowerName.includes(key)) {
      return value;
    }
  }
  
  return null;
}

// Get disease description from any available source (tries all DBs in order)
function getDiseaseDescription(diseaseName) {
  const lowerName = diseaseName.toLowerCase().trim();
  
  // First try detailed DB
  const detailed = getDiseaseDetails(diseaseName);
  if (detailed && (detailed.description || detailed.symptoms)) {
    return detailed;
  }
  
  // Then comprehensive
  const comprehensive = loadComprehensiveDescriptions();
  if (comprehensive[lowerName]) {
    return comprehensive[lowerName];
  }
  
  // Then common fallback
  if (commonDiseaseDescriptions[lowerName]) {
    return commonDiseaseDescriptions[lowerName];
  }
  
  // Try variations
  const variations = [
    lowerName.replace(/'/g, ''),
    lowerName.replace(/'/g, 's'),
    lowerName + ' disease',
    lowerName + 's disease',
    lowerName.replace(/\s+/g, '-'),
    lowerName.replace(/\s+/g, ' ')
  ];
  
  for (const variation of variations) {
    if (comprehensive[variation]) {
      return comprehensive[variation];
    }
    if (commonDiseaseDescriptions[variation]) {
      return commonDiseaseDescriptions[variation];
    }
  }
  
  return null;
}

module.exports = {
  getDiseaseDetails,
  getDiseaseDescription,
  loadDiseaseDetails,
  loadComprehensiveDescriptions
};

