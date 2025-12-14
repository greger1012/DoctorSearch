/**
 * Script to add diseases starting with G, H, I from NHS Inform with detailed descriptions
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
  "gallbladder cancer": {
    name: "Gallbladder Cancer",
    description: "Gallbladder cancer is a rare cancer that begins in the gallbladder, a small organ that stores bile. It's often discovered at a late stage because early symptoms are rare.",
    symptoms: ["abdominal pain", "nausea and vomiting", "jaundice", "fever", "bloating", "lumps in abdomen"],
    treatments: ["surgery to remove gallbladder and surrounding tissue", "chemotherapy", "radiation therapy", "targeted therapy"],
    specialties: ["Oncology", "Surgical Oncology", "Gastroenterology"]
  },
  "gallstones": {
    name: "Gallstones",
    description: "Gallstones are hardened deposits of digestive fluid that can form in the gallbladder. They can range in size from a grain of sand to a golf ball and may cause no symptoms or severe pain.",
    symptoms: ["often no symptoms", "sudden pain in upper right abdomen", "back pain between shoulder blades", "nausea", "vomiting", "jaundice if blocking bile duct"],
    treatments: ["watchful waiting if no symptoms", "medications to dissolve stones", "surgery to remove gallbladder (cholecystectomy)", "ERCP to remove stones from bile duct"],
    specialties: ["Gastroenterology", "General Surgery"]
  },
  "ganglion cyst": {
    name: "Ganglion Cyst",
    description: "A ganglion cyst is a noncancerous, fluid-filled lump that most commonly develops along the tendons or joints of wrists or hands, but can also occur in ankles and feet.",
    symptoms: ["lump or mass", "usually painless but can cause discomfort", "may change in size", "firm or spongy to touch"],
    treatments: ["watchful waiting (many disappear on their own)", "aspiration (draining fluid)", "surgery to remove cyst", "immobilization"],
    specialties: ["Orthopedics", "Hand Surgery", "Dermatology"]
  },
  "ganglion cysts in children": {
    name: "Ganglion Cysts in Children and Young People",
    description: "Ganglion cysts in children are similar to those in adults but may require different management approaches. They're usually benign and often resolve without treatment.",
    symptoms: ["lump on wrist, hand, or foot", "usually painless", "may interfere with activities"],
    treatments: ["observation (often resolve spontaneously)", "aspiration if causing problems", "surgery rarely needed"],
    specialties: ["Pediatrics", "Pediatric Orthopedics"]
  },
  "gastroenteritis": {
    name: "Gastroenteritis",
    description: "Gastroenteritis is inflammation of the stomach and intestines, usually caused by a viral or bacterial infection. It's commonly known as stomach flu, though it's not related to influenza.",
    symptoms: ["diarrhea", "nausea and vomiting", "abdominal cramps", "fever", "headache", "muscle aches"],
    treatments: ["rest and fluids", "oral rehydration solutions", "avoiding solid foods initially", "antibiotics if bacterial", "preventing dehydration"],
    specialties: ["Gastroenterology", "Infectious Disease", "Internal Medicine", "Pediatrics"]
  },
  "gastro-oesophageal reflux disease": {
    name: "Gastro-oesophageal Reflux Disease (GORD)",
    description: "GORD, also known as GERD, is a digestive disorder in which stomach acid or bile irritates the food pipe lining. It's a more serious, chronic form of acid reflux.",
    symptoms: ["heartburn", "regurgitation of food or sour liquid", "chest pain", "difficulty swallowing", "sensation of a lump in throat", "chronic cough"],
    treatments: ["lifestyle changes (diet, weight loss, elevating head)", "antacids", "H2 blockers", "proton pump inhibitors", "surgery in severe cases"],
    specialties: ["Gastroenterology"]
  },
  "gord": {
    name: "GORD (GERD)",
    description: "GORD is a chronic form of acid reflux causing stomach acid to irritate the esophagus.",
    symptoms: ["heartburn", "regurgitation", "chest pain"],
    treatments: ["lifestyle changes", "medications", "surgery if needed"],
    specialties: ["Gastroenterology"]
  },
  "gerd": {
    name: "GERD",
    description: "GERD is gastroesophageal reflux disease, a chronic digestive disorder.",
    symptoms: ["heartburn", "acid regurgitation"],
    treatments: ["medications", "lifestyle changes"],
    specialties: ["Gastroenterology"]
  },
  "generalised anxiety disorder": {
    name: "Generalised Anxiety Disorder (GAD)",
    description: "Generalised anxiety disorder is a mental health condition characterized by persistent and excessive worry about various aspects of daily life. The worry is out of proportion to the actual circumstances.",
    symptoms: ["excessive worry", "restlessness", "fatigue", "difficulty concentrating", "irritability", "muscle tension", "sleep problems"],
    treatments: ["psychotherapy (CBT)", "medications (antidepressants, anti-anxiety drugs)", "lifestyle changes", "stress management techniques"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "gad": {
    name: "Generalised Anxiety Disorder",
    description: "GAD is a condition involving excessive, persistent worry.",
    symptoms: ["excessive worry", "restlessness", "fatigue"],
    treatments: ["therapy", "medications"],
    specialties: ["Psychiatry"]
  },
  "genital herpes": {
    name: "Genital Herpes",
    description: "Genital herpes is a common sexually transmitted infection caused by the herpes simplex virus. It causes sores or blisters in the genital area and can recur periodically.",
    symptoms: ["small blisters or sores in genital area", "pain or itching", "flu-like symptoms during first outbreak", "recurrent outbreaks"],
    treatments: ["antiviral medications", "pain relievers", "keeping area clean and dry", "avoiding sexual contact during outbreaks"],
    specialties: ["Infectious Disease", "Urology", "Obstetrics & Gynecology", "Dermatology"]
  },
  "genital symptoms": {
    name: "Genital Symptoms",
    description: "Genital symptoms can include various issues affecting the genital area, such as itching, pain, discharge, or sores. They can have many causes and require medical evaluation.",
    symptoms: ["varies by condition", "itching", "pain", "discharge", "sores", "swelling", "rashes"],
    treatments: ["depends on underlying cause", "may include antibiotics, antifungals, or other medications", "good hygiene", "avoiding irritants"],
    specialties: ["Urology", "Obstetrics & Gynecology", "Dermatology", "Infectious Disease"]
  },
  "genital warts": {
    name: "Genital Warts",
    description: "Genital warts are a common sexually transmitted infection caused by certain types of human papillomavirus (HPV). They appear as small bumps or groups of bumps in the genital area.",
    symptoms: ["small bumps in genital area", "clusters that look like cauliflower", "usually painless", "may itch or cause discomfort"],
    treatments: ["topical medications", "cryotherapy (freezing)", "surgical removal", "laser treatment", "HPV vaccination for prevention"],
    specialties: ["Infectious Disease", "Urology", "Obstetrics & Gynecology", "Dermatology"]
  },
  "germ cell tumours": {
    name: "Germ Cell Tumours",
    description: "Germ cell tumours are a type of cancer that develops from germ cells, which normally develop into eggs or sperm. They can occur in the ovaries, testicles, or other areas.",
    symptoms: ["varies by location", "testicular or ovarian mass", "abdominal pain", "back pain", "hormonal changes"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "hormone therapy"],
    specialties: ["Oncology", "Urology", "Gynecologic Oncology"]
  },
  "germ cell tumors": {
    name: "Germ Cell Tumours",
    description: "Germ cell tumors are cancers developing from reproductive cells.",
    symptoms: ["varies by location"],
    treatments: ["surgery", "chemotherapy"],
    specialties: ["Oncology"]
  },
  "glandular fever": {
    name: "Glandular Fever (Infectious Mononucleosis)",
    description: "Glandular fever, also known as infectious mononucleosis or 'mono', is caused by the Epstein-Barr virus. It's common in teenagers and young adults and causes fatigue and swollen glands.",
    symptoms: ["extreme fatigue", "fever", "sore throat", "swollen lymph nodes", "swollen tonsils", "headache", "skin rash"],
    treatments: ["rest", "fluids", "pain relievers", "avoiding contact sports (spleen may be enlarged)", "usually resolves on its own"],
    specialties: ["Infectious Disease", "Internal Medicine", "Pediatrics"]
  },
  "mononucleosis": {
    name: "Glandular Fever",
    description: "Mononucleosis is a viral infection causing fatigue and swollen glands.",
    symptoms: ["fatigue", "fever", "sore throat"],
    treatments: ["rest", "supportive care"],
    specialties: ["Infectious Disease"]
  },
  "golfers elbow": {
    name: "Golfer's Elbow (Medial Epicondylitis)",
    description: "Golfer's elbow is a condition that causes pain on the inside of the elbow, where the tendons attach to the bony bump. Despite its name, it can affect anyone, not just golfers.",
    symptoms: ["pain on inside of elbow", "pain that worsens with gripping", "weakness in hand and wrist", "numbness or tingling"],
    treatments: ["rest", "ice", "pain medications", "physical therapy", "braces or straps", "corticosteroid injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Sports Medicine", "Physical Medicine"]
  },
  "medial epicondylitis": {
    name: "Golfer's Elbow",
    description: "Medial epicondylitis is inflammation of the inner elbow tendons.",
    symptoms: ["inner elbow pain", "weakness"],
    treatments: ["rest", "physical therapy", "injections"],
    specialties: ["Orthopedics"]
  },
  "gonorrhoea": {
    name: "Gonorrhoea",
    description: "Gonorrhoea is a sexually transmitted infection caused by bacteria. It can infect the genitals, rectum, and throat. Many people have no symptoms.",
    symptoms: ["often no symptoms", "painful urination", "discharge from penis or vagina", "painful bowel movements", "sore throat"],
    treatments: ["antibiotics", "partner treatment", "abstinence during treatment", "regular STI screening"],
    specialties: ["Infectious Disease", "Urology", "Obstetrics & Gynecology"]
  },
  "gonorrhea": {
    name: "Gonorrhoea",
    description: "Gonorrhea is a bacterial sexually transmitted infection.",
    symptoms: ["often asymptomatic", "discharge", "painful urination"],
    treatments: ["antibiotics"],
    specialties: ["Infectious Disease"]
  },
  "gout": {
    name: "Gout",
    description: "Gout is a form of inflammatory arthritis characterized by sudden, severe attacks of pain, swelling, redness, and tenderness in joints, often the joint at the base of the big toe.",
    symptoms: ["intense joint pain", "lingering discomfort", "inflammation and redness", "limited range of motion", "tophi (lumps under skin) in chronic cases"],
    treatments: ["nonsteroidal anti-inflammatory drugs", "colchicine", "corticosteroids", "medications to prevent complications", "lifestyle changes (diet, avoiding alcohol)"],
    specialties: ["Rheumatology"]
  },
  "greater trochanteric pain syndrome": {
    name: "Greater Trochanteric Pain Syndrome",
    description: "Greater trochanteric pain syndrome is pain on the outside of the hip, around the bony prominence called the greater trochanter. It's often related to inflammation of the bursa or tendons.",
    symptoms: ["pain on outside of hip", "pain when lying on affected side", "pain when walking or climbing stairs", "tenderness"],
    treatments: ["rest", "ice", "pain medications", "physical therapy", "corticosteroid injections", "avoiding activities that worsen pain"],
    specialties: ["Orthopedics", "Sports Medicine", "Physical Medicine"]
  },
  "gum disease": {
    name: "Gum Disease (Periodontal Disease)",
    description: "Gum disease is an infection of the tissues that hold teeth in place. It's usually caused by poor brushing and flossing habits that allow plaque to build up and harden.",
    symptoms: ["swollen, red, or tender gums", "bleeding gums", "receding gums", "bad breath", "loose teeth", "pain when chewing"],
    treatments: ["professional cleaning", "scaling and root planing", "antibiotics", "surgery in advanced cases", "good oral hygiene"],
    specialties: ["Dentistry", "Periodontics"]
  },
  "periodontal disease": {
    name: "Gum Disease",
    description: "Periodontal disease is infection of the gums and supporting structures.",
    symptoms: ["bleeding gums", "swollen gums", "bad breath"],
    treatments: ["professional cleaning", "good oral hygiene"],
    specialties: ["Dentistry"]
  },
  "haemorrhoids": {
    name: "Haemorrhoids (Piles)",
    description: "Haemorrhoids, also called piles, are swollen veins in the lower rectum and anus. They're very common and can be internal or external.",
    symptoms: ["bleeding during bowel movements", "itching or irritation in anal region", "pain or discomfort", "swelling around anus", "lump near anus"],
    treatments: ["high-fiber diet", "topical treatments", "sitz baths", "pain medications", "rubber band ligation", "surgery in severe cases"],
    specialties: ["Gastroenterology", "Colon and Rectal Surgery", "General Surgery"]
  },
  "piles": {
    name: "Haemorrhoids",
    description: "Piles are swollen veins in the rectum and anus.",
    symptoms: ["bleeding", "itching", "discomfort"],
    treatments: ["dietary changes", "topical treatments", "surgery if needed"],
    specialties: ["Gastroenterology"]
  },
  "hemorrhoids": {
    name: "Haemorrhoids",
    description: "Hemorrhoids are swollen veins in the anal area.",
    symptoms: ["bleeding", "itching"],
    treatments: ["dietary changes", "topical treatments"],
    specialties: ["Gastroenterology"]
  },
  "hand, foot and mouth disease": {
    name: "Hand, Foot and Mouth Disease",
    description: "Hand, foot and mouth disease is a common viral infection that primarily affects children. It causes sores in the mouth and a rash on the hands and feet.",
    symptoms: ["fever", "sore throat", "painful sores in mouth", "rash on hands and feet", "loss of appetite", "irritability"],
    treatments: ["rest and fluids", "pain relievers", "soft foods", "avoiding acidic foods", "usually resolves on its own"],
    specialties: ["Pediatrics", "Infectious Disease"]
  },
  "hay fever": {
    name: "Hay Fever (Allergic Rhinitis)",
    description: "Hay fever, also known as allergic rhinitis, is an allergic reaction to pollen, dust mites, or other allergens. It causes symptoms similar to a cold but isn't caused by a virus.",
    symptoms: ["sneezing", "runny or stuffy nose", "itchy eyes, nose, or throat", "watery eyes", "postnasal drip"],
    treatments: ["avoiding allergens", "antihistamines", "nasal corticosteroids", "decongestants", "allergy shots (immunotherapy)"],
    specialties: ["Allergy & Immunology", "Otolaryngology"]
  },
  "allergic rhinitis": {
    name: "Hay Fever",
    description: "Allergic rhinitis is inflammation of the nose due to allergies.",
    symptoms: ["sneezing", "runny nose", "itchy eyes"],
    treatments: ["antihistamines", "avoiding allergens"],
    specialties: ["Allergy & Immunology"]
  },
  "head and neck cancer": {
    name: "Head and Neck Cancer",
    description: "Head and neck cancer is a term used to describe a number of different cancers that develop in or around the throat, larynx, nose, sinuses, and mouth.",
    symptoms: ["sore throat", "difficulty swallowing", "hoarseness", "lump in neck", "persistent ear pain", "unexplained weight loss"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy", "rehabilitation"],
    specialties: ["Otolaryngology", "Oncology", "Radiation Oncology", "Surgical Oncology"]
  },
  "head lice and nits": {
    name: "Head Lice and Nits",
    description: "Head lice are tiny insects that live on the scalp and feed on blood. Nits are the eggs of head lice. They're very common in children and spread through head-to-head contact.",
    symptoms: ["itching of scalp", "visible lice or nits", "sores from scratching", "irritability", "difficulty sleeping"],
    treatments: ["medicated shampoos or lotions", "combing with fine-tooth comb", "washing bedding and clothing", "treating all household members"],
    specialties: ["Dermatology", "Pediatrics"]
  },
  "head lice": {
    name: "Head Lice",
    description: "Head lice are tiny insects that infest the scalp.",
    symptoms: ["scalp itching", "visible lice"],
    treatments: ["medicated treatments", "combing"],
    specialties: ["Dermatology", "Pediatrics"]
  },
  "headaches": {
    name: "Headaches",
    description: "Headaches are pain in the head or upper neck. They can be primary (like migraines or tension headaches) or secondary (caused by another condition).",
    symptoms: ["head pain", "varies by type", "may be throbbing, dull, or sharp", "may be accompanied by nausea, sensitivity to light"],
    treatments: ["pain relievers", "rest", "identifying triggers", "preventive medications for frequent headaches", "treating underlying cause"],
    specialties: ["Neurology", "Internal Medicine"]
  },
  "hearing loss": {
    name: "Hearing Loss",
    description: "Hearing loss can be partial or complete and can occur gradually or suddenly. It can be caused by various factors including age, noise exposure, infections, or genetics.",
    symptoms: ["difficulty hearing", "muffled speech", "trouble understanding words", "needing to turn up volume", "ringing in ears (tinnitus)"],
    treatments: ["hearing aids", "cochlear implants", "assistive listening devices", "treating underlying cause", "sign language or lip reading"],
    specialties: ["Otolaryngology", "Audiology"]
  },
  "heart attack": {
    name: "Heart Attack (Myocardial Infarction)",
    description: "A heart attack occurs when blood flow to the heart is blocked, often by a blood clot. This can damage or destroy part of the heart muscle and is a medical emergency.",
    symptoms: ["chest pain or pressure", "pain in arm, neck, jaw, or back", "shortness of breath", "nausea", "cold sweat", "lightheadedness"],
    treatments: ["emergency medical treatment", "aspirin", "thrombolytics", "angioplasty and stenting", "cardiac rehabilitation"],
    specialties: ["Cardiology", "Emergency Medicine", "Interventional Cardiology"]
  },
  "heart block": {
    name: "Heart Block",
    description: "Heart block is a condition where the electrical signals that control the heartbeat are delayed or blocked as they travel through the heart. It can cause slow or irregular heartbeats.",
    symptoms: ["often no symptoms", "dizziness", "fainting", "shortness of breath", "chest pain", "fatigue"],
    treatments: ["pacemaker implantation", "treating underlying cause", "medications", "lifestyle modifications"],
    specialties: ["Cardiology", "Electrophysiology"]
  },
  "heart disease": {
    name: "Heart Disease",
    description: "Heart disease is a general term for various conditions affecting the heart, including coronary artery disease, heart failure, arrhythmias, and heart valve problems.",
    symptoms: ["varies by condition", "chest pain", "shortness of breath", "fatigue", "irregular heartbeat", "swelling"],
    treatments: ["lifestyle changes", "medications", "surgery", "cardiac rehabilitation", "preventive measures"],
    specialties: ["Cardiology", "Cardiothoracic Surgery"]
  },
  "heart failure": {
    name: "Heart Failure",
    description: "Heart failure occurs when the heart muscle doesn't pump blood as well as it should. Blood often backs up and fluid can build up in the lungs and legs.",
    symptoms: ["shortness of breath", "fatigue", "swelling in legs, ankles, and feet", "rapid or irregular heartbeat", "persistent cough", "reduced ability to exercise"],
    treatments: ["medications (ACE inhibitors, beta blockers, diuretics)", "lifestyle changes", "devices (pacemakers, defibrillators)", "surgery (heart transplant in severe cases)"],
    specialties: ["Cardiology", "Heart Failure"]
  },
  "heart palpitations": {
    name: "Heart Palpitations",
    description: "Heart palpitations are feelings of having a fast-beating, fluttering, or pounding heart. They can be caused by stress, exercise, medications, or medical conditions.",
    symptoms: ["feeling of skipped beats", "rapid heartbeat", "fluttering sensation", "pounding in chest"],
    treatments: ["treating underlying cause", "lifestyle changes", "medications", "avoiding triggers", "electrophysiology procedures if needed"],
    specialties: ["Cardiology", "Electrophysiology"]
  },
  "heatstroke and heat illness": {
    name: "Heatstroke and Heat Illness",
    description: "Heatstroke is a life-threatening condition that occurs when the body's temperature rises to dangerous levels, usually as a result of prolonged exposure to high temperatures or physical exertion.",
    symptoms: ["high body temperature", "altered mental state", "nausea and vomiting", "flushed skin", "rapid breathing", "racing heart rate", "headache"],
    treatments: ["immediate cooling", "emergency medical treatment", "IV fluids", "monitoring", "prevention"],
    specialties: ["Emergency Medicine", "Critical Care"]
  },
  "heatstroke": {
    name: "Heatstroke",
    description: "Heatstroke is a medical emergency caused by overheating.",
    symptoms: ["high temperature", "confusion", "rapid pulse"],
    treatments: ["immediate cooling", "emergency care"],
    specialties: ["Emergency Medicine"]
  },
  "hepatitis a": {
    name: "Hepatitis A",
    description: "Hepatitis A is a highly contagious liver infection caused by the hepatitis A virus. It's usually spread through contaminated food or water or close contact with an infected person.",
    symptoms: ["fatigue", "nausea and vomiting", "abdominal pain", "loss of appetite", "fever", "jaundice", "dark urine"],
    treatments: ["rest", "fluids", "avoiding alcohol", "supportive care", "vaccination for prevention"],
    specialties: ["Gastroenterology", "Hepatology", "Infectious Disease"]
  },
  "hepatitis b": {
    name: "Hepatitis B",
    description: "Hepatitis B is a serious liver infection caused by the hepatitis B virus. It can be acute (short-term) or chronic (long-term) and is spread through blood and body fluids.",
    symptoms: ["fatigue", "abdominal pain", "loss of appetite", "nausea", "jaundice", "joint pain"],
    treatments: ["antiviral medications for chronic cases", "liver monitoring", "vaccination for prevention", "avoiding alcohol"],
    specialties: ["Gastroenterology", "Hepatology", "Infectious Disease"]
  },
  "hepatitis c": {
    name: "Hepatitis C",
    description: "Hepatitis C is a viral infection that causes liver inflammation, sometimes leading to serious liver damage. It's spread through contaminated blood, most commonly through sharing needles.",
    symptoms: ["often no symptoms initially", "fatigue", "jaundice", "abdominal pain", "loss of appetite", "nausea"],
    treatments: ["antiviral medications", "liver monitoring", "avoiding alcohol", "liver transplant in severe cases"],
    specialties: ["Gastroenterology", "Hepatology", "Infectious Disease"]
  },
  "hiatus hernia": {
    name: "Hiatus Hernia",
    description: "A hiatus hernia occurs when part of the stomach pushes up through the diaphragm into the chest cavity. It's common and often causes no symptoms, but can contribute to acid reflux.",
    symptoms: ["often no symptoms", "heartburn", "chest pain", "difficulty swallowing", "belching"],
    treatments: ["lifestyle changes", "medications for acid reflux", "surgery in severe cases"],
    specialties: ["Gastroenterology", "General Surgery"]
  },
  "high blood pressure": {
    name: "High Blood Pressure (Hypertension)",
    description: "High blood pressure is a long-term condition where the force of blood against artery walls is consistently too high, which can lead to serious health problems like heart disease and stroke.",
    symptoms: ["often no symptoms", "headaches", "shortness of breath", "nosebleeds"],
    treatments: ["lifestyle changes (diet, exercise, weight loss)", "medications (ACE inhibitors, diuretics, beta blockers)", "regular monitoring", "reducing salt intake"],
    specialties: ["Cardiology", "Internal Medicine", "Nephrology"]
  },
  "hypertension": {
    name: "High Blood Pressure",
    description: "Hypertension is elevated blood pressure that increases risk of heart disease and stroke.",
    symptoms: ["often asymptomatic", "headaches"],
    treatments: ["medications", "lifestyle changes"],
    specialties: ["Cardiology"]
  },
  "high cholesterol": {
    name: "High Cholesterol",
    description: "High cholesterol is a condition where you have too much cholesterol in your blood. It can increase your risk of heart disease and stroke.",
    symptoms: ["usually no symptoms", "detected through blood tests"],
    treatments: ["lifestyle changes (diet, exercise)", "statins and other cholesterol-lowering medications", "regular monitoring"],
    specialties: ["Cardiology", "Internal Medicine", "Endocrinology"]
  },
  "hiv": {
    name: "HIV (Human Immunodeficiency Virus)",
    description: "HIV is a virus that attacks the immune system. Without treatment, it can lead to AIDS. With modern treatment, people with HIV can live long, healthy lives.",
    symptoms: ["flu-like symptoms in early stage", "often no symptoms for years", "later symptoms include infections, weight loss, fever"],
    treatments: ["antiretroviral therapy (ART)", "preventive medications", "treating opportunistic infections", "regular monitoring"],
    specialties: ["Infectious Disease"]
  },
  "hives": {
    name: "Hives (Urticaria)",
    description: "Hives are raised, itchy welts on the skin that appear suddenly. They can be caused by allergies, infections, medications, or other triggers.",
    symptoms: ["raised, red welts", "itching", "burning or stinging", "may come and go", "can last hours to days"],
    treatments: ["antihistamines", "avoiding triggers", "corticosteroids for severe cases", "identifying and treating underlying cause"],
    specialties: ["Dermatology", "Allergy & Immunology"]
  },
  "urticaria": {
    name: "Hives",
    description: "Urticaria is the medical term for hives.",
    symptoms: ["itchy welts", "redness"],
    treatments: ["antihistamines"],
    specialties: ["Dermatology", "Allergy"]
  },
  "hodgkin lymphoma": {
    name: "Hodgkin Lymphoma",
    description: "Hodgkin lymphoma is a type of cancer that affects the lymphatic system, part of the immune system. It's characterized by the presence of Reed-Sternberg cells.",
    symptoms: ["swollen lymph nodes", "fatigue", "fever", "night sweats", "unexplained weight loss", "itching"],
    treatments: ["chemotherapy", "radiation therapy", "immunotherapy", "stem cell transplant in some cases"],
    specialties: ["Hematology-Oncology", "Radiation Oncology"]
  },
  "hodgkin lymphoma: teenagers and young adults": {
    name: "Hodgkin Lymphoma in Teenagers and Young Adults",
    description: "Hodgkin lymphoma in teenagers and young adults requires specialized care that considers both treatment effectiveness and long-term side effects, including fertility preservation.",
    symptoms: ["swollen lymph nodes", "fatigue", "fever", "night sweats"],
    treatments: ["specialized protocols", "chemotherapy", "radiation", "fertility preservation", "long-term follow-up"],
    specialties: ["Hematology-Oncology", "Adolescent Medicine"]
  },
  "huntington's disease": {
    name: "Huntington's Disease",
    description: "Huntington's disease is a progressive brain disorder caused by a defective gene. It causes uncontrolled movements, emotional problems, and loss of thinking ability.",
    symptoms: ["involuntary jerking movements", "muscle problems", "difficulty walking", "speech problems", "memory and thinking difficulties", "mood changes"],
    treatments: ["medications to manage symptoms", "physical therapy", "speech therapy", "occupational therapy", "supportive care"],
    specialties: ["Neurology", "Movement Disorders"]
  },
  "huntingtons disease": {
    name: "Huntington's Disease",
    description: "Huntington's disease is a genetic disorder causing progressive brain damage.",
    symptoms: ["involuntary movements", "cognitive decline", "emotional problems"],
    treatments: ["symptom management", "supportive care"],
    specialties: ["Neurology"]
  },
  "hydrocephalus": {
    name: "Hydrocephalus",
    description: "Hydrocephalus is a condition in which there is an abnormal accumulation of cerebrospinal fluid in the brain, causing increased pressure inside the skull.",
    symptoms: ["headache", "nausea and vomiting", "vision problems", "balance problems", "cognitive changes", "in infants: enlarged head"],
    treatments: ["surgery to place shunt", "endoscopic third ventriculostomy", "treating underlying cause", "regular monitoring"],
    specialties: ["Neurosurgery", "Neurology", "Pediatric Neurosurgery"]
  },
  "hyperglycaemia": {
    name: "Hyperglycaemia (High Blood Sugar)",
    description: "Hyperglycaemia is a condition in which blood glucose levels are too high. It's a common problem in people with diabetes and can cause serious complications if not treated.",
    symptoms: ["increased thirst", "frequent urination", "fatigue", "blurred vision", "headache", "difficulty concentrating"],
    treatments: ["adjusting insulin or medications", "dietary changes", "exercise", "monitoring blood sugar", "preventing complications"],
    specialties: ["Endocrinology", "Internal Medicine"]
  },
  "high blood sugar": {
    name: "Hyperglycaemia",
    description: "High blood sugar occurs when glucose levels are elevated.",
    symptoms: ["thirst", "frequent urination", "fatigue"],
    treatments: ["adjusting medications", "dietary changes"],
    specialties: ["Endocrinology"]
  },
  "hyperhidrosis": {
    name: "Hyperhidrosis",
    description: "Hyperhidrosis is excessive sweating that's not necessarily related to heat or exercise. It can affect the entire body or just specific areas like the palms, soles, or underarms.",
    symptoms: ["excessive sweating", "sweating that interferes with daily activities", "skin problems from constant moisture", "social embarrassment"],
    treatments: ["antiperspirants", "medications", "iontophoresis", "botulinum toxin injections", "surgery in severe cases"],
    specialties: ["Dermatology"]
  },
  "excessive sweating": {
    name: "Hyperhidrosis",
    description: "Excessive sweating is abnormal sweating beyond what's needed for temperature regulation.",
    symptoms: ["profuse sweating", "interference with activities"],
    treatments: ["antiperspirants", "medications", "injections"],
    specialties: ["Dermatology"]
  },
  "hypoglycaemia": {
    name: "Hypoglycaemia (Low Blood Sugar)",
    description: "Hypoglycaemia is a condition in which blood glucose levels drop too low. It's common in people with diabetes who take insulin or certain medications.",
    symptoms: ["shakiness", "sweating", "hunger", "irritability", "confusion", "dizziness", "rapid heartbeat"],
    treatments: ["consuming fast-acting carbohydrates", "glucagon injection if severe", "adjusting medications", "regular monitoring", "preventing future episodes"],
    specialties: ["Endocrinology", "Emergency Medicine"]
  },
  "low blood sugar": {
    name: "Hypoglycaemia",
    description: "Low blood sugar occurs when glucose levels drop too low.",
    symptoms: ["shakiness", "sweating", "confusion"],
    treatments: ["consuming sugar", "glucagon if severe"],
    specialties: ["Endocrinology"]
  },
  "hypothermia": {
    name: "Hypothermia (Low Body Temperature)",
    description: "Hypothermia is a medical emergency that occurs when the body loses heat faster than it can produce it, causing body temperature to drop dangerously low.",
    symptoms: ["shivering", "slurred speech", "slow, shallow breathing", "weak pulse", "confusion", "loss of coordination", "loss of consciousness"],
    treatments: ["gradual warming", "removing wet clothing", "warm fluids", "medical monitoring", "preventing further heat loss"],
    specialties: ["Emergency Medicine", "Critical Care"]
  },
  "low body temperature": {
    name: "Hypothermia",
    description: "Hypothermia is dangerously low body temperature.",
    symptoms: ["shivering", "confusion", "weakness"],
    treatments: ["gradual warming", "emergency care"],
    specialties: ["Emergency Medicine"]
  },
  "idiopathic pulmonary fibrosis": {
    name: "Idiopathic Pulmonary Fibrosis",
    description: "Idiopathic pulmonary fibrosis is a chronic lung disease characterized by progressive scarring of lung tissue. The cause is unknown, and it leads to difficulty breathing.",
    symptoms: ["shortness of breath", "dry cough", "fatigue", "unexplained weight loss", "aching muscles and joints", "clubbing of fingers"],
    treatments: ["medications to slow progression", "oxygen therapy", "pulmonary rehabilitation", "lung transplant in eligible patients"],
    specialties: ["Pulmonology"]
  },
  "ipf": {
    name: "Idiopathic Pulmonary Fibrosis",
    description: "IPF is a progressive lung disease causing scarring.",
    symptoms: ["shortness of breath", "dry cough", "fatigue"],
    treatments: ["medications", "oxygen therapy", "lung transplant"],
    specialties: ["Pulmonology"]
  },
  "if your child has cold or flu symptoms": {
    name: "Cold or Flu Symptoms in Children",
    description: "Cold and flu symptoms in children are common and usually resolve on their own. However, it's important to know when to seek medical attention.",
    symptoms: ["runny nose", "cough", "fever", "sore throat", "fatigue", "body aches"],
    treatments: ["rest and fluids", "fever reducers (age-appropriate)", "comfort measures", "medical attention if severe or concerning symptoms"],
    specialties: ["Pediatrics", "Emergency Medicine"]
  },
  "impetigo": {
    name: "Impetigo",
    description: "Impetigo is a common and highly contagious skin infection that mainly affects infants and children. It causes red sores that can break open, ooze, and form a yellow-brown crust.",
    symptoms: ["red sores that burst", "honey-colored crusts", "itching", "swollen lymph nodes", "blisters"],
    treatments: ["antibiotic creams or ointments", "oral antibiotics for widespread infection", "keeping area clean", "covering sores"],
    specialties: ["Dermatology", "Pediatrics", "Infectious Disease"]
  },
  "indigestion": {
    name: "Indigestion (Dyspepsia)",
    description: "Indigestion is a general term that describes discomfort in the upper abdomen. It's not a disease but rather a collection of symptoms including feeling full, bloated, or nauseous.",
    symptoms: ["feeling full during or after meals", "bloating", "nausea", "belching", "upper abdominal pain", "burning sensation"],
    treatments: ["lifestyle changes", "over-the-counter antacids", "prescription medications", "treating underlying cause"],
    specialties: ["Gastroenterology", "Internal Medicine"]
  },
  "dyspepsia": {
    name: "Indigestion",
    description: "Dyspepsia is the medical term for indigestion.",
    symptoms: ["upper abdominal discomfort", "bloating", "nausea"],
    treatments: ["lifestyle changes", "medications"],
    specialties: ["Gastroenterology"]
  },
  "ingrown toenail": {
    name: "Ingrown Toenail",
    description: "An ingrown toenail occurs when the edge of the toenail grows into the surrounding skin, causing pain, redness, and sometimes infection.",
    symptoms: ["pain and tenderness", "redness", "swelling", "infection", "drainage"],
    treatments: ["soaking foot in warm water", "placing cotton under nail", "antibiotics if infected", "partial or complete nail removal", "preventing recurrence"],
    specialties: ["Podiatry", "General Surgery", "Dermatology"]
  },
  "infertility": {
    name: "Infertility",
    description: "Infertility is the inability to conceive after one year of regular, unprotected intercourse. It can affect men, women, or both partners.",
    symptoms: ["inability to conceive", "irregular periods (in women)", "may have no other symptoms"],
    treatments: ["fertility medications", "surgery", "assisted reproductive technologies (IVF)", "lifestyle changes", "treating underlying causes"],
    specialties: ["Reproductive Endocrinology & Infertility", "Obstetrics & Gynecology", "Urology"]
  },
  "inflammatory bowel disease": {
    name: "Inflammatory Bowel Disease (IBD)",
    description: "Inflammatory bowel disease is an umbrella term for two conditions: Crohn's disease and ulcerative colitis. Both cause chronic inflammation of the digestive tract.",
    symptoms: ["abdominal pain", "diarrhea", "blood in stool", "fatigue", "weight loss", "fever"],
    treatments: ["anti-inflammatory medications", "immune system suppressors", "antibiotics", "surgery in severe cases", "nutrition therapy"],
    specialties: ["Gastroenterology"]
  },
  "ibd": {
    name: "Inflammatory Bowel Disease",
    description: "IBD includes Crohn's disease and ulcerative colitis.",
    symptoms: ["abdominal pain", "diarrhea", "blood in stool"],
    treatments: ["medications", "surgery if needed"],
    specialties: ["Gastroenterology"]
  },
  "inherited heart conditions": {
    name: "Inherited Heart Conditions",
    description: "Inherited heart conditions are heart problems that are passed down through families. They can include various conditions affecting the heart muscle, electrical system, or structure.",
    symptoms: ["varies by condition", "chest pain", "shortness of breath", "irregular heartbeat", "fainting", "family history of heart problems"],
    treatments: ["medications", "lifestyle modifications", "devices (pacemakers, defibrillators)", "surgery", "genetic counseling", "family screening"],
    specialties: ["Cardiology", "Genetics", "Cardiothoracic Surgery"]
  },
  "insomnia": {
    name: "Insomnia",
    description: "Insomnia is a sleep disorder that makes it hard to fall asleep, stay asleep, or causes you to wake up too early. It can be short-term or chronic.",
    symptoms: ["difficulty falling asleep", "waking up during the night", "waking up too early", "not feeling rested", "daytime fatigue", "irritability"],
    treatments: ["sleep hygiene", "cognitive behavioral therapy", "medications", "treating underlying causes", "relaxation techniques"],
    specialties: ["Sleep Medicine", "Psychiatry", "Neurology"]
  },
  "intoeing": {
    name: "Intoeing (Pigeon Toe) in Children",
    description: "Intoeing, also called pigeon toe, is when a child's feet turn inward instead of pointing straight ahead. It's common in children and usually corrects itself as they grow.",
    symptoms: ["feet turning inward", "awkward walking", "tripping", "usually no pain"],
    treatments: ["usually no treatment needed", "observation", "stretching exercises", "special shoes rarely needed", "surgery only in severe persistent cases"],
    specialties: ["Pediatrics", "Orthopedics", "Pediatric Orthopedics"]
  },
  "pigeon toe": {
    name: "Intoeing",
    description: "Pigeon toe is when feet turn inward, common in children.",
    symptoms: ["inward-turning feet", "awkward gait"],
    treatments: ["usually resolves naturally", "observation"],
    specialties: ["Pediatrics", "Orthopedics"]
  },
  "iron deficiency anaemia": {
    name: "Iron Deficiency Anaemia",
    description: "Iron deficiency anaemia is a common type of anaemia that occurs when the body doesn't have enough iron to produce hemoglobin, the substance in red blood cells that carries oxygen.",
    symptoms: ["fatigue", "weakness", "pale skin", "shortness of breath", "dizziness", "headaches", "cold hands and feet"],
    treatments: ["iron supplements", "dietary changes (iron-rich foods)", "treating underlying cause (bleeding, poor absorption)", "blood transfusions in severe cases"],
    specialties: ["Hematology", "Internal Medicine"]
  },
  "iron deficiency anemia": {
    name: "Iron Deficiency Anaemia",
    description: "Iron deficiency anemia is low red blood cells due to insufficient iron.",
    symptoms: ["fatigue", "pale skin", "weakness"],
    treatments: ["iron supplements", "dietary changes"],
    specialties: ["Hematology"]
  },
  "irritable bowel syndrome": {
    name: "Irritable Bowel Syndrome (IBS)",
    description: "IBS is a common disorder that affects the large intestine, causing cramping, abdominal pain, bloating, gas, and diarrhea or constipation.",
    symptoms: ["abdominal pain and cramping", "bloating", "gas", "diarrhea or constipation", "mucus in stool"],
    treatments: ["dietary changes", "fiber supplements", "medications", "stress management", "probiotics", "lifestyle modifications"],
    specialties: ["Gastroenterology"]
  },
  "ibs": {
    name: "Irritable Bowel Syndrome",
    description: "IBS is a digestive disorder causing abdominal pain and bowel changes.",
    symptoms: ["abdominal pain", "bloating", "diarrhea or constipation"],
    treatments: ["diet changes", "medications"],
    specialties: ["Gastroenterology"]
  },
  "itching": {
    name: "Itching (Pruritus)",
    description: "Itching is an uncomfortable sensation that makes you want to scratch. It can be caused by skin conditions, allergies, medications, or internal diseases.",
    symptoms: ["itchy skin", "may be localized or widespread", "may be accompanied by rash"],
    treatments: ["moisturizers", "topical corticosteroids", "antihistamines", "treating underlying cause", "avoiding triggers"],
    specialties: ["Dermatology", "Allergy & Immunology", "Internal Medicine"]
  },
  "pruritus": {
    name: "Itching",
    description: "Pruritus is the medical term for itching.",
    symptoms: ["itchy skin"],
    treatments: ["moisturizers", "topical treatments"],
    specialties: ["Dermatology"]
  },
  "itchy bottom": {
    name: "Itchy Bottom (Pruritus Ani)",
    description: "An itchy bottom, or pruritus ani, is itching around the anus. It can be caused by various factors including hygiene issues, skin conditions, or infections.",
    symptoms: ["itching around anus", "may be worse at night", "redness", "soreness"],
    treatments: ["good hygiene", "avoiding irritants", "topical treatments", "treating underlying cause (hemorrhoids, infections)", "dietary changes"],
    specialties: ["Gastroenterology", "Colon and Rectal Surgery", "Dermatology"]
  },
  "pruritus ani": {
    name: "Itchy Bottom",
    description: "Pruritus ani is itching around the anal area.",
    symptoms: ["anal itching", "discomfort"],
    treatments: ["good hygiene", "topical treatments"],
    specialties: ["Gastroenterology"]
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
    key.replace(/-/g, ' '),
    key.replace(/\s+and\s+/gi, ' & '),
    key.replace(/\s+in\s+children/gi, ' children')
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

