// Specialty service - generates explanations for why specialties appear in results

const { containsKeyword } = require('../utils/stringHelpers');
const { getDiseaseDetails } = require('./diseaseService');

// Generate explanation for why a specialty matches
function explainSpecialtyMatch(specialtyName, query) {
  const loweredSpecialty = specialtyName.toLowerCase();
  const loweredQuery = query.toLowerCase();

  // Specialty descriptors - provide context about what each specialty does
  const descriptors = [
    {
      includes: ['hospitalist'],
      text: '{specialty} physicians coordinate inpatient care once someone is admitted. For concerns like internal bleeding, they guide rapid diagnostics, transfusion orders, and specialist consults while monitoring the patient 24/7.'
    },
    {
      includes: ['internal medicine'],
      text: '{specialty} clinicians are trained to handle complex medical crises that involve multiple organs. They are typically the first to evaluate internal bleeding, order imaging, stabilize vital signs, and route the case to surgery if needed.'
    },
    {
      includes: ['emergency medicine'],
      text: '{specialty} physicians run the emergency department. When the symptoms sound urgent—like internal bleeding—they lead the initial resuscitation and determine whether surgery or interventional radiology is required.'
    },
    {
      includes: ['general surgery', 'trauma', 'vascular surgery'],
      text: '{specialty} surgeons step in when bleeding must be stopped in the operating room, repairing organs, vessels, or trauma injuries.'
    },
    {
      includes: ['gastroenterology'],
      text: '{specialty} teams treat bleeding in the digestive tract by performing endoscopies to locate and cauterize the source.'
    },
    {
      includes: ['hematology', 'oncology'],
      text: '{specialty} specialists evaluate clotting disorders, anemia, or cancers that can trigger bleeding and tailor medication or transfusion plans.'
    },
    {
      includes: ['critical care', 'intensive care'],
      text: '{specialty} clinicians manage patients in the ICU when bleeding becomes life-threatening, overseeing ventilators, blood pressure support, and multi-organ care.'
    },
    {
      includes: ['neonatal', 'obstetric', 'maternal', 'midwife'],
      text: '{specialty} focuses on pregnancy, delivery, and newborn stabilization—so they are the right match when you ask for birth-related help.'
    },
    {
      includes: ['pediatric', 'child'],
      text: '{specialty} is dedicated to infants, kids, and teens.',
      requiresKeywords: ['child', 'kid', 'pediatric', 'teen', 'adolescent', 'baby', 'infant']
    },
    {
      includes: ['neurology', 'neurosurgery'],
      text: '{specialty} handles the brain and nervous system; neurological wording or concern about bleeding in the head routes to them.'
    },
    {
      includes: ['cardiology', 'cardiac'],
      text: '{specialty} looks after the heart and major vessels. If bleeding affects cardiovascular stability, these physicians coordinate advanced support.'
    },
    {
      includes: ['infectious'],
      text: '{specialty} doctors manage infections or sepsis that can either cause bleeding or complicate recovery.'
    }
  ];

  // Find matching descriptor (with keyword requirements check)
  const descriptor = descriptors.find(item => {
    const matchesSpecialty = item.includes.some(fragment => loweredSpecialty.includes(fragment));
    if (!matchesSpecialty) return false;
    
    // If descriptor requires specific keywords, check if they're in the query
    if (item.requiresKeywords && item.requiresKeywords.length > 0) {
      return containsKeyword(loweredQuery, item.requiresKeywords);
    }
    
    return true;
  });

  // Context-specific explanations based on query content
  const explanations = [
    {
      match: () =>
        containsKeyword(loweredQuery, ['birth', 'labor', 'delivery', 'pregnancy', 'postpartum', 'newborn', 'baby']) &&
        (loweredSpecialty.includes('neonatal') ||
          loweredSpecialty.includes('maternal') ||
          loweredSpecialty.includes('obstetric') ||
          loweredSpecialty.includes('midwife') ||
          loweredSpecialty.includes('obstetrics')),
      text: 'Because you asked about birth support, specialists such as {specialty} surface—they focus on pregnancy, delivery, and early newborn care at UCSF.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['child', 'kid', 'pediatric', 'teen', 'adolescent']) &&
        (loweredSpecialty.includes('pediatric') || loweredSpecialty.includes('child')),
      text: 'You mentioned care for children, so {specialty} appears prominently—they handle pediatric needs for the scenario you described.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['brain', 'neuro', 'seizure', 'memory']) &&
        loweredSpecialty.includes('neuro'),
      text: 'Neurology-focused teams like {specialty} match the neurological wording in your request.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['heart', 'cardio', 'cardiac']) &&
        (loweredSpecialty.includes('cardio') || loweredSpecialty.includes('heart')),
      text: '{specialty} shows up because the search includes heart-related language.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['cancer', 'oncology', 'tumor']) &&
        loweredSpecialty.includes('onco'),
      text: '{specialty} aligns with the oncology terms in the query.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['mental', 'behavioral', 'depression', 'anxiety', 'psychiatry']) &&
        (loweredSpecialty.includes('mental') ||
          loweredSpecialty.includes('psych') ||
          loweredSpecialty.includes('behavioral')),
      text: 'Behavioral-health specialists like {specialty} appear because of the mental health cues in your request.'
    }
  ];

  // Find matching explanation or use default
  const matchedExplanation = explanations.find(item => item.match());
  const baseText = matchedExplanation
    ? matchedExplanation.text
    : `Results emphasize {specialty} because that team frequently manages the scenario you described.`;

  // Get descriptor text if available
  const descriptorText = descriptor
    ? descriptor.text
    : loweredSpecialty.includes('nurse')
    ? `{specialty} clinicians provide bedside monitoring, triage, and procedure support, which keeps care moving quickly for this need.`
    : '';

  // Combine base explanation with descriptor
  return [baseText, descriptorText]
    .filter(Boolean)
    .join(' ')
    .replace('{specialty}', specialtyName);
}

// Build narrative explaining why certain specialties show up
function buildSpecialtyNarrative(query, topSpecialties = [], recognized = {}) {
  if (!topSpecialties.length) {
    return '';
  }

  // Check if we have disease information to enhance explanations
  const diseaseName = recognized.diseases?.[0];
  const diseaseInfo = diseaseName ? getDiseaseDetails(diseaseName) : null;
  
  // Generate explanations for top specialties
  const rawNarratives = topSpecialties.slice(0, 2).map(specialty => {
    let explanation = explainSpecialtyMatch(specialty.name, query);
    
    // Enhance explanation with disease-specific information if available
    if (diseaseInfo && diseaseInfo.specialties?.includes(specialty.name)) {
      if (diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0) {
        const relevantSymptoms = diseaseInfo.symptoms
          .filter(s => s.length > 15 && s.length < 100)
          .slice(0, 2);
        
        if (relevantSymptoms.length > 0) {
          explanation += ` These specialists are particularly skilled at managing conditions like ${diseaseName}, ` +
            `which can present with symptoms such as ${relevantSymptoms.join(' and ')}.`;
        }
      }
    }
    
    return explanation.replace('{specialty}', specialty.name);
  });

  const narratives = Array.from(new Set(rawNarratives));

  // Add explanation for recognized specialty if it's not in top results
  if (recognized.specialty && !topSpecialties.some(s => s.name === recognized.specialty)) {
    let additionalText = `We also factored in ${recognized.specialty}, which the query implies.`;
    
    if (diseaseInfo && diseaseInfo.description) {
      additionalText += ` ${recognized.specialty} specialists are trained to diagnose and treat this condition.`;
    }
    
    narratives.push(additionalText);
  }

  return narratives.join(' ');
}

module.exports = {
  explainSpecialtyMatch,
  buildSpecialtyNarrative
};

