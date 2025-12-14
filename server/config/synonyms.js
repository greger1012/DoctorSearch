// Synonym mappings - converts abbreviations to full names for better search matching

// Specialty synonyms
const specialtySynonyms = {
  cardio: 'Cardiology',
  cardiologist: 'Cardiology',
  cardiology: 'Cardiology',
  neuro: 'Neurology',
  neurologist: 'Neurology',
  neurology: 'Neurology',
  obgyn: 'Obstetrics & Gynecology',
  'ob-gyn': 'Obstetrics & Gynecology',
  ortho: 'Orthopedics',
  orthopedic: 'Orthopedics',
  orthopedics: 'Orthopedics',
  derm: 'Dermatology',
  dermatologist: 'Dermatology',
  dermato: 'Dermatology',
  psych: 'Psychiatry',
  psychiatrist: 'Psychiatry',
  ent: 'Otolaryngology',
  otolaryngology: 'Otolaryngology',
  primary: 'Primary Care',
  pediatric: 'Pediatrics',
  pediatrics: 'Pediatrics'
};

// Location synonyms - maps common names to standardized location data
const locationSynonyms = {
  parnassus: { filter: 'UCSF Medical Center', label: 'Parnassus Heights', code: 'PARN' },
  'parnassus heights': { filter: 'UCSF Medical Center', label: 'Parnassus Heights', code: 'PARN' },
  'mission bay': { filter: 'Mission Bay', label: 'Mission Bay', code: 'MZB' },
  'mt zion': { filter: 'Mount Zion', label: 'Mount Zion', code: 'MTZ' },
  'mount zion': { filter: 'Mount Zion', label: 'Mount Zion', code: 'MTZ' },
  sfg: { filter: 'San Francisco General', label: 'San Francisco General', code: 'SFGH' },
  sfghe: { filter: 'San Francisco General', label: 'San Francisco General', code: 'SFGH' },
  sfgeneral: { filter: 'San Francisco General', label: 'San Francisco General', code: 'SFGH' },
  'san francisco general': { filter: 'San Francisco General', label: 'San Francisco General', code: 'SFGH' },
  oakland: { filter: 'Oakland', label: 'Oakland', code: 'OAK' },
  berkeley: { filter: 'Berkeley', label: 'Berkeley' },
  'ucsf medical center': { filter: 'UCSF Medical Center', label: 'UCSF Medical Center', code: 'UCNAC' },
  'benioff children': { filter: "Benioff Children's Hospital", label: "Benioff Children's Hospital", code: 'CHILD' }
};

module.exports = {
  specialtySynonyms,
  locationSynonyms
};

