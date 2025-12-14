/**
 * Script to add diseases starting with J, K, L, M from NHS Inform with detailed descriptions
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
  "joint hypermobility": {
    name: "Joint Hypermobility",
    description: "Joint hypermobility is when joints move beyond the normal range of motion. It can be harmless or associated with conditions like Ehlers-Danlos syndrome. Some people with hypermobile joints experience pain and other symptoms.",
    symptoms: ["joints that move beyond normal range", "joint pain", "joint stiffness", "frequent joint dislocations", "fatigue", "easy bruising"],
    treatments: ["physical therapy", "pain management", "joint protection techniques", "strengthening exercises", "treating associated conditions"],
    specialties: ["Rheumatology", "Physical Medicine", "Orthopedics"]
  },
  "kaposi's sarcoma": {
    name: "Kaposi's Sarcoma",
    description: "Kaposi's sarcoma is a type of cancer that forms in the lining of blood and lymph vessels. It typically appears as lesions on the skin but can also affect internal organs. It's often associated with HIV/AIDS.",
    symptoms: ["purple, red, or brown lesions on skin", "swollen lymph nodes", "lesions in mouth or throat", "shortness of breath if affecting lungs", "abdominal pain if affecting digestive tract"],
    treatments: ["treating underlying HIV if present", "chemotherapy", "radiation therapy", "surgery", "immunotherapy"],
    specialties: ["Oncology", "Dermatology", "Infectious Disease"]
  },
  "kaposis sarcoma": {
    name: "Kaposi's Sarcoma",
    description: "Kaposi's sarcoma is a cancer affecting blood and lymph vessels.",
    symptoms: ["skin lesions", "swollen nodes"],
    treatments: ["chemotherapy", "radiation"],
    specialties: ["Oncology"]
  },
  "kidney cancer": {
    name: "Kidney Cancer (Renal Cell Carcinoma)",
    description: "Kidney cancer is cancer that begins in the kidneys. The most common type is renal cell carcinoma. It's often discovered incidentally during imaging for other conditions.",
    symptoms: ["blood in urine", "persistent pain in side or back", "lump in side or abdomen", "fatigue", "unexplained weight loss", "fever"],
    treatments: ["surgery (partial or complete nephrectomy)", "targeted therapy", "immunotherapy", "radiation therapy", "ablation therapy"],
    specialties: ["Urology", "Oncology", "Surgical Oncology"]
  },
  "renal cell carcinoma": {
    name: "Kidney Cancer",
    description: "Renal cell carcinoma is the most common type of kidney cancer.",
    symptoms: ["blood in urine", "abdominal pain"],
    treatments: ["surgery", "targeted therapy"],
    specialties: ["Urology", "Oncology"]
  },
  "kidney infection": {
    name: "Kidney Infection (Pyelonephritis)",
    description: "A kidney infection, or pyelonephritis, is a type of urinary tract infection that begins in the urethra or bladder and travels to one or both kidneys. It requires prompt treatment.",
    symptoms: ["fever", "chills", "back or side pain", "abdominal pain", "frequent urination", "burning during urination", "nausea and vomiting"],
    treatments: ["antibiotics", "hospitalization for severe cases", "pain medications", "fluids", "treating underlying causes"],
    specialties: ["Nephrology", "Urology", "Infectious Disease"]
  },
  "pyelonephritis": {
    name: "Kidney Infection",
    description: "Pyelonephritis is a bacterial infection of the kidneys.",
    symptoms: ["fever", "back pain", "urinary symptoms"],
    treatments: ["antibiotics", "hospitalization if severe"],
    specialties: ["Nephrology", "Urology"]
  },
  "kidney stones": {
    name: "Kidney Stones",
    description: "Kidney stones are hard deposits of minerals and salts that form inside your kidneys. They can be very painful when they pass through the urinary tract.",
    symptoms: ["severe pain in side and back", "pain radiating to lower abdomen", "painful urination", "pink, red, or brown urine", "nausea and vomiting", "fever if infection present"],
    treatments: ["pain medications", "drinking water", "medical procedures to break up stones", "surgery in severe cases", "preventing recurrence"],
    specialties: ["Urology", "Nephrology"]
  },
  "labyrinthitis": {
    name: "Labyrinthitis",
    description: "Labyrinthitis is an inner ear disorder that causes inflammation of the labyrinth, the part of the ear responsible for balance and hearing. It often follows a viral infection.",
    symptoms: ["vertigo", "dizziness", "nausea", "vomiting", "hearing loss", "tinnitus", "loss of balance"],
    treatments: ["medications for vertigo and nausea", "antiviral medications if viral", "antibiotics if bacterial", "vestibular rehabilitation", "rest"],
    specialties: ["Otolaryngology", "Neurology"]
  },
  "lactose intolerance": {
    name: "Lactose Intolerance",
    description: "Lactose intolerance is the inability to digest lactose, the sugar found in milk and dairy products. It occurs when the small intestine doesn't produce enough lactase enzyme.",
    symptoms: ["diarrhea", "nausea", "abdominal cramps", "bloating", "gas", "symptoms occur after consuming dairy"],
    treatments: ["avoiding or limiting dairy products", "lactase enzyme supplements", "lactose-free alternatives", "gradual introduction of dairy"],
    specialties: ["Gastroenterology", "Internal Medicine"]
  },
  "laryngeal cancer": {
    name: "Laryngeal (Larynx) Cancer",
    description: "Laryngeal cancer is cancer that forms in the larynx (voice box). It's often associated with smoking and heavy alcohol use. Early detection is important for preserving voice function.",
    symptoms: ["hoarseness", "sore throat", "difficulty swallowing", "lump in neck", "persistent cough", "ear pain", "unexplained weight loss"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy", "speech therapy after treatment"],
    specialties: ["Otolaryngology", "Oncology", "Radiation Oncology"]
  },
  "larynx cancer": {
    name: "Laryngeal Cancer",
    description: "Larynx cancer is cancer of the voice box.",
    symptoms: ["hoarseness", "sore throat", "difficulty swallowing"],
    treatments: ["surgery", "radiation", "chemotherapy"],
    specialties: ["Otolaryngology", "Oncology"]
  },
  "laryngitis": {
    name: "Laryngitis",
    description: "Laryngitis is inflammation of the larynx (voice box), usually caused by a viral infection, overuse of the voice, or irritation. It causes hoarseness or loss of voice.",
    symptoms: ["hoarseness", "weak voice", "loss of voice", "sore throat", "dry throat", "tickling sensation in throat"],
    treatments: ["resting voice", "staying hydrated", "avoiding irritants", "treating underlying cause", "usually resolves on its own"],
    specialties: ["Otolaryngology"]
  },
  "late miscarriage": {
    name: "Late Miscarriage",
    description: "A late miscarriage is the loss of a pregnancy between 12 and 24 weeks. It's less common than early miscarriage but can be emotionally devastating.",
    symptoms: ["vaginal bleeding", "abdominal cramping", "passing tissue", "back pain"],
    treatments: ["medical monitoring", "supportive care", "emotional support", "medical or surgical management", "follow-up care"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "leg cramps": {
    name: "Leg Cramps",
    description: "Leg cramps are sudden, involuntary contractions of one or more muscles in the leg. They're common and usually harmless, though they can be very painful.",
    symptoms: ["sudden muscle pain", "muscle tightness", "hard lump in muscle", "pain lasting seconds to minutes"],
    treatments: ["stretching", "massage", "applying heat or cold", "staying hydrated", "treating underlying causes", "medications if frequent"],
    specialties: ["Internal Medicine", "Physical Medicine", "Neurology"]
  },
  "legionnaires' disease": {
    name: "Legionnaires' Disease",
    description: "Legionnaires' disease is a severe form of pneumonia caused by Legionella bacteria. It's contracted by inhaling contaminated water droplets, often from air conditioning systems or hot tubs.",
    symptoms: ["fever", "chills", "cough", "shortness of breath", "muscle aches", "headaches", "diarrhea", "nausea"],
    treatments: ["antibiotics", "hospitalization", "supportive care", "oxygen therapy", "preventing exposure"],
    specialties: ["Infectious Disease", "Pulmonology", "Emergency Medicine"]
  },
  "legionnaires disease": {
    name: "Legionnaires' Disease",
    description: "Legionnaires' disease is a severe pneumonia caused by Legionella bacteria.",
    symptoms: ["fever", "cough", "shortness of breath"],
    treatments: ["antibiotics", "hospitalization"],
    specialties: ["Infectious Disease", "Pulmonology"]
  },
  "lichen planus": {
    name: "Lichen Planus",
    description: "Lichen planus is an inflammatory condition that can affect the skin, hair, nails, and mucous membranes. It causes itchy, purple, flat-topped bumps.",
    symptoms: ["purple, flat-topped bumps", "itching", "white lacy patches in mouth", "nail changes", "hair loss in some cases"],
    treatments: ["topical corticosteroids", "oral medications", "antihistamines", "phototherapy", "treating underlying causes"],
    specialties: ["Dermatology"]
  },
  "limb girdle muscular dystrophy": {
    name: "Limb Girdle Muscular Dystrophy",
    description: "Limb girdle muscular dystrophy is a group of genetic muscle disorders that cause progressive weakness and wasting of muscles in the shoulders and hips.",
    symptoms: ["progressive muscle weakness in shoulders and hips", "difficulty raising arms", "difficulty climbing stairs", "frequent falls", "muscle wasting"],
    treatments: ["physical therapy", "occupational therapy", "assistive devices", "cardiac monitoring", "respiratory support"],
    specialties: ["Neurology", "Physical Medicine"]
  },
  "lipoedema": {
    name: "Lipoedema",
    description: "Lipoedema is a chronic condition characterized by abnormal fat accumulation, usually in the legs and sometimes arms. It's more common in women and is often misdiagnosed as obesity.",
    symptoms: ["disproportionate fat accumulation in legs/arms", "pain and tenderness", "easy bruising", "swelling", "feeling of heaviness"],
    treatments: ["compression therapy", "manual lymphatic drainage", "exercise", "dietary changes", "surgery (liposuction) in some cases"],
    specialties: ["Vascular Medicine", "Dermatology", "Physical Medicine"]
  },
  "lipedema": {
    name: "Lipoedema",
    description: "Lipedema is abnormal fat accumulation in legs and arms.",
    symptoms: ["disproportionate fat", "pain", "easy bruising"],
    treatments: ["compression", "exercise", "surgery"],
    specialties: ["Vascular Medicine"]
  },
  "liver cancer": {
    name: "Liver Cancer",
    description: "Liver cancer is cancer that begins in the cells of the liver. Primary liver cancer starts in the liver, while secondary (metastatic) liver cancer spreads from elsewhere.",
    symptoms: ["weight loss", "loss of appetite", "upper abdominal pain", "nausea and vomiting", "fatigue", "jaundice", "swollen abdomen"],
    treatments: ["surgery to remove tumor", "liver transplant", "ablation therapy", "embolization", "targeted therapy", "chemotherapy"],
    specialties: ["Hepatology", "Oncology", "Surgical Oncology"]
  },
  "liver disease": {
    name: "Liver Disease",
    description: "Liver disease is a broad term for any condition that affects the liver. It includes hepatitis, cirrhosis, fatty liver disease, and liver cancer.",
    symptoms: ["varies by condition", "jaundice", "abdominal pain", "fatigue", "nausea", "swelling"],
    treatments: ["treating underlying cause", "lifestyle changes", "medications", "liver transplant in severe cases"],
    specialties: ["Gastroenterology", "Hepatology"]
  },
  "long-term effects of covid-19": {
    name: "Long-term Effects of COVID-19 (Long COVID)",
    description: "Long COVID refers to symptoms that persist for weeks or months after the initial COVID-19 infection. It can affect multiple body systems and significantly impact quality of life.",
    symptoms: ["fatigue", "shortness of breath", "brain fog", "joint pain", "chest pain", "sleep problems", "anxiety or depression", "loss of taste or smell"],
    treatments: ["symptom management", "pulmonary rehabilitation", "cognitive therapy", "physical therapy", "mental health support", "multidisciplinary care"],
    specialties: ["Internal Medicine", "Pulmonology", "Neurology", "Physical Medicine", "Psychiatry"]
  },
  "long covid": {
    name: "Long COVID",
    description: "Long COVID is persistent symptoms after COVID-19 infection.",
    symptoms: ["fatigue", "breathing problems", "brain fog"],
    treatments: ["symptom management", "rehabilitation"],
    specialties: ["Internal Medicine", "Pulmonology"]
  },
  "loss of libido": {
    name: "Loss of Libido",
    description: "Loss of libido, or reduced sexual desire, can affect both men and women. It can be caused by physical, psychological, or relationship factors.",
    symptoms: ["reduced interest in sex", "lack of sexual thoughts", "avoidance of sexual activity"],
    treatments: ["treating underlying causes", "counseling", "hormone therapy", "medications", "relationship therapy"],
    specialties: ["Urology", "Obstetrics & Gynecology", "Psychiatry", "Endocrinology"]
  },
  "low blood pressure": {
    name: "Low Blood Pressure (Hypotension)",
    description: "Low blood pressure, or hypotension, is when blood pressure is lower than normal. It can cause dizziness and fainting, but for some people it's normal and causes no problems.",
    symptoms: ["dizziness", "fainting", "blurred vision", "nausea", "fatigue", "lack of concentration"],
    treatments: ["increasing salt intake (if recommended)", "drinking more fluids", "wearing compression stockings", "medications if needed", "treating underlying cause"],
    specialties: ["Cardiology", "Internal Medicine"]
  },
  "hypotension": {
    name: "Low Blood Pressure",
    description: "Hypotension is abnormally low blood pressure.",
    symptoms: ["dizziness", "fainting", "fatigue"],
    treatments: ["lifestyle changes", "medications if needed"],
    specialties: ["Cardiology"]
  },
  "lung cancer": {
    name: "Lung Cancer",
    description: "Lung cancer is a type of cancer that begins in the lungs. It's the leading cause of cancer deaths worldwide, often caused by smoking, though non-smokers can also develop it.",
    symptoms: ["persistent cough", "coughing up blood", "shortness of breath", "chest pain", "weight loss", "hoarseness", "bone pain"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "targeted therapy", "immunotherapy", "palliative care"],
    specialties: ["Oncology", "Pulmonology", "Thoracic Surgery", "Radiation Oncology"]
  },
  "lupus": {
    name: "Lupus (Systemic Lupus Erythematosus)",
    description: "Lupus is an autoimmune disease where the immune system attacks healthy tissue, causing inflammation and damage to various body systems including skin, joints, and organs.",
    symptoms: ["fatigue", "joint pain and swelling", "butterfly-shaped rash on face", "fever", "hair loss", "sensitivity to sun", "chest pain"],
    treatments: ["nonsteroidal anti-inflammatory drugs", "antimalarial drugs", "corticosteroids", "immunosuppressants", "lifestyle modifications"],
    specialties: ["Rheumatology"]
  },
  "lyme disease": {
    name: "Lyme Disease",
    description: "Lyme disease is a bacterial infection transmitted through the bite of infected blacklegged ticks. Early treatment is important to prevent complications.",
    symptoms: ["bull's-eye rash (early)", "fever", "chills", "fatigue", "body aches", "headache", "joint pain (later)", "neurological problems (later)"],
    treatments: ["antibiotics", "early treatment is crucial", "longer treatment for late-stage disease"],
    specialties: ["Infectious Disease", "Rheumatology"]
  },
  "lymphoedema": {
    name: "Lymphoedema",
    description: "Lymphoedema is swelling that occurs when the lymphatic system is damaged or blocked, preventing lymph fluid from draining properly. It commonly affects arms or legs.",
    symptoms: ["swelling in arms or legs", "feeling of heaviness", "tightness", "limited range of motion", "recurring infections", "hardening of skin"],
    treatments: ["compression garments", "manual lymphatic drainage", "exercise", "skin care", "surgery in severe cases"],
    specialties: ["Vascular Medicine", "Physical Medicine", "Oncology"]
  },
  "lymphedema": {
    name: "Lymphoedema",
    description: "Lymphedema is swelling due to lymphatic system problems.",
    symptoms: ["swelling", "heaviness", "tightness"],
    treatments: ["compression", "manual drainage", "exercise"],
    specialties: ["Vascular Medicine"]
  },
  "lymphogranuloma venereum": {
    name: "Lymphogranuloma Venereum (LGV)",
    description: "LGV is a sexually transmitted infection caused by certain types of Chlamydia bacteria. It's rare but can cause serious complications if not treated.",
    symptoms: ["small painless sore", "swollen lymph nodes in groin", "fever", "rectal symptoms if anal infection"],
    treatments: ["antibiotics", "draining of abscesses", "partner treatment", "follow-up care"],
    specialties: ["Infectious Disease", "Urology", "Obstetrics & Gynecology"]
  },
  "lgv": {
    name: "Lymphogranuloma Venereum",
    description: "LGV is a rare sexually transmitted infection.",
    symptoms: ["sore", "swollen nodes"],
    treatments: ["antibiotics"],
    specialties: ["Infectious Disease"]
  },
  "malaria": {
    name: "Malaria",
    description: "Malaria is a serious and sometimes fatal disease caused by a parasite transmitted through the bite of infected mosquitoes. It's common in tropical and subtropical regions.",
    symptoms: ["fever", "chills", "sweating", "headache", "nausea and vomiting", "muscle pain", "fatigue"],
    treatments: ["antimalarial medications", "supportive care", "prevention through medications and mosquito avoidance"],
    specialties: ["Infectious Disease", "Tropical Medicine"]
  },
  "malignant brain tumour": {
    name: "Malignant Brain Tumour (Brain Cancer)",
    description: "A malignant brain tumour is a cancerous growth in the brain. It can be primary (starting in the brain) or secondary (spreading from elsewhere).",
    symptoms: ["headaches", "seizures", "vision problems", "personality changes", "memory problems", "nausea and vomiting", "difficulty with balance"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy", "rehabilitation"],
    specialties: ["Neurosurgery", "Oncology", "Radiation Oncology", "Neurology"]
  },
  "brain cancer": {
    name: "Malignant Brain Tumour",
    description: "Brain cancer is a malignant tumor in the brain.",
    symptoms: ["headaches", "seizures", "vision problems"],
    treatments: ["surgery", "radiation", "chemotherapy"],
    specialties: ["Neurosurgery", "Oncology"]
  },
  "malnutrition": {
    name: "Malnutrition",
    description: "Malnutrition is a condition that occurs when the body doesn't get enough nutrients. It can be caused by inadequate diet, absorption problems, or increased nutritional needs.",
    symptoms: ["weight loss", "fatigue", "weakness", "poor wound healing", "delayed growth in children", "muscle wasting"],
    treatments: ["nutritional support", "dietary changes", "supplements", "treating underlying causes", "tube feeding if needed"],
    specialties: ["Nutrition", "Internal Medicine", "Gastroenterology", "Pediatrics"]
  },
  "managing genital symptoms": {
    name: "Managing Genital Symptoms",
    description: "Genital symptoms can include various issues affecting the genital area. Proper management involves identifying the cause and appropriate treatment.",
    symptoms: ["varies by condition", "itching", "pain", "discharge", "sores", "swelling"],
    treatments: ["depends on cause", "may include medications", "good hygiene", "avoiding irritants", "medical evaluation"],
    specialties: ["Urology", "Obstetrics & Gynecology", "Dermatology", "Infectious Disease"]
  },
  "measles": {
    name: "Measles",
    description: "Measles is a highly contagious viral infection that causes a distinctive rash and flu-like symptoms. It can lead to serious complications, especially in children.",
    symptoms: ["fever", "cough", "runny nose", "red eyes", "rash", "small white spots in mouth"],
    treatments: ["supportive care", "rest and fluids", "fever reducers", "prevention through vaccination"],
    specialties: ["Infectious Disease", "Pediatrics"]
  },
  "mechanical neck pain": {
    name: "Mechanical Neck Pain",
    description: "Mechanical neck pain is pain in the neck caused by problems with the muscles, ligaments, or joints rather than nerve compression. It's often related to posture or injury.",
    symptoms: ["neck pain", "stiffness", "muscle spasms", "headaches", "limited range of motion"],
    treatments: ["pain medications", "physical therapy", "heat or cold therapy", "posture correction", "exercise", "massage"],
    specialties: ["Orthopedics", "Physical Medicine", "Neurology"]
  },
  "meningitis": {
    name: "Meningitis",
    description: "Meningitis is inflammation of the membranes (meninges) surrounding the brain and spinal cord. It can be caused by bacteria, viruses, or other organisms and is a medical emergency.",
    symptoms: ["sudden high fever", "severe headache", "stiff neck", "nausea and vomiting", "confusion", "sensitivity to light", "rash"],
    treatments: ["immediate medical treatment", "antibiotics if bacterial", "antiviral medications if viral", "supportive care", "prevention through vaccination"],
    specialties: ["Infectious Disease", "Neurology", "Emergency Medicine", "Pediatrics"]
  },
  "meniere's disease": {
    name: "Meniere's Disease",
    description: "Meniere's disease is an inner ear disorder that can lead to vertigo and hearing loss. It typically affects only one ear and can cause episodes of severe dizziness.",
    symptoms: ["recurring episodes of vertigo", "hearing loss", "tinnitus", "feeling of fullness in ear", "nausea and vomiting during episodes"],
    treatments: ["medications for vertigo", "dietary changes (low salt)", "hearing aids", "injections", "surgery in severe cases"],
    specialties: ["Otolaryngology", "Neurology"]
  },
  "menieres disease": {
    name: "Meniere's Disease",
    description: "Meniere's disease is an inner ear disorder causing vertigo and hearing problems.",
    symptoms: ["vertigo", "hearing loss", "tinnitus"],
    treatments: ["medications", "dietary changes"],
    specialties: ["Otolaryngology"]
  },
  "menopause": {
    name: "Menopause",
    description: "Menopause is the natural cessation of menstrual periods, marking the end of a woman's reproductive years. It typically occurs in the late 40s or early 50s.",
    symptoms: ["irregular periods", "hot flashes", "night sweats", "mood changes", "sleep problems", "vaginal dryness", "decreased libido"],
    treatments: ["hormone replacement therapy", "lifestyle changes", "medications for specific symptoms", "supportive care"],
    specialties: ["Obstetrics & Gynecology", "Endocrinology"]
  },
  "mesothelioma": {
    name: "Mesothelioma",
    description: "Mesothelioma is a rare and aggressive cancer that affects the mesothelium, the thin layer of tissue covering most internal organs. It's primarily caused by asbestos exposure.",
    symptoms: ["chest pain", "shortness of breath", "persistent cough", "unexplained weight loss", "fatigue", "abdominal pain if affecting abdomen"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "targeted therapy", "palliative care"],
    specialties: ["Oncology", "Thoracic Surgery", "Radiation Oncology"]
  },
  "metacarpal fracture": {
    name: "Metacarpal Fracture of the Hand",
    description: "A metacarpal fracture is a break in one of the long bones in the hand that connect the wrist to the fingers. It's a common hand injury.",
    symptoms: ["hand pain", "swelling", "bruising", "deformity", "difficulty moving fingers", "tenderness"],
    treatments: ["splinting or casting", "pain medications", "ice", "surgery for displaced fractures", "physical therapy"],
    specialties: ["Orthopedics", "Hand Surgery", "Emergency Medicine"]
  },
  "middle ear infection": {
    name: "Middle Ear Infection (Otitis Media)",
    description: "A middle ear infection, or otitis media, is an infection of the air-filled space behind the eardrum. It's very common in children but can affect adults too.",
    symptoms: ["ear pain", "fever", "hearing loss", "fluid drainage from ear", "irritability in children", "difficulty sleeping"],
    treatments: ["pain medications", "antibiotics if bacterial", "watchful waiting in some cases", "ear tubes if recurrent"],
    specialties: ["Otolaryngology", "Pediatrics"]
  },
  "otitis media": {
    name: "Middle Ear Infection",
    description: "Otitis media is an infection of the middle ear.",
    symptoms: ["ear pain", "fever", "hearing loss"],
    treatments: ["antibiotics", "pain medications"],
    specialties: ["Otolaryngology"]
  },
  "migraine": {
    name: "Migraine",
    description: "Migraines are severe, recurring headaches that can cause throbbing pain, usually on one side of the head, often accompanied by nausea and sensitivity to light and sound.",
    symptoms: ["throbbing or pulsing pain", "nausea", "vomiting", "sensitivity to light and sound", "aura (visual disturbances)", "may last hours to days"],
    treatments: ["pain-relieving medications", "preventive medications", "lifestyle changes", "identifying and avoiding triggers", "biofeedback"],
    specialties: ["Neurology", "Headache Medicine"]
  },
  "minor head injury": {
    name: "Minor Head Injury",
    description: "A minor head injury, also called a concussion, is a traumatic brain injury caused by a blow to the head or body that causes the brain to move rapidly inside the skull.",
    symptoms: ["headache", "confusion", "dizziness", "nausea", "memory problems", "sensitivity to light or noise"],
    treatments: ["rest", "avoiding activities that could cause another injury", "gradual return to activities", "pain medications", "medical monitoring"],
    specialties: ["Emergency Medicine", "Neurology", "Sports Medicine"]
  },
  "miscarriage": {
    name: "Miscarriage",
    description: "A miscarriage is the loss of a pregnancy before 20 weeks. It's unfortunately common and can be emotionally devastating. Most occur due to chromosomal abnormalities.",
    symptoms: ["vaginal bleeding", "abdominal cramping", "passing tissue", "back pain"],
    treatments: ["medical monitoring", "supportive care", "emotional support", "medical or surgical management if needed", "follow-up care"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "molar pregnancy": {
    name: "Molar Pregnancy",
    description: "A molar pregnancy is a rare complication of pregnancy in which abnormal tissue grows in the uterus instead of a normal fetus. It requires medical treatment.",
    symptoms: ["vaginal bleeding", "severe nausea and vomiting", "rapid uterine growth", "high blood pressure", "no fetal movement"],
    treatments: ["surgical removal of molar tissue", "monitoring for complications", "chemotherapy if needed", "follow-up care", "delaying future pregnancy"],
    specialties: ["Obstetrics & Gynecology", "Oncology"]
  },
  "motor neurone disease": {
    name: "Motor Neurone Disease (MND)",
    description: "Motor neurone disease, also known as ALS (amyotrophic lateral sclerosis), is a progressive neurological disorder that affects nerve cells controlling voluntary muscle movement.",
    symptoms: ["muscle weakness", "muscle wasting", "difficulty speaking", "difficulty swallowing", "breathing problems", "twitching"],
    treatments: ["medications to slow progression", "supportive care", "respiratory support", "nutritional support", "physical therapy"],
    specialties: ["Neurology"]
  },
  "mnd": {
    name: "Motor Neurone Disease",
    description: "MND is a progressive neurological disorder affecting muscle control.",
    symptoms: ["muscle weakness", "difficulty speaking", "breathing problems"],
    treatments: ["medications", "supportive care"],
    specialties: ["Neurology"]
  },
  "mouth cancer": {
    name: "Mouth Cancer (Oral Cancer)",
    description: "Mouth cancer, or oral cancer, can occur in any part of the mouth including lips, tongue, cheeks, floor of mouth, hard and soft palate, sinuses, and throat.",
    symptoms: ["sore that doesn't heal", "lump or thickening", "white or red patches", "loose teeth", "difficulty swallowing", "mouth pain"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy", "rehabilitation"],
    specialties: ["Otolaryngology", "Oncology", "Oral Surgery", "Radiation Oncology"]
  },
  "oral cancer": {
    name: "Mouth Cancer",
    description: "Oral cancer is cancer affecting the mouth and throat.",
    symptoms: ["mouth sore", "lump", "white patches"],
    treatments: ["surgery", "radiation", "chemotherapy"],
    specialties: ["Otolaryngology", "Oncology"]
  },
  "mouth ulcer": {
    name: "Mouth Ulcer",
    description: "Mouth ulcers are painful sores that appear inside the mouth. They're common and usually harmless, healing on their own within a week or two.",
    symptoms: ["painful sore in mouth", "round or oval shape", "white or yellow center", "red border", "may be single or multiple"],
    treatments: ["usually heals on its own", "topical treatments", "pain relievers", "avoiding irritants", "treating underlying causes if recurrent"],
    specialties: ["Dentistry", "Otolaryngology"]
  },
  "multiple myeloma": {
    name: "Multiple Myeloma",
    description: "Multiple myeloma is a cancer of plasma cells, a type of white blood cell. It causes bone pain, fractures, and can affect kidney function.",
    symptoms: ["bone pain", "fatigue", "frequent infections", "nausea", "constipation", "loss of appetite", "confusion"],
    treatments: ["chemotherapy", "targeted therapy", "immunotherapy", "stem cell transplant", "radiation therapy", "supportive care"],
    specialties: ["Hematology-Oncology"]
  },
  "multiple sclerosis": {
    name: "Multiple Sclerosis (MS)",
    description: "Multiple sclerosis is a disease of the central nervous system where the immune system attacks the protective covering of nerves, disrupting communication between brain and body.",
    symptoms: ["numbness or weakness in limbs", "vision problems", "tingling or pain", "tremor", "fatigue", "dizziness", "cognitive problems"],
    treatments: ["disease-modifying therapies", "corticosteroids", "physical therapy", "medications for symptoms", "lifestyle modifications"],
    specialties: ["Neurology", "Multiple Sclerosis"]
  },
  "ms": {
    name: "Multiple Sclerosis",
    description: "MS is a neurological condition where the immune system attacks the nervous system.",
    symptoms: ["numbness", "vision problems", "fatigue"],
    treatments: ["disease-modifying medications", "symptom management"],
    specialties: ["Neurology"]
  },
  "multiple system atrophy": {
    name: "Multiple System Atrophy (MSA)",
    description: "Multiple system atrophy is a rare, progressive neurological disorder that affects multiple systems in the body, including movement, blood pressure, and bladder control.",
    symptoms: ["parkinsonian symptoms", "autonomic dysfunction", "urinary problems", "low blood pressure", "speech problems", "balance problems"],
    treatments: ["symptom management", "medications for blood pressure", "physical therapy", "speech therapy", "supportive care"],
    specialties: ["Neurology", "Movement Disorders"]
  },
  "msa": {
    name: "Multiple System Atrophy",
    description: "MSA is a rare progressive neurological disorder affecting multiple body systems.",
    symptoms: ["movement problems", "blood pressure issues", "urinary problems"],
    treatments: ["symptom management", "supportive care"],
    specialties: ["Neurology"]
  },
  "mumps": {
    name: "Mumps",
    description: "Mumps is a viral infection that primarily affects the salivary glands, causing them to swell. It's now rare due to vaccination but can cause serious complications.",
    symptoms: ["swollen, painful salivary glands", "fever", "headache", "muscle aches", "fatigue", "loss of appetite"],
    treatments: ["supportive care", "rest and fluids", "pain relievers", "prevention through vaccination"],
    specialties: ["Infectious Disease", "Pediatrics"]
  },
  "munchausen's syndrome": {
    name: "Munchausen's Syndrome",
    description: "Munchausen's syndrome, now called factitious disorder, is a mental health condition where a person repeatedly acts as if they have a physical or mental illness when they're not really sick.",
    symptoms: ["fabricating symptoms", "seeking medical attention", "undergoing unnecessary procedures", "lying about medical history"],
    treatments: ["psychotherapy", "addressing underlying psychological issues", "family therapy", "preventing unnecessary medical procedures"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "factitious disorder": {
    name: "Munchausen's Syndrome",
    description: "Factitious disorder involves feigning illness.",
    symptoms: ["fabricated symptoms", "seeking medical care"],
    treatments: ["psychotherapy"],
    specialties: ["Psychiatry"]
  },
  "muscular dystrophy": {
    name: "Muscular Dystrophy",
    description: "Muscular dystrophy is a group of genetic diseases that cause progressive weakness and loss of muscle mass. There are many types, each with different patterns of inheritance and symptoms.",
    symptoms: ["progressive muscle weakness", "frequent falls", "difficulty walking", "large calf muscles", "learning disabilities in some types"],
    treatments: ["medications to slow progression", "physical therapy", "respiratory support", "cardiac monitoring", "assistive devices"],
    specialties: ["Neurology", "Physical Medicine", "Pediatrics"]
  },
  "myalgic encephalomyelitis": {
    name: "Myalgic Encephalomyelitis (ME) or Chronic Fatigue Syndrome (CFS)",
    description: "ME/CFS is a complex disorder characterized by extreme fatigue that doesn't improve with rest and can't be explained by an underlying medical condition.",
    symptoms: ["severe fatigue", "sleep problems", "cognitive difficulties (brain fog)", "muscle and joint pain", "headaches", "sore throat"],
    treatments: ["pacing activities", "cognitive behavioral therapy", "graded exercise therapy", "medications for symptoms", "sleep management"],
    specialties: ["Internal Medicine", "Rheumatology", "Neurology"]
  },
  "me": {
    name: "Myalgic Encephalomyelitis",
    description: "ME is a condition causing severe fatigue that doesn't improve with rest.",
    symptoms: ["extreme fatigue", "cognitive problems", "pain"],
    treatments: ["pacing", "therapy", "symptom management"],
    specialties: ["Internal Medicine"]
  },
  "chronic fatigue syndrome": {
    name: "ME/CFS",
    description: "Chronic fatigue syndrome causes persistent fatigue and other symptoms.",
    symptoms: ["fatigue", "sleep problems", "cognitive difficulties"],
    treatments: ["pacing", "therapy"],
    specialties: ["Internal Medicine"]
  },
  "myasthenia gravis": {
    name: "Myasthenia Gravis",
    description: "Myasthenia gravis is a chronic autoimmune neuromuscular disease that causes weakness in the skeletal muscles, which are responsible for breathing and moving parts of the body.",
    symptoms: ["muscle weakness that worsens with activity", "drooping eyelids", "double vision", "difficulty speaking", "difficulty swallowing", "weakness in arms and legs"],
    treatments: ["medications (cholinesterase inhibitors)", "immunosuppressants", "plasmapheresis", "intravenous immunoglobulin", "thymectomy"],
    specialties: ["Neurology"]
  },
  "mycoplasma genitalium": {
    name: "Mycoplasma Genitalium (Mgen)",
    description: "Mycoplasma genitalium is a sexually transmitted bacterial infection. It can cause urethritis in men and cervicitis in women, and is often asymptomatic.",
    symptoms: ["often no symptoms", "urethritis in men", "cervicitis in women", "discharge", "pain during urination"],
    treatments: ["antibiotics", "partner treatment", "follow-up testing", "abstinence during treatment"],
    specialties: ["Infectious Disease", "Urology", "Obstetrics & Gynecology"]
  },
  "mgen": {
    name: "Mycoplasma Genitalium",
    description: "Mgen is a sexually transmitted bacterial infection.",
    symptoms: ["often asymptomatic", "discharge", "pain"],
    treatments: ["antibiotics"],
    specialties: ["Infectious Disease"]
  },
  "myotonic dystrophy": {
    name: "Myotonic Dystrophy",
    description: "Myotonic dystrophy is a type of muscular dystrophy characterized by progressive muscle wasting and weakness, along with myotonia (inability to relax muscles after contraction).",
    symptoms: ["progressive muscle weakness", "myotonia (muscle stiffness)", "cataracts", "heart problems", "breathing problems", "cognitive problems"],
    treatments: ["symptom management", "cardiac monitoring", "respiratory support", "cataract surgery", "physical therapy"],
    specialties: ["Neurology", "Cardiology", "Physical Medicine"]
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

