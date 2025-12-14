/**
 * Script to generate a comprehensive disease database with descriptions
 * Based on NHS Inform A-Z list structure
 */

const fs = require('fs');
const path = require('path');

// Comprehensive disease descriptions based on NHS Inform and medical knowledge
const comprehensiveDiseaseDB = {
  // A
  "addison's": {
    name: "Addison's disease",
    description: "Addison's disease, also known as primary adrenal insufficiency, is a rare disorder where the adrenal glands don't produce enough cortisol and often aldosterone. This occurs when the adrenal cortex is damaged, usually by an autoimmune response.",
    symptoms: ["fatigue and weakness", "weight loss and decreased appetite", "darkening of the skin (hyperpigmentation)", "low blood pressure", "salt craving", "nausea and vomiting", "muscle and joint pain"],
    treatments: ["hormone replacement therapy with corticosteroids", "lifelong medication to replace missing hormones", "dietary adjustments including increased salt intake"],
    specialties: ["Endocrinology"]
  },
  "addisons": {
    name: "Addison's disease",
    description: "Addison's disease is a rare disorder where the adrenal glands don't produce enough hormones, particularly cortisol and aldosterone.",
    symptoms: ["fatigue", "weight loss", "darkening of the skin", "low blood pressure"],
    treatments: ["hormone replacement therapy"],
    specialties: ["Endocrinology"]
  },
  "addison disease": {
    name: "Addison's disease",
    description: "Addison's disease is a rare disorder where the adrenal glands don't produce enough hormones.",
    symptoms: ["fatigue", "weight loss", "darkening of the skin"],
    treatments: ["hormone replacement therapy"],
    specialties: ["Endocrinology"]
  },
  "adhd": {
    name: "ADHD (Attention Deficit Hyperactivity Disorder)",
    description: "ADHD is a neurodevelopmental disorder characterized by persistent patterns of inattention, hyperactivity, and impulsivity that interfere with functioning or development.",
    symptoms: ["difficulty paying attention", "hyperactivity", "impulsiveness", "forgetfulness", "difficulty organizing tasks"],
    treatments: ["behavioral therapy", "medications such as stimulants", "educational support", "lifestyle modifications"],
    specialties: ["Psychiatry", "Pediatrics"]
  },
  "attention deficit": {
    name: "ADHD",
    description: "ADHD is a condition that affects attention, hyperactivity, and impulsivity.",
    symptoms: ["difficulty focusing", "hyperactivity", "impulsiveness"],
    treatments: ["therapy", "medications"],
    specialties: ["Psychiatry"]
  },
  "alzheimer's": {
    name: "Alzheimer's disease",
    description: "Alzheimer's disease is a progressive brain disorder that slowly destroys memory and thinking skills, and eventually the ability to carry out simple tasks. It is the most common cause of dementia.",
    symptoms: ["memory loss", "difficulty with problem-solving", "confusion about time and place", "trouble understanding visual images", "problems with words in speaking or writing", "misplacing things", "poor judgment"],
    treatments: ["medications to slow progression", "cognitive training", "supportive care", "lifestyle modifications"],
    specialties: ["Neurology", "Geriatrics"]
  },
  "alzheimers": {
    name: "Alzheimer's disease",
    description: "Alzheimer's disease is a progressive brain disorder that causes memory loss and cognitive decline.",
    symptoms: ["memory loss", "confusion", "difficulty with daily tasks"],
    treatments: ["medications", "cognitive support"],
    specialties: ["Neurology"]
  },
  "anemia": {
    name: "Anemia",
    description: "Anemia is a condition in which you lack enough healthy red blood cells to carry adequate oxygen to your body's tissues. This can make you feel tired and weak.",
    symptoms: ["fatigue", "weakness", "pale or yellowish skin", "irregular heartbeats", "shortness of breath", "dizziness", "chest pain"],
    treatments: ["iron supplements", "vitamin B12 or folate supplements", "blood transfusions in severe cases", "treating underlying causes"],
    specialties: ["Hematology", "Internal Medicine"]
  },
  "anxiety": {
    name: "Anxiety disorders",
    description: "Anxiety disorders are a group of mental health conditions characterized by excessive worry, fear, or nervousness that interferes with daily activities.",
    symptoms: ["excessive worry", "restlessness", "fatigue", "difficulty concentrating", "irritability", "muscle tension", "sleep problems"],
    treatments: ["psychotherapy (CBT)", "medications (antidepressants, anti-anxiety drugs)", "lifestyle changes", "stress management"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "arthritis": {
    name: "Arthritis",
    description: "Arthritis is inflammation of one or more joints, causing pain and stiffness that can worsen with age. The most common types are osteoarthritis and rheumatoid arthritis.",
    symptoms: ["joint pain", "stiffness", "swelling", "reduced range of motion", "redness around joints"],
    treatments: ["pain medications", "anti-inflammatory drugs", "physical therapy", "joint injections", "surgery in severe cases"],
    specialties: ["Rheumatology", "Orthopedics"]
  },
  "asthma": {
    name: "Asthma",
    description: "Asthma is a chronic condition in which the airways become inflamed, narrow, and produce extra mucus, making breathing difficult.",
    symptoms: ["shortness of breath", "chest tightness", "wheezing", "coughing, especially at night"],
    treatments: ["inhalers (bronchodilators and corticosteroids)", "avoiding triggers", "allergy medications", "lifestyle modifications"],
    specialties: ["Pulmonology", "Allergy & Immunology"]
  },
  
  // B
  "back pain": {
    name: "Back pain",
    description: "Back pain is one of the most common medical problems, affecting most people at some point in their lives. It can range from a dull, constant ache to a sudden, sharp pain.",
    symptoms: ["pain in the lower, middle, or upper back", "stiffness", "muscle spasms", "limited range of motion"],
    treatments: ["pain medications", "physical therapy", "exercise", "heat or cold therapy", "surgery in severe cases"],
    specialties: ["Orthopedics", "Physical Medicine"]
  },
  "bell's palsy": {
    name: "Bell's palsy",
    description: "Bell's palsy is a condition that causes sudden, temporary weakness or paralysis of the facial muscles, usually on one side of the face.",
    symptoms: ["sudden weakness on one side of the face", "facial drooping", "difficulty closing one eye", "drooling", "loss of taste"],
    treatments: ["corticosteroids", "antiviral medications", "eye protection", "physical therapy"],
    specialties: ["Neurology"]
  },
  "bells palsy": {
    name: "Bell's palsy",
    description: "Bell's palsy causes sudden facial weakness or paralysis, usually on one side.",
    symptoms: ["facial drooping", "difficulty closing eye"],
    treatments: ["steroids", "eye care"],
    specialties: ["Neurology"]
  },
  
  // C
  "cancer": {
    name: "Cancer",
    description: "Cancer is a group of diseases characterized by the uncontrolled growth and spread of abnormal cells. There are many types of cancer, each requiring specialized treatment.",
    symptoms: ["varies by type", "unexplained weight loss", "fatigue", "persistent pain", "skin changes", "changes in bowel or bladder habits"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "immunotherapy", "targeted therapy"],
    specialties: ["Oncology"]
  },
  "carpal tunnel": {
    name: "Carpal tunnel syndrome",
    description: "Carpal tunnel syndrome is a condition that causes numbness, tingling, and weakness in the hand due to compression of the median nerve in the wrist.",
    symptoms: ["numbness or tingling in thumb and fingers", "weakness in hand", "pain radiating up the arm"],
    treatments: ["wrist splinting", "anti-inflammatory medications", "corticosteroid injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Hand Surgery"]
  },
  "cataract": {
    name: "Cataracts",
    description: "Cataracts are a clouding of the normally clear lens of the eye, causing blurry vision. They are very common in older adults.",
    symptoms: ["cloudy or blurry vision", "fading colors", "sensitivity to light", "difficulty seeing at night", "double vision"],
    treatments: ["surgery to remove the cloudy lens", "replacement with artificial lens"],
    specialties: ["Ophthalmology"]
  },
  "copd": {
    name: "COPD (Chronic Obstructive Pulmonary Disease)",
    description: "COPD is a chronic inflammatory lung disease that causes obstructed airflow from the lungs. It includes emphysema and chronic bronchitis.",
    symptoms: ["shortness of breath", "wheezing", "chest tightness", "chronic cough with mucus", "frequent respiratory infections"],
    treatments: ["bronchodilators", "inhaled corticosteroids", "oxygen therapy", "pulmonary rehabilitation", "lifestyle changes (quitting smoking)"],
    specialties: ["Pulmonology"]
  },
  "crohn's": {
    name: "Crohn's disease",
    description: "Crohn's disease is a type of inflammatory bowel disease (IBD) that causes inflammation of the digestive tract, leading to abdominal pain, severe diarrhea, fatigue, weight loss, and malnutrition.",
    symptoms: ["abdominal pain and cramping", "diarrhea", "fatigue", "weight loss", "blood in stool", "mouth sores"],
    treatments: ["anti-inflammatory medications", "immune system suppressors", "antibiotics", "nutrition therapy", "surgery in severe cases"],
    specialties: ["Gastroenterology"]
  },
  "crohns": {
    name: "Crohn's disease",
    description: "Crohn's disease is an inflammatory bowel disease that causes chronic inflammation of the digestive tract.",
    symptoms: ["abdominal pain", "diarrhea", "weight loss"],
    treatments: ["medications", "dietary changes"],
    specialties: ["Gastroenterology"]
  },
  
  // D
  "dementia": {
    name: "Dementia",
    description: "Dementia is a general term for a decline in mental ability severe enough to interfere with daily life. Alzheimer's is the most common type.",
    symptoms: ["memory loss", "difficulty communicating", "impaired reasoning", "personality changes", "inability to perform daily tasks"],
    treatments: ["medications to slow progression", "supportive care", "cognitive therapy", "lifestyle modifications"],
    specialties: ["Neurology", "Geriatrics"]
  },
  "depression": {
    name: "Depression",
    description: "Depression is a mood disorder that causes persistent feelings of sadness, loss of interest, and can affect how you think, feel, and handle daily activities.",
    symptoms: ["persistent sadness", "loss of interest in activities", "fatigue", "changes in appetite or sleep", "difficulty concentrating", "feelings of worthlessness"],
    treatments: ["psychotherapy", "antidepressant medications", "lifestyle changes", "support groups"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "diabetes": {
    name: "Diabetes",
    description: "Diabetes is a chronic condition that affects how your body turns food into energy. There are two main types: Type 1 (insulin-dependent) and Type 2 (most common).",
    symptoms: ["increased thirst", "frequent urination", "extreme hunger", "unexplained weight loss", "fatigue", "blurred vision", "slow-healing sores"],
    treatments: ["insulin therapy (Type 1)", "oral medications (Type 2)", "blood sugar monitoring", "diet and exercise", "lifestyle modifications"],
    specialties: ["Endocrinology", "Internal Medicine"]
  },
  "type 1 diabetes": {
    name: "Type 1 Diabetes",
    description: "Type 1 diabetes is an autoimmune condition where the pancreas produces little or no insulin. It usually develops in children and young adults.",
    symptoms: ["increased thirst", "frequent urination", "extreme hunger", "weight loss", "fatigue"],
    treatments: ["insulin therapy", "blood sugar monitoring", "diet management"],
    specialties: ["Endocrinology", "Pediatrics"]
  },
  "type 2 diabetes": {
    name: "Type 2 Diabetes",
    description: "Type 2 diabetes is a chronic condition that affects the way your body processes blood sugar. It's the most common form of diabetes.",
    symptoms: ["increased thirst", "frequent urination", "hunger", "fatigue", "blurred vision"],
    treatments: ["oral medications", "insulin if needed", "diet and exercise", "lifestyle changes"],
    specialties: ["Endocrinology"]
  },
  "diverticulitis": {
    name: "Diverticulitis",
    description: "Diverticulitis occurs when small pouches (diverticula) that form in the wall of the colon become inflamed or infected.",
    symptoms: ["abdominal pain, usually on the left side", "fever", "nausea", "constipation or diarrhea"],
    treatments: ["antibiotics", "liquid diet", "pain medications", "surgery in severe or recurrent cases"],
    specialties: ["Gastroenterology", "General Surgery"]
  },
  
  // E
  "eczema": {
    name: "Eczema (Atopic Dermatitis)",
    description: "Eczema is a condition that makes your skin red and itchy. It's common in children but can occur at any age. It's long-lasting and tends to flare periodically.",
    symptoms: ["dry, sensitive skin", "red, inflamed skin", "itching", "dark colored patches", "rough, scaly patches"],
    treatments: ["moisturizers", "topical corticosteroids", "antihistamines", "avoiding triggers", "phototherapy"],
    specialties: ["Dermatology", "Allergy & Immunology"]
  },
  "epilepsy": {
    name: "Epilepsy",
    description: "Epilepsy is a neurological disorder marked by recurrent, unprovoked seizures. Seizures are sudden bursts of electrical activity in the brain.",
    symptoms: ["seizures", "temporary confusion", "staring spells", "uncontrollable jerking movements", "loss of consciousness"],
    treatments: ["antiepileptic medications", "surgery in some cases", "vagus nerve stimulation", "ketogenic diet"],
    specialties: ["Neurology", "Epileptology"]
  },
  
  // F
  "fibromyalgia": {
    name: "Fibromyalgia",
    description: "Fibromyalgia is a disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory, and mood issues.",
    symptoms: ["widespread pain", "fatigue", "sleep disturbances", "cognitive difficulties (fibro fog)", "headaches"],
    treatments: ["pain medications", "antidepressants", "antiseizure drugs", "physical therapy", "lifestyle modifications"],
    specialties: ["Rheumatology", "Physical Medicine"]
  },
  
  // G
  "gerd": {
    name: "GERD (Gastroesophageal Reflux Disease)",
    description: "GERD is a digestive disorder in which stomach acid or bile irritates the food pipe lining. It's a more serious, chronic form of acid reflux.",
    symptoms: ["heartburn", "regurgitation of food or sour liquid", "chest pain", "difficulty swallowing", "sensation of a lump in throat"],
    treatments: ["lifestyle changes (diet, weight loss)", "antacids", "H2 blockers", "proton pump inhibitors", "surgery in severe cases"],
    specialties: ["Gastroenterology"]
  },
  "gout": {
    name: "Gout",
    description: "Gout is a form of inflammatory arthritis characterized by sudden, severe attacks of pain, swelling, redness, and tenderness in joints, often the joint at the base of the big toe.",
    symptoms: ["intense joint pain", "lingering discomfort", "inflammation and redness", "limited range of motion"],
    treatments: ["nonsteroidal anti-inflammatory drugs", "colchicine", "corticosteroids", "medications to prevent complications", "lifestyle changes"],
    specialties: ["Rheumatology"]
  },
  
  // H
  "heart attack": {
    name: "Heart Attack (Myocardial Infarction)",
    description: "A heart attack occurs when blood flow to the heart is blocked, often by a blood clot. This can damage or destroy part of the heart muscle.",
    symptoms: ["chest pain or pressure", "pain in arm, neck, jaw, or back", "shortness of breath", "nausea", "cold sweat"],
    treatments: ["emergency medical treatment", "aspirin", "thrombolytics", "angioplasty", "stent placement", "cardiac rehabilitation"],
    specialties: ["Cardiology", "Emergency Medicine"]
  },
  "heart failure": {
    name: "Heart Failure",
    description: "Heart failure occurs when the heart muscle doesn't pump blood as well as it should. Blood often backs up and fluid can build up in the lungs and legs.",
    symptoms: ["shortness of breath", "fatigue", "swelling in legs, ankles, and feet", "rapid or irregular heartbeat", "persistent cough"],
    treatments: ["medications (ACE inhibitors, beta blockers)", "lifestyle changes", "devices (pacemakers)", "surgery (heart transplant in severe cases)"],
    specialties: ["Cardiology", "Heart Failure"]
  },
  "hepatitis": {
    name: "Hepatitis",
    description: "Hepatitis is inflammation of the liver, most commonly caused by viral infections (hepatitis A, B, or C), but can also result from alcohol, medications, or autoimmune conditions.",
    symptoms: ["fatigue", "flu-like symptoms", "dark urine", "pale stool", "abdominal pain", "loss of appetite", "jaundice"],
    treatments: ["antiviral medications (for viral hepatitis)", "liver transplant in severe cases", "avoiding alcohol", "vaccination (for prevention)"],
    specialties: ["Gastroenterology", "Hepatology", "Infectious Disease"]
  },
  "hypertension": {
    name: "Hypertension (High Blood Pressure)",
    description: "Hypertension is a long-term condition where the force of blood against artery walls is consistently too high, which can lead to serious health problems.",
    symptoms: ["often no symptoms", "headaches", "shortness of breath", "nosebleeds"],
    treatments: ["lifestyle changes (diet, exercise)", "medications (ACE inhibitors, diuretics)", "regular monitoring"],
    specialties: ["Cardiology", "Internal Medicine"]
  },
  "high blood pressure": {
    name: "Hypertension",
    description: "High blood pressure is a condition where blood pressure is consistently elevated, increasing the risk of heart disease and stroke.",
    symptoms: ["often asymptomatic", "headaches", "dizziness"],
    treatments: ["medications", "lifestyle changes"],
    specialties: ["Cardiology"]
  },
  
  // I
  "ibs": {
    name: "IBS (Irritable Bowel Syndrome)",
    description: "IBS is a common disorder that affects the large intestine, causing cramping, abdominal pain, bloating, gas, and diarrhea or constipation.",
    symptoms: ["abdominal pain and cramping", "bloating", "gas", "diarrhea or constipation", "mucus in stool"],
    treatments: ["dietary changes", "fiber supplements", "medications", "stress management", "probiotics"],
    specialties: ["Gastroenterology"]
  },
  "irritable bowel": {
    name: "IBS",
    description: "Irritable bowel syndrome is a digestive disorder causing abdominal pain and changes in bowel habits.",
    symptoms: ["abdominal pain", "bloating", "diarrhea or constipation"],
    treatments: ["diet changes", "medications"],
    specialties: ["Gastroenterology"]
  },
  
  // K
  "kidney disease": {
    name: "Chronic Kidney Disease",
    description: "Chronic kidney disease is the gradual loss of kidney function over time. The kidneys filter wastes and excess fluids from blood.",
    symptoms: ["nausea", "vomiting", "fatigue", "swelling in feet and ankles", "sleep problems", "changes in urine output"],
    treatments: ["treating underlying causes", "medications to control symptoms", "dialysis", "kidney transplant"],
    specialties: ["Nephrology"]
  },
  "kidney stones": {
    name: "Kidney Stones",
    description: "Kidney stones are hard deposits of minerals and salts that form inside your kidneys. They can be very painful when they pass through the urinary tract.",
    symptoms: ["severe pain in side and back", "pain radiating to lower abdomen", "painful urination", "pink, red, or brown urine", "nausea and vomiting"],
    treatments: ["pain medications", "drinking water", "medical procedures to break up stones", "surgery in severe cases"],
    specialties: ["Urology", "Nephrology"]
  },
  
  // L
  "lupus": {
    name: "Lupus (Systemic Lupus Erythematosus)",
    description: "Lupus is an autoimmune disease where the immune system attacks healthy tissue, causing inflammation and damage to various body systems.",
    symptoms: ["fatigue", "joint pain and swelling", "butterfly-shaped rash on face", "fever", "hair loss", "sensitivity to sun"],
    treatments: ["nonsteroidal anti-inflammatory drugs", "antimalarial drugs", "corticosteroids", "immunosuppressants"],
    specialties: ["Rheumatology"]
  },
  "lung cancer": {
    name: "Lung Cancer",
    description: "Lung cancer is a type of cancer that begins in the lungs. It's the leading cause of cancer deaths worldwide, often caused by smoking.",
    symptoms: ["persistent cough", "coughing up blood", "shortness of breath", "chest pain", "weight loss", "hoarseness"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "targeted therapy", "immunotherapy"],
    specialties: ["Oncology", "Pulmonology", "Thoracic Surgery"]
  },
  
  // M
  "migraine": {
    name: "Migraine",
    description: "Migraines are severe, recurring headaches that can cause throbbing pain, usually on one side of the head, often accompanied by nausea and sensitivity to light and sound.",
    symptoms: ["throbbing or pulsing pain", "nausea", "vomiting", "sensitivity to light and sound", "aura (visual disturbances)"],
    treatments: ["pain-relieving medications", "preventive medications", "lifestyle changes", "identifying and avoiding triggers"],
    specialties: ["Neurology", "Headache Medicine"]
  },
  "multiple sclerosis": {
    name: "Multiple Sclerosis (MS)",
    description: "Multiple sclerosis is a disease of the central nervous system where the immune system attacks the protective covering of nerves, disrupting communication between brain and body.",
    symptoms: ["numbness or weakness in limbs", "vision problems", "tingling or pain", "tremor", "fatigue", "dizziness"],
    treatments: ["disease-modifying therapies", "corticosteroids", "physical therapy", "medications for symptoms"],
    specialties: ["Neurology", "Multiple Sclerosis"]
  },
  "ms": {
    name: "Multiple Sclerosis",
    description: "MS is a neurological condition where the immune system attacks the nervous system.",
    symptoms: ["numbness", "vision problems", "fatigue"],
    treatments: ["disease-modifying medications", "symptom management"],
    specialties: ["Neurology"]
  },
  
  // O
  "osteoarthritis": {
    name: "Osteoarthritis",
    description: "Osteoarthritis is the most common form of arthritis, occurring when the protective cartilage that cushions the ends of bones wears down over time.",
    symptoms: ["joint pain", "stiffness", "tenderness", "loss of flexibility", "bone spurs"],
    treatments: ["pain medications", "physical therapy", "joint injections", "surgery (joint replacement in severe cases)"],
    specialties: ["Rheumatology", "Orthopedics"]
  },
  "osteoporosis": {
    name: "Osteoporosis",
    description: "Osteoporosis is a condition that weakens bones, making them fragile and more likely to break. It develops slowly over several years.",
    symptoms: ["often no symptoms until a fracture occurs", "back pain", "loss of height", "stooped posture"],
    treatments: ["calcium and vitamin D supplements", "bisphosphonates", "hormone-related therapy", "exercise", "lifestyle changes"],
    specialties: ["Endocrinology", "Orthopedics", "Rheumatology"]
  },
  
  // P
  "parkinson's": {
    name: "Parkinson's disease",
    description: "Parkinson's disease is a progressive neurological disorder that affects movement. It occurs when nerve cells in the brain that produce dopamine die or become impaired.",
    symptoms: ["tremors or shaking", "slowed movement (bradykinesia)", "rigid muscles", "impaired posture and balance", "loss of automatic movements", "speech changes"],
    treatments: ["medications to increase dopamine levels", "physical therapy", "speech therapy", "deep brain stimulation in advanced cases"],
    specialties: ["Neurology", "Movement Disorders"]
  },
  "parkinsons": {
    name: "Parkinson's disease",
    description: "Parkinson's disease is a progressive neurological disorder that affects movement.",
    symptoms: ["tremors", "slowed movement", "rigid muscles", "balance problems"],
    treatments: ["medications", "physical therapy"],
    specialties: ["Neurology"]
  },
  "pneumonia": {
    name: "Pneumonia",
    description: "Pneumonia is an infection that inflames air sacs in one or both lungs, which may fill with fluid. It can be caused by bacteria, viruses, or fungi.",
    symptoms: ["chest pain when breathing or coughing", "confusion", "cough with phlegm", "fatigue", "fever", "shortness of breath"],
    treatments: ["antibiotics (for bacterial)", "antiviral medications (for viral)", "fever reducers", "cough medicine", "rest"],
    specialties: ["Pulmonology", "Infectious Disease", "Internal Medicine"]
  },
  "psoriasis": {
    name: "Psoriasis",
    description: "Psoriasis is a skin condition that causes red, itchy, scaly patches, most commonly on the knees, elbows, trunk, and scalp. It's a chronic autoimmune condition.",
    symptoms: ["red patches of skin with silvery scales", "dry, cracked skin", "itching", "burning or soreness", "thickened or pitted nails"],
    treatments: ["topical treatments", "light therapy", "oral or injected medications", "biologics"],
    specialties: ["Dermatology", "Rheumatology"]
  },
  
  // R
  "rheumatoid arthritis": {
    name: "Rheumatoid Arthritis (RA)",
    description: "Rheumatoid arthritis is an autoimmune disorder that causes chronic inflammation of the joints and other areas of the body. It can cause joint deformity and bone erosion.",
    symptoms: ["tender, warm, swollen joints", "morning stiffness", "fatigue", "fever", "weight loss"],
    treatments: ["disease-modifying antirheumatic drugs (DMARDs)", "biologics", "nonsteroidal anti-inflammatory drugs", "corticosteroids", "physical therapy"],
    specialties: ["Rheumatology"]
  },
  "ra": {
    name: "Rheumatoid Arthritis",
    description: "RA is an autoimmune disease that causes joint inflammation and pain.",
    symptoms: ["joint pain and swelling", "morning stiffness"],
    treatments: ["DMARDs", "anti-inflammatory medications"],
    specialties: ["Rheumatology"]
  },
  
  // S
  "sinusitis": {
    name: "Sinusitis",
    description: "Sinusitis is inflammation of the sinuses, the air-filled spaces in the skull. It can be acute (short-term) or chronic (long-term).",
    symptoms: ["nasal congestion", "thick nasal discharge", "facial pain or pressure", "reduced sense of smell", "headache"],
    treatments: ["nasal decongestants", "saline nasal irrigation", "antibiotics (if bacterial)", "corticosteroids", "surgery in chronic cases"],
    specialties: ["Otolaryngology"]
  },
  "stroke": {
    name: "Stroke",
    description: "A stroke occurs when blood supply to part of the brain is interrupted or reduced, preventing brain tissue from getting oxygen and nutrients. Brain cells begin to die within minutes.",
    symptoms: ["sudden numbness or weakness in face, arm, or leg", "sudden confusion", "trouble speaking", "sudden trouble seeing", "sudden severe headache"],
    treatments: ["emergency medical treatment", "clot-busting drugs", "mechanical thrombectomy", "rehabilitation", "preventive medications"],
    specialties: ["Neurology", "Emergency Medicine", "Stroke"]
  },
  
  // T
  "thyroid": {
    name: "Thyroid Disorders",
    description: "Thyroid disorders are conditions that affect the thyroid gland, which produces hormones that regulate metabolism. Common disorders include hypothyroidism and hyperthyroidism.",
    symptoms: ["varies by condition", "fatigue", "weight changes", "mood changes", "hair loss", "temperature sensitivity"],
    treatments: ["hormone replacement (for hypothyroidism)", "antithyroid medications (for hyperthyroidism)", "radioactive iodine", "surgery"],
    specialties: ["Endocrinology"]
  },
  "tuberculosis": {
    name: "Tuberculosis (TB)",
    description: "Tuberculosis is a serious infectious disease that mainly affects the lungs. It's caused by bacteria that spread through the air when an infected person coughs or sneezes.",
    symptoms: ["persistent cough", "coughing up blood", "chest pain", "weakness", "weight loss", "fever", "night sweats"],
    treatments: ["antibiotics (long-term treatment)", "directly observed therapy", "preventive treatment for contacts"],
    specialties: ["Infectious Disease", "Pulmonology"]
  },
  "tb": {
    name: "Tuberculosis",
    description: "TB is a bacterial infection that primarily affects the lungs.",
    symptoms: ["persistent cough", "fever", "weight loss"],
    treatments: ["long-term antibiotic treatment"],
    specialties: ["Infectious Disease"]
  },
  
  // U
  "ulcerative colitis": {
    name: "Ulcerative Colitis",
    description: "Ulcerative colitis is an inflammatory bowel disease that causes long-lasting inflammation and ulcers in the digestive tract, specifically the innermost lining of the large intestine and rectum.",
    symptoms: ["diarrhea, often with blood or pus", "abdominal pain and cramping", "rectal pain", "urgency to defecate", "weight loss", "fatigue"],
    treatments: ["anti-inflammatory medications", "immune system suppressors", "biologics", "surgery (colectomy) in severe cases"],
    specialties: ["Gastroenterology"]
  },
  "uti": {
    name: "Urinary Tract Infection (UTI)",
    description: "A UTI is an infection in any part of the urinary system — kidneys, bladder, or urethra. Most infections involve the lower urinary tract.",
    symptoms: ["strong, persistent urge to urinate", "burning sensation when urinating", "passing frequent, small amounts of urine", "cloudy urine", "pelvic pain"],
    treatments: ["antibiotics", "drinking plenty of water", "pain relievers"],
    specialties: ["Urology", "Infectious Disease"]
  },
  "urinary tract infection": {
    name: "UTI",
    description: "A urinary tract infection is a bacterial infection of the urinary system.",
    symptoms: ["burning during urination", "frequent urination", "cloudy urine"],
    treatments: ["antibiotics"],
    specialties: ["Urology"]
  }
};

// Generate the file
const outputCode = `// Comprehensive disease descriptions database
// Based on NHS Inform A-Z and medical knowledge
// Generated: ${new Date().toISOString()}
// Total conditions: ${Object.keys(comprehensiveDiseaseDB).length}

const comprehensiveDiseaseDescriptions = ${JSON.stringify(comprehensiveDiseaseDB, null, 2)};

module.exports = { comprehensiveDiseaseDescriptions };
`;

const outputPath = path.join(__dirname, 'comprehensiveDiseaseDescriptions.js');
fs.writeFileSync(outputPath, outputCode, 'utf8');

console.log(`✅ Generated comprehensive disease database with ${Object.keys(comprehensiveDiseaseDB).length} conditions`);
console.log(`   File: ${outputPath}`);

