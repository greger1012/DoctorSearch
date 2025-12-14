// Search route - handles all search endpoints
// Does natural language parsing, Elasticsearch queries, and generates AI summaries

const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const router = express.Router();

// Imports
const { escapeRegExp, toTitleCase, containsKeyword, cleanseQueryString, normalizeBoolean } = require('../utils/stringHelpers');
const { formatDate, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } = require('../utils/dateHelpers');
const { VOCAB_CACHE_TTL_MS, MONTH_NAMES } = require('../config/constants');
const { specialtySynonyms, locationSynonyms } = require('../config/synonyms');
const { getDiseaseDetails, getDiseaseDescription } = require('../services/diseaseService');
const { explainSpecialtyMatch, buildSpecialtyNarrative } = require('../services/specialtyService');
const { generateAISummary, generateDiseaseExplanation } = require('../services/llmService');

// Elasticsearch client
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

// Load disease databases
let comprehensiveDiseaseDescriptions = {};
try {
  const comprehensiveModule = require('../scripts/comprehensiveDiseaseDescriptions');
  comprehensiveDiseaseDescriptions = comprehensiveModule.comprehensiveDiseaseDescriptions || {};
} catch (e) {
  console.log('Note: Comprehensive disease descriptions not available.');
}

// Disease to specialty mapping - helps match user queries to the right doctors
// TODO: This is getting pretty long, might want to move to a separate file eventually
const diseaseToSpecialty = {
  // Neurology conditions
  'parkinson': ['Neurology', 'Movement Disorders'],
  'parkinsons': ['Neurology', 'Movement Disorders'],
  'parkinson\'s': ['Neurology', 'Movement Disorders'],
  'parkinsons disease': ['Neurology', 'Movement Disorders'],
  'alzheimer': ['Neurology', 'Memory Disorders'],
  'alzheimers': ['Neurology', 'Memory Disorders'],
  'alzheimer\'s': ['Neurology', 'Memory Disorders'],
  'dementia': ['Neurology', 'Memory Disorders', 'Geriatrics'],
  'epilepsy': ['Neurology', 'Epilepsy'],
  'seizure': ['Neurology', 'Epilepsy'],
  'seizures': ['Neurology', 'Epilepsy'],
  'stroke': ['Neurology', 'Stroke', 'Emergency Medicine'],
  'multiple sclerosis': ['Neurology', 'Multiple Sclerosis'],
  'ms': ['Neurology', 'Multiple Sclerosis'],
  'migraine': ['Neurology', 'Headache'],
  'headache': ['Neurology', 'Headache'],
  'headaches': ['Neurology', 'Headache'],
  'als': ['Neurology', 'Neuromuscular'],
  'amyotrophic lateral sclerosis': ['Neurology', 'Neuromuscular'],
  'huntington': ['Neurology', 'Movement Disorders'],
  'huntingtons': ['Neurology', 'Movement Disorders'],
  'tourette': ['Neurology', 'Movement Disorders'],
  'tourettes': ['Neurology', 'Movement Disorders'],
  'tremor': ['Neurology', 'Movement Disorders'],
  'neuropathy': ['Neurology', 'Peripheral Nerve'],
  'peripheral neuropathy': ['Neurology', 'Peripheral Nerve'],
  'bell\'s palsy': ['Neurology'],
  'bells palsy': ['Neurology'],
  'concussion': ['Neurology', 'Sports Medicine'],
  'tbi': ['Neurology', 'Trauma'],
  'traumatic brain injury': ['Neurology', 'Trauma'],
  'brain tumor': ['Neurology', 'Neurosurgery', 'Oncology'],
  'brain cancer': ['Neurology', 'Neurosurgery', 'Oncology'],
  
  // Cardiology conditions
  'heart attack': ['Cardiology', 'Emergency Medicine'],
  'myocardial infarction': ['Cardiology', 'Emergency Medicine'],
  'mi': ['Cardiology', 'Emergency Medicine'],
  'chest pain': ['Cardiology', 'Emergency Medicine'],
  'arrhythmia': ['Cardiology', 'Electrophysiology'],
  'atrial fibrillation': ['Cardiology', 'Electrophysiology'],
  'afib': ['Cardiology', 'Electrophysiology'],
  'heart failure': ['Cardiology', 'Heart Failure'],
  'congestive heart failure': ['Cardiology', 'Heart Failure'],
  'chf': ['Cardiology', 'Heart Failure'],
  'hypertension': ['Cardiology', 'Internal Medicine'],
  'high blood pressure': ['Cardiology', 'Internal Medicine'],
  'coronary artery disease': ['Cardiology', 'Interventional Cardiology'],
  'cad': ['Cardiology', 'Interventional Cardiology'],
  'angina': ['Cardiology', 'Interventional Cardiology'],
  'valve disease': ['Cardiology', 'Cardiac Surgery'],
  'heart valve': ['Cardiology', 'Cardiac Surgery'],
  'aortic stenosis': ['Cardiology', 'Cardiac Surgery'],
  'mitral regurgitation': ['Cardiology', 'Cardiac Surgery'],
  'cardiomyopathy': ['Cardiology', 'Heart Failure'],
  'palpitations': ['Cardiology', 'Electrophysiology'],
  
  // Oncology/Cancer
  'cancer': ['Oncology', 'Medical Oncology'],
  'tumor': ['Oncology', 'Surgical Oncology'],
  'tumour': ['Oncology', 'Surgical Oncology'],
  'leukemia': ['Oncology', 'Hematology'],
  'lymphoma': ['Oncology', 'Hematology'],
  'breast cancer': ['Oncology', 'Surgical Oncology', 'Breast Surgery'],
  'lung cancer': ['Oncology', 'Medical Oncology', 'Pulmonology'],
  'colon cancer': ['Oncology', 'Surgical Oncology', 'Gastroenterology'],
  'colorectal cancer': ['Oncology', 'Surgical Oncology', 'Gastroenterology'],
  'prostate cancer': ['Oncology', 'Urology'],
  'skin cancer': ['Oncology', 'Dermatology'],
  'melanoma': ['Oncology', 'Dermatology'],
  'chemotherapy': ['Oncology', 'Medical Oncology'],
  'radiation': ['Oncology', 'Radiation Oncology'],
  'radiotherapy': ['Oncology', 'Radiation Oncology'],
  
  // Orthopedics
  'fracture': ['Orthopedics', 'Trauma'],
  'broken bone': ['Orthopedics', 'Trauma'],
  'arthritis': ['Orthopedics', 'Rheumatology'],
  'osteoarthritis': ['Orthopedics', 'Rheumatology'],
  'rheumatoid arthritis': ['Rheumatology'],
  'ra': ['Rheumatology'],
  'back pain': ['Orthopedics', 'Spine', 'Physical Medicine'],
  'neck pain': ['Orthopedics', 'Spine', 'Physical Medicine'],
  'herniated disc': ['Orthopedics', 'Spine'],
  'sciatica': ['Orthopedics', 'Spine'],
  'torn acl': ['Orthopedics', 'Sports Medicine'],
  'acl tear': ['Orthopedics', 'Sports Medicine'],
  'rotator cuff': ['Orthopedics', 'Sports Medicine'],
  'carpal tunnel': ['Orthopedics', 'Hand Surgery'],
  'hip replacement': ['Orthopedics', 'Joint Replacement'],
  'knee replacement': ['Orthopedics', 'Joint Replacement'],
  'osteoporosis': ['Orthopedics', 'Endocrinology'],
  
  // Gastroenterology
  'crohn': ['Gastroenterology'],
  'crohns': ['Gastroenterology'],
  'crohn\'s disease': ['Gastroenterology'],
  'ulcerative colitis': ['Gastroenterology'],
  'uc': ['Gastroenterology'],
  'ibd': ['Gastroenterology'],
  'ibs': ['Gastroenterology'],
  'irritable bowel': ['Gastroenterology'],
  'celiac': ['Gastroenterology'],
  'celiac disease': ['Gastroenterology'],
  'hepatitis': ['Gastroenterology', 'Hepatology'],
  'cirrhosis': ['Gastroenterology', 'Hepatology'],
  'liver disease': ['Gastroenterology', 'Hepatology'],
  'pancreatitis': ['Gastroenterology'],
  'gallstones': ['Gastroenterology', 'General Surgery'],
  'gastritis': ['Gastroenterology'],
  'gerd': ['Gastroenterology'],
  'acid reflux': ['Gastroenterology'],
  'ulcer': ['Gastroenterology'],
  'peptic ulcer': ['Gastroenterology'],
  
  // Endocrinology/Diabetes
  'diabetes': ['Endocrinology', 'Diabetes'],
  'type 1 diabetes': ['Endocrinology', 'Diabetes'],
  'type 2 diabetes': ['Endocrinology', 'Diabetes'],
  'diabetic': ['Endocrinology', 'Diabetes'],
  'thyroid': ['Endocrinology'],
  'hypothyroidism': ['Endocrinology'],
  'hyperthyroidism': ['Endocrinology'],
  'hashimoto': ['Endocrinology'],
  'graves disease': ['Endocrinology'],
  'adrenal': ['Endocrinology'],
  'cushing': ['Endocrinology'],
  'addison': ['Endocrinology'],
  
  // Pulmonology/Respiratory
  'asthma': ['Pulmonology', 'Allergy'],
  'copd': ['Pulmonology'],
  'chronic obstructive pulmonary disease': ['Pulmonology'],
  'emphysema': ['Pulmonology'],
  'bronchitis': ['Pulmonology', 'Internal Medicine'],
  'pneumonia': ['Pulmonology', 'Infectious Disease', 'Internal Medicine'],
  'sleep apnea': ['Pulmonology', 'Sleep Medicine'],
  'pulmonary fibrosis': ['Pulmonology'],
  'sarcoidosis': ['Pulmonology', 'Rheumatology'],
  
  // Nephrology/Kidney
  'kidney disease': ['Nephrology'],
  'kidney failure': ['Nephrology'],
  'renal failure': ['Nephrology'],
  'ckd': ['Nephrology'],
  'chronic kidney disease': ['Nephrology'],
  'dialysis': ['Nephrology'],
  'kidney stones': ['Nephrology', 'Urology'],
  'nephritis': ['Nephrology'],
  
  // Urology
  'prostate': ['Urology'],
  'bph': ['Urology'],
  'benign prostatic hyperplasia': ['Urology'],
  'urinary tract infection': ['Urology', 'Infectious Disease'],
  'uti': ['Urology', 'Infectious Disease'],
  'incontinence': ['Urology', 'Gynecology'],
  'kidney stones': ['Urology', 'Nephrology'],
  'bladder cancer': ['Urology', 'Oncology'],
  'testicular cancer': ['Urology', 'Oncology'],
  'erectile dysfunction': ['Urology'],
  'ed': ['Urology'],
  
  // Dermatology
  'eczema': ['Dermatology', 'Allergy'],
  'psoriasis': ['Dermatology', 'Rheumatology'],
  'acne': ['Dermatology'],
  'rosacea': ['Dermatology'],
  'melanoma': ['Dermatology', 'Oncology'],
  'skin cancer': ['Dermatology', 'Oncology'],
  'basal cell': ['Dermatology', 'Oncology'],
  'squamous cell': ['Dermatology', 'Oncology'],
  'mole': ['Dermatology'],
  'rash': ['Dermatology', 'Allergy'],
  'hives': ['Dermatology', 'Allergy'],
  
  // Psychiatry/Mental Health
  'depression': ['Psychiatry', 'Mental Health'],
  'anxiety': ['Psychiatry', 'Mental Health'],
  'bipolar': ['Psychiatry', 'Mental Health'],
  'bipolar disorder': ['Psychiatry', 'Mental Health'],
  'schizophrenia': ['Psychiatry', 'Mental Health'],
  'ptsd': ['Psychiatry', 'Mental Health'],
  'post traumatic stress': ['Psychiatry', 'Mental Health'],
  'ocd': ['Psychiatry', 'Mental Health'],
  'obsessive compulsive': ['Psychiatry', 'Mental Health'],
  'adhd': ['Psychiatry', 'Mental Health', 'Pediatrics'],
  'attention deficit': ['Psychiatry', 'Mental Health', 'Pediatrics'],
  'autism': ['Psychiatry', 'Developmental', 'Pediatrics'],
  'autism spectrum': ['Psychiatry', 'Developmental', 'Pediatrics'],
  'eating disorder': ['Psychiatry', 'Mental Health'],
  'anorexia': ['Psychiatry', 'Mental Health'],
  'bulimia': ['Psychiatry', 'Mental Health'],
  
  // Obstetrics & Gynecology
  'pregnancy': ['Obstetrics & Gynecology'],
  'prenatal': ['Obstetrics & Gynecology'],
  'maternity': ['Obstetrics & Gynecology'],
  'labor': ['Obstetrics & Gynecology'],
  'delivery': ['Obstetrics & Gynecology'],
  'menopause': ['Obstetrics & Gynecology', 'Endocrinology'],
  'endometriosis': ['Obstetrics & Gynecology'],
  'fibroids': ['Obstetrics & Gynecology'],
  'ovarian cyst': ['Obstetrics & Gynecology'],
  'pcos': ['Obstetrics & Gynecology', 'Endocrinology'],
  'polycystic ovary': ['Obstetrics & Gynecology', 'Endocrinology'],
  'infertility': ['Obstetrics & Gynecology', 'Reproductive Endocrinology'],
  'pap smear': ['Obstetrics & Gynecology'],
  'mammogram': ['Obstetrics & Gynecology', 'Radiology'],
  
  // Pediatrics
  'adhd': ['Pediatrics', 'Psychiatry'],
  'autism': ['Pediatrics', 'Psychiatry'],
  'asthma': ['Pediatrics', 'Pulmonology'],
  'diabetes': ['Pediatrics', 'Endocrinology'],
  'type 1 diabetes': ['Pediatrics', 'Endocrinology'],
  'juvenile diabetes': ['Pediatrics', 'Endocrinology'],
  
  // Infectious Disease
  'hiv': ['Infectious Disease'],
  'aids': ['Infectious Disease'],
  'tuberculosis': ['Infectious Disease', 'Pulmonology'],
  'tb': ['Infectious Disease', 'Pulmonology'],
  'sepsis': ['Infectious Disease', 'Critical Care', 'Emergency Medicine'],
  'mrsa': ['Infectious Disease'],
  'covid': ['Infectious Disease', 'Pulmonology', 'Internal Medicine'],
  'coronavirus': ['Infectious Disease', 'Pulmonology', 'Internal Medicine'],
  'flu': ['Infectious Disease', 'Internal Medicine'],
  'influenza': ['Infectious Disease', 'Internal Medicine'],
  'pneumonia': ['Infectious Disease', 'Pulmonology'],
  
  // Ophthalmology
  'cataract': ['Ophthalmology'],
  'glaucoma': ['Ophthalmology'],
  'macular degeneration': ['Ophthalmology'],
  'retinal detachment': ['Ophthalmology'],
  'diabetic retinopathy': ['Ophthalmology', 'Endocrinology'],
  'eye infection': ['Ophthalmology'],
  'conjunctivitis': ['Ophthalmology'],
  'pink eye': ['Ophthalmology'],
  
  // ENT/Otolaryngology
  'sinusitis': ['Otolaryngology'],
  'sinus infection': ['Otolaryngology'],
  'tonsillitis': ['Otolaryngology'],
  'ear infection': ['Otolaryngology'],
  'otitis media': ['Otolaryngology'],
  'hearing loss': ['Otolaryngology', 'Audiology'],
  'tinnitus': ['Otolaryngology'],
  'vertigo': ['Otolaryngology', 'Neurology'],
  'meniere': ['Otolaryngology', 'Neurology'],
  'sleep apnea': ['Otolaryngology', 'Pulmonology'],
  'snoring': ['Otolaryngology', 'Pulmonology'],
  
  // Rheumatology
  'lupus': ['Rheumatology'],
  'sle': ['Rheumatology'],
  'systemic lupus': ['Rheumatology'],
  'rheumatoid arthritis': ['Rheumatology'],
  'ra': ['Rheumatology'],
  'fibromyalgia': ['Rheumatology', 'Physical Medicine'],
  'gout': ['Rheumatology'],
  'sjogren': ['Rheumatology'],
  'scleroderma': ['Rheumatology'],
  
  // Emergency/Trauma
  'trauma': ['Emergency Medicine', 'Trauma Surgery'],
  'injury': ['Emergency Medicine', 'Orthopedics'],
  'accident': ['Emergency Medicine', 'Trauma Surgery'],
  'emergency': ['Emergency Medicine'],
  
  // General/Internal Medicine
  'hypertension': ['Internal Medicine', 'Cardiology'],
  'high blood pressure': ['Internal Medicine', 'Cardiology'],
  'diabetes': ['Internal Medicine', 'Endocrinology'],
  'cholesterol': ['Internal Medicine', 'Cardiology'],
  'high cholesterol': ['Internal Medicine', 'Cardiology'],
  'obesity': ['Internal Medicine', 'Endocrinology', 'Bariatric Surgery'],
  'weight loss': ['Internal Medicine', 'Endocrinology', 'Bariatric Surgery'],
  'fatigue': ['Internal Medicine'],
  'anemia': ['Internal Medicine', 'Hematology'],
  'iron deficiency': ['Internal Medicine', 'Hematology'],
  
  // Additional Common Conditions (A-Z from NHS Inform)
  // A
  'abscess': ['General Surgery', 'Infectious Disease'],
  'acne': ['Dermatology'],
  'addison disease': ['Endocrinology'],
  'adhd': ['Psychiatry', 'Pediatrics'],
  'aids': ['Infectious Disease'],
  'alcohol misuse': ['Psychiatry', 'Addiction Medicine'],
  'allergy': ['Allergy', 'Immunology'],
  'alzheimer disease': ['Neurology'],
  'anemia': ['Hematology', 'Internal Medicine'],
  'angina': ['Cardiology'],
  'anorexia': ['Psychiatry', 'Mental Health'],
  'anxiety': ['Psychiatry'],
  'appendicitis': ['General Surgery', 'Emergency Medicine'],
  'arthritis': ['Rheumatology', 'Orthopedics'],
  'asthma': ['Pulmonology', 'Allergy'],
  'athlete foot': ['Dermatology'],
  'autism': ['Psychiatry', 'Pediatrics', 'Developmental'],
  
  // B
  'back pain': ['Orthopedics', 'Physical Medicine'],
  'bad breath': ['Dentistry', 'Otolaryngology'],
  'baldness': ['Dermatology'],
  'bedwetting': ['Urology', 'Pediatrics'],
  'bell palsy': ['Neurology'],
  'bipolar disorder': ['Psychiatry'],
  'bladder infection': ['Urology'],
  'bleeding': ['Emergency Medicine', 'Hematology'],
  'blood clot': ['Hematology', 'Emergency Medicine'],
  'blood pressure': ['Cardiology', 'Internal Medicine'],
  'boil': ['Dermatology', 'Infectious Disease'],
  'bowel cancer': ['Oncology', 'Gastroenterology'],
  'brain tumor': ['Neurology', 'Neurosurgery', 'Oncology'],
  'breast cancer': ['Oncology', 'Surgical Oncology'],
  'bronchitis': ['Pulmonology'],
  'bruise': ['Emergency Medicine', 'Hematology'],
  'bulimia': ['Psychiatry'],
  'bunion': ['Orthopedics', 'Podiatry'],
  
  // C
  'cancer': ['Oncology'],
  'carpal tunnel': ['Orthopedics', 'Hand Surgery'],
  'cataract': ['Ophthalmology'],
  'cellulitis': ['Infectious Disease', 'Dermatology'],
  'chest infection': ['Pulmonology', 'Infectious Disease'],
  'chest pain': ['Cardiology', 'Emergency Medicine'],
  'chickenpox': ['Infectious Disease', 'Pediatrics'],
  'chlamydia': ['Infectious Disease', 'Urology'],
  'cholesterol': ['Cardiology', 'Internal Medicine'],
  'chronic fatigue': ['Internal Medicine', 'Rheumatology'],
  'cold': ['Internal Medicine', 'Infectious Disease'],
  'cold sore': ['Dermatology', 'Infectious Disease'],
  'colitis': ['Gastroenterology'],
  'colon cancer': ['Oncology', 'Gastroenterology'],
  'concussion': ['Neurology', 'Sports Medicine'],
  'constipation': ['Gastroenterology'],
  'copd': ['Pulmonology'],
  'coronary heart disease': ['Cardiology'],
  'cough': ['Pulmonology', 'Internal Medicine'],
  'covid': ['Infectious Disease', 'Pulmonology'],
  'crohn disease': ['Gastroenterology'],
  'cyst': ['General Surgery', 'Dermatology'],
  'cystitis': ['Urology'],
  
  // D
  'dandruff': ['Dermatology'],
  'deafness': ['Otolaryngology', 'Audiology'],
  'deep vein thrombosis': ['Hematology', 'Emergency Medicine'],
  'dvt': ['Hematology', 'Emergency Medicine'],
  'dementia': ['Neurology', 'Geriatrics'],
  'depression': ['Psychiatry'],
  'dermatitis': ['Dermatology', 'Allergy'],
  'diabetes': ['Endocrinology'],
  'diarrhea': ['Gastroenterology', 'Infectious Disease'],
  'diverticulitis': ['Gastroenterology', 'General Surgery'],
  'dizziness': ['Neurology', 'Otolaryngology'],
  'down syndrome': ['Pediatrics', 'Genetics'],
  'dry eye': ['Ophthalmology'],
  'dyslexia': ['Psychiatry', 'Pediatrics'],
  
  // E
  'earache': ['Otolaryngology'],
  'ear infection': ['Otolaryngology'],
  'eating disorder': ['Psychiatry'],
  'eczema': ['Dermatology', 'Allergy'],
  'edema': ['Internal Medicine', 'Cardiology'],
  'endometriosis': ['Obstetrics & Gynecology'],
  'epilepsy': ['Neurology'],
  'erectile dysfunction': ['Urology'],
  'eye infection': ['Ophthalmology'],
  'eye strain': ['Ophthalmology'],
  
  // F
  'fainting': ['Neurology', 'Cardiology', 'Emergency Medicine'],
  'fever': ['Infectious Disease', 'Internal Medicine'],
  'fibroids': ['Obstetrics & Gynecology'],
  'fibromyalgia': ['Rheumatology', 'Physical Medicine'],
  'flatulence': ['Gastroenterology'],
  'flu': ['Infectious Disease'],
  'food poisoning': ['Gastroenterology', 'Infectious Disease'],
  'fracture': ['Orthopedics'],
  'fungal infection': ['Dermatology', 'Infectious Disease'],
  
  // G
  'gallstones': ['Gastroenterology', 'General Surgery'],
  'ganglion': ['Orthopedics', 'Hand Surgery'],
  'gastritis': ['Gastroenterology'],
  'gastroenteritis': ['Gastroenterology', 'Infectious Disease'],
  'genital herpes': ['Infectious Disease', 'Urology'],
  'genital warts': ['Infectious Disease', 'Urology'],
  'gerd': ['Gastroenterology'],
  'gingivitis': ['Dentistry'],
  'glaucoma': ['Ophthalmology'],
  'gout': ['Rheumatology'],
  'gum disease': ['Dentistry'],
  
  // H
  'hair loss': ['Dermatology'],
  'hay fever': ['Allergy', 'Immunology'],
  'headache': ['Neurology'],
  'head lice': ['Dermatology', 'Pediatrics'],
  'hearing loss': ['Otolaryngology', 'Audiology'],
  'heart attack': ['Cardiology', 'Emergency Medicine'],
  'heart disease': ['Cardiology'],
  'heart failure': ['Cardiology'],
  'heartburn': ['Gastroenterology'],
  'heatstroke': ['Emergency Medicine'],
  'hemorrhoids': ['Gastroenterology', 'General Surgery'],
  'hepatitis': ['Gastroenterology', 'Hepatology'],
  'hernia': ['General Surgery'],
  'herpes': ['Infectious Disease', 'Dermatology'],
  'hives': ['Dermatology', 'Allergy'],
  'hiv': ['Infectious Disease'],
  'hoarseness': ['Otolaryngology'],
  'hypertension': ['Cardiology', 'Internal Medicine'],
  'hypothyroidism': ['Endocrinology'],
  'hysterectomy': ['Obstetrics & Gynecology'],
  
  // I
  'ibs': ['Gastroenterology'],
  'ibd': ['Gastroenterology'],
  'impotence': ['Urology'],
  'incontinence': ['Urology', 'Gynecology'],
  'indigestion': ['Gastroenterology'],
  'infection': ['Infectious Disease'],
  'infertility': ['Obstetrics & Gynecology', 'Reproductive Endocrinology'],
  'influenza': ['Infectious Disease'],
  'ingrown toenail': ['Podiatry', 'General Surgery'],
  'insomnia': ['Sleep Medicine', 'Psychiatry'],
  'irritable bowel': ['Gastroenterology'],
  'itchy skin': ['Dermatology', 'Allergy'],
  
  // J
  'jaundice': ['Gastroenterology', 'Hepatology'],
  'joint pain': ['Rheumatology', 'Orthopedics'],
  
  // K
  'kidney disease': ['Nephrology'],
  'kidney infection': ['Nephrology', 'Urology'],
  'kidney stones': ['Urology', 'Nephrology'],
  'knee pain': ['Orthopedics'],
  
  // L
  'labyrinthitis': ['Otolaryngology', 'Neurology'],
  'laryngitis': ['Otolaryngology'],
  'leg ulcer': ['Dermatology', 'Vascular Surgery'],
  'leukemia': ['Oncology', 'Hematology'],
  'lice': ['Dermatology'],
  'liver disease': ['Gastroenterology', 'Hepatology'],
  'low blood pressure': ['Cardiology', 'Internal Medicine'],
  'lung cancer': ['Oncology', 'Pulmonology'],
  'lupus': ['Rheumatology'],
  'lymphoma': ['Oncology', 'Hematology'],
  
  // M
  'malaria': ['Infectious Disease'],
  'measles': ['Infectious Disease', 'Pediatrics'],
  'meniere disease': ['Otolaryngology', 'Neurology'],
  'meningitis': ['Infectious Disease', 'Neurology', 'Emergency Medicine'],
  'menopause': ['Obstetrics & Gynecology', 'Endocrinology'],
  'menstrual problems': ['Obstetrics & Gynecology'],
  'migraine': ['Neurology'],
  'miscarriage': ['Obstetrics & Gynecology'],
  'moles': ['Dermatology'],
  'mumps': ['Infectious Disease', 'Pediatrics'],
  'multiple sclerosis': ['Neurology'],
  'muscle pain': ['Orthopedics', 'Rheumatology'],
  'myalgia': ['Rheumatology', 'Orthopedics'],
  
  // N
  'nausea': ['Gastroenterology', 'Internal Medicine'],
  'neck pain': ['Orthopedics', 'Physical Medicine'],
  'nephritis': ['Nephrology'],
  'neuralgia': ['Neurology'],
  'neuropathy': ['Neurology'],
  'nosebleed': ['Otolaryngology', 'Emergency Medicine'],
  
  // O
  'obesity': ['Endocrinology', 'Bariatric Surgery'],
  'ocd': ['Psychiatry'],
  'osteoporosis': ['Orthopedics', 'Endocrinology'],
  'otitis': ['Otolaryngology'],
  'ovarian cyst': ['Obstetrics & Gynecology'],
  
  // P
  'pancreatitis': ['Gastroenterology'],
  'panic attack': ['Psychiatry'],
  'parkinson disease': ['Neurology'],
  'pelvic pain': ['Obstetrics & Gynecology', 'Urology'],
  'peptic ulcer': ['Gastroenterology'],
  'peripheral neuropathy': ['Neurology'],
  'pharyngitis': ['Otolaryngology', 'Infectious Disease'],
  'piles': ['Gastroenterology', 'General Surgery'],
  'pink eye': ['Ophthalmology'],
  'pneumonia': ['Pulmonology', 'Infectious Disease'],
  'pcos': ['Obstetrics & Gynecology', 'Endocrinology'],
  'pregnancy': ['Obstetrics & Gynecology'],
  'prostate': ['Urology'],
  'prostate cancer': ['Oncology', 'Urology'],
  'psoriasis': ['Dermatology', 'Rheumatology'],
  'ptsd': ['Psychiatry'],
  'pulmonary embolism': ['Pulmonology', 'Hematology', 'Emergency Medicine'],
  
  // R
  'rash': ['Dermatology', 'Allergy'],
  'rectal bleeding': ['Gastroenterology', 'General Surgery'],
  'reflux': ['Gastroenterology'],
  'rheumatoid arthritis': ['Rheumatology'],
  'ringworm': ['Dermatology', 'Infectious Disease'],
  'rosacea': ['Dermatology'],
  'rubella': ['Infectious Disease', 'Pediatrics'],
  
  // S
  'sciatica': ['Orthopedics', 'Neurology'],
  'scoliosis': ['Orthopedics'],
  'seizure': ['Neurology'],
  'shingles': ['Infectious Disease', 'Dermatology'],
  'sinusitis': ['Otolaryngology'],
  'skin cancer': ['Dermatology', 'Oncology'],
  'sleep apnea': ['Pulmonology', 'Otolaryngology', 'Sleep Medicine'],
  'sore throat': ['Otolaryngology', 'Infectious Disease'],
  'sprain': ['Orthopedics', 'Sports Medicine'],
  'stomach ulcer': ['Gastroenterology'],
  'stroke': ['Neurology', 'Emergency Medicine'],
  'stye': ['Ophthalmology'],
  'sunburn': ['Dermatology'],
  'swollen glands': ['Otolaryngology', 'Infectious Disease'],
  
  // T
  'tendonitis': ['Orthopedics', 'Sports Medicine'],
  'thrush': ['Infectious Disease', 'Gynecology'],
  'thyroid': ['Endocrinology'],
  'tinnitus': ['Otolaryngology'],
  'tonsillitis': ['Otolaryngology'],
  'tuberculosis': ['Infectious Disease', 'Pulmonology'],
  'type 1 diabetes': ['Endocrinology', 'Pediatrics'],
  'type 2 diabetes': ['Endocrinology'],
  
  // U
  'ulcer': ['Gastroenterology'],
  'ulcerative colitis': ['Gastroenterology'],
  'urinary infection': ['Urology'],
  'uti': ['Urology'],
  'urticaria': ['Dermatology', 'Allergy'],
  
  // V
  'varicose veins': ['Vascular Surgery', 'Dermatology'],
  'vertigo': ['Otolaryngology', 'Neurology'],
  'vision problems': ['Ophthalmology'],
  'vomiting': ['Gastroenterology', 'Internal Medicine'],
  
  // W
  'warts': ['Dermatology', 'Infectious Disease'],
  'weight loss': ['Endocrinology', 'Internal Medicine'],
  'wheezing': ['Pulmonology', 'Allergy'],
  
  // Y
  'yeast infection': ['Infectious Disease', 'Gynecology'],
  
  // Additional neurology conditions from clinical keywords
  'acoustic neuroma': ['Neurology', 'Neurosurgery'],
  'meningioma': ['Neurology', 'Neurosurgery'],
  'ependymoma': ['Neurology', 'Neurosurgery'],
  'glioma': ['Neurology', 'Neurosurgery', 'Oncology'],
  'astrocytoma': ['Neurology', 'Neurosurgery', 'Oncology'],
  'medulloblastoma': ['Neurology', 'Neurosurgery', 'Oncology'],
  'cerebral aneurysm': ['Neurology', 'Neurosurgery'],
  'brain tumor': ['Neurology', 'Neurosurgery', 'Oncology'],
  'brain cancer': ['Neurology', 'Neurosurgery', 'Oncology'],
  'spinal stenosis': ['Neurology', 'Neurosurgery', 'Orthopedics'],
  'herniated disc': ['Neurology', 'Neurosurgery', 'Orthopedics'],
  'hydrocephalus': ['Neurology', 'Neurosurgery'],
  'chiari malformation': ['Neurology', 'Neurosurgery'],
  'arnold chiari': ['Neurology', 'Neurosurgery'],
  'neurofibromatosis': ['Neurology', 'Neurosurgery'],
  'tuberous sclerosis': ['Neurology', 'Neurosurgery'],
  'moyamoya': ['Neurology', 'Neurosurgery'],
  'subarachnoid hemorrhage': ['Neurology', 'Neurosurgery', 'Emergency Medicine'],
  'subdural hematoma': ['Neurology', 'Neurosurgery', 'Emergency Medicine'],
  'cauda equina': ['Neurology', 'Neurosurgery', 'Orthopedics'],
  'myelopathy': ['Neurology', 'Neurosurgery'],
  'radiculopathy': ['Neurology', 'Neurosurgery', 'Orthopedics'],
  'sciatica': ['Neurology', 'Neurosurgery', 'Orthopedics'],
  
  // Neurology procedures and treatments
  'deep brain stimulation': ['Neurology', 'Neurosurgery'],
  'dbs': ['Neurology', 'Neurosurgery'],
  'brain surgery': ['Neurosurgery', 'Neurology'],
  'craniotomy': ['Neurosurgery', 'Neurology'],
  'spinal fusion': ['Neurosurgery', 'Orthopedics'],
  'laminectomy': ['Neurosurgery', 'Orthopedics'],
  'microvascular decompression': ['Neurosurgery', 'Neurology'],
  'gamma knife': ['Neurosurgery', 'Radiation Oncology'],
  'stereotactic radiosurgery': ['Neurosurgery', 'Radiation Oncology'],
  'epilepsy surgery': ['Neurosurgery', 'Neurology'],
  'shunt': ['Neurosurgery', 'Neurology'],
  'ventricular shunt': ['Neurosurgery', 'Neurology'],
  'biopsy of brain': ['Neurosurgery', 'Neurology'],
  'brain biopsy': ['Neurosurgery', 'Neurology'],
  'endoscopic neurosurgery': ['Neurosurgery', 'Neurology'],
  'minimally invasive spine surgery': ['Neurosurgery', 'Orthopedics'],
  'spinal cord stimulator': ['Neurosurgery', 'Neurology', 'Pain Medicine'],
  'vagal nerve stimulator': ['Neurosurgery', 'Neurology'],
  'vns': ['Neurosurgery', 'Neurology'],
  'pituitary surgery': ['Neurosurgery', 'Endocrinology'],
  'peripheral nerve surgery': ['Neurosurgery', 'Neurology'],
  'nerve decompression': ['Neurosurgery', 'Neurology', 'Orthopedics']
};

// Cache for specialties/locations (refreshes every 15 min)
let vocabularyCache = {
  specialties: [],
  locations: [],
  loadedAt: 0
};

// Specialty functions are imported from specialtyService

// Parse time expressions like "this month", "next week", etc.
function parseTemporalRange(query) {
  if (!query) return null;

  const now = new Date();
  const lowerQuery = query.toLowerCase();
  const results = [];

  const patterns = [
    {
      regex: /\bthis\s+month\b/i,
      compute: () => ({
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: 'this month',
        match: 'this month'
      })
    },
    {
      regex: /\bnext\s+month\b/i,
      compute: () => {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return {
          start: startOfMonth(nextMonth),
          end: endOfMonth(nextMonth),
          label: 'next month',
          match: 'next month'
        };
      }
    },
    {
      regex: /\bthis\s+week\b/i,
      compute: () => ({
        start: startOfWeek(now),
        end: endOfWeek(now),
        label: 'this week',
        match: 'this week'
      })
    },
    {
      regex: /\bnext\s+week\b/i,
      compute: () => {
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        return {
          start: startOfWeek(nextWeek),
          end: endOfWeek(nextWeek),
          label: 'next week',
          match: 'next week'
        };
      }
    },
    {
      regex: /\bthis\s+year\b/i,
      compute: () => ({
        start: startOfYear(now),
        end: endOfYear(now),
        label: 'this year',
        match: 'this year'
      })
    },
    {
      regex: /\bnext\s+year\b/i,
      compute: () => ({
        start: startOfYear(new Date(now.getFullYear() + 1, 0, 1)),
        end: endOfYear(new Date(now.getFullYear() + 1, 0, 1)),
        label: 'next year',
        match: 'next year'
      })
    }
  ];

  // Month name with optional year (e.g., "March 2024" or "April")
  const monthMatch = lowerQuery.match(
    new RegExp(`\\b(${MONTH_NAMES.join('|')})(?:\\s+(\\d{4}))?\\b`, 'i')
  );
  if (monthMatch) {
    const monthName = monthMatch[1].toLowerCase();
    const monthIndex = MONTH_NAMES.indexOf(monthName);
    const requestedYear = monthMatch[2] ? parseInt(monthMatch[2], 10) : now.getFullYear();
    const start = new Date(requestedYear, monthIndex, 1);
    const end = endOfMonth(start);
    results.push({
      start,
      end,
      label: monthMatch[0],
      match: monthMatch[0]
    });
  }

  // Specific year (e.g., 2025)
  const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    const yearValue = parseInt(yearMatch[1], 10);
    results.push({
      start: startOfYear(new Date(yearValue, 0, 1)),
      end: endOfYear(new Date(yearValue, 0, 1)),
      label: yearMatch[1],
      match: yearMatch[1]
    });
  }

  patterns.forEach(pattern => {
    if (pattern.regex.test(query)) {
      results.push(pattern.compute());
    }
  });

  if (results.length === 0) {
    return null;
  }

  // Choose the most specific match (prefer month > week > year)
  const priority = match => {
    const label = match.label || '';
    if (label.includes('week')) return 3;
    if (label.includes('month') || MONTH_NAMES.includes(label.toLowerCase())) return 2;
    return 1;
  };

  const selected = results.sort((a, b) => priority(b) - priority(a))[0];
  return {
    startDate: formatDate(selected.start),
    endDate: formatDate(selected.end),
    label: selected.label,
    matchedText: selected.match
  };
}

// Make sure vocabulary cache is fresh
async function ensureVocabularyCache() {
  const now = Date.now();
  if (
    vocabularyCache.loadedAt &&
    now - vocabularyCache.loadedAt < VOCAB_CACHE_TTL_MS &&
    vocabularyCache.specialties.length > 0
  ) {
    return vocabularyCache;
  }

  const response = await client.search({
      index: 'doctors',
      body: {
      size: 0,
      aggs: {
        specialties: {
          terms: {
            field: 'specialty.keyword',
            size: 1000
          }
        },
        locations: {
          terms: {
            field: 'location.keyword',
            size: 500
          }
        }
      }
    }
  });

  const body = response.body || response;
  vocabularyCache = {
    specialties: (body.aggregations?.specialties?.buckets || []).map(bucket => bucket.key),
    locations: (body.aggregations?.locations?.buckets || []).map(bucket => bucket.key),
    loadedAt: now
  };

  return vocabularyCache;
}

// Parse natural language queries - extracts diseases, specialties, locations, dates, etc.
function parseNaturalLanguageQuery(query, vocabulary, explicitFilters = {}) {
  let cleanQuery = query;
  const parsedFilters = {};
  const recognized = {};
  const preferences = {};

  // Accepting new patients
  const acceptingRegex = /\b(?:accept(?:ing)?|see(?:ing)?|take(?:s|n|ing)?|welcom(?:e|ing)|taking on|taking in)\s+(?:new\s+)?patients?\b/gi;
  if (acceptingRegex.test(cleanQuery)) {
    acceptingRegex.lastIndex = 0;
    parsedFilters.acceptingPatients = true;
    recognized.acceptingPatients = true;
    cleanQuery = cleanQuery.replace(acceptingRegex, ' ');
  }

  // Temporal expressions
  const timeRange = parseTemporalRange(cleanQuery);
  if (timeRange?.matchedText) {
    cleanQuery = cleanQuery.replace(
      new RegExp(escapeRegExp(timeRange.matchedText), 'gi'),
      ' '
    );
  }

  // Filler phrases
  const fillerPatterns = [
    /\bshow me\b/gi,
    /\bfind\b/gi,
    /\bshow\b/gi,
    /\bplease\b/gi,
    /\bi need\b/gi,
    /\bi want\b/gi,
    /\bcan you\b/gi,
    /\blooking for\b/gi,
    /\bwho (are|is)\b/gi,
    /\bthat\b/gi
  ];
  fillerPatterns.forEach(pattern => {
    cleanQuery = cleanQuery.replace(pattern, ' ');
  });

  // Disease/Condition to Specialty mapping
  // Check for diseases and conditions in the query and map to relevant specialties
  // This runs early to catch diseases before explicit specialty matching
  if (!explicitFilters.specialty && !preferences.specialty) {
    const lowerQuery = cleanQuery.toLowerCase();
    const matchedDiseases = [];
    
    // Check all disease databases
    const allDiseaseKeys = [
      ...Object.keys(diseaseToSpecialty),
      ...Object.keys(comprehensiveDiseaseDescriptions),
      ...Object.keys(commonDiseaseDescriptions)
    ];
    
    // Separate conditions from procedures - prioritize conditions
    const conditions = [];
    const procedures = [];
    
    for (const key of allDiseaseKeys) {
      const isProcedure = key.includes('surgery') || 
                          key.includes('procedure') || 
                          key.includes('removal') ||
                          key.includes('biopsy') ||
                          key.includes('stimulation') ||
                          key.includes('decompression') ||
                          key.includes('fusion') ||
                          key.includes('shunt') ||
                          key.includes('treatment') && !key.includes('disease');
      
      if (isProcedure) {
        procedures.push(key);
      } else {
        conditions.push(key);
      }
    }
    
    // Sort conditions by length (longest first) to match "parkinson's disease" before just "parkinson"
    // But also prioritize exact matches
    const sortedConditions = [...new Set(conditions)].sort((a, b) => {
      const aExact = lowerQuery === a || lowerQuery === a.replace(/'/g, '');
      const bExact = lowerQuery === b || lowerQuery === b.replace(/'/g, '');
      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;
      return b.length - a.length; // Longer first
    });
    
    // Try conditions first
    const sortedDiseaseKeys = [...sortedConditions, ...procedures];
    
    for (const diseaseKey of sortedDiseaseKeys) {
      // Handle apostrophes - normalize both query and key
      const normalizedKey = diseaseKey.replace(/'/g, '');
      const normalizedQuery = lowerQuery.replace(/'/g, '');
      
      // Try exact match first
      const escapedKey = escapeRegExp(diseaseKey);
      let regex = new RegExp(`\\b${escapedKey}\\b`, 'gi');
      let matched = regex.test(lowerQuery);
      
      // If no match, try without apostrophes
      if (!matched) {
        const escapedNormalized = escapeRegExp(normalizedKey);
        regex = new RegExp(`\\b${escapedNormalized}\\b`, 'gi');
        matched = regex.test(normalizedQuery);
      }
      
      // Partial match as last resort
      if (!matched && normalizedKey.length > 3) {
        matched = normalizedQuery.includes(normalizedKey) || normalizedKey.includes(normalizedQuery.trim());
      }
      
      if (matched) {
        regex.lastIndex = 0;
        
        // Get specialties from any of the disease databases
        const specialties = diseaseToSpecialty[diseaseKey] || 
                           comprehensiveDiseaseDescriptions[diseaseKey]?.specialties ||
                           commonDiseaseDescriptions[diseaseKey]?.specialties || 
                           [];
        
        if (specialties.length > 0) {
          // Add to boost list
          if (!preferences.specialtyBoost) {
            preferences.specialtyBoost = [];
          }
          
          specialties.forEach(specialty => {
            if (!preferences.specialtyBoost.includes(specialty)) {
              preferences.specialtyBoost.push(specialty);
            }
          });
          
          // Set primary specialty if not already set
          if (!preferences.specialty && specialties.length > 0) {
            preferences.specialty = specialties[0];
            recognized.specialty = specialties[0];
          }
        }
        
        matchedDiseases.push(diseaseKey);
        cleanQuery = cleanQuery.replace(regex, ' '); // Remove from query
      }
    }
    
    // Save matched diseases for the summary
    if (matchedDiseases.length > 0) {
      recognized.diseases = matchedDiseases;
    }
  }

  // Specialty synonyms
  if (!explicitFilters.specialty) {
    for (const [synonym, normalized] of Object.entries(specialtySynonyms)) {
      const allowPlural = !synonym.includes(' ');
      const synonymPattern = allowPlural
        ? `${escapeRegExp(synonym)}(?:s|es)?`
        : escapeRegExp(synonym);
      const regex = new RegExp(`\\b${synonymPattern}\\b`, 'gi');
      if (regex.test(cleanQuery)) {
        regex.lastIndex = 0;
        preferences.specialty = normalized;
        recognized.specialty = normalized;
        cleanQuery = cleanQuery.replace(regex, ' ');
        break;
      }
    }
  }

  // Specialty direct matches
  if (!preferences.specialty && !explicitFilters.specialty) {
    const sortedSpecialties = [...(vocabulary.specialties || [])].sort(
      (a, b) => b.length - a.length
    );
    for (const specialty of sortedSpecialties) {
      const regex = new RegExp(`\\b${escapeRegExp(specialty)}\\b`, 'i');
      if (regex.test(cleanQuery)) {
        preferences.specialty = specialty;
        recognized.specialty = specialty;
        cleanQuery = cleanQuery.replace(regex, ' ');
        break;
      }
    }
  }

  // Check location synonyms
  if (!explicitFilters.location) {
    for (const [synonym, info] of Object.entries(locationSynonyms)) {
      const allowPlural = !synonym.includes(' ');
      const synonymPattern = allowPlural
        ? `${escapeRegExp(synonym)}(?:s|es)?`
        : escapeRegExp(synonym);
      const regex = new RegExp(`\\b${synonymPattern}\\b`, 'gi');
      if (regex.test(cleanQuery)) {
        regex.lastIndex = 0;
        const normalized = typeof info === 'string' ? { filter: info, label: info } : info;
        preferences.location = normalized.filter;
        if (normalized.code) {
          preferences.locationCode = normalized.code;
        }
        recognized.location = normalized.label || normalized.filter;
        cleanQuery = cleanQuery.replace(regex, ' ');
        break;
      }
    }
  }

  // Try direct location matches
  if (!preferences.location && !explicitFilters.location) {
    const sortedLocations = [...(vocabulary.locations || [])].sort(
      (a, b) => b.length - a.length
    );
    for (const locationName of sortedLocations) {
      const regex = new RegExp(`\\b${escapeRegExp(locationName)}\\b`, 'i');
      if (regex.test(cleanQuery)) {
        preferences.location = locationName;
        recognized.location = locationName;
        cleanQuery = cleanQuery.replace(regex, ' ');
        break;
      }
    }
  }

  cleanQuery = cleanseQueryString(cleanQuery);
  if (!cleanQuery) {
    cleanQuery = query.trim();
  }

  const pediatricRegex = /\b(pediatric|pediatrics|kids?|children|child|adolescent|adolescents|teen|teens)\b/i;
  if (pediatricRegex.test(query)) {
    const existingSpecialty =
      recognized.specialty ||
      preferences.specialty ||
      parsedFilters.specialty ||
      '';
    const alreadyPediatric = /pediatric|child|adolescent/i.test(existingSpecialty);

    const variants = [];
    if (existingSpecialty && !alreadyPediatric) {
      variants.push(`pediatric ${existingSpecialty}`);
      variants.push(`child ${existingSpecialty}`);
    }

    if (variants.length === 0) {
      variants.push('pediatrics');
    }

    preferences.specialtyBoost = Array.from(
      new Set([...(preferences.specialtyBoost || []), ...variants])
    );

    if (!preferences.specialty) {
      preferences.specialty = variants[0];
    }

    if (!alreadyPediatric) {
      recognized.specialty = toTitleCase(variants[0]);
    }
  }

  return { cleanQuery, parsedFilters, timeRange, recognized, preferences };
}

// Build Elasticsearch filters
function buildFilters(filters, timeRange) {
  const filterArray = [];

  if (filters.type) {
    filterArray.push({ term: { 'type.keyword': filters.type } });
  }

  if (filters.specialty) {
    filterArray.push({ term: { 'specialty.keyword': filters.specialty } });
  }

  if (filters.location) {
    filterArray.push({ term: { 'location.keyword': filters.location } });
  }

  if (filters.acceptingPatients !== undefined) {
    filterArray.push({
      term: { acceptingPatients: normalizeBoolean(filters.acceptingPatients) }
    });
  }

  if (timeRange?.startDate || timeRange?.endDate) {
    const rangeEnd = timeRange.endDate || timeRange.startDate;
    const rangeStart = timeRange.startDate || timeRange.endDate;

    filterArray.push({
      bool: {
        should: [
          {
          bool: {
            must: [
                {
                  range: {
                    currentFromDate: {
                      lte: rangeEnd
                    }
                  }
                }
              ],
              should: [
                {
                  range: {
                    currentToDate: {
                      gte: rangeStart
                    }
                  }
                },
                {
                  bool: {
                    must_not: {
                      exists: { field: 'currentToDate' }
                    }
                  }
                }
              ],
              minimum_should_match: 1
            }
          },
          {
            bool: {
              must_not: {
                exists: { field: 'currentFromDate' }
              }
            }
          }
        ],
        minimum_should_match: 1
      }
    });
  }

  return filterArray;
}

// Build Elasticsearch query for doctors
// Uses multiple match strategies with different boosts - specialty gets highest priority
function buildDoctorQuery(originalQuery, cleanQuery, filters, timeRange, preferences = {}) {
  const queryText = cleanQuery || originalQuery;

  const shouldClauses = [
              {
                multi_match: {
        query: originalQuery,
        fields: ['specialty^8', 'boardCertifications^6', 'name^3', 'location^2'],
        type: 'phrase',
        boost: 5
      }
    },
    {
      match: {
        specialty: {
          query: queryText,
          boost: 8,
          fuzziness: 0
        }
      }
    },
    {
      match_phrase_prefix: {
        specialty: {
          query: queryText,
          boost: 6
        }
      }
    },
    {
      multi_match: {
        query: queryText,
                  fields: [
          'specialty^6',
          'boardCertifications^4',
          'department^3',
          'description^2'
                  ],
                  type: 'best_fields',
        fuzziness: 1,
        prefix_length: 2
      }
    },
    {
      multi_match: {
        query: queryText,
        fields: ['name^3', 'location^2', 'institution^1', 'address^1'],
        type: 'best_fields',
        fuzziness: 1,
        prefix_length: 2
      }
    }
  ];

  if (preferences.specialty) {
    shouldClauses.push({
      term: {
        'specialty.keyword': {
          value: preferences.specialty,
          boost: 7
        }
      }
    });
  }

  if (Array.isArray(preferences.specialtyBoost)) {
    preferences.specialtyBoost.forEach(variant => {
      const trimmed = variant && variant.trim();
      if (!trimmed) {
        return;
      }
      shouldClauses.push({
        match: {
          specialty: {
            query: trimmed,
            operator: 'and',
            boost: 6
          }
        }
      });
    });
  }

  if (preferences.location) {
    shouldClauses.push({
      term: {
        'location.keyword': {
          value: preferences.location,
          boost: 4
        }
      }
    });
  }

  if (preferences.locationCode) {
    shouldClauses.push({
      term: {
        locationCode: {
          value: preferences.locationCode,
          boost: 3
        }
      }
    });
  }

  const filterClauses = buildFilters(filters, timeRange);

  return {
    query: {
      bool: {
        should: shouldClauses,
        filter: filterClauses,
        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
      }
    },
    min_score: 1.0,
        highlight: {
          fields: {
        name: { number_of_fragments: 0 },
        specialty: { number_of_fragments: 0 },
        boardCertifications: { number_of_fragments: 0 },
        location: { number_of_fragments: 0 },
        department: { number_of_fragments: 0 }
      },
      pre_tags: ['<em>'],
      post_tags: ['</em>']
    },
    aggs: {
      by_specialty: {
        terms: {
          field: 'specialty.keyword',
          size: 50
        }
      },
      by_location: {
        terms: {
          field: 'location.keyword',
          size: 20
        }
      },
      accepting_patients: {
        terms: {
          field: 'acceptingPatients',
          size: 2
        }
      }
    },
    size: 10000,
    track_total_hits: true
  };
}

// Build query for locations/clinics
function buildLocationQuery(originalQuery, cleanQuery, filters, preferences = {}) {
  const queryText = cleanQuery || originalQuery;

  const shouldClauses = [
    {
      match_phrase: {
        name: {
          query: originalQuery,
          boost: 6
        }
      }
    },
    {
      multi_match: {
        query: queryText,
        fields: ['name^5', 'location^4', 'services^3', 'specialties^2', 'summary'],
        type: 'best_fields',
        fuzziness: 1,
        prefix_length: 2
      }
    }
  ];

  if (filters.specialty) {
    shouldClauses.push({
      term: {
        'specialties': {
          value: filters.specialty,
          boost: 5
        }
      }
    });
  }

  if (preferences.specialty) {
    shouldClauses.push({
      term: {
        specialties: {
          value: preferences.specialty,
          boost: 4
        }
      }
    });
  }

  if (Array.isArray(preferences.specialtyBoost)) {
    preferences.specialtyBoost.forEach(variant => {
      const trimmed = variant && variant.trim();
      if (!trimmed) {
        return;
      }
      shouldClauses.push({
        match: {
          specialties: {
            query: trimmed,
            operator: 'and',
            boost: 3.5
          }
        }
      });
    });
  }

  if (preferences.location) {
    shouldClauses.push({
      term: {
        'location.keyword': {
          value: preferences.location,
          boost: 6
        }
      }
    });
  }

  if (preferences.locationCode) {
    shouldClauses.push({
      term: {
        locationCode: {
          value: preferences.locationCode,
          boost: 4
        }
      }
    });
  }

  return {
    query: {
      bool: {
        should: shouldClauses,
        filter: filters.location
          ? [{ term: { 'location.keyword': filters.location } }]
          : [],
        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
      }
    },
    highlight: {
      fields: {
        name: { number_of_fragments: 0 },
        services: { number_of_fragments: 0 },
        summary: { fragment_size: 150 }
      },
      pre_tags: ['<em>'],
      post_tags: ['</em>']
        },
        aggs: {
      by_location: {
            terms: {
          field: 'location.keyword',
          size: 20
            }
          },
          by_specialty: {
            terms: {
          field: 'specialties',
          size: 20
        }
      }
    },
    size: 250,
    track_total_hits: true
  };
}

// Build query for content/articles
function buildContentQuery(originalQuery, cleanQuery, filters, timeRange, preferences = {}) {
  const queryText = cleanQuery || originalQuery;

  const filterClauses = [];
  if (timeRange?.startDate || timeRange?.endDate) {
    filterClauses.push({
      range: {
        publishedDate: {
          gte: timeRange.startDate,
          lte: timeRange.endDate
        }
      }
    });
  }

  if (filters.specialty) {
    filterClauses.push({
      term: {
        tags: filters.specialty
      }
    });
  }

  const shouldClauses = [
    {
      multi_match: {
        query: queryText,
        fields: ['title^5', 'summary^3', 'content', 'tags^4', 'category^2'],
        type: 'best_fields',
        fuzziness: 1,
        prefix_length: 2
      }
    }
  ];

  if (preferences.specialty) {
    shouldClauses.push({
      match: {
        tags: {
          query: preferences.specialty,
          operator: 'and',
          boost: 4
        }
      }
    });
  }

  if (Array.isArray(preferences.specialtyBoost)) {
    preferences.specialtyBoost.forEach(variant => {
      const trimmed = variant && variant.trim();
      if (!trimmed) {
        return;
      }
      shouldClauses.push({
        match: {
          tags: {
            query: trimmed,
            operator: 'and',
            boost: 3.5
          }
        }
      });
    });
  }

  return {
    query: {
      bool: {
        should: shouldClauses,
        filter: filterClauses,
        minimum_should_match: shouldClauses.length > 0 ? 1 : 0
      }
    },
    highlight: {
      fields: {
        title: { number_of_fragments: 0 },
        summary: { fragment_size: 150 },
        content: { fragment_size: 150 }
      },
      pre_tags: ['<em>'],
      post_tags: ['</em>']
    },
    aggs: {
      by_category: {
            terms: {
          field: 'category',
          size: 20
        }
      },
      by_tag: {
        terms: {
          field: 'tags',
          size: 20
        }
      }
    },
    size: 150,
    track_total_hits: true
  };
}

// Format Elasticsearch results for API response
function processHits(response, fallbackType) {
  if (!response || response.error) {
    return [];
  }

  const hits = response.hits?.hits || [];
  return hits.map(hit => {
    const source = hit._source || {};
    const highlight = hit.highlight || {};
    const formattedHighlights = Object.entries(highlight).reduce((acc, [field, value]) => {
      acc[field] = Array.isArray(value) ? value : [value].filter(Boolean);
      return acc;
    }, {});

    return {
      id: hit._id,
      type: source.type || fallbackType,
      score: hit._score,
      source,
      highlights: formattedHighlights
    };
  });
}

// Disease functions are imported from diseaseService

// Fallback disease descriptions (for when detailed DB doesn't have them)
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


// Build disease explanation - tries LLM first, falls back to templates
async function buildDiseaseExplanation(diseaseInfo, recognizedSpecialties, query, diseaseName) {
  if (!diseaseInfo) return null;
  
  // Try LLM first
  const llmExplanation = await generateDiseaseExplanation(diseaseInfo, query, diseaseName);
  if (llmExplanation) {
    return llmExplanation;
  }
  
  // Fallback to template-based explanation
  const explanations = [];
  const displayName = diseaseInfo.name || diseaseName || 'this condition';
  
  // Helper function to remove disease name from start of description if present
  function cleanDescription(description, diseaseName) {
    if (!description || !diseaseName) return description;
    
    const descLower = description.toLowerCase().trim();
    const nameLower = diseaseName.toLowerCase().trim();
    
    // Check if description starts with the disease name followed by "is" or "is a" etc.
    const patterns = [
      new RegExp(`^${nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+is\\s+`, 'i'),
      new RegExp(`^${nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+is\\s+a\\s+`, 'i'),
      new RegExp(`^${nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+is\\s+an\\s+`, 'i'),
      new RegExp(`^${nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i')
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(descLower)) {
        return description.replace(pattern, '').trim();
      }
    }
    
    return description;
  }
  
  // ALWAYS start with "What is [disease]?" - this is the key improvement
  if (diseaseInfo.description && diseaseInfo.description.length > 20) {
    const cleanedDescription = cleanDescription(diseaseInfo.description, displayName);
    explanations.push(`${displayName} is ${cleanedDescription.toLowerCase()}`);
  } else if (diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0) {
    // If no description, create one from symptoms
    const firstSymptom = diseaseInfo.symptoms[0];
    if (firstSymptom.length > 30) {
      explanations.push(`${displayName} is a condition that ${firstSymptom.toLowerCase()}`);
    }
  } else {
    // Fallback: basic explanation
    explanations.push(`${displayName} is a medical condition`);
  }
  
  // Add symptoms if available
  if (diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0) {
    const relevantSymptoms = diseaseInfo.symptoms
      .filter(s => {
        const clean = s.trim();
        return clean.length > 15 && clean.length < 120 && 
               !clean.toLowerCase().includes('symptoms') &&
               !clean.toLowerCase().includes('include');
      })
      .slice(0, 3);
    
    if (relevantSymptoms.length > 0) {
      let symptomText;
      if (relevantSymptoms.length === 1) {
        symptomText = relevantSymptoms[0].toLowerCase();
      } else if (relevantSymptoms.length === 2) {
        symptomText = `${relevantSymptoms[0].toLowerCase()} and ${relevantSymptoms[1].toLowerCase()}`;
      } else {
        symptomText = `${relevantSymptoms.slice(0, -1).map(s => s.toLowerCase()).join(', ')}, and ${relevantSymptoms[relevantSymptoms.length - 1].toLowerCase()}`;
      }
      explanations.push(`Common symptoms include ${symptomText}.`);
    }
  }
  
  // Explain specialty connection
  if (recognizedSpecialties && recognizedSpecialties.length > 0) {
    const specialtyList = recognizedSpecialties.length === 1
      ? recognizedSpecialties[0]
      : recognizedSpecialties.slice(0, 2).join(' and ');
    
    explanations.push(
      `${specialtyList} specialists are trained to diagnose and treat this condition, ` +
      `which is why they appear prominently in your results.`
    );
  } else if (diseaseInfo.specialties && diseaseInfo.specialties.length > 0) {
    const specialtyList = diseaseInfo.specialties.length === 1
      ? diseaseInfo.specialties[0]
      : diseaseInfo.specialties.slice(0, 2).join(' and ');
    
    explanations.push(
      `${specialtyList} specialists are trained to diagnose and treat this condition, ` +
      `which is why they appear prominently in your results.`
    );
  }
  
  // Add treatment information if available
  if (diseaseInfo.treatments && diseaseInfo.treatments.length > 0) {
    const treatmentInfo = diseaseInfo.treatments
      .filter(t => {
        const clean = t.trim().toLowerCase();
        return clean.length > 20 && clean.length < 200 && 
               !clean.includes('treatment') &&
               !clean.includes('may refer');
      })
      .slice(0, 1)[0];
    
    if (treatmentInfo) {
      const treatmentText = treatmentInfo.toLowerCase();
      if (!treatmentText.startsWith('treatment')) {
        explanations.push(`Treatment typically involves ${treatmentText}.`);
      } else {
        explanations.push(treatmentText.charAt(0).toUpperCase() + treatmentText.slice(1) + '.');
      }
    }
  }
  
  return explanations.join(' ');
}

// Build the AI summary that shows up at the top of search results
// Tries LLM first, falls back to templates
async function buildUnifiedSummary({
      query,
  doctorResponse,
  locationResponse,
  contentResponse,
  filters,
  timeRange,
  recognized
}) {
  const doctorTotal = doctorResponse?.hits?.total?.value || 0;
  const locationTotal = locationResponse?.hits?.total?.value || 0;
  const contentTotal = contentResponse?.hits?.total?.value || 0;
  const overallTotal = doctorTotal + locationTotal + contentTotal;

  if (!overallTotal) {
    return {
      text: `I couldn't find any matches for "${query}". Try broadening the search or adjusting filters.`,
      highlights: {}
    };
  }

  // Prepare context data for LLM or templates
  const doctorAggs = doctorResponse?.aggregations || {};
  const acceptingBuckets = doctorAggs.accepting_patients?.buckets || [];
  const acceptingBucket = acceptingBuckets.find(bucket => bucket.key === true || bucket.key === 1);
  const acceptingCount = acceptingBucket ? acceptingBucket.doc_count : 0;
  const acceptingPercent = doctorTotal
    ? Math.round((acceptingCount / doctorTotal) * 100)
    : 0;

  const topSpecialties = (doctorAggs.by_specialty?.buckets || [])
    .filter(bucket => bucket.key)
    .slice(0, 3)
    .map(bucket => ({ name: bucket.key, count: bucket.doc_count }));

  const topDoctorLocations = (doctorAggs.by_location?.buckets || [])
    .filter(bucket => bucket.key)
    .slice(0, 3)
    .map(bucket => ({ name: bucket.key, count: bucket.doc_count }));

  const topClinics = (locationResponse?.hits?.hits || [])
    .slice(0, 3)
    .map(hit => ({
      name: hit._source?.name,
      location: hit._source?.location
    }))
    .filter(item => item.name);

  const topArticles = (contentResponse?.hits?.hits || [])
    .slice(0, 3)
    .map(hit => ({
      title: hit._source?.title,
      summary: hit._source?.summary
    }))
    .filter(item => item.title);

  // Try to detect diseases even if not explicitly recognized
  let diseaseName = recognized.diseases?.[0];
  let diseaseInfo = null;
  
  // Fallback: try to detect disease from query directly
  // Prioritize conditions over procedures
  if (!diseaseName) {
    const queryLower = query.toLowerCase().trim();
    const allPatterns = Object.keys(diseaseToSpecialty).concat(
      Object.keys(commonDiseaseDescriptions),
      Object.keys(comprehensiveDiseaseDescriptions)
    );
    
    // Separate conditions from procedures
    const conditions = [];
    const procedures = [];
    
    for (const pattern of allPatterns) {
      const isProcedure = pattern.includes('surgery') || 
                          pattern.includes('procedure') || 
                          pattern.includes('treatment') ||
                          pattern.includes('removal') ||
                          pattern.includes('biopsy') ||
                          pattern.includes('stimulation') ||
                          pattern.includes('decompression') ||
                          pattern.includes('fusion') ||
                          pattern.includes('shunt');
      
      if (isProcedure) {
        procedures.push(pattern);
      } else {
        conditions.push(pattern);
      }
    }
    
    // Try conditions first (prioritize shorter, exact matches)
    const sortedConditions = conditions.sort((a, b) => {
      // Exact match first
      if (queryLower === a) return -1;
      if (queryLower === b) return 1;
      // Then by length (shorter first for common names)
      return a.length - b.length;
    });
    
    for (const pattern of sortedConditions) {
      if (queryLower === pattern || 
          queryLower.includes(pattern) || 
          pattern.includes(queryLower)) {
        diseaseName = pattern;
        break;
      }
    }
    
    // Only try procedures if no condition matched
    if (!diseaseName) {
      for (const pattern of procedures) {
        if (queryLower === pattern || 
            queryLower.includes(pattern) || 
            pattern.includes(queryLower)) {
          diseaseName = pattern;
          break;
        }
      }
    }
  }
  
  if (diseaseName) {
    diseaseInfo = getDiseaseDescription(diseaseName);
    
    // If we matched a procedure but the query seems like a condition, try to find the condition
    if (diseaseInfo && (diseaseName.toLowerCase().includes('surgery') || 
                        diseaseName.toLowerCase().includes('procedure') ||
                        diseaseName.toLowerCase().includes('treatment') && !diseaseName.toLowerCase().includes('disease'))) {
      const queryLower = query.toLowerCase().trim();
      // Try to find the underlying condition (e.g., "parkinson" -> "parkinson's disease")
      const conditionKeys = Object.keys(comprehensiveDiseaseDescriptions).concat(
        Object.keys(commonDiseaseDescriptions),
        Object.keys(diseaseToSpecialty)
      ).filter(key => 
        !key.toLowerCase().includes('surgery') && 
        !key.toLowerCase().includes('procedure') &&
        !key.toLowerCase().includes('removal') &&
        !key.toLowerCase().includes('biopsy') &&
        (queryLower.includes(key.toLowerCase()) || 
         key.toLowerCase().includes(queryLower) ||
         key.toLowerCase().replace(/'/g, '').includes(queryLower.replace(/'/g, '')))
      );
      
      if (conditionKeys.length > 0) {
        // Prefer exact matches, then shorter names (more common)
        const preferredCondition = conditionKeys.sort((a, b) => {
          const aExact = queryLower === a.toLowerCase() || queryLower === a.toLowerCase().replace(/'/g, '');
          const bExact = queryLower === b.toLowerCase() || queryLower === b.toLowerCase().replace(/'/g, '');
          if (aExact && !bExact) return -1;
          if (bExact && !aExact) return 1;
          return a.length - b.length;
        })[0];
        const conditionInfo = getDiseaseDescription(preferredCondition);
        if (conditionInfo && conditionInfo.description) {
          diseaseName = preferredCondition;
          diseaseInfo = conditionInfo;
        }
      }
    }
  }

  // Try LLM first
  const llmSummary = await generateAISummary({
    query,
    doctorTotal,
    locationTotal,
    contentTotal,
    diseaseInfo,
    diseaseName: diseaseName ? (diseaseInfo?.name || diseaseName) : null,
    recognizedSpecialty: recognized.specialty || filters.specialty,
    topSpecialties,
    acceptingCount,
    acceptingPercent,
    filters,
    timeRange,
    recognized,
    highlights: {
      totals: {
        doctors: doctorTotal,
        locations: locationTotal,
        content: contentTotal,
        overall: overallTotal
      },
      specialties: topSpecialties,
      doctorLocations: topDoctorLocations,
      clinics: topClinics,
      articles: topArticles,
      accepting: {
        count: acceptingCount,
        percent: acceptingPercent
      },
      timeRange: timeRange?.label || null
    }
  });

  if (llmSummary) {
    return llmSummary;
  }

  // Fallback to template-based summary
  const segments = [];
  const breakdownParts = [];

  if (doctorTotal) breakdownParts.push(`${doctorTotal.toLocaleString()} doctors`);
  if (locationTotal) breakdownParts.push(`${locationTotal.toLocaleString()} practice locations`);
  if (contentTotal) breakdownParts.push(`${contentTotal.toLocaleString()} specialty resources`);

  if (breakdownParts.length > 0) {
    segments.push(`Here's what I found for "${query}": ${breakdownParts.join(', ')}.`);
  } else {
    segments.push(`I found ${overallTotal.toLocaleString()} relevant items for "${query}".`);
  }

  if (diseaseName && diseaseInfo) {
    const diseaseDisplay = diseaseInfo.name || diseaseName.charAt(0).toUpperCase() + diseaseName.slice(1);
    
    // Build explanation - tries LLM first, falls back to templates
    const diseaseExplanation = await buildDiseaseExplanation(
      diseaseInfo,
      recognized.specialty ? [recognized.specialty] : (diseaseInfo.specialties || []),
      query,
      diseaseDisplay
    );
    
    if (diseaseExplanation) {
      segments.push(diseaseExplanation);
    } else if (recognized.specialty) {
      // Fallback
      segments.push(
        `Because you searched for ${diseaseDisplay}, results emphasize ${recognized.specialty} specialists who typically treat this condition.`
      );
    }
    
    // Add symptom info if available
    if (diseaseInfo.symptoms && diseaseInfo.symptoms.length > 0 && doctorTotal > 0) {
      segments.push(
        `The doctors shown specialize in managing the symptoms and complications associated with ${diseaseDisplay}.`
      );
    }
  } else if (filters.specialty || recognized.specialty) {
    segments.push(
      `Focusing on ${filters.specialty || recognized.specialty} specialists.`
    );
  }

  if (filters.location || recognized.location) {
    segments.push(
      `Showing results around ${filters.location || recognized.location}.`
    );
  }

  if (filters.acceptingPatients || recognized.acceptingPatients) {
    segments.push('Only providers accepting new patients are included.');
  }

  if (timeRange?.label) {
    segments.push(`Filtered to availability around ${timeRange.label}.`);
  }

  if (acceptingCount && doctorTotal) {
    segments.push(`${acceptingCount} (${acceptingPercent}%) doctors are currently accepting new patients.`);
  }

  const specialtyNarrative = buildSpecialtyNarrative(query, topSpecialties, recognized);
  if (specialtyNarrative) {
    segments.push(specialtyNarrative);
  }

  return {
    text: segments.join(' '),
    highlights: {
      totals: {
        doctors: doctorTotal,
        locations: locationTotal,
        content: contentTotal,
        overall: overallTotal
      },
      specialties: topSpecialties,
      doctorLocations: topDoctorLocations,
      clinics: topClinics,
      articles: topArticles,
      accepting: {
        count: acceptingCount,
        percent: acceptingPercent
      },
      timeRange: timeRange?.label || null
    }
  };
}

// API Routes

// Main search endpoint
router.post('/', async (req, res) => {
  try {
    const { query, filters = {} } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const vocabulary = await ensureVocabularyCache();
    const { cleanQuery, parsedFilters, timeRange, recognized, preferences } = parseNaturalLanguageQuery(
      query,
      vocabulary,
      filters
    );

    const normalizedUserFilters = Object.entries(filters || {}).reduce((acc, [key, value]) => {
      if (value === '' || value === null || value === undefined) {
        return acc;
      }
      if (key === 'acceptingPatients') {
        const normalized = normalizeBoolean(value);
        if (!normalized) {
          return acc;
        }
        acc[key] = normalized;
        return acc;
      }
      acc[key] = value;
      return acc;
    }, {});

    const combinedFilters = { ...parsedFilters, ...normalizedUserFilters };

    const doctorRequest = buildDoctorQuery(query, cleanQuery, combinedFilters, timeRange, preferences);
    const locationRequest = buildLocationQuery(query, cleanQuery, combinedFilters, preferences);
    const contentRequest = buildContentQuery(query, cleanQuery, combinedFilters, timeRange, preferences);

    const msearchResponse = await client.msearch({
      body: [
        { index: 'doctors' },
        doctorRequest,
        { index: 'locations' },
        locationRequest,
        { index: 'content' },
        contentRequest
      ]
    });

    const responses = msearchResponse.body?.responses || msearchResponse.responses || [];
    const doctorResponse = responses[0] || {};
    const locationResponse = responses[1] || {};
    const contentResponse = responses[2] || {};

    const doctorResults = processHits(doctorResponse, 'doctor');
    const locationResults = processHits(locationResponse, 'location');
    const contentResults = processHits(contentResponse, 'content');

    const summary = await buildUnifiedSummary({
      query,
      doctorResponse,
      locationResponse,
      contentResponse,
      filters: combinedFilters,
      timeRange,
      recognized
    });

    const doctorTotal = doctorResponse?.hits?.total?.value || 0;
    const locationTotal = locationResponse?.hits?.total?.value || 0;
    const contentTotal = contentResponse?.hits?.total?.value || 0;
    const overall = doctorTotal + locationTotal + contentTotal;
    
    const appliedFilters = { ...combinedFilters };
    
    res.json({
      query,
      cleanQuery,
      results: [...doctorResults, ...locationResults, ...contentResults],
      sections: {
        doctors: doctorResults,
        locations: locationResults,
        content: contentResults
      },
      totals: {
        doctors: doctorTotal,
        locations: locationTotal,
        content: contentTotal,
        overall
      },
      aggregations: doctorResponse.aggregations || {},
      locationAggregations: locationResponse.aggregations || {},
      contentAggregations: contentResponse.aggregations || {},
      took: msearchResponse.body?.took || msearchResponse.took || 0,
      summary,
      appliedFilters,
      timeRange
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Autocomplete/suggestions endpoint
router.get('/suggest/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const response = await client.msearch({
      body: [
        { index: 'doctors' },
        {
        suggest: {
          doctor_suggest: {
            prefix: query,
            completion: {
              field: 'name.suggest',
              size: 5
            }
          },
          specialty_suggest: {
            prefix: query,
            completion: {
              field: 'specialty.suggest',
              size: 5
              }
            }
            }
          },
        { index: 'locations' },
        {
          suggest: {
          location_suggest: {
            prefix: query,
            completion: {
                field: 'name.suggest',
              size: 5
            }
          }
        }
      }
      ]
    });

    const [doctorSuggestions, locationSuggestions] =
      response.body?.responses || response.responses || [];

    res.json({
      doctors: doctorSuggestions?.suggest || {},
      locations: locationSuggestions?.suggest || {}
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

module.exports = router;
