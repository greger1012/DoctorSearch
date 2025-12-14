/**
 * Script to add diseases starting with N, O, P from NHS Inform with detailed descriptions
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
  "nasal and sinus cancer": {
    name: "Nasal and Sinus Cancer",
    description: "Nasal and sinus cancer is a rare type of cancer that occurs in the nasal cavity and paranasal sinuses. It's often associated with certain occupational exposures and smoking.",
    symptoms: ["persistent nasal congestion", "nosebleeds", "facial pain or numbness", "swelling around eyes", "loss of smell", "loose teeth"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy", "rehabilitation"],
    specialties: ["Otolaryngology", "Oncology", "Radiation Oncology"]
  },
  "nasopharyngeal cancer": {
    name: "Nasopharyngeal Cancer",
    description: "Nasopharyngeal cancer is a rare type of cancer that occurs in the nasopharynx, the area behind the nose and above the back of the throat. It's more common in certain parts of the world.",
    symptoms: ["lump in neck", "blood in saliva", "nasal congestion", "hearing loss", "ear infections", "headaches"],
    treatments: ["radiation therapy", "chemotherapy", "surgery in some cases", "targeted therapy"],
    specialties: ["Otolaryngology", "Oncology", "Radiation Oncology"]
  },
  "neck injury": {
    name: "Neck Injury",
    description: "A neck injury can range from minor muscle strains to serious spinal cord injuries. Common causes include whiplash from car accidents, sports injuries, or falls.",
    symptoms: ["neck pain", "stiffness", "headache", "muscle spasms", "numbness or tingling", "weakness in severe cases"],
    treatments: ["rest", "ice or heat", "pain medications", "physical therapy", "cervical collar if needed", "surgery in severe cases"],
    specialties: ["Orthopedics", "Emergency Medicine", "Neurosurgery", "Physical Medicine"]
  },
  "neck problems": {
    name: "Neck Problems",
    description: "Neck problems encompass a wide range of conditions affecting the neck, including muscle strains, cervical spondylosis, herniated discs, and nerve compression.",
    symptoms: ["neck pain", "stiffness", "headaches", "reduced range of motion", "numbness or tingling", "muscle spasms"],
    treatments: ["pain medications", "physical therapy", "heat or cold therapy", "posture correction", "exercise", "surgery in severe cases"],
    specialties: ["Orthopedics", "Physical Medicine", "Neurology"]
  },
  "neuroendocrine tumours": {
    name: "Neuroendocrine Tumours",
    description: "Neuroendocrine tumours are rare cancers that develop from neuroendocrine cells, which are found throughout the body. They can occur in various organs including the pancreas, lungs, and digestive tract.",
    symptoms: ["varies by location", "abdominal pain", "diarrhea", "flushing", "wheezing", "hormonal symptoms"],
    treatments: ["surgery", "medications to control hormone production", "chemotherapy", "targeted therapy", "peptide receptor radionuclide therapy"],
    specialties: ["Oncology", "Endocrinology", "Surgical Oncology"]
  },
  "neuroendocrine tumors": {
    name: "Neuroendocrine Tumours",
    description: "Neuroendocrine tumors are rare cancers from neuroendocrine cells.",
    symptoms: ["varies by location"],
    treatments: ["surgery", "medications", "chemotherapy"],
    specialties: ["Oncology"]
  },
  "non-alcoholic fatty liver disease": {
    name: "Non-Alcoholic Fatty Liver Disease (NAFLD)",
    description: "NAFLD is a condition where fat builds up in the liver in people who drink little or no alcohol. It can progress to more serious liver disease including cirrhosis.",
    symptoms: ["often no symptoms", "fatigue", "abdominal discomfort", "jaundice in advanced stages"],
    treatments: ["weight loss", "dietary changes", "exercise", "controlling diabetes and cholesterol", "avoiding alcohol"],
    specialties: ["Gastroenterology", "Hepatology"]
  },
  "nafld": {
    name: "Non-Alcoholic Fatty Liver Disease",
    description: "NAFLD is fat accumulation in the liver not caused by alcohol.",
    symptoms: ["often asymptomatic", "fatigue"],
    treatments: ["weight loss", "dietary changes", "exercise"],
    specialties: ["Gastroenterology", "Hepatology"]
  },
  "non-hodgkin lymphoma": {
    name: "Non-Hodgkin Lymphoma",
    description: "Non-Hodgkin lymphoma is a type of cancer that begins in the lymphatic system. It's more common than Hodgkin lymphoma and includes many different subtypes.",
    symptoms: ["swollen lymph nodes", "fatigue", "fever", "night sweats", "unexplained weight loss", "abdominal pain"],
    treatments: ["chemotherapy", "radiation therapy", "immunotherapy", "targeted therapy", "stem cell transplant in some cases"],
    specialties: ["Hematology-Oncology", "Radiation Oncology"]
  },
  "norovirus": {
    name: "Norovirus",
    description: "Norovirus is a highly contagious virus that causes vomiting and diarrhea. It's the most common cause of gastroenteritis outbreaks and spreads easily in close quarters.",
    symptoms: ["nausea", "vomiting", "diarrhea", "stomach cramps", "fever", "headache", "body aches"],
    treatments: ["rest and fluids", "oral rehydration solutions", "preventing dehydration", "good hygiene to prevent spread"],
    specialties: ["Infectious Disease", "Gastroenterology", "Internal Medicine"]
  },
  "nosebleed": {
    name: "Nosebleed (Epistaxis)",
    description: "A nosebleed is bleeding from the nose, usually from the blood vessels in the front part of the nose. Most nosebleeds are harmless and can be stopped at home.",
    symptoms: ["bleeding from one or both nostrils", "blood dripping down throat"],
    treatments: ["pinching nose", "leaning forward", "applying ice", "avoiding nose picking", "medical treatment if severe or recurrent"],
    specialties: ["Otolaryngology", "Emergency Medicine"]
  },
  "epistaxis": {
    name: "Nosebleed",
    description: "Epistaxis is the medical term for a nosebleed.",
    symptoms: ["bleeding from nose"],
    treatments: ["pinching nose", "medical treatment if needed"],
    specialties: ["Otolaryngology"]
  },
  "obesity": {
    name: "Obesity",
    description: "Obesity is a complex disease involving an excessive amount of body fat. It's a medical problem that increases the risk of other diseases and health problems.",
    symptoms: ["excessive body fat", "difficulty with physical activities", "shortness of breath", "increased sweating", "snoring"],
    treatments: ["dietary changes", "increased physical activity", "behavioral therapy", "medications", "bariatric surgery in severe cases"],
    specialties: ["Internal Medicine", "Endocrinology", "Bariatric Surgery", "Nutrition"]
  },
  "obsessive compulsive disorder": {
    name: "Obsessive Compulsive Disorder (OCD)",
    description: "OCD is a mental health disorder characterized by unwanted, recurring thoughts (obsessions) and repetitive behaviors (compulsions) that interfere with daily life.",
    symptoms: ["obsessive thoughts", "compulsive behaviors", "anxiety", "time-consuming rituals", "difficulty functioning"],
    treatments: ["cognitive behavioral therapy", "medications (SSRIs)", "exposure and response prevention", "support groups"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "ocd": {
    name: "Obsessive Compulsive Disorder",
    description: "OCD involves obsessions and compulsions that interfere with daily life.",
    symptoms: ["obsessive thoughts", "compulsive behaviors"],
    treatments: ["therapy", "medications"],
    specialties: ["Psychiatry"]
  },
  "obstructive sleep apnoea": {
    name: "Obstructive Sleep Apnoea (OSA)",
    description: "Obstructive sleep apnoea is a serious sleep disorder where breathing repeatedly stops and starts during sleep due to blocked airways.",
    symptoms: ["loud snoring", "episodes of stopped breathing during sleep", "gasping for air", "excessive daytime sleepiness", "morning headache", "irritability"],
    treatments: ["continuous positive airway pressure (CPAP)", "lifestyle changes (weight loss, avoiding alcohol)", "oral appliances", "surgery in some cases"],
    specialties: ["Sleep Medicine", "Pulmonology", "Otolaryngology"]
  },
  "osa": {
    name: "Obstructive Sleep Apnoea",
    description: "OSA is a sleep disorder causing breathing interruptions.",
    symptoms: ["snoring", "daytime sleepiness", "stopped breathing"],
    treatments: ["CPAP", "lifestyle changes"],
    specialties: ["Sleep Medicine", "Pulmonology"]
  },
  "oculopharyngeal muscular dystrophy": {
    name: "Oculopharyngeal Muscular Dystrophy (OPMD)",
    description: "OPMD is a rare genetic muscle disorder that causes progressive weakness of the eye muscles and throat muscles, leading to drooping eyelids and difficulty swallowing.",
    symptoms: ["drooping eyelids", "difficulty swallowing", "weakness in facial muscles", "progressive muscle weakness"],
    treatments: ["symptom management", "swallowing therapy", "eyelid surgery", "feeding tube if needed", "physical therapy"],
    specialties: ["Neurology", "Physical Medicine", "Otolaryngology"]
  },
  "opmd": {
    name: "Oculopharyngeal Muscular Dystrophy",
    description: "OPMD is a rare muscle disorder affecting eyes and throat.",
    symptoms: ["drooping eyelids", "swallowing problems"],
    treatments: ["symptom management", "therapy"],
    specialties: ["Neurology"]
  },
  "oesophageal cancer": {
    name: "Oesophageal Cancer",
    description: "Oesophageal cancer is cancer that occurs in the oesophagus, the tube that carries food from the throat to the stomach. It's often associated with smoking, alcohol, and acid reflux.",
    symptoms: ["difficulty swallowing", "unexplained weight loss", "chest pain", "worsening indigestion", "coughing", "hoarseness"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "targeted therapy", "palliative care"],
    specialties: ["Oncology", "Gastroenterology", "Surgical Oncology", "Radiation Oncology"]
  },
  "esophageal cancer": {
    name: "Oesophageal Cancer",
    description: "Esophageal cancer is cancer of the food pipe.",
    symptoms: ["difficulty swallowing", "weight loss"],
    treatments: ["surgery", "chemotherapy", "radiation"],
    specialties: ["Oncology"]
  },
  "oral thrush in adults": {
    name: "Oral Thrush in Adults",
    description: "Oral thrush is a fungal infection in the mouth caused by Candida yeast. It's more common in people with weakened immune systems, diabetes, or those taking certain medications.",
    symptoms: ["white patches in mouth", "redness or soreness", "loss of taste", "pain when eating or swallowing", "cracking at corners of mouth"],
    treatments: ["antifungal medications", "good oral hygiene", "treating underlying causes", "dietary changes"],
    specialties: ["Dentistry", "Infectious Disease", "Internal Medicine"]
  },
  "oral thrush": {
    name: "Oral Thrush",
    description: "Oral thrush is a fungal infection in the mouth.",
    symptoms: ["white patches", "soreness"],
    treatments: ["antifungal medications"],
    specialties: ["Dentistry"]
  },
  "osteoarthritis": {
    name: "Osteoarthritis",
    description: "Osteoarthritis is the most common form of arthritis, occurring when the protective cartilage that cushions the ends of bones wears down over time. It can affect any joint.",
    symptoms: ["joint pain", "stiffness", "swelling", "reduced range of motion", "grating sensation", "bone spurs"],
    treatments: ["pain medications", "physical therapy", "exercise", "weight loss", "joint injections", "surgery in severe cases"],
    specialties: ["Rheumatology", "Orthopedics"]
  },
  "osteoarthritis of the hip": {
    name: "Osteoarthritis of the Hip",
    description: "Hip osteoarthritis is wear and tear of the hip joint cartilage, causing pain and stiffness. It's common in older adults and can significantly impact mobility.",
    symptoms: ["hip pain", "stiffness", "reduced range of motion", "pain that worsens with activity", "limping"],
    treatments: ["pain medications", "physical therapy", "exercise", "weight loss", "hip injections", "hip replacement surgery"],
    specialties: ["Orthopedics", "Rheumatology"]
  },
  "osteoarthritis of the knee": {
    name: "Osteoarthritis of the Knee",
    description: "Knee osteoarthritis is the most common form of osteoarthritis, causing pain, stiffness, and reduced function in the knee joint.",
    symptoms: ["knee pain", "stiffness", "swelling", "reduced range of motion", "creaking or grinding sounds", "difficulty walking"],
    treatments: ["pain medications", "physical therapy", "exercise", "weight loss", "knee braces", "knee injections", "knee replacement surgery"],
    specialties: ["Orthopedics", "Rheumatology"]
  },
  "osteoarthritis of the hand": {
    name: "Osteoarthritis of the Hand",
    description: "Hand osteoarthritis affects the joints in the hands and fingers, causing pain, stiffness, and reduced dexterity. It's common in older adults.",
    symptoms: ["hand pain", "stiffness", "swelling", "reduced grip strength", "bony nodules", "difficulty with fine motor tasks"],
    treatments: ["pain medications", "hand therapy", "splinting", "joint injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Rheumatology", "Hand Surgery"]
  },
  "osteoporosis": {
    name: "Osteoporosis",
    description: "Osteoporosis is a condition that weakens bones, making them fragile and more likely to break. It develops slowly over years and is often only diagnosed when a fracture occurs.",
    symptoms: ["often no symptoms until fracture", "back pain", "loss of height", "stooped posture", "fractures from minor falls"],
    treatments: ["calcium and vitamin D supplements", "medications to strengthen bones", "exercise", "fall prevention", "lifestyle changes"],
    specialties: ["Endocrinology", "Rheumatology", "Orthopedics"]
  },
  "osteosarcoma": {
    name: "Osteosarcoma",
    description: "Osteosarcoma is the most common type of bone cancer, usually occurring in children and young adults. It most commonly affects the long bones of the arms and legs.",
    symptoms: ["bone pain", "swelling near affected bone", "fractures", "limping", "fatigue", "unexplained weight loss"],
    treatments: ["chemotherapy", "surgery to remove tumor", "limb-sparing surgery when possible", "radiation therapy in some cases"],
    specialties: ["Oncology", "Pediatric Oncology", "Orthopedic Surgery"]
  },
  "outer ear infection": {
    name: "Outer Ear Infection (Otitis Externa)",
    description: "An outer ear infection, also called swimmer's ear, is an infection of the outer ear canal. It's often caused by water remaining in the ear after swimming.",
    symptoms: ["ear pain", "itching", "redness", "swelling", "discharge", "hearing loss"],
    treatments: ["ear drops (antibiotic or antifungal)", "pain medications", "keeping ear dry", "cleaning ear canal"],
    specialties: ["Otolaryngology"]
  },
  "otitis externa": {
    name: "Outer Ear Infection",
    description: "Otitis externa is an infection of the outer ear canal.",
    symptoms: ["ear pain", "itching", "discharge"],
    treatments: ["ear drops", "keeping ear dry"],
    specialties: ["Otolaryngology"]
  },
  "ovarian cancer": {
    name: "Ovarian Cancer",
    description: "Ovarian cancer is cancer that begins in the ovaries. It's often called the 'silent killer' because symptoms are vague and often go unnoticed until the cancer has spread.",
    symptoms: ["abdominal bloating", "pelvic pain", "feeling full quickly", "urinary urgency", "fatigue", "back pain"],
    treatments: ["surgery", "chemotherapy", "targeted therapy", "hormone therapy", "palliative care"],
    specialties: ["Gynecologic Oncology", "Oncology", "Surgical Oncology"]
  },
  "ovarian cancer: teenagers and young adults": {
    name: "Ovarian Cancer in Teenagers and Young Adults",
    description: "Ovarian cancer in teenagers and young adults requires specialized care that considers fertility preservation, long-term side effects, and the unique needs of this age group.",
    symptoms: ["abdominal bloating", "pelvic pain", "feeling full quickly", "urinary symptoms"],
    treatments: ["specialized protocols", "fertility preservation", "surgery", "chemotherapy", "long-term follow-up"],
    specialties: ["Gynecologic Oncology", "Adolescent Medicine"]
  },
  "ovarian cyst": {
    name: "Ovarian Cyst",
    description: "An ovarian cyst is a fluid-filled sac that forms on or inside an ovary. Most ovarian cysts are harmless and go away on their own, but some can cause problems.",
    symptoms: ["often no symptoms", "pelvic pain", "bloating", "painful periods", "pain during intercourse", "frequent urination"],
    treatments: ["watchful waiting", "hormonal contraceptives", "surgery if large or causing problems", "treating underlying conditions"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "overactive thyroid": {
    name: "Overactive Thyroid (Hyperthyroidism)",
    description: "An overactive thyroid, or hyperthyroidism, occurs when the thyroid gland produces too much thyroid hormone, speeding up the body's metabolism.",
    symptoms: ["rapid heartbeat", "nervousness", "anxiety", "tremor", "sweating", "weight loss", "fatigue", "heat intolerance"],
    treatments: ["antithyroid medications", "radioactive iodine", "surgery", "beta blockers for symptoms"],
    specialties: ["Endocrinology"]
  },
  "hyperthyroidism": {
    name: "Overactive Thyroid",
    description: "Hyperthyroidism is excessive thyroid hormone production.",
    symptoms: ["rapid heartbeat", "weight loss", "nervousness"],
    treatments: ["antithyroid medications", "radioactive iodine"],
    specialties: ["Endocrinology"]
  },
  "pain in the ball of the foot": {
    name: "Pain in the Ball of the Foot (Metatarsalgia)",
    description: "Pain in the ball of the foot, or metatarsalgia, is a common condition that causes pain and inflammation in the ball of the foot, often due to overuse or ill-fitting shoes.",
    symptoms: ["sharp or burning pain in ball of foot", "pain that worsens with standing or walking", "numbness or tingling", "feeling of pebble in shoe"],
    treatments: ["rest", "ice", "proper footwear", "orthotics", "pain medications", "physical therapy"],
    specialties: ["Podiatry", "Orthopedics", "Physical Medicine"]
  },
  "metatarsalgia": {
    name: "Pain in the Ball of the Foot",
    description: "Metatarsalgia is pain in the ball of the foot.",
    symptoms: ["pain in ball of foot", "worsens with activity"],
    treatments: ["rest", "proper footwear", "orthotics"],
    specialties: ["Podiatry"]
  },
  "paget's disease of the breast": {
    name: "Paget's Disease of the Breast",
    description: "Paget's disease of the breast is a rare form of breast cancer that affects the skin of the nipple and areola. It's often associated with underlying breast cancer.",
    symptoms: ["redness and scaling of nipple", "itching", "burning", "discharge from nipple", "nipple inversion"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "hormone therapy"],
    specialties: ["Surgical Oncology", "Oncology", "Dermatology"]
  },
  "pagets disease of the breast": {
    name: "Paget's Disease of the Breast",
    description: "Paget's disease of the breast is a rare breast cancer affecting the nipple.",
    symptoms: ["nipple changes", "redness", "itching"],
    treatments: ["surgery", "chemotherapy"],
    specialties: ["Oncology"]
  },
  "pancreatic cancer": {
    name: "Pancreatic Cancer",
    description: "Pancreatic cancer is cancer that begins in the pancreas, an organ behind the stomach. It's often diagnosed at a late stage and has a poor prognosis.",
    symptoms: ["abdominal pain", "unexplained weight loss", "jaundice", "loss of appetite", "fatigue", "diabetes"],
    treatments: ["surgery (Whipple procedure)", "chemotherapy", "radiation therapy", "targeted therapy", "palliative care"],
    specialties: ["Oncology", "Surgical Oncology", "Gastroenterology"]
  },
  "panic disorder": {
    name: "Panic Disorder",
    description: "Panic disorder is a type of anxiety disorder characterized by recurrent, unexpected panic attacks. These are sudden episodes of intense fear that trigger severe physical reactions.",
    symptoms: ["panic attacks", "rapid heartbeat", "sweating", "trembling", "shortness of breath", "fear of losing control", "fear of dying"],
    treatments: ["psychotherapy (CBT)", "medications (antidepressants, anti-anxiety drugs)", "lifestyle changes", "stress management"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "parkinson's disease": {
    name: "Parkinson's Disease",
    description: "Parkinson's disease is a progressive nervous system disorder that affects movement. It develops gradually, often starting with a barely noticeable tremor in one hand.",
    symptoms: ["tremor", "slowed movement", "rigid muscles", "impaired posture and balance", "loss of automatic movements", "speech changes"],
    treatments: ["medications (levodopa, dopamine agonists)", "deep brain stimulation", "physical therapy", "occupational therapy", "speech therapy"],
    specialties: ["Neurology", "Movement Disorders"]
  },
  "parkinsons disease": {
    name: "Parkinson's Disease",
    description: "Parkinson's disease is a progressive movement disorder.",
    symptoms: ["tremor", "slowed movement", "rigidity"],
    treatments: ["medications", "deep brain stimulation"],
    specialties: ["Neurology"]
  },
  "patau's syndrome": {
    name: "Patau's Syndrome (Trisomy 13)",
    description: "Patau's syndrome, or trisomy 13, is a genetic disorder caused by the presence of an extra chromosome 13. It causes severe intellectual disability and physical abnormalities.",
    symptoms: ["severe intellectual disability", "multiple physical abnormalities", "heart defects", "cleft lip and palate", "extra fingers or toes"],
    treatments: ["supportive care", "treating associated health conditions", "palliative care", "family support"],
    specialties: ["Pediatrics", "Genetics", "Palliative Medicine"]
  },
  "pataus syndrome": {
    name: "Patau's Syndrome",
    description: "Patau's syndrome is a genetic condition with severe developmental delays.",
    symptoms: ["severe delays", "physical abnormalities", "heart defects"],
    treatments: ["supportive care"],
    specialties: ["Pediatrics", "Genetics"]
  },
  "patellofemoral pain syndrome": {
    name: "Patellofemoral Pain Syndrome",
    description: "Patellofemoral pain syndrome is pain around the kneecap (patella) and front of the knee. It's common in athletes and people who do a lot of running or jumping.",
    symptoms: ["pain around or behind kneecap", "pain that worsens with activity", "pain when sitting with bent knees", "grinding or popping sounds"],
    treatments: ["rest", "ice", "physical therapy", "strengthening exercises", "proper footwear", "patellar taping"],
    specialties: ["Orthopedics", "Sports Medicine", "Physical Medicine"]
  },
  "pelvic inflammatory disease": {
    name: "Pelvic Inflammatory Disease (PID)",
    description: "PID is an infection of the female reproductive organs, usually caused by sexually transmitted bacteria. It can cause serious complications including infertility if not treated.",
    symptoms: ["lower abdominal pain", "fever", "unusual vaginal discharge", "pain during intercourse", "irregular bleeding", "painful urination"],
    treatments: ["antibiotics", "treating sexual partners", "hospitalization in severe cases", "surgery if abscess forms"],
    specialties: ["Obstetrics & Gynecology", "Infectious Disease"]
  },
  "pid": {
    name: "Pelvic Inflammatory Disease",
    description: "PID is an infection of the female reproductive organs.",
    symptoms: ["pelvic pain", "fever", "discharge"],
    treatments: ["antibiotics"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "pelvic organ prolapse": {
    name: "Pelvic Organ Prolapse",
    description: "Pelvic organ prolapse occurs when pelvic organs (bladder, uterus, or rectum) drop from their normal position and bulge into the vagina. It's common after childbirth and with aging.",
    symptoms: ["feeling of pressure or fullness in pelvis", "bulge in vagina", "urinary problems", "bowel problems", "back pain"],
    treatments: ["pelvic floor exercises", "pessary (device to support organs)", "lifestyle changes", "surgery"],
    specialties: ["Urogynecology", "Obstetrics & Gynecology"]
  },
  "penile cancer": {
    name: "Penile Cancer",
    description: "Penile cancer is a rare type of cancer that forms in the tissues of the penis. It's most common in men over 50 and is often associated with HPV infection.",
    symptoms: ["sore or lump on penis", "thickening or discoloration of skin", "discharge", "bleeding", "swollen lymph nodes"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "laser therapy", "topical chemotherapy"],
    specialties: ["Urology", "Oncology"]
  },
  "peripheral neuropathy": {
    name: "Peripheral Neuropathy",
    description: "Peripheral neuropathy is damage to the peripheral nerves, often causing weakness, numbness, and pain, usually in the hands and feet. It can be caused by diabetes, infections, and other conditions.",
    symptoms: ["numbness or tingling", "burning pain", "sharp, jabbing pain", "sensitivity to touch", "muscle weakness", "loss of coordination"],
    treatments: ["treating underlying cause", "pain medications", "antidepressants", "anticonvulsants", "physical therapy"],
    specialties: ["Neurology"]
  },
  "personality disorder": {
    name: "Personality Disorder",
    description: "Personality disorders are a group of mental health conditions characterized by long-term patterns of thoughts, behaviors, and emotions that are unhealthy and inflexible.",
    symptoms: ["varies by type", "difficulty relating to others", "unstable relationships", "impulsive behavior", "emotional instability"],
    treatments: ["psychotherapy", "dialectical behavior therapy", "cognitive behavioral therapy", "medications for co-occurring conditions"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "pims": {
    name: "PIMS (Paediatric Inflammatory Multisystem Syndrome)",
    description: "PIMS is a rare but serious condition that can occur in children after COVID-19 infection. It causes inflammation in multiple body systems.",
    symptoms: ["persistent fever", "rash", "abdominal pain", "vomiting", "diarrhea", "red eyes", "swollen hands and feet"],
    treatments: ["hospitalization", "intravenous immunoglobulin", "corticosteroids", "supportive care", "monitoring"],
    specialties: ["Pediatrics", "Pediatric Intensive Care", "Rheumatology"]
  },
  "plantar heel pain": {
    name: "Plantar Heel Pain (Plantar Fasciitis)",
    description: "Plantar heel pain, commonly called plantar fasciitis, is inflammation of the thick band of tissue that runs across the bottom of the foot and connects the heel bone to the toes.",
    symptoms: ["sharp pain in heel", "pain that's worse in the morning", "pain after long periods of standing", "stiffness"],
    treatments: ["rest", "ice", "stretching exercises", "orthotics", "pain medications", "physical therapy", "injections", "surgery in severe cases"],
    specialties: ["Podiatry", "Orthopedics", "Physical Medicine"]
  },
  "plantar fasciitis": {
    name: "Plantar Heel Pain",
    description: "Plantar fasciitis is inflammation of the plantar fascia causing heel pain.",
    symptoms: ["heel pain", "worse in morning"],
    treatments: ["stretching", "orthotics", "rest"],
    specialties: ["Podiatry"]
  },
  "pleurisy": {
    name: "Pleurisy",
    description: "Pleurisy is inflammation of the pleura, the thin layers of tissue that separate the lungs from the chest wall. It causes sharp chest pain that worsens with breathing.",
    symptoms: ["sharp chest pain", "pain that worsens with breathing", "shortness of breath", "cough", "fever"],
    treatments: ["treating underlying cause", "pain medications", "anti-inflammatory medications", "rest"],
    specialties: ["Pulmonology", "Internal Medicine"]
  },
  "pneumonia": {
    name: "Pneumonia",
    description: "Pneumonia is an infection that inflames air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm, fever, chills, and difficulty breathing.",
    symptoms: ["cough with phlegm", "fever", "chills", "shortness of breath", "chest pain", "fatigue", "nausea"],
    treatments: ["antibiotics if bacterial", "antiviral medications if viral", "rest and fluids", "fever reducers", "oxygen therapy if needed"],
    specialties: ["Pulmonology", "Infectious Disease", "Internal Medicine"]
  },
  "polio": {
    name: "Polio",
    description: "Polio is a highly contagious viral disease that can cause paralysis. It's now rare in most parts of the world due to vaccination, but outbreaks still occur in some regions.",
    symptoms: ["often no symptoms", "flu-like symptoms", "meningitis", "paralysis in severe cases"],
    treatments: ["supportive care", "prevention through vaccination", "physical therapy if paralysis occurs"],
    specialties: ["Infectious Disease", "Neurology", "Physical Medicine"]
  },
  "polycystic ovary syndrome": {
    name: "Polycystic Ovary Syndrome (PCOS)",
    description: "PCOS is a hormonal disorder common among women of reproductive age. It's characterized by irregular periods, excess androgen levels, and polycystic ovaries.",
    symptoms: ["irregular periods", "excess hair growth", "acne", "weight gain", "difficulty getting pregnant", "thinning hair"],
    treatments: ["lifestyle changes (diet, exercise)", "hormonal contraceptives", "metformin", "fertility treatments", "treating specific symptoms"],
    specialties: ["Obstetrics & Gynecology", "Endocrinology"]
  },
  "pcos": {
    name: "Polycystic Ovary Syndrome",
    description: "PCOS is a hormonal disorder affecting women.",
    symptoms: ["irregular periods", "excess hair", "weight gain"],
    treatments: ["lifestyle changes", "hormonal treatments"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "polymyalgia rheumatica": {
    name: "Polymyalgia Rheumatica",
    description: "Polymyalgia rheumatica is an inflammatory disorder that causes muscle pain and stiffness, especially in the shoulders, neck, and hips. It's common in older adults.",
    symptoms: ["muscle pain and stiffness", "stiffness in morning", "fatigue", "fever", "weight loss", "depression"],
    treatments: ["corticosteroids", "gradual tapering of medications", "monitoring for complications"],
    specialties: ["Rheumatology"]
  },
  "post-concussion syndrome": {
    name: "Post-Concussion Syndrome",
    description: "Post-concussion syndrome is a complex disorder in which concussion symptoms last for weeks or months after the injury that caused the concussion.",
    symptoms: ["headaches", "dizziness", "fatigue", "irritability", "anxiety", "insomnia", "memory problems", "sensitivity to light and noise"],
    treatments: ["rest", "gradual return to activities", "cognitive therapy", "physical therapy", "medications for symptoms"],
    specialties: ["Neurology", "Physical Medicine"]
  },
  "post-polio syndrome": {
    name: "Post-Polio Syndrome",
    description: "Post-polio syndrome is a condition that affects polio survivors years after recovery from the initial polio infection. It causes new muscle weakness and fatigue.",
    symptoms: ["progressive muscle weakness", "fatigue", "muscle and joint pain", "breathing problems", "sleep problems"],
    treatments: ["energy conservation", "physical therapy", "pain management", "respiratory support", "lifestyle modifications"],
    specialties: ["Neurology", "Physical Medicine"]
  },
  "popliteal cysts in children": {
    name: "Popliteal Cysts in Children and Young People",
    description: "A popliteal cyst, or Baker's cyst, is a fluid-filled swelling that develops behind the knee. In children, they're usually harmless and often resolve on their own.",
    symptoms: ["swelling behind knee", "usually painless", "may cause stiffness", "may limit knee movement"],
    treatments: ["usually no treatment needed", "observation", "rest", "ice if painful", "surgery rarely needed"],
    specialties: ["Pediatrics", "Pediatric Orthopedics"]
  },
  "bakers cyst": {
    name: "Popliteal Cyst",
    description: "Baker's cyst is a fluid-filled swelling behind the knee.",
    symptoms: ["swelling behind knee"],
    treatments: ["usually no treatment", "observation"],
    specialties: ["Orthopedics"]
  },
  "positional talipes in children": {
    name: "Positional Talipes in Children and Young People",
    description: "Positional talipes, or clubfoot, is a foot deformity where the foot is turned inward. In positional talipes, it's usually mild and can be corrected with stretching.",
    symptoms: ["foot turned inward", "may affect one or both feet", "usually flexible"],
    treatments: ["stretching exercises", "casting", "splinting", "physical therapy", "surgery rarely needed"],
    specialties: ["Pediatrics", "Pediatric Orthopedics"]
  },
  "clubfoot": {
    name: "Positional Talipes",
    description: "Clubfoot is a foot deformity where the foot is turned inward.",
    symptoms: ["foot turned inward"],
    treatments: ["stretching", "casting"],
    specialties: ["Pediatrics", "Orthopedics"]
  },
  "post-traumatic stress disorder": {
    name: "Post-Traumatic Stress Disorder (PTSD)",
    description: "PTSD is a mental health condition triggered by experiencing or witnessing a terrifying event. Symptoms may include flashbacks, nightmares, and severe anxiety.",
    symptoms: ["flashbacks", "nightmares", "severe anxiety", "uncontrollable thoughts", "avoidance", "negative changes in mood", "hypervigilance"],
    treatments: ["psychotherapy (CBT, EMDR)", "medications (antidepressants)", "exposure therapy", "support groups"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "ptsd": {
    name: "Post-Traumatic Stress Disorder",
    description: "PTSD is a condition triggered by traumatic events.",
    symptoms: ["flashbacks", "anxiety", "avoidance"],
    treatments: ["therapy", "medications"],
    specialties: ["Psychiatry"]
  },
  "postural orthostatic tachycardia syndrome": {
    name: "Postural Orthostatic Tachycardia Syndrome (PoTS)",
    description: "PoTS is a condition that affects circulation. It causes an abnormal increase in heart rate when standing up, leading to dizziness, fainting, and other symptoms.",
    symptoms: ["rapid increase in heart rate when standing", "dizziness", "fainting", "fatigue", "brain fog", "nausea"],
    treatments: ["increasing fluid and salt intake", "compression stockings", "medications", "exercise", "lifestyle modifications"],
    specialties: ["Cardiology", "Neurology", "Autonomic Disorders"]
  },
  "pots": {
    name: "Postural Orthostatic Tachycardia Syndrome",
    description: "PoTS causes rapid heart rate when standing.",
    symptoms: ["rapid heartbeat", "dizziness", "fainting"],
    treatments: ["increased fluids", "medications"],
    specialties: ["Cardiology"]
  },
  "postnatal depression": {
    name: "Postnatal Depression",
    description: "Postnatal depression, also called postpartum depression, is a type of depression that affects some women after giving birth. It's more severe than the 'baby blues' and requires treatment.",
    symptoms: ["persistent sadness", "loss of interest", "fatigue", "anxiety", "difficulty bonding with baby", "feelings of worthlessness", "thoughts of harming self or baby"],
    treatments: ["psychotherapy", "antidepressants", "support groups", "family support", "self-care"],
    specialties: ["Psychiatry", "Obstetrics & Gynecology"]
  },
  "postpartum depression": {
    name: "Postnatal Depression",
    description: "Postpartum depression is depression after childbirth.",
    symptoms: ["sadness", "anxiety", "fatigue"],
    treatments: ["therapy", "medications"],
    specialties: ["Psychiatry"]
  },
  "pregnancy and baby": {
    name: "Pregnancy and Baby Health",
    description: "Pregnancy and baby health encompasses a wide range of topics related to pregnancy, childbirth, and infant care. Regular prenatal care is essential for a healthy pregnancy.",
    symptoms: ["varies by stage and condition"],
    treatments: ["prenatal care", "healthy lifestyle", "monitoring", "delivery planning", "postnatal care"],
    specialties: ["Obstetrics & Gynecology", "Pediatrics", "Maternal-Fetal Medicine"]
  },
  "pressure ulcers": {
    name: "Pressure Ulcers (Bedsores)",
    description: "Pressure ulcers, also called bedsores or pressure sores, are injuries to skin and underlying tissue resulting from prolonged pressure on the skin. They're common in people who are bedridden or use wheelchairs.",
    symptoms: ["redness", "swelling", "open wounds", "skin breakdown", "infection"],
    treatments: ["relieving pressure", "wound care", "dressings", "antibiotics if infected", "surgery in severe cases", "prevention"],
    specialties: ["Wound Care", "Dermatology", "Physical Medicine"]
  },
  "bedsores": {
    name: "Pressure Ulcers",
    description: "Bedsores are pressure injuries to the skin.",
    symptoms: ["skin breakdown", "open wounds"],
    treatments: ["pressure relief", "wound care"],
    specialties: ["Wound Care"]
  },
  "progressive supranuclear palsy": {
    name: "Progressive Supranuclear Palsy (PSP)",
    description: "PSP is a rare brain disorder that causes serious problems with walking, balance, and eye movements. It's often misdiagnosed as Parkinson's disease.",
    symptoms: ["loss of balance", "frequent falls", "stiffness", "difficulty moving eyes", "slurred speech", "swallowing problems", "cognitive changes"],
    treatments: ["symptom management", "medications", "physical therapy", "speech therapy", "supportive care"],
    specialties: ["Neurology", "Movement Disorders"]
  },
  "psp": {
    name: "Progressive Supranuclear Palsy",
    description: "PSP is a rare brain disorder affecting movement and balance.",
    symptoms: ["balance problems", "eye movement problems", "stiffness"],
    treatments: ["symptom management"],
    specialties: ["Neurology"]
  },
  "prostate cancer": {
    name: "Prostate Cancer",
    description: "Prostate cancer is cancer that occurs in the prostate, a small walnut-shaped gland in men that produces seminal fluid. It's one of the most common types of cancer in men.",
    symptoms: ["often no early symptoms", "difficulty urinating", "blood in urine or semen", "erectile dysfunction", "bone pain if advanced"],
    treatments: ["active surveillance", "surgery (prostatectomy)", "radiation therapy", "hormone therapy", "chemotherapy"],
    specialties: ["Urology", "Oncology", "Radiation Oncology"]
  },
  "psoriasis": {
    name: "Psoriasis",
    description: "Psoriasis is a chronic skin condition that causes cells to build up rapidly on the skin's surface, forming scales and red patches that are itchy and sometimes painful.",
    symptoms: ["red patches covered with silvery scales", "dry, cracked skin", "itching", "burning", "thickened nails", "swollen joints"],
    treatments: ["topical treatments", "light therapy", "oral medications", "biologics", "lifestyle modifications"],
    specialties: ["Dermatology", "Rheumatology"]
  },
  "psoriatic arthritis": {
    name: "Psoriatic Arthritis",
    description: "Psoriatic arthritis is a form of arthritis that affects some people with psoriasis. It causes joint pain, stiffness, and swelling and can affect any joint.",
    symptoms: ["joint pain and stiffness", "swollen fingers and toes", "foot pain", "lower back pain", "nail changes", "eye inflammation"],
    treatments: ["nonsteroidal anti-inflammatory drugs", "disease-modifying antirheumatic drugs", "biologics", "physical therapy"],
    specialties: ["Rheumatology", "Dermatology"]
  },
  "psychosis": {
    name: "Psychosis",
    description: "Psychosis is a mental health condition where people lose contact with reality. It can involve hallucinations, delusions, and disorganized thinking.",
    symptoms: ["hallucinations", "delusions", "disorganized thinking", "lack of insight", "social withdrawal"],
    treatments: ["antipsychotic medications", "psychotherapy", "supportive care", "hospitalization if needed"],
    specialties: ["Psychiatry"]
  },
  "psychotic depression": {
    name: "Psychotic Depression",
    description: "Psychotic depression is a subtype of major depression that includes psychotic features such as hallucinations or delusions. It's a serious condition requiring immediate treatment.",
    symptoms: ["symptoms of depression", "hallucinations", "delusions", "paranoia", "severe anxiety"],
    treatments: ["antidepressants combined with antipsychotics", "electroconvulsive therapy", "hospitalization", "psychotherapy"],
    specialties: ["Psychiatry"]
  },
  "pubic lice": {
    name: "Pubic Lice (Crabs)",
    description: "Pubic lice, also called crabs, are tiny insects that infest the pubic hair area. They're spread through close physical contact, usually sexual contact.",
    symptoms: ["itching in pubic area", "visible lice or nits", "sores from scratching", "blue spots on skin"],
    treatments: ["medicated shampoos or lotions", "washing bedding and clothing", "treating sexual partners", "avoiding sexual contact until treated"],
    specialties: ["Dermatology", "Infectious Disease"]
  },
  "crabs": {
    name: "Pubic Lice",
    description: "Crabs are pubic lice infesting the pubic area.",
    symptoms: ["itching", "visible lice"],
    treatments: ["medicated treatments"],
    specialties: ["Dermatology"]
  },
  "pulmonary hypertension": {
    name: "Pulmonary Hypertension",
    description: "Pulmonary hypertension is high blood pressure in the arteries of the lungs. It makes the right side of the heart work harder and can lead to heart failure.",
    symptoms: ["shortness of breath", "fatigue", "chest pain", "racing heartbeat", "dizziness", "fainting", "swelling in legs"],
    treatments: ["medications to dilate blood vessels", "oxygen therapy", "anticoagulants", "diuretics", "lung transplant in severe cases"],
    specialties: ["Pulmonology", "Cardiology"]
  },
  "phobias": {
    name: "Phobias",
    description: "A phobia is an intense, irrational fear of a specific object, situation, or activity. The fear is out of proportion to the actual danger posed.",
    symptoms: ["intense fear", "anxiety", "avoidance", "physical symptoms (sweating, rapid heartbeat)", "panic attacks"],
    treatments: ["exposure therapy", "cognitive behavioral therapy", "medications", "relaxation techniques"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "pelvic girdle pain": {
    name: "Pelvic Girdle Pain",
    description: "Pelvic girdle pain is pain in the pelvic area, often occurring during or after pregnancy. It can affect the front or back of the pelvis and can be very debilitating.",
    symptoms: ["pain in pelvic area", "pain in lower back", "pain in hips", "difficulty walking", "pain that worsens with activity"],
    treatments: ["physical therapy", "pelvic support belts", "pain medications", "exercise", "avoiding activities that worsen pain"],
    specialties: ["Obstetrics & Gynecology", "Physical Medicine", "Orthopedics"]
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

