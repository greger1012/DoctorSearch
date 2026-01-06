const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const router = express.Router();

// Load detailed disease information if available
let diseaseDetails = {};
try {
  const diseaseDetailsModule = require('../scripts/diseaseDetails');
  diseaseDetails = diseaseDetailsModule.diseaseDetails || {};
} catch (e) {
  // File doesn't exist or can't be loaded - that's okay, we'll use the basic mapping
}

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// Get all doctors with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      size = 20, 
      specialty, 
      location, 
      acceptingPatients,
      search 
    } = req.query;

    const from = (page - 1) * size;
    
    const query = {
      bool: {
        must: [
          { term: { type: 'doctor' } }
        ]
      }
    };

    // Add search term if provided
    if (search) {
      query.bool.must.push({
        multi_match: {
          query: search,
          fields: ['name^3', 'specialty^2', 'description^2'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Add filters
    if (specialty) {
      query.bool.filter = query.bool.filter || [];
      query.bool.filter.push({ term: { 'specialty.keyword': specialty } });
    }

    if (location) {
      query.bool.filter = query.bool.filter || [];
      query.bool.filter.push({ term: { 'location.keyword': location } });
    }

    if (acceptingPatients !== undefined) {
      query.bool.filter = query.bool.filter || [];
      query.bool.filter.push({ term: { acceptingPatients: acceptingPatients === 'true' } });
    }

    const response = await client.search({
      index: 'doctors',
      body: {
        query,
        from,
        size: parseInt(size),
        sort: [{ '_score': { order: 'desc' } }, { 'name.keyword': { order: 'asc' } }]
      }
    });

    res.json({
      doctors: response.body?.hits?.hits?.map(hit => hit._source) || [],
      total: response.body?.hits?.total?.value || 0,
      page: parseInt(page),
      size: parseInt(size)
    });

  } catch (error) {
    console.error('Doctors search error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Helper function to check if text contains keywords
function containsKeyword(text = '', keywords = []) {
  const lowered = text.toLowerCase();
  return keywords.some(keyword => lowered.includes(keyword));
}

/**
 * Get detailed disease information from the database
 */
function getDiseaseDetails(diseaseName) {
  if (!diseaseName) return null;
  
  const lowerName = diseaseName.toLowerCase().trim();
  
  // Try exact match first
  if (diseaseDetails[lowerName]) {
    return diseaseDetails[lowerName];
  }
  
  // Try variations
  const variations = [
    lowerName,
    lowerName.replace(/'/g, ''),
    lowerName.replace(/'/g, 's'),
    lowerName.replace(/\s+/g, '-'),
    lowerName.replace(/\s+/g, ' '),
    lowerName.replace(/[^a-z0-9\s-]/g, '')
  ];
  
  for (const variation of variations) {
    if (diseaseDetails[variation]) {
      return diseaseDetails[variation];
    }
  }
  
  // Try partial match
  for (const [key, details] of Object.entries(diseaseDetails)) {
    if (key.includes(lowerName) || lowerName.includes(key)) {
      return details;
    }
  }
  
  return null;
}

// Helper function to explain why a doctor matches a search query
function explainDoctorMatch(doctor, query) {
  if (!doctor || !query) {
    return null;
  }

  const specialty = doctor.specialty || '';
  const loweredSpecialty = specialty.toLowerCase();
  const loweredQuery = query.toLowerCase();
  
  // Try to identify disease from query
  let diseaseInfo = null;
  const queryWords = loweredQuery.split(/\s+/);
  for (const word of queryWords) {
    if (word.length > 3) {
      const found = getDiseaseDetails(word);
      if (found) {
        diseaseInfo = found;
        break;
      }
    }
  }
  
  // Also try full query
  if (!diseaseInfo) {
    diseaseInfo = getDiseaseDetails(loweredQuery);
  }

  const descriptors = [
    {
      includes: ['hospitalist'],
      text:
        '{specialty} physicians coordinate inpatient care once someone is admitted. For concerns like {query}, they guide rapid diagnostics, transfusion orders, and specialist consults while monitoring the patient 24/7.'
    },
    {
      includes: ['internal medicine'],
      text:
        '{specialty} clinicians are trained to handle complex medical crises that involve multiple organs. They are typically the first to evaluate {query}, order imaging, stabilize vital signs, and route the case to surgery if needed.'
    },
    {
      includes: ['emergency medicine'],
      text:
        '{specialty} physicians run the emergency department. When the symptoms sound urgent—like {query}—they lead the initial resuscitation and determine whether surgery or interventional radiology is required.'
    },
    {
      includes: ['general surgery', 'trauma', 'vascular surgery'],
      text:
        '{specialty} surgeons step in when {query} must be addressed in the operating room, repairing organs, vessels, or trauma injuries.'
    },
    {
      includes: ['gastroenterology'],
      text:
        '{specialty} teams treat {query} in the digestive tract by performing endoscopies to locate and cauterize the source.'
    },
    {
      includes: ['hematology', 'oncology'],
      text:
        '{specialty} specialists evaluate clotting disorders, anemia, or cancers that can trigger {query} and tailor medication or transfusion plans.'
    },
    {
      includes: ['critical care', 'intensive care'],
      text:
        '{specialty} clinicians manage patients in the ICU when {query} becomes life-threatening, overseeing ventilators, blood pressure support, and multi-organ care.'
    },
    {
      includes: ['neonatal', 'obstetric', 'maternal', 'midwife'],
      text:
        '{specialty} focuses on pregnancy, delivery, and newborn stabilization—so they are the right match when you ask about {query}.'
    },
    {
      includes: ['pediatric', 'child'],
      text:
        '{specialty} is dedicated to infants, kids, and teens, aligning with pediatric language in your query about {query}.'
    },
    {
      includes: ['neurology', 'neurosurgery'],
      text:
        '{specialty} handles the brain and nervous system; neurological wording or concern about {query} routes to them.'
    },
    {
      includes: ['cardiology', 'cardiac'],
      text:
        '{specialty} looks after the heart and major vessels. If {query} affects cardiovascular stability, these physicians coordinate advanced support.'
    },
    {
      includes: ['infectious'],
      text:
        '{specialty} doctors manage infections or sepsis that can either cause {query} or complicate recovery.'
    },
    {
      includes: ['dermatology'],
      text:
        '{specialty} physicians diagnose and treat skin conditions, including issues related to {query}.'
    },
    {
      includes: ['psychiatry', 'mental health', 'behavioral'],
      text:
        '{specialty} specialists address mental health concerns like {query}, providing evaluation, therapy, and medication management.'
    },
    {
      includes: ['orthopedic', 'orthopedics'],
      text:
        '{specialty} surgeons treat bone, joint, and muscle issues, including problems related to {query}.'
    },
    {
      includes: ['radiology'],
      text:
        '{specialty} physicians use imaging to diagnose {query}, helping guide treatment decisions.'
    }
  ];

  const descriptor = descriptors.find(item =>
    item.includes.some(fragment => loweredSpecialty.includes(fragment))
  );

  const explanations = [
    {
      match: () =>
        containsKeyword(loweredQuery, [
          'birth',
          'labor',
          'delivery',
          'pregnancy',
          'postpartum',
          'newborn',
          'baby'
        ]) &&
        (loweredSpecialty.includes('neonatal') ||
          loweredSpecialty.includes('maternal') ||
          loweredSpecialty.includes('obstetric') ||
          loweredSpecialty.includes('midwife') ||
          loweredSpecialty.includes('obstetrics')),
      text:
        'Because you asked about birth support, {name} specializes in {specialty}—they focus on pregnancy, delivery, and early newborn care at UCSF.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['child', 'kid', 'pediatric', 'teen', 'adolescent']) &&
        (loweredSpecialty.includes('pediatric') || loweredSpecialty.includes('child')),
      text:
        'You mentioned care for children, so {name} appears prominently—they specialize in {specialty} and handle pediatric needs for the scenario you described.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['brain', 'neuro', 'seizure', 'memory']) &&
        loweredSpecialty.includes('neuro'),
      text:
        'Neurology-focused specialists like {name} match the neurological wording in your request. Their expertise in {specialty} makes them well-suited for this need.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['heart', 'cardio', 'cardiac']) &&
        (loweredSpecialty.includes('cardio') || loweredSpecialty.includes('heart')),
      text:
        '{name} specializes in {specialty}, which shows up because the search includes heart-related language.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['cancer', 'oncology', 'tumor']) &&
        loweredSpecialty.includes('onco'),
      text:
        '{name} aligns with the oncology terms in the query through their specialization in {specialty}.'
    },
    {
      match: () =>
        containsKeyword(loweredQuery, ['mental', 'behavioral', 'depression', 'anxiety', 'psychiatry']) &&
        (loweredSpecialty.includes('mental') ||
          loweredSpecialty.includes('psych') ||
          loweredSpecialty.includes('behavioral')),
      text:
        'Behavioral-health specialists like {name} appear because of the mental health cues in your request. Their expertise in {specialty} makes them a good match.'
    }
  ];

  const matchedExplanation = explanations.find(item => item.match());
  
  let baseText = '';
  let additionalContext = '';
  
  // Build base explanation
  if (matchedExplanation) {
    baseText = matchedExplanation.text;
  } else if (descriptor) {
    baseText = `{name} specializes in {specialty}. ${descriptor.text}`;
  } else {
    baseText = '{name} specializes in {specialty}, which is relevant to your search for "{query}".';
  }
  
  // Enhance with disease information if available
  if (diseaseInfo) {
    const diseaseName = diseaseInfo.name || query;
    
    // Check if doctor's specialty matches the disease's recommended specialties
    const doctorSpecialtyMatches = diseaseInfo.specialties?.some(spec => 
      loweredSpecialty.includes(spec.toLowerCase())
    );
    
    if (doctorSpecialtyMatches) {
      // Add detailed context about the condition
      if (diseaseInfo.description && diseaseInfo.description.length > 20) {
        additionalContext += ` ${diseaseInfo.description.substring(0, 150)}`;
      }
      
      // Add symptom context if relevant
      if (diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0) {
        const relevantSymptoms = diseaseInfo.symptoms
          .filter(s => s.length > 15 && s.length < 100)
          .slice(0, 2);
        
        if (relevantSymptoms.length > 0) {
          additionalContext += ` This condition commonly presents with symptoms such as ${relevantSymptoms.join(' and ')}.`;
        }
      }
      
      // Add treatment context
      if (diseaseInfo.treatments && diseaseInfo.treatments.length > 0) {
        const treatmentInfo = diseaseInfo.treatments
          .filter(t => t.length > 20 && t.length < 150)
          .slice(0, 1)[0];
        
        if (treatmentInfo) {
          additionalContext += ` Treatment typically involves ${treatmentInfo.toLowerCase()}.`;
        }
      }
      
      // Add connection explanation
      if (additionalContext) {
        additionalContext = ` ${diseaseName} is a condition that ${specialty} specialists are trained to diagnose and manage.` + additionalContext;
      } else {
        additionalContext = ` ${diseaseName} is a condition that ${specialty} specialists are trained to diagnose and manage.`;
      }
    }
  }

  // Replace placeholders
  const doctorName = doctor.name || 'This doctor';
  let explanation = baseText
    .replace(/{name}/g, doctorName)
    .replace(/{specialty}/g, specialty)
    .replace(/{query}/g, query);
  
  // Append additional context
  if (additionalContext) {
    explanation += additionalContext;
  }

  return explanation;
}

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { query } = req.query; // Optional search query for explanation
    
    const response = await client.get({
      index: 'doctors',
      id: id
    });

    // Handle both old and new Elasticsearch client response formats
    const doctor = response._source || response.body?._source || {};
    
    // If a query is provided, generate an explanation
    if (query) {
      doctor.matchExplanation = explainDoctorMatch(doctor, query);
    }
    
    res.json(doctor);
  } catch (error) {
    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Doctor not found' });
    } else {
      console.error('Doctor fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch doctor' });
    }
  }
});

// Get available specialties
router.get('/specialties/list', async (req, res) => {
  try {
    const response = await client.search({
      index: 'doctors',
      body: {
        aggs: {
          specialties: {
            terms: {
              field: 'specialty.keyword',
              size: 100
            }
          }
        },
        size: 0
      }
    });

    const aggSource = response?.aggregations || response?.body?.aggregations || {};
    const specialties = aggSource.specialties?.buckets?.map(bucket => bucket.key) || [];

    res.json(specialties);
  } catch (error) {
    console.error('Specialties fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch specialties' });
  }
});

// Get available practice locations (from doctors - for backward compatibility)
// NOTE: Use /api/locations/list for all locations from LocationCatalog
router.get('/locations/list', async (req, res) => {
  try {
    const response = await client.search({
      index: 'doctors',
      body: {
        aggs: {
          locations: {
            terms: {
              field: 'location.keyword',
              size: 200  // Increased size
            }
          }
        },
        size: 0
      }
    });

    const aggSource = response?.aggregations || response?.body?.aggregations || {};
    const locations = aggSource.locations?.buckets?.map(bucket => bucket.key) || [];

    res.json(locations);
  } catch (error) {
    console.error('Locations list fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

module.exports = router;
