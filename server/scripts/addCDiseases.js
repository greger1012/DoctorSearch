/**
 * Script to add diseases starting with C from NHS Inform with detailed descriptions
 */

const fs = require('fs');
const path = require('path');

// Load existing comprehensive descriptions
let allDescriptions = {};
try {
  const existingModule = require('./comprehensiveDiseaseDescriptions');
  allDescriptions = existingModule.comprehensiveDiseaseDescriptions || {};
} catch (e) {
  console.log('Starting fresh database');
}

// New diseases to add/update with detailed descriptions
const newDiseases = {
  "carcinoid syndrome": {
    name: "Carcinoid Syndrome",
    description: "Carcinoid syndrome is a group of symptoms that occur when a carcinoid tumor releases certain chemicals into the bloodstream. Carcinoid tumors are slow-growing neuroendocrine tumors.",
    symptoms: ["flushing of the face and upper chest", "diarrhea", "wheezing", "abdominal pain", "heart valve problems", "rapid heartbeat"],
    treatments: ["surgery to remove tumor", "medications to block hormone release", "somatostatin analogs", "chemotherapy", "targeted therapy"],
    specialties: ["Oncology", "Endocrinology", "Surgical Oncology"]
  },
  "carcinoid tumours": {
    name: "Carcinoid Tumours",
    description: "Carcinoid tumours are slow-growing neuroendocrine tumors that can develop in various parts of the body, most commonly in the digestive system and lungs.",
    symptoms: ["often no symptoms until advanced", "abdominal pain", "diarrhea", "flushing", "wheezing", "heart problems"],
    treatments: ["surgery to remove tumor", "somatostatin analogs", "chemotherapy", "targeted therapy", "liver-directed therapies"],
    specialties: ["Oncology", "Surgical Oncology", "Endocrinology"]
  },
  "carcinoid tumors": {
    name: "Carcinoid Tumours",
    description: "Carcinoid tumors are slow-growing neuroendocrine tumors.",
    symptoms: ["varies by location", "flushing", "diarrhea"],
    treatments: ["surgery", "medications", "chemotherapy"],
    specialties: ["Oncology"]
  },
  "cardiac arrest": {
    name: "Cardiac Arrest",
    description: "Cardiac arrest is the sudden loss of heart function, breathing, and consciousness. It's a medical emergency that requires immediate CPR and defibrillation.",
    symptoms: ["sudden collapse", "no pulse", "no breathing", "loss of consciousness", "no response"],
    treatments: ["immediate CPR", "defibrillation", "advanced cardiac life support", "treating underlying cause", "post-resuscitation care"],
    specialties: ["Emergency Medicine", "Cardiology", "Critical Care"]
  },
  "cardiovascular disease": {
    name: "Cardiovascular Disease",
    description: "Cardiovascular disease is a general term for conditions affecting the heart and blood vessels, including coronary artery disease, heart failure, and stroke.",
    symptoms: ["varies by condition", "chest pain", "shortness of breath", "fatigue", "irregular heartbeat"],
    treatments: ["lifestyle changes", "medications", "surgery", "cardiac rehabilitation", "preventive measures"],
    specialties: ["Cardiology", "Cardiovascular Surgery"]
  },
  "carpal tunnel syndrome": {
    name: "Carpal Tunnel Syndrome",
    description: "Carpal tunnel syndrome is a condition that causes numbness, tingling, and weakness in the hand due to compression of the median nerve in the wrist.",
    symptoms: ["numbness or tingling in thumb and fingers", "weakness in hand", "pain radiating up the arm", "dropping objects"],
    treatments: ["wrist splinting", "anti-inflammatory medications", "corticosteroid injections", "physical therapy", "surgery (carpal tunnel release) in severe cases"],
    specialties: ["Orthopedics", "Hand Surgery", "Physical Medicine"]
  },
  "catarrh": {
    name: "Catarrh",
    description: "Catarrh is a build-up of mucus in the nose, throat, or sinuses. It's often associated with colds or allergies and usually clears up on its own.",
    symptoms: ["blocked or stuffy nose", "mucus in throat", "postnasal drip", "coughing", "feeling of mucus in back of throat"],
    treatments: ["steam inhalation", "nasal irrigation", "decongestants", "treating underlying cause (allergies, infection)"],
    specialties: ["Otolaryngology", "Internal Medicine"]
  },
  "cellulitis": {
    name: "Cellulitis",
    description: "Cellulitis is a common bacterial skin infection that affects the deeper layers of the skin and underlying tissue. It requires prompt treatment with antibiotics.",
    symptoms: ["red, swollen skin", "pain and tenderness", "warmth in affected area", "fever", "blisters", "red streaks"],
    treatments: ["oral antibiotics", "IV antibiotics for severe cases", "elevating affected area", "pain medications", "wound care"],
    specialties: ["Infectious Disease", "Dermatology", "Emergency Medicine"]
  },
  "cerebral palsy": {
    name: "Cerebral Palsy",
    description: "Cerebral palsy is a group of permanent movement disorders that appear in early childhood. It's caused by damage to the developing brain, often before birth.",
    symptoms: ["muscle stiffness or floppiness", "poor coordination", "difficulty walking", "involuntary movements", "speech difficulties", "learning disabilities"],
    treatments: ["physical therapy", "occupational therapy", "speech therapy", "medications for muscle spasticity", "surgery", "assistive devices"],
    specialties: ["Pediatrics", "Neurology", "Physical Medicine", "Developmental-Behavioral Pediatrics"]
  },
  "cervical cancer": {
    name: "Cervical Cancer",
    description: "Cervical cancer is cancer that occurs in the cells of the cervix, the lower part of the uterus. It's often caused by human papillomavirus (HPV) infection and is highly preventable with screening.",
    symptoms: ["abnormal vaginal bleeding", "pelvic pain", "pain during intercourse", "unusual vaginal discharge"],
    treatments: ["surgery (hysterectomy, cone biopsy)", "radiation therapy", "chemotherapy", "targeted therapy", "HPV vaccination for prevention"],
    specialties: ["Gynecologic Oncology", "Radiation Oncology", "Obstetrics & Gynecology"]
  },
  "cervical spondylosis": {
    name: "Cervical Spondylosis",
    description: "Cervical spondylosis is a general term for age-related wear and tear affecting the spinal disks in the neck. It's very common and worsens with age.",
    symptoms: ["neck pain and stiffness", "headaches", "pain in shoulders or arms", "numbness or weakness in arms", "grinding or popping sensation"],
    treatments: ["pain medications", "physical therapy", "neck exercises", "heat or cold therapy", "cervical collar", "surgery in severe cases"],
    specialties: ["Orthopedics", "Neurology", "Physical Medicine"]
  },
  "chest and rib injury": {
    name: "Chest and Rib Injury",
    description: "Chest and rib injuries can range from simple bruises to broken ribs or more serious internal injuries. They're often caused by trauma, falls, or accidents.",
    symptoms: ["chest pain", "pain when breathing", "tenderness", "bruising", "difficulty breathing", "coughing up blood in severe cases"],
    treatments: ["pain medications", "rest", "ice", "breathing exercises", "surgery for severe fractures", "treating underlying lung injuries"],
    specialties: ["Emergency Medicine", "Orthopedics", "Trauma Surgery", "Pulmonology"]
  },
  "chest infection": {
    name: "Chest Infection",
    description: "A chest infection is an infection that affects the lungs, airways, or both. It can be caused by viruses or bacteria and includes conditions like pneumonia and bronchitis.",
    symptoms: ["cough with phlegm", "shortness of breath", "chest pain", "fever", "fatigue", "wheezing"],
    treatments: ["antibiotics if bacterial", "rest and fluids", "cough medicine", "pain relievers", "oxygen therapy if needed"],
    specialties: ["Pulmonology", "Infectious Disease", "Internal Medicine"]
  },
  "chickenpox": {
    name: "Chickenpox",
    description: "Chickenpox is a highly contagious viral infection caused by the varicella-zoster virus. It's characterized by an itchy, blister-like rash and is most common in children.",
    symptoms: ["itchy, blister-like rash", "fever", "headache", "loss of appetite", "tiredness"],
    treatments: ["rest and fluids", "calamine lotion for itching", "antihistamines", "antiviral medications in some cases", "vaccination for prevention"],
    specialties: ["Infectious Disease", "Pediatrics"]
  },
  "chilblains": {
    name: "Chilblains",
    description: "Chilblains are small, itchy, red patches that can appear on the skin after exposure to cold. They're caused by inflammation of small blood vessels.",
    symptoms: ["red or purple patches on skin", "itching", "burning sensation", "swelling", "blisters in severe cases"],
    treatments: ["keeping affected areas warm", "avoiding scratching", "moisturizers", "medications to improve circulation", "avoiding rapid temperature changes"],
    specialties: ["Dermatology", "Vascular Medicine"]
  },
  "chlamydia": {
    name: "Chlamydia",
    description: "Chlamydia is a common sexually transmitted infection (STI) caused by bacteria. It can affect both men and women and often has no symptoms.",
    symptoms: ["often no symptoms", "painful urination", "unusual discharge", "pelvic pain in women", "testicular pain in men"],
    treatments: ["antibiotics (azithromycin or doxycycline)", "partner treatment", "abstinence during treatment", "regular STI screening"],
    specialties: ["Infectious Disease", "Urology", "Obstetrics & Gynecology"]
  },
  "chronic fatigue syndrome": {
    name: "Chronic Fatigue Syndrome (ME/CFS)",
    description: "Chronic fatigue syndrome, also known as myalgic encephalomyelitis (ME), is a complex disorder characterized by extreme fatigue that doesn't improve with rest and can't be explained by an underlying medical condition.",
    symptoms: ["severe fatigue", "sleep problems", "cognitive difficulties (brain fog)", "muscle and joint pain", "headaches", "sore throat", "swollen lymph nodes"],
    treatments: ["pacing activities", "cognitive behavioral therapy", "graded exercise therapy", "medications for symptoms", "sleep management"],
    specialties: ["Internal Medicine", "Rheumatology", "Neurology"]
  },
  "me/cfs": {
    name: "Chronic Fatigue Syndrome",
    description: "ME/CFS is a condition causing severe fatigue that doesn't improve with rest.",
    symptoms: ["extreme fatigue", "cognitive problems", "pain"],
    treatments: ["pacing", "therapy", "symptom management"],
    specialties: ["Internal Medicine"]
  },
  "chronic kidney disease": {
    name: "Chronic Kidney Disease (CKD)",
    description: "Chronic kidney disease is the gradual loss of kidney function over time. The kidneys filter wastes and excess fluids from blood, which are then excreted in urine.",
    symptoms: ["nausea", "vomiting", "fatigue", "swelling in feet and ankles", "sleep problems", "changes in urine output", "muscle cramps"],
    treatments: ["treating underlying causes", "medications to control symptoms", "dietary changes", "dialysis", "kidney transplant"],
    specialties: ["Nephrology"]
  },
  "ckd": {
    name: "Chronic Kidney Disease",
    description: "CKD is gradual loss of kidney function over time.",
    symptoms: ["fatigue", "swelling", "urine changes"],
    treatments: ["medications", "dialysis", "transplant"],
    specialties: ["Nephrology"]
  },
  "chronic lymphocytic leukaemia": {
    name: "Chronic Lymphocytic Leukaemia (CLL)",
    description: "Chronic lymphocytic leukaemia is a type of cancer that affects white blood cells called lymphocytes. It progresses slowly and is the most common type of leukaemia in adults.",
    symptoms: ["often no symptoms in early stages", "fatigue", "swollen lymph nodes", "fever", "night sweats", "weight loss", "frequent infections"],
    treatments: ["watchful waiting for early stages", "chemotherapy", "targeted therapy", "immunotherapy", "stem cell transplant in some cases"],
    specialties: ["Hematology-Oncology"]
  },
  "cll": {
    name: "Chronic Lymphocytic Leukaemia",
    description: "CLL is a slow-growing blood cancer affecting lymphocytes.",
    symptoms: ["fatigue", "swollen nodes", "infections"],
    treatments: ["watchful waiting", "chemotherapy", "targeted therapy"],
    specialties: ["Hematology-Oncology"]
  },
  "chronic myeloid leukaemia": {
    name: "Chronic Myeloid Leukaemia (CML)",
    description: "Chronic myeloid leukaemia is a type of cancer that affects white blood cells. It's characterized by the presence of an abnormal chromosome called the Philadelphia chromosome.",
    symptoms: ["fatigue", "weight loss", "fever", "night sweats", "abdominal fullness", "bone pain"],
    treatments: ["targeted therapy (tyrosine kinase inhibitors)", "chemotherapy", "stem cell transplant", "interferon"],
    specialties: ["Hematology-Oncology"]
  },
  "cml": {
    name: "Chronic Myeloid Leukaemia",
    description: "CML is a blood cancer characterized by the Philadelphia chromosome.",
    symptoms: ["fatigue", "weight loss", "fever"],
    treatments: ["targeted therapy", "chemotherapy"],
    specialties: ["Hematology-Oncology"]
  },
  "chronic obstructive pulmonary disease": {
    name: "Chronic Obstructive Pulmonary Disease (COPD)",
    description: "COPD is a chronic inflammatory lung disease that causes obstructed airflow from the lungs. It includes emphysema and chronic bronchitis and is often caused by smoking.",
    symptoms: ["shortness of breath", "wheezing", "chest tightness", "chronic cough with mucus", "frequent respiratory infections", "fatigue"],
    treatments: ["bronchodilators", "inhaled corticosteroids", "oxygen therapy", "pulmonary rehabilitation", "quitting smoking", "lung transplant in severe cases"],
    specialties: ["Pulmonology"]
  },
  "copd": {
    name: "COPD",
    description: "COPD is a chronic lung disease causing breathing difficulties.",
    symptoms: ["shortness of breath", "cough", "wheezing"],
    treatments: ["bronchodilators", "oxygen", "quitting smoking"],
    specialties: ["Pulmonology"]
  },
  "chronic pain": {
    name: "Chronic Pain",
    description: "Chronic pain is pain that persists for weeks, months, or years. It can be caused by an injury, illness, or have no clear cause. It affects daily life and requires comprehensive management.",
    symptoms: ["persistent pain", "fatigue", "sleep problems", "mood changes", "decreased activity"],
    treatments: ["pain medications", "physical therapy", "psychological therapy", "nerve blocks", "acupuncture", "lifestyle modifications"],
    specialties: ["Pain Medicine", "Physical Medicine", "Neurology", "Anesthesiology"]
  },
  "chronic pancreatitis": {
    name: "Chronic Pancreatitis",
    description: "Chronic pancreatitis is long-term inflammation of the pancreas that leads to permanent damage. It can cause severe pain and digestive problems.",
    symptoms: ["severe abdominal pain", "weight loss", "diarrhea", "fatty stools", "nausea", "vomiting", "diabetes"],
    treatments: ["pain management", "pancreatic enzyme supplements", "dietary changes", "avoiding alcohol", "surgery in severe cases"],
    specialties: ["Gastroenterology", "General Surgery"]
  },
  "cirrhosis": {
    name: "Cirrhosis",
    description: "Cirrhosis is late-stage scarring (fibrosis) of the liver caused by many forms of liver diseases and conditions, such as hepatitis and chronic alcoholism.",
    symptoms: ["fatigue", "easy bruising and bleeding", "jaundice", "swelling in legs and abdomen", "confusion", "spider-like blood vessels"],
    treatments: ["treating underlying cause", "lifestyle changes (stopping alcohol)", "medications", "liver transplant in severe cases"],
    specialties: ["Gastroenterology", "Hepatology"]
  },
  "clavicle fracture": {
    name: "Clavicle (Collar Bone) Fracture",
    description: "A clavicle fracture is a break in the collarbone, one of the main bones in the shoulder. It's a common injury, especially in children and athletes.",
    symptoms: ["pain at fracture site", "swelling", "bruising", "difficulty moving arm", "deformity or bump", "grinding sensation"],
    treatments: ["arm sling or figure-of-eight brace", "pain medications", "ice", "physical therapy", "surgery for severe fractures"],
    specialties: ["Orthopedics", "Emergency Medicine"]
  },
  "collar bone fracture": {
    name: "Clavicle Fracture",
    description: "A collar bone fracture is a break in the clavicle.",
    symptoms: ["shoulder pain", "swelling", "difficulty moving arm"],
    treatments: ["sling", "pain medications", "surgery if needed"],
    specialties: ["Orthopedics"]
  },
  "clostridium difficile": {
    name: "Clostridium Difficile (C. diff)",
    description: "Clostridium difficile, or C. diff, is a bacterium that can cause diarrhea and more serious intestinal conditions. It often occurs after antibiotic use.",
    symptoms: ["watery diarrhea", "abdominal pain", "fever", "loss of appetite", "nausea", "dehydration"],
    treatments: ["stopping current antibiotics", "specific antibiotics (metronidazole, vancomycin)", "probiotics", "fecal microbiota transplant in recurrent cases"],
    specialties: ["Infectious Disease", "Gastroenterology"]
  },
  "c. diff": {
    name: "Clostridium Difficile",
    description: "C. diff is a bacterial infection causing severe diarrhea.",
    symptoms: ["watery diarrhea", "abdominal pain", "fever"],
    treatments: ["specific antibiotics", "probiotics"],
    specialties: ["Infectious Disease"]
  },
  "coeliac disease": {
    name: "Coeliac Disease",
    description: "Coeliac disease is an autoimmune disorder where the ingestion of gluten leads to damage in the small intestine. It affects nutrient absorption and requires a strict gluten-free diet.",
    symptoms: ["diarrhea", "abdominal pain", "bloating", "fatigue", "weight loss", "anemia", "skin rash (dermatitis herpetiformis)"],
    treatments: ["strict gluten-free diet", "nutritional supplements", "monitoring for complications", "support groups"],
    specialties: ["Gastroenterology"]
  },
  "celiac disease": {
    name: "Coeliac Disease",
    description: "Celiac disease is an autoimmune disorder triggered by gluten.",
    symptoms: ["diarrhea", "abdominal pain", "fatigue"],
    treatments: ["gluten-free diet"],
    specialties: ["Gastroenterology"]
  },
  "cold sore": {
    name: "Cold Sore",
    description: "Cold sores are small blisters that develop on the lips or around the mouth. They're caused by the herpes simplex virus and are very common.",
    symptoms: ["small blisters on or around lips", "tingling or burning before blisters appear", "pain", "crusting", "healing within 2-4 weeks"],
    treatments: ["antiviral creams or tablets", "pain relievers", "keeping area clean", "avoiding triggers (sun, stress)"],
    specialties: ["Dermatology", "Infectious Disease"]
  },
  "coma": {
    name: "Coma",
    description: "A coma is a prolonged state of unconsciousness where a person cannot be awakened and doesn't respond to stimuli. It can be caused by various conditions affecting the brain.",
    symptoms: ["unconsciousness", "no response to stimuli", "no eye opening", "no verbal response", "no motor response"],
    treatments: ["treating underlying cause", "life support", "preventing complications", "rehabilitation if recovery occurs"],
    specialties: ["Neurology", "Critical Care", "Intensive Care"]
  },
  "common cold": {
    name: "Common Cold",
    description: "The common cold is a viral infection of the upper respiratory tract. It's one of the most frequent illnesses and usually resolves on its own within a week.",
    symptoms: ["runny or stuffy nose", "sneezing", "sore throat", "cough", "mild headache", "mild body aches", "low-grade fever"],
    treatments: ["rest and fluids", "over-the-counter cold medications", "pain relievers", "saline nasal sprays", "honey for cough"],
    specialties: ["Internal Medicine", "Pediatrics"]
  },
  "complications of type 1 diabetes": {
    name: "Complications of Type 1 Diabetes",
    description: "Type 1 diabetes can lead to serious complications affecting various organs if blood sugar is not well controlled. These include heart disease, kidney disease, eye problems, and nerve damage.",
    symptoms: ["varies by complication", "vision problems", "numbness in feet", "kidney problems", "heart disease", "poor wound healing"],
    treatments: ["tight blood sugar control", "regular monitoring", "medications for complications", "lifestyle modifications", "preventive care"],
    specialties: ["Endocrinology", "Nephrology", "Ophthalmology", "Cardiology", "Neurology"]
  },
  "concussion": {
    name: "Concussion",
    description: "A concussion is a traumatic brain injury caused by a blow to the head or body that causes the brain to move rapidly inside the skull. It's a common sports injury.",
    symptoms: ["headache", "confusion", "dizziness", "nausea", "memory problems", "sensitivity to light or noise", "sleep disturbances"],
    treatments: ["rest", "avoiding activities that could cause another injury", "gradual return to activities", "pain medications", "cognitive rest"],
    specialties: ["Neurology", "Sports Medicine", "Emergency Medicine"]
  },
  "congenital heart disease": {
    name: "Congenital Heart Disease",
    description: "Congenital heart disease refers to one or more problems with the heart's structure that are present at birth. These defects can affect how the heart works.",
    symptoms: ["varies by defect", "rapid breathing", "poor feeding", "bluish skin", "fatigue", "swelling"],
    treatments: ["medications", "cardiac catheterization procedures", "surgery", "heart transplant in severe cases", "lifelong monitoring"],
    specialties: ["Pediatric Cardiology", "Cardiology", "Cardiothoracic Surgery"]
  },
  "congenital muscular dystrophy": {
    name: "Congenital Muscular Dystrophy (CMD)",
    description: "Congenital muscular dystrophy is a group of genetic muscle disorders that are present at birth or appear in early infancy. They cause progressive muscle weakness.",
    symptoms: ["muscle weakness at birth or early infancy", "delayed motor milestones", "joint contractures", "breathing problems", "feeding difficulties"],
    treatments: ["physical therapy", "respiratory support", "nutritional support", "medications", "assistive devices"],
    specialties: ["Neurology", "Pediatrics", "Physical Medicine"]
  },
  "cmd": {
    name: "Congenital Muscular Dystrophy",
    description: "CMD is a group of genetic muscle disorders present at birth.",
    symptoms: ["muscle weakness", "delayed development"],
    treatments: ["physical therapy", "respiratory support"],
    specialties: ["Neurology", "Pediatrics"]
  },
  "conjunctivitis": {
    name: "Conjunctivitis",
    description: "Conjunctivitis, also known as pink eye, is inflammation of the conjunctiva, the thin clear tissue covering the white part of the eye. It can be caused by bacteria, viruses, or allergies.",
    symptoms: ["redness in one or both eyes", "itching", "tearing", "discharge", "crusting of eyelids", "sensitivity to light"],
    treatments: ["antibiotic eye drops if bacterial", "antihistamines if allergic", "warm compresses", "artificial tears", "avoiding contact lenses"],
    specialties: ["Ophthalmology"]
  },
  "pink eye": {
    name: "Conjunctivitis",
    description: "Pink eye is inflammation of the eye's outer membrane.",
    symptoms: ["redness", "itching", "discharge"],
    treatments: ["eye drops", "warm compresses"],
    specialties: ["Ophthalmology"]
  },
  "constipation": {
    name: "Constipation",
    description: "Constipation is a condition in which you have fewer than three bowel movements a week or stools that are hard, dry, and difficult to pass.",
    symptoms: ["fewer than three bowel movements per week", "hard, dry stools", "straining during bowel movements", "feeling of incomplete evacuation", "abdominal discomfort"],
    treatments: ["increasing fiber intake", "drinking more water", "exercise", "laxatives if needed", "treating underlying causes"],
    specialties: ["Gastroenterology", "Internal Medicine"]
  },
  "coronary heart disease": {
    name: "Coronary Heart Disease",
    description: "Coronary heart disease is a condition where the coronary arteries become narrowed or blocked, reducing blood flow to the heart muscle. It's a leading cause of heart attacks.",
    symptoms: ["chest pain (angina)", "shortness of breath", "fatigue", "heart attack", "irregular heartbeat"],
    treatments: ["lifestyle changes", "medications (statins, aspirin, beta blockers)", "angioplasty and stenting", "coronary artery bypass surgery"],
    specialties: ["Cardiology", "Interventional Cardiology", "Cardiothoracic Surgery"]
  },
  "coronavirus (covid-19)": {
    name: "Coronavirus (COVID-19)",
    description: "COVID-19 is an infectious disease caused by the SARS-CoV-2 virus. It primarily affects the respiratory system but can affect multiple organs. It spread globally starting in 2019.",
    symptoms: ["fever", "cough", "shortness of breath", "fatigue", "loss of taste or smell", "body aches", "sore throat", "nausea"],
    treatments: ["rest and fluids", "fever reducers", "antiviral medications", "monoclonal antibodies", "hospitalization for severe cases", "vaccination for prevention"],
    specialties: ["Infectious Disease", "Pulmonology", "Internal Medicine", "Emergency Medicine"]
  },
  "covid-19": {
    name: "COVID-19",
    description: "COVID-19 is an infectious disease caused by the SARS-CoV-2 virus.",
    symptoms: ["fever", "cough", "shortness of breath"],
    treatments: ["symptomatic treatment", "antivirals", "vaccination"],
    specialties: ["Infectious Disease", "Pulmonology"]
  },
  "covid": {
    name: "COVID-19",
    description: "COVID-19 is a viral respiratory illness.",
    symptoms: ["fever", "cough", "fatigue"],
    treatments: ["rest", "symptomatic care", "vaccination"],
    specialties: ["Infectious Disease"]
  },
  "long covid": {
    name: "Long COVID",
    description: "Long COVID refers to symptoms that persist for weeks or months after the initial COVID-19 infection. It can affect multiple body systems.",
    symptoms: ["fatigue", "shortness of breath", "brain fog", "joint pain", "chest pain", "sleep problems", "anxiety or depression"],
    treatments: ["symptom management", "pulmonary rehabilitation", "cognitive therapy", "physical therapy", "mental health support"],
    specialties: ["Internal Medicine", "Pulmonology", "Neurology", "Physical Medicine"]
  },
  "coronavirus (covid-19): longer-term effects": {
    name: "Long COVID",
    description: "Long COVID refers to persistent symptoms that continue for weeks or months after COVID-19 infection, affecting various body systems.",
    symptoms: ["persistent fatigue", "breathing difficulties", "cognitive problems", "joint and muscle pain", "heart palpitations"],
    treatments: ["multidisciplinary care", "symptom-specific treatments", "rehabilitation", "mental health support"],
    specialties: ["Internal Medicine", "Pulmonology", "Physical Medicine"]
  },
  "costochondritis": {
    name: "Costochondritis",
    description: "Costochondritis is inflammation of the cartilage that connects a rib to the breastbone. It causes chest pain that can be mistaken for a heart attack.",
    symptoms: ["chest pain, often sharp", "pain worsens with deep breathing or movement", "tenderness when pressing on affected area", "pain on one side of chest"],
    treatments: ["pain medications (NSAIDs)", "rest", "heat or ice", "avoiding activities that worsen pain", "stretching exercises"],
    specialties: ["Rheumatology", "Internal Medicine", "Emergency Medicine"]
  },
  "cough": {
    name: "Cough",
    description: "A cough is a reflex action to clear the airways of mucus and irritants. It can be acute (short-term) or chronic (lasting more than 8 weeks) and can have many causes.",
    symptoms: ["coughing", "may be dry or productive", "may be accompanied by other symptoms depending on cause"],
    treatments: ["treating underlying cause", "cough suppressants for dry coughs", "expectorants for productive coughs", "honey", "staying hydrated"],
    specialties: ["Pulmonology", "Internal Medicine"]
  },
  "crohn's disease": {
    name: "Crohn's Disease",
    description: "Crohn's disease is a type of inflammatory bowel disease (IBD) that causes inflammation of the digestive tract, leading to abdominal pain, severe diarrhea, fatigue, weight loss, and malnutrition.",
    symptoms: ["abdominal pain and cramping", "diarrhea", "fatigue", "weight loss", "blood in stool", "mouth sores", "reduced appetite"],
    treatments: ["anti-inflammatory medications", "immune system suppressors", "antibiotics", "nutrition therapy", "surgery in severe cases"],
    specialties: ["Gastroenterology"]
  },
  "crohns disease": {
    name: "Crohn's Disease",
    description: "Crohn's disease is an inflammatory bowel disease causing chronic inflammation of the digestive tract.",
    symptoms: ["abdominal pain", "diarrhea", "weight loss"],
    treatments: ["medications", "dietary changes", "surgery"],
    specialties: ["Gastroenterology"]
  },
  "croup": {
    name: "Croup",
    description: "Croup is a viral infection that causes swelling of the voice box and windpipe, leading to a characteristic barking cough. It's most common in young children.",
    symptoms: ["barking cough", "hoarse voice", "difficulty breathing", "stridor (harsh sound when breathing in)", "fever"],
    treatments: ["cool mist or steam", "corticosteroids", "epinephrine in severe cases", "supportive care", "hospitalization if severe"],
    specialties: ["Pediatrics", "Otolaryngology", "Emergency Medicine"]
  },
  "cystic fibrosis": {
    name: "Cystic Fibrosis",
    description: "Cystic fibrosis is a genetic disorder that affects the lungs and digestive system. It causes thick, sticky mucus to build up in the lungs and other organs.",
    symptoms: ["persistent cough with thick mucus", "frequent lung infections", "wheezing", "shortness of breath", "poor growth", "salty-tasting skin"],
    treatments: ["airway clearance techniques", "medications to thin mucus", "antibiotics for infections", "pancreatic enzyme supplements", "lung transplant in severe cases"],
    specialties: ["Pulmonology", "Pediatrics", "Gastroenterology"]
  },
  "cystitis": {
    name: "Cystitis",
    description: "Cystitis is inflammation of the bladder, most commonly caused by a bacterial infection (urinary tract infection). It's more common in women.",
    symptoms: ["frequent, urgent need to urinate", "burning sensation when urinating", "passing small amounts of urine", "blood in urine", "pelvic discomfort"],
    treatments: ["antibiotics if bacterial", "drinking plenty of water", "pain relievers", "avoiding irritants", "heating pad"],
    specialties: ["Urology", "Infectious Disease"]
  }
};

// Merge with existing descriptions
for (const [key, value] of Object.entries(newDiseases)) {
  const lowerKey = key.toLowerCase();
  allDescriptions[lowerKey] = value;
  
  // Also add variations
  const variations = [
    key.replace(/'/g, ''),
    key.replace(/'/g, 's'),
    key.replace(/:/g, ''),
    key.replace(/\s+/g, '-'),
    key.replace(/\s+/g, ' '),
    key.replace(/\(/g, ''),
    key.replace(/\)/g, ''),
    key.replace(/-/g, ' ')
  ];
  
  for (const variation of variations) {
    const lowerVar = variation.toLowerCase();
    if (lowerVar !== lowerKey && lowerVar.length > 2) {
      if (!allDescriptions[lowerVar]) {
        allDescriptions[lowerVar] = value;
      }
    }
  }
}

// Generate output file
const outputCode = `// Comprehensive disease descriptions database
// Includes specific diseases from NHS Inform
// Generated: ${new Date().toISOString()}
// Total conditions: ${Object.keys(allDescriptions).length}

const comprehensiveDiseaseDescriptions = ${JSON.stringify(allDescriptions, null, 2)};

module.exports = { comprehensiveDiseaseDescriptions };
`;

const outputPath = path.join(__dirname, 'comprehensiveDiseaseDescriptions.js');
fs.writeFileSync(outputPath, outputCode, 'utf8');

console.log(`✅ Updated comprehensive disease database`);
console.log(`   Total conditions: ${Object.keys(allDescriptions).length}`);
console.log(`   New/updated conditions: ${Object.keys(newDiseases).length}`);
console.log(`   File: ${outputPath}`);

