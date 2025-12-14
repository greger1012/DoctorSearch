/**
 * Script to add diseases starting with R, S, T from NHS Inform with detailed descriptions
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
  "rare conditions": {
    name: "Rare Conditions",
    description: "Rare conditions are diseases that affect a small number of people. Many are genetic, and they often require specialized care and treatment. Support groups and research organizations can provide valuable resources.",
    symptoms: ["varies widely by condition"],
    treatments: ["specialized care", "treating symptoms", "supportive care", "research participation"],
    specialties: ["Various specialties depending on condition", "Genetics", "Rare Disease Centers"]
  },
  "rare tumours": {
    name: "Rare Tumours",
    description: "Rare tumours are uncommon types of cancer that require specialized diagnosis and treatment. They may need referral to specialized cancer centers with expertise in these specific tumour types.",
    symptoms: ["varies by tumour type and location"],
    treatments: ["specialized protocols", "surgery", "chemotherapy", "radiation therapy", "targeted therapy"],
    specialties: ["Oncology", "Surgical Oncology", "Specialized Cancer Centers"]
  },
  "rare tumors": {
    name: "Rare Tumours",
    description: "Rare tumors are uncommon cancers requiring specialized care.",
    symptoms: ["varies by type"],
    treatments: ["specialized treatment"],
    specialties: ["Oncology"]
  },
  "raynaud's phenomenon": {
    name: "Raynaud's Phenomenon",
    description: "Raynaud's phenomenon is a condition that causes some areas of the body (fingers, toes, nose, ears) to feel numb and cold in response to cold temperatures or stress. It's caused by narrowing of blood vessels.",
    symptoms: ["cold fingers and toes", "color changes in skin (white, blue, red)", "numbness", "tingling", "pain"],
    treatments: ["avoiding cold", "keeping warm", "stress management", "medications to improve circulation", "avoiding smoking"],
    specialties: ["Rheumatology", "Vascular Medicine"]
  },
  "raynauds phenomenon": {
    name: "Raynaud's Phenomenon",
    description: "Raynaud's phenomenon causes cold, numb fingers and toes.",
    symptoms: ["cold extremities", "color changes"],
    treatments: ["keeping warm", "medications"],
    specialties: ["Rheumatology"]
  },
  "reactive arthritis": {
    name: "Reactive Arthritis",
    description: "Reactive arthritis is joint pain and swelling triggered by an infection in another part of the body, most often the intestines, genitals, or urinary tract. It typically affects the knees, ankles, and feet.",
    symptoms: ["joint pain and swelling", "eye inflammation", "urinary problems", "skin rashes", "mouth sores"],
    treatments: ["treating underlying infection", "nonsteroidal anti-inflammatory drugs", "corticosteroids", "physical therapy"],
    specialties: ["Rheumatology", "Infectious Disease"]
  },
  "recovering from a cardiac arrest": {
    name: "Recovering from Cardiac Arrest",
    description: "Recovery from cardiac arrest involves intensive medical care and rehabilitation. The extent of recovery depends on how quickly treatment was received and any brain damage that occurred.",
    symptoms: ["varies by individual", "cognitive problems", "physical weakness", "emotional difficulties"],
    treatments: ["intensive care", "cardiac rehabilitation", "physical therapy", "cognitive therapy", "psychological support"],
    specialties: ["Cardiology", "Critical Care", "Physical Medicine", "Neurology"]
  },
  "recurrent miscarriage": {
    name: "Recurrent Miscarriage",
    description: "Recurrent miscarriage is defined as having three or more consecutive pregnancy losses. It can be caused by various factors including genetic, hormonal, or structural problems.",
    symptoms: ["repeated pregnancy losses", "may have no other symptoms"],
    treatments: ["identifying and treating underlying cause", "genetic counseling", "hormonal treatments", "surgery if structural problems", "supportive care"],
    specialties: ["Obstetrics & Gynecology", "Reproductive Endocrinology & Infertility"]
  },
  "restless legs syndrome": {
    name: "Restless Legs Syndrome (RLS)",
    description: "Restless legs syndrome is a condition that causes an uncontrollable urge to move the legs, usually because of an uncomfortable sensation. It typically occurs in the evening or nighttime hours.",
    symptoms: ["urge to move legs", "uncomfortable sensations in legs", "symptoms worsen at rest", "symptoms improve with movement", "sleep problems"],
    treatments: ["lifestyle changes", "medications", "treating underlying conditions", "iron supplements if deficient"],
    specialties: ["Neurology", "Sleep Medicine"]
  },
  "rls": {
    name: "Restless Legs Syndrome",
    description: "RLS causes an uncontrollable urge to move the legs.",
    symptoms: ["urge to move legs", "uncomfortable sensations"],
    treatments: ["medications", "lifestyle changes"],
    specialties: ["Neurology"]
  },
  "respiratory syncytial virus": {
    name: "Respiratory Syncytial Virus (RSV)",
    description: "RSV is a common respiratory virus that usually causes mild, cold-like symptoms. However, it can be serious in infants, older adults, and people with weakened immune systems.",
    symptoms: ["runny nose", "cough", "sneezing", "fever", "wheezing", "difficulty breathing in severe cases"],
    treatments: ["supportive care", "rest and fluids", "oxygen therapy if needed", "hospitalization for severe cases"],
    specialties: ["Infectious Disease", "Pediatrics", "Pulmonology"]
  },
  "rsv": {
    name: "Respiratory Syncytial Virus",
    description: "RSV is a common respiratory virus, especially serious in infants.",
    symptoms: ["cold-like symptoms", "cough", "fever"],
    treatments: ["supportive care"],
    specialties: ["Pediatrics", "Infectious Disease"]
  },
  "rhabdomyosarcoma": {
    name: "Rhabdomyosarcoma",
    description: "Rhabdomyosarcoma is a rare type of cancer that forms in soft tissue, usually in muscles. It's most common in children and can occur anywhere in the body.",
    symptoms: ["lump or swelling", "pain", "bleeding from affected area", "difficulty with bodily functions depending on location"],
    treatments: ["chemotherapy", "surgery", "radiation therapy", "specialized pediatric protocols"],
    specialties: ["Pediatric Oncology", "Oncology", "Surgical Oncology"]
  },
  "rheumatoid arthritis": {
    name: "Rheumatoid Arthritis (RA)",
    description: "Rheumatoid arthritis is an autoimmune disorder that causes chronic inflammation of the joints and other areas of the body. It can cause joint deformity and disability if not treated.",
    symptoms: ["joint pain and swelling", "morning stiffness", "fatigue", "fever", "weight loss", "rheumatoid nodules"],
    treatments: ["disease-modifying antirheumatic drugs", "biologics", "nonsteroidal anti-inflammatory drugs", "corticosteroids", "physical therapy"],
    specialties: ["Rheumatology"]
  },
  "ra": {
    name: "Rheumatoid Arthritis",
    description: "RA is an autoimmune disorder causing joint inflammation.",
    symptoms: ["joint pain", "swelling", "morning stiffness"],
    treatments: ["disease-modifying medications", "biologics"],
    specialties: ["Rheumatology"]
  },
  "ringworm and other fungal infections": {
    name: "Ringworm and Other Fungal Infections",
    description: "Ringworm is a common fungal infection of the skin that causes a ring-shaped rash. Other fungal infections can affect the skin, nails, and other areas of the body.",
    symptoms: ["ring-shaped rash", "itching", "redness", "scaling", "hair loss if on scalp"],
    treatments: ["antifungal creams or ointments", "oral antifungal medications for severe cases", "keeping area clean and dry"],
    specialties: ["Dermatology", "Infectious Disease"]
  },
  "ringworm": {
    name: "Ringworm",
    description: "Ringworm is a fungal skin infection causing a ring-shaped rash.",
    symptoms: ["ring-shaped rash", "itching"],
    treatments: ["antifungal medications"],
    specialties: ["Dermatology"]
  },
  "rosacea": {
    name: "Rosacea",
    description: "Rosacea is a common skin condition that causes redness and visible blood vessels in the face. It may also produce small, red, pus-filled bumps and can affect the eyes.",
    symptoms: ["facial redness", "visible blood vessels", "bumps and pimples", "burning or stinging", "eye problems"],
    treatments: ["topical medications", "oral antibiotics", "laser therapy", "avoiding triggers", "good skin care"],
    specialties: ["Dermatology"]
  },
  "scabies": {
    name: "Scabies",
    description: "Scabies is an infestation of the skin by the human itch mite. It causes intense itching and a pimple-like skin rash. It spreads through close physical contact.",
    symptoms: ["intense itching", "pimple-like rash", "burrows in skin", "worse at night"],
    treatments: ["prescription creams or lotions", "oral medications", "treating all household members", "washing bedding and clothing"],
    specialties: ["Dermatology", "Infectious Disease"]
  },
  "scarlet fever": {
    name: "Scarlet Fever",
    description: "Scarlet fever is a bacterial illness that develops in some people who have strep throat. It's characterized by a bright red rash that feels like sandpaper.",
    symptoms: ["red rash", "high fever", "sore throat", "red, swollen tongue", "flushed face", "headache"],
    treatments: ["antibiotics", "rest and fluids", "fever reducers", "treating strep throat"],
    specialties: ["Infectious Disease", "Pediatrics"]
  },
  "schizophrenia": {
    name: "Schizophrenia",
    description: "Schizophrenia is a serious mental health disorder that affects how a person thinks, feels, and behaves. People with schizophrenia may seem like they have lost touch with reality.",
    symptoms: ["hallucinations", "delusions", "disorganized thinking", "negative symptoms (lack of motivation)", "cognitive problems"],
    treatments: ["antipsychotic medications", "psychotherapy", "social skills training", "family therapy", "supported employment"],
    specialties: ["Psychiatry"]
  },
  "sciatica": {
    name: "Sciatica",
    description: "Sciatica is pain that radiates along the path of the sciatic nerve, which branches from the lower back through the hips and buttocks and down each leg. It's usually caused by a herniated disc.",
    symptoms: ["pain radiating from lower back down leg", "numbness or weakness in leg", "tingling", "pain that worsens with movement"],
    treatments: ["pain medications", "physical therapy", "hot or cold packs", "injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Neurology", "Physical Medicine"]
  },
  "about scoliosis": {
    name: "Scoliosis",
    description: "Scoliosis is a sideways curvature of the spine that occurs most often during the growth spurt just before puberty. Most cases are mild, but some can be severe.",
    symptoms: ["uneven shoulders", "uneven waist", "one hip higher than the other", "rib prominence", "back pain in some cases"],
    treatments: ["observation for mild cases", "bracing for moderate cases", "surgery for severe cases", "physical therapy"],
    specialties: ["Orthopedics", "Pediatric Orthopedics"]
  },
  "scoliosis": {
    name: "Scoliosis",
    description: "Scoliosis is a sideways curvature of the spine.",
    symptoms: ["uneven shoulders", "curved spine"],
    treatments: ["bracing", "surgery if severe"],
    specialties: ["Orthopedics"]
  },
  "seasonal affective disorder": {
    name: "Seasonal Affective Disorder (SAD)",
    description: "SAD is a type of depression that's related to changes in seasons. It typically begins and ends at about the same times every year, most commonly in fall and winter.",
    symptoms: ["depression", "loss of interest", "low energy", "sleep problems", "changes in appetite", "difficulty concentrating"],
    treatments: ["light therapy", "psychotherapy", "antidepressants", "vitamin D", "lifestyle changes"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "sad": {
    name: "Seasonal Affective Disorder",
    description: "SAD is depression related to seasonal changes.",
    symptoms: ["depression", "low energy", "sleep problems"],
    treatments: ["light therapy", "antidepressants"],
    specialties: ["Psychiatry"]
  },
  "sepsis": {
    name: "Sepsis",
    description: "Sepsis is a life-threatening condition that occurs when the body's response to an infection causes injury to its own tissues and organs. It requires immediate medical attention.",
    symptoms: ["fever or low body temperature", "rapid heart rate", "rapid breathing", "confusion", "extreme pain", "clammy skin"],
    treatments: ["immediate antibiotics", "IV fluids", "oxygen therapy", "vasopressors", "treating underlying infection", "intensive care"],
    specialties: ["Emergency Medicine", "Critical Care", "Infectious Disease"]
  },
  "septic shock": {
    name: "Septic Shock",
    description: "Septic shock is a severe complication of sepsis that causes extremely low blood pressure and organ failure. It's a medical emergency with a high mortality rate.",
    symptoms: ["very low blood pressure", "rapid heart rate", "rapid breathing", "confusion", "organ failure", "decreased urine output"],
    treatments: ["immediate intensive care", "vasopressors", "antibiotics", "IV fluids", "mechanical ventilation", "dialysis if needed"],
    specialties: ["Critical Care", "Emergency Medicine", "Infectious Disease"]
  },
  "severe head injury": {
    name: "Severe Head Injury",
    description: "A severe head injury is a traumatic brain injury that can cause serious complications including brain damage, bleeding, and long-term disability. It requires immediate medical attention.",
    symptoms: ["loss of consciousness", "severe headache", "vomiting", "seizures", "confusion", "weakness", "vision problems"],
    treatments: ["emergency medical treatment", "surgery if needed", "intensive care", "rehabilitation", "long-term support"],
    specialties: ["Neurosurgery", "Neurology", "Emergency Medicine", "Critical Care"]
  },
  "shigella": {
    name: "Shigella",
    description: "Shigella is a bacterial infection that affects the digestive system. It causes diarrhea, which is often bloody, and spreads through contaminated food or water or close contact.",
    symptoms: ["diarrhea (often bloody)", "abdominal cramps", "fever", "nausea", "vomiting"],
    treatments: ["antibiotics", "rest and fluids", "oral rehydration solutions", "preventing dehydration"],
    specialties: ["Infectious Disease", "Gastroenterology"]
  },
  "shingles": {
    name: "Shingles (Herpes Zoster)",
    description: "Shingles is a viral infection that causes a painful rash. It's caused by the varicella-zoster virus, the same virus that causes chickenpox. It typically appears as a stripe of blisters on one side of the body.",
    symptoms: ["painful rash", "blisters", "burning sensation", "itching", "fever", "headache", "fatigue"],
    treatments: ["antiviral medications", "pain medications", "calamine lotion", "cool compresses", "vaccination for prevention"],
    specialties: ["Dermatology", "Infectious Disease", "Neurology"]
  },
  "herpes zoster": {
    name: "Shingles",
    description: "Herpes zoster is the medical term for shingles.",
    symptoms: ["painful rash", "blisters"],
    treatments: ["antiviral medications"],
    specialties: ["Dermatology"]
  },
  "shortness of breath": {
    name: "Shortness of Breath (Dyspnea)",
    description: "Shortness of breath, or dyspnea, is an uncomfortable sensation of not being able to breathe well enough. It can be caused by various conditions affecting the heart, lungs, or other systems.",
    symptoms: ["difficulty breathing", "feeling of suffocation", "rapid breathing", "chest tightness"],
    treatments: ["treating underlying cause", "oxygen therapy", "bronchodilators", "medications for heart conditions", "pulmonary rehabilitation"],
    specialties: ["Pulmonology", "Cardiology", "Emergency Medicine"]
  },
  "dyspnea": {
    name: "Shortness of Breath",
    description: "Dyspnea is difficulty breathing.",
    symptoms: ["difficulty breathing", "rapid breathing"],
    treatments: ["treating cause", "oxygen if needed"],
    specialties: ["Pulmonology", "Cardiology"]
  },
  "sickle cell disease": {
    name: "Sickle Cell Disease",
    description: "Sickle cell disease is a group of inherited red blood cell disorders. It causes red blood cells to become misshapen and break down, leading to anemia, pain crises, and organ damage.",
    symptoms: ["anemia", "episodes of pain (crises)", "swelling of hands and feet", "frequent infections", "delayed growth", "vision problems"],
    treatments: ["pain management", "blood transfusions", "hydroxyurea", "bone marrow transplant", "treating complications"],
    specialties: ["Hematology", "Pediatric Hematology"]
  },
  "sinusitis": {
    name: "Sinusitis",
    description: "Sinusitis is inflammation of the sinuses, the air-filled spaces in the skull. It can be acute (short-term) or chronic (long-term) and is often caused by infections or allergies.",
    symptoms: ["facial pain or pressure", "nasal congestion", "thick nasal discharge", "loss of smell", "headache", "cough"],
    treatments: ["nasal irrigation", "decongestants", "antibiotics if bacterial", "corticosteroids", "surgery in chronic cases"],
    specialties: ["Otolaryngology", "Allergy & Immunology"]
  },
  "sjogren's syndrome": {
    name: "Sjogren's Syndrome",
    description: "Sjogren's syndrome is an autoimmune disorder that causes dry eyes and dry mouth. It can also affect other parts of the body including joints, skin, and internal organs.",
    symptoms: ["dry eyes", "dry mouth", "joint pain", "fatigue", "dry skin", "vaginal dryness"],
    treatments: ["artificial tears", "saliva substitutes", "medications to increase moisture", "treating underlying inflammation", "lifestyle modifications"],
    specialties: ["Rheumatology", "Ophthalmology", "Dentistry"]
  },
  "sjogrens syndrome": {
    name: "Sjogren's Syndrome",
    description: "Sjogren's syndrome is an autoimmune disorder causing dryness.",
    symptoms: ["dry eyes", "dry mouth", "joint pain"],
    treatments: ["artificial tears", "medications"],
    specialties: ["Rheumatology"]
  },
  "skin cancer (melanoma)": {
    name: "Skin Cancer (Melanoma)",
    description: "Melanoma is the most serious type of skin cancer. It develops in the cells that produce melanin, the pigment that gives skin its color. Early detection is crucial for successful treatment.",
    symptoms: ["new or changing mole", "asymmetrical shape", "irregular borders", "varied colors", "large size", "evolving appearance"],
    treatments: ["surgery to remove melanoma", "lymph node biopsy", "immunotherapy", "targeted therapy", "chemotherapy", "radiation therapy"],
    specialties: ["Dermatology", "Oncology", "Surgical Oncology"]
  },
  "melanoma": {
    name: "Melanoma",
    description: "Melanoma is the most serious type of skin cancer.",
    symptoms: ["changing mole", "irregular borders"],
    treatments: ["surgery", "immunotherapy"],
    specialties: ["Dermatology", "Oncology"]
  },
  "skin cancer": {
    name: "Skin Cancer",
    description: "Skin cancer is the abnormal growth of skin cells, most often developing on skin exposed to the sun. The main types are basal cell carcinoma, squamous cell carcinoma, and melanoma.",
    symptoms: ["new growth on skin", "sore that doesn't heal", "changing mole", "irregular borders", "varied colors"],
    treatments: ["surgery", "Mohs surgery", "radiation therapy", "topical medications", "cryotherapy", "prevention through sun protection"],
    specialties: ["Dermatology", "Oncology"]
  },
  "skin light sensitivity": {
    name: "Skin Light Sensitivity (Photosensitivity)",
    description: "Photosensitivity is an extreme sensitivity to ultraviolet (UV) rays from the sun and other light sources. It can be caused by medications, medical conditions, or genetic factors.",
    symptoms: ["rash after sun exposure", "redness", "blistering", "itching", "burning sensation"],
    treatments: ["avoiding sun exposure", "sunscreen", "protective clothing", "treating underlying cause", "medications if needed"],
    specialties: ["Dermatology", "Allergy & Immunology"]
  },
  "photosensitivity": {
    name: "Skin Light Sensitivity",
    description: "Photosensitivity is extreme sensitivity to sunlight.",
    symptoms: ["rash after sun", "redness", "blistering"],
    treatments: ["sun protection", "avoiding sun"],
    specialties: ["Dermatology"]
  },
  "skin rashes in children": {
    name: "Skin Rashes in Children",
    description: "Skin rashes in children are common and can have many causes including infections, allergies, and skin conditions. Most are harmless, but some require medical attention.",
    symptoms: ["redness", "itching", "bumps", "blisters", "scaling", "varies by cause"],
    treatments: ["treating underlying cause", "moisturizers", "topical treatments", "avoiding irritants", "medical evaluation"],
    specialties: ["Pediatrics", "Dermatology"]
  },
  "slapped cheek syndrome": {
    name: "Slapped Cheek Syndrome (Fifth Disease)",
    description: "Slapped cheek syndrome, also called fifth disease, is a viral infection that causes a distinctive red rash on the cheeks. It's common in children and usually mild.",
    symptoms: ["red rash on cheeks", "lacy rash on body", "fever", "headache", "runny nose"],
    treatments: ["supportive care", "rest and fluids", "fever reducers", "usually resolves on its own"],
    specialties: ["Pediatrics", "Infectious Disease"]
  },
  "fifth disease": {
    name: "Slapped Cheek Syndrome",
    description: "Fifth disease is a viral infection causing a red cheek rash.",
    symptoms: ["red cheek rash", "lacy body rash"],
    treatments: ["supportive care"],
    specialties: ["Pediatrics"]
  },
  "social anxiety disorder": {
    name: "Social Anxiety Disorder",
    description: "Social anxiety disorder, also called social phobia, is an intense, persistent fear of being watched and judged by others. It can interfere with daily activities and relationships.",
    symptoms: ["intense fear of social situations", "avoidance of social situations", "physical symptoms (sweating, trembling)", "fear of embarrassment", "difficulty speaking"],
    treatments: ["cognitive behavioral therapy", "medications (antidepressants, anti-anxiety drugs)", "exposure therapy", "support groups"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "soft tissue sarcomas": {
    name: "Soft Tissue Sarcomas",
    description: "Soft tissue sarcomas are rare cancers that develop in soft tissues such as muscles, fat, nerves, blood vessels, and fibrous tissues. They can occur anywhere in the body.",
    symptoms: ["lump or swelling", "pain", "difficulty with bodily functions depending on location"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy"],
    specialties: ["Oncology", "Surgical Oncology"]
  },
  "soft tissue sarcomas: teenagers and young adults": {
    name: "Soft Tissue Sarcomas in Teenagers and Young Adults",
    description: "Soft tissue sarcomas in teenagers and young adults require specialized care that considers both treatment effectiveness and long-term side effects, including fertility preservation.",
    symptoms: ["lump or swelling", "pain"],
    treatments: ["specialized protocols", "surgery", "chemotherapy", "fertility preservation"],
    specialties: ["Oncology", "Adolescent Medicine"]
  },
  "sore throat": {
    name: "Sore Throat",
    description: "A sore throat is pain, scratchiness, or irritation of the throat that often worsens when swallowing. Most sore throats are caused by viral infections and resolve on their own.",
    symptoms: ["throat pain", "scratchiness", "difficulty swallowing", "swollen glands", "hoarseness"],
    treatments: ["rest and fluids", "gargling with salt water", "lozenges", "pain relievers", "antibiotics if bacterial"],
    specialties: ["Otolaryngology", "Internal Medicine", "Pediatrics"]
  },
  "spina bifida": {
    name: "Spina Bifida",
    description: "Spina bifida is a birth defect that occurs when the spine and spinal cord don't form properly. It's a type of neural tube defect that can cause physical and intellectual disabilities.",
    symptoms: ["varies by severity", "weakness or paralysis of legs", "bladder and bowel problems", "hydrocephalus", "learning disabilities"],
    treatments: ["surgery", "physical therapy", "occupational therapy", "managing complications", "supportive care"],
    specialties: ["Pediatrics", "Neurosurgery", "Physical Medicine"]
  },
  "spinal stenosis": {
    name: "Spinal Stenosis",
    description: "Spinal stenosis is a narrowing of the spaces within the spine, which can put pressure on the spinal cord and nerves. It's most common in the lower back and neck.",
    symptoms: ["back pain", "numbness or weakness in legs", "pain that worsens with standing", "pain that improves with bending forward", "difficulty walking"],
    treatments: ["pain medications", "physical therapy", "injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Neurosurgery", "Physical Medicine"]
  },
  "spleen problems and spleen removal": {
    name: "Spleen Problems and Spleen Removal",
    description: "The spleen can be affected by various conditions including infections, trauma, and diseases. Sometimes the spleen needs to be removed (splenectomy), which requires special precautions.",
    symptoms: ["varies by condition", "abdominal pain", "feeling full quickly", "frequent infections if spleen removed"],
    treatments: ["treating underlying condition", "splenectomy if needed", "vaccinations after splenectomy", "antibiotics for prevention"],
    specialties: ["Hematology", "General Surgery", "Infectious Disease"]
  },
  "splenectomy": {
    name: "Spleen Removal",
    description: "Splenectomy is surgical removal of the spleen.",
    symptoms: ["increased infection risk"],
    treatments: ["vaccinations", "antibiotics"],
    specialties: ["General Surgery", "Hematology"]
  },
  "stillbirth": {
    name: "Stillbirth",
    description: "Stillbirth is the loss of a baby after 20 weeks of pregnancy but before birth. It's a devastating experience that requires emotional support and medical care.",
    symptoms: ["loss of fetal movement", "no fetal heartbeat"],
    treatments: ["medical care", "delivery", "emotional support", "counseling", "investigating cause"],
    specialties: ["Obstetrics & Gynecology", "Maternal-Fetal Medicine"]
  },
  "stomach ache and abdominal pain": {
    name: "Stomach Ache and Abdominal Pain",
    description: "Stomach ache and abdominal pain are common symptoms that can have many causes, ranging from minor issues like indigestion to serious conditions requiring immediate medical attention.",
    symptoms: ["abdominal pain", "cramping", "bloating", "nausea", "varies by cause"],
    treatments: ["treating underlying cause", "pain medications", "dietary changes", "rest", "medical evaluation"],
    specialties: ["Gastroenterology", "Internal Medicine", "Emergency Medicine"]
  },
  "stomach cancer": {
    name: "Stomach Cancer (Gastric Cancer)",
    description: "Stomach cancer, also called gastric cancer, is cancer that begins in the stomach. It's often diagnosed at a late stage, which makes it more difficult to treat.",
    symptoms: ["indigestion", "stomach pain", "nausea", "loss of appetite", "unexplained weight loss", "vomiting blood"],
    treatments: ["surgery", "chemotherapy", "radiation therapy", "targeted therapy", "immunotherapy"],
    specialties: ["Oncology", "Surgical Oncology", "Gastroenterology"]
  },
  "gastric cancer": {
    name: "Stomach Cancer",
    description: "Gastric cancer is cancer of the stomach.",
    symptoms: ["stomach pain", "nausea", "weight loss"],
    treatments: ["surgery", "chemotherapy"],
    specialties: ["Oncology"]
  },
  "stomach ulcer": {
    name: "Stomach Ulcer (Peptic Ulcer)",
    description: "A stomach ulcer, or peptic ulcer, is a sore that develops on the lining of the stomach or the first part of the small intestine. It's often caused by H. pylori bacteria or NSAIDs.",
    symptoms: ["burning stomach pain", "bloating", "nausea", "vomiting", "loss of appetite", "weight loss"],
    treatments: ["antibiotics if H. pylori", "proton pump inhibitors", "avoiding NSAIDs", "lifestyle changes"],
    specialties: ["Gastroenterology"]
  },
  "peptic ulcer": {
    name: "Stomach Ulcer",
    description: "Peptic ulcers are sores in the stomach or small intestine.",
    symptoms: ["burning stomach pain", "nausea"],
    treatments: ["antibiotics", "acid-reducing medications"],
    specialties: ["Gastroenterology"]
  },
  "streptococcus a": {
    name: "Streptococcus A (Strep A)",
    description: "Strep A is a bacterial infection caused by group A streptococcus. It can cause various illnesses including strep throat, scarlet fever, and more serious invasive infections.",
    symptoms: ["varies by infection type", "sore throat", "fever", "rash", "swollen glands"],
    treatments: ["antibiotics", "supportive care", "treating complications"],
    specialties: ["Infectious Disease", "Pediatrics"]
  },
  "strep a": {
    name: "Streptococcus A",
    description: "Strep A is a bacterial infection causing various illnesses.",
    symptoms: ["varies by type"],
    treatments: ["antibiotics"],
    specialties: ["Infectious Disease"]
  },
  "stress, anxiety and low mood": {
    name: "Stress, Anxiety and Low Mood",
    description: "Stress, anxiety, and low mood are common mental health concerns that can significantly impact daily life. They can occur separately or together and may require treatment.",
    symptoms: ["worry", "feeling overwhelmed", "sadness", "irritability", "sleep problems", "difficulty concentrating"],
    treatments: ["psychotherapy", "medications", "lifestyle changes", "stress management", "support groups"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "stroke": {
    name: "Stroke",
    description: "A stroke occurs when blood supply to part of the brain is interrupted or reduced, depriving brain tissue of oxygen and nutrients. It's a medical emergency requiring immediate treatment.",
    symptoms: ["sudden numbness or weakness", "confusion", "trouble speaking", "vision problems", "severe headache", "difficulty walking"],
    treatments: ["immediate medical treatment", "thrombolytics if ischemic", "surgery", "rehabilitation", "preventing recurrence"],
    specialties: ["Neurology", "Emergency Medicine", "Physical Medicine"]
  },
  "subacromial pain syndrome": {
    name: "Subacromial Pain Syndrome",
    description: "Subacromial pain syndrome is a common cause of shoulder pain. It involves inflammation or irritation of structures in the subacromial space, including tendons and bursa.",
    symptoms: ["shoulder pain", "pain when raising arm", "night pain", "weakness", "limited range of motion"],
    treatments: ["rest", "physical therapy", "pain medications", "injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Sports Medicine", "Physical Medicine"]
  },
  "sudden infant death syndrome": {
    name: "Sudden Infant Death Syndrome (SIDS)",
    description: "SIDS is the unexplained death of a seemingly healthy baby less than a year old, usually during sleep. Following safe sleep practices can help reduce the risk.",
    symptoms: ["none - occurs during sleep"],
    treatments: ["prevention through safe sleep practices", "support for families"],
    specialties: ["Pediatrics", "Forensic Medicine"]
  },
  "sids": {
    name: "Sudden Infant Death Syndrome",
    description: "SIDS is the unexplained death of an infant during sleep.",
    symptoms: ["none"],
    treatments: ["prevention"],
    specialties: ["Pediatrics"]
  },
  "suicide": {
    name: "Suicide Prevention and Support",
    description: "Suicide is a serious public health problem. If you or someone you know is having thoughts of suicide, immediate help is available. Prevention and support are crucial.",
    symptoms: ["thoughts of suicide", "talking about suicide", "giving away possessions", "withdrawal", "mood changes"],
    treatments: ["immediate crisis intervention", "psychotherapy", "medications", "hospitalization if needed", "support groups"],
    specialties: ["Psychiatry", "Emergency Medicine", "Crisis Intervention"]
  },
  "sunbed and tanning safety": {
    name: "Sunbed and Tanning Safety",
    description: "Sunbeds and tanning devices emit UV radiation that can cause skin cancer and premature aging. Understanding the risks and practicing safe sun exposure is important.",
    symptoms: ["skin damage", "increased cancer risk", "premature aging"],
    treatments: ["avoiding sunbeds", "using sunscreen", "protective clothing", "regular skin checks"],
    specialties: ["Dermatology"]
  },
  "sunburn": {
    name: "Sunburn",
    description: "Sunburn is red, painful skin that feels hot to the touch. It's caused by overexposure to ultraviolet (UV) radiation from the sun or artificial sources like tanning beds.",
    symptoms: ["red, painful skin", "swelling", "blisters", "peeling", "fever", "headache"],
    treatments: ["cool compresses", "moisturizers", "pain relievers", "staying hydrated", "avoiding further sun exposure"],
    specialties: ["Dermatology", "Emergency Medicine"]
  },
  "supraventricular tachycardia": {
    name: "Supraventricular Tachycardia (SVT)",
    description: "SVT is a condition that causes the heart to beat very fast, usually more than 100 beats per minute. It originates above the ventricles and can cause palpitations and dizziness.",
    symptoms: ["rapid heartbeat", "palpitations", "dizziness", "shortness of breath", "chest pain", "fainting"],
    treatments: ["vagal maneuvers", "medications", "cardioversion", "catheter ablation", "pacemaker if needed"],
    specialties: ["Cardiology", "Electrophysiology"]
  },
  "svt": {
    name: "Supraventricular Tachycardia",
    description: "SVT causes rapid heart rate originating above the ventricles.",
    symptoms: ["rapid heartbeat", "palpitations", "dizziness"],
    treatments: ["vagal maneuvers", "medications", "ablation"],
    specialties: ["Cardiology"]
  },
  "swollen glands": {
    name: "Swollen Glands (Lymphadenopathy)",
    description: "Swollen glands, or lymph nodes, are common and usually indicate the body is fighting an infection. They can also be caused by other conditions including cancer.",
    symptoms: ["swollen, tender lymph nodes", "may be accompanied by infection symptoms"],
    treatments: ["treating underlying cause", "warm compresses", "pain medications", "medical evaluation if persistent"],
    specialties: ["Internal Medicine", "Infectious Disease", "Hematology"]
  },
  "lymphadenopathy": {
    name: "Swollen Glands",
    description: "Lymphadenopathy is swelling of the lymph nodes.",
    symptoms: ["swollen nodes"],
    treatments: ["treating cause"],
    specialties: ["Internal Medicine"]
  },
  "syphilis": {
    name: "Syphilis",
    description: "Syphilis is a sexually transmitted infection caused by bacteria. It can cause serious health problems if left untreated, but it's easily cured with antibiotics in early stages.",
    symptoms: ["sore (chancre) at infection site", "rash", "fever", "swollen glands", "fatigue", "may have no symptoms"],
    treatments: ["antibiotics (penicillin)", "treating sexual partners", "follow-up testing", "abstinence during treatment"],
    specialties: ["Infectious Disease", "Dermatology", "Urology", "Obstetrics & Gynecology"]
  },
  "self-harm": {
    name: "Self-Harm",
    description: "Self-harm is when someone intentionally hurts themselves, often as a way to cope with emotional pain. It's a serious mental health concern that requires professional help.",
    symptoms: ["intentional self-injury", "cuts, burns, or other injuries", "hiding injuries", "emotional distress"],
    treatments: ["psychotherapy", "medications", "crisis intervention", "support groups", "addressing underlying issues"],
    specialties: ["Psychiatry", "Psychology", "Emergency Medicine"]
  },
  "tennis elbow": {
    name: "Tennis Elbow (Lateral Epicondylitis)",
    description: "Tennis elbow is a painful condition that occurs when tendons in the elbow are overworked, usually by repetitive motions of the wrist and arm. Despite its name, it can affect anyone.",
    symptoms: ["pain on outside of elbow", "pain that worsens with gripping", "weakness in hand and wrist", "pain that may radiate down arm"],
    treatments: ["rest", "ice", "pain medications", "physical therapy", "braces or straps", "injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Sports Medicine", "Physical Medicine"]
  },
  "lateral epicondylitis": {
    name: "Tennis Elbow",
    description: "Lateral epicondylitis is inflammation of the outer elbow tendons.",
    symptoms: ["outer elbow pain", "weakness"],
    treatments: ["rest", "physical therapy", "injections"],
    specialties: ["Orthopedics"]
  },
  "testicular cancer": {
    name: "Testicular Cancer",
    description: "Testicular cancer is cancer that develops in the testicles. It's the most common cancer in men aged 15-35 and is highly treatable, especially when detected early.",
    symptoms: ["lump in testicle", "testicular swelling", "pain or discomfort", "heaviness in scrotum", "back pain if advanced"],
    treatments: ["surgery (orchiectomy)", "chemotherapy", "radiation therapy", "surveillance", "fertility preservation"],
    specialties: ["Urology", "Oncology"]
  },
  "testicular cancer: teenagers and young adults": {
    name: "Testicular Cancer in Teenagers and Young Adults",
    description: "Testicular cancer in teenagers and young adults requires specialized care that considers fertility preservation, long-term side effects, and the unique needs of this age group.",
    symptoms: ["lump in testicle", "swelling", "pain"],
    treatments: ["specialized protocols", "surgery", "fertility preservation", "long-term follow-up"],
    specialties: ["Urology", "Oncology", "Adolescent Medicine"]
  },
  "testicular lumps and swellings": {
    name: "Testicular Lumps and Swellings",
    description: "Testicular lumps and swellings can have various causes, from harmless conditions like cysts to serious conditions like cancer. All should be evaluated by a doctor.",
    symptoms: ["lump in testicle", "swelling", "pain or discomfort", "heaviness"],
    treatments: ["medical evaluation", "treating underlying cause", "may include surgery", "monitoring"],
    specialties: ["Urology"]
  },
  "thirst": {
    name: "Excessive Thirst (Polydipsia)",
    description: "Excessive thirst can be a symptom of various conditions including diabetes, dehydration, or certain medications. It's important to identify the underlying cause.",
    symptoms: ["excessive thirst", "drinking large amounts of fluids", "may be accompanied by frequent urination"],
    treatments: ["treating underlying cause", "ensuring adequate hydration", "adjusting medications if needed"],
    specialties: ["Internal Medicine", "Endocrinology"]
  },
  "polydipsia": {
    name: "Excessive Thirst",
    description: "Polydipsia is excessive thirst.",
    symptoms: ["excessive thirst"],
    treatments: ["treating cause"],
    specialties: ["Internal Medicine"]
  },
  "threadworms": {
    name: "Threadworms (Pinworms)",
    description: "Threadworms, also called pinworms, are tiny parasitic worms that infect the intestines. They're very common in children and spread easily through close contact.",
    symptoms: ["itching around anus", "disturbed sleep", "irritability", "visible worms in stool or around anus"],
    treatments: ["anthelmintic medications", "treating all household members", "good hygiene", "washing bedding and clothing"],
    specialties: ["Pediatrics", "Infectious Disease", "Gastroenterology"]
  },
  "pinworms": {
    name: "Threadworms",
    description: "Pinworms are parasitic worms infecting the intestines.",
    symptoms: ["anal itching", "visible worms"],
    treatments: ["anthelmintic medications"],
    specialties: ["Pediatrics"]
  },
  "thrush": {
    name: "Thrush",
    description: "Thrush is a fungal infection caused by Candida yeast. It can affect the mouth (oral thrush) or genitals (genital thrush). It's more common in people with weakened immune systems.",
    symptoms: ["white patches (oral)", "redness and itching (genital)", "discomfort", "discharge (genital)"],
    treatments: ["antifungal medications", "good hygiene", "treating underlying causes"],
    specialties: ["Dentistry", "Obstetrics & Gynecology", "Infectious Disease"]
  },
  "thumb fracture": {
    name: "Thumb Fracture",
    description: "A thumb fracture is a break in one of the bones of the thumb. It's a common hand injury that can significantly impact hand function.",
    symptoms: ["thumb pain", "swelling", "bruising", "difficulty moving thumb", "deformity"],
    treatments: ["splinting or casting", "pain medications", "ice", "surgery for displaced fractures", "physical therapy"],
    specialties: ["Orthopedics", "Hand Surgery", "Emergency Medicine"]
  },
  "thyroid cancer": {
    name: "Thyroid Cancer",
    description: "Thyroid cancer is cancer that begins in the thyroid gland, a butterfly-shaped gland at the base of the neck. Most types are highly treatable and have a good prognosis.",
    symptoms: ["lump in neck", "hoarseness", "difficulty swallowing", "neck pain", "swollen lymph nodes"],
    treatments: ["surgery (thyroidectomy)", "radioactive iodine", "hormone therapy", "external radiation", "targeted therapy"],
    specialties: ["Endocrinology", "Oncology", "Surgical Oncology"]
  },
  "thyroid cancer: teenagers and young adults": {
    name: "Thyroid Cancer in Teenagers and Young Adults",
    description: "Thyroid cancer in teenagers and young adults requires specialized care that considers long-term hormone replacement, fertility, and the unique needs of this age group.",
    symptoms: ["lump in neck", "hoarseness", "difficulty swallowing"],
    treatments: ["specialized protocols", "surgery", "radioactive iodine", "long-term hormone management"],
    specialties: ["Endocrinology", "Oncology", "Adolescent Medicine"]
  },
  "tick bites": {
    name: "Tick Bites",
    description: "Tick bites are usually harmless but can transmit diseases like Lyme disease. It's important to remove ticks properly and monitor for signs of infection.",
    symptoms: ["tick attached to skin", "redness at bite site", "may develop rash", "flu-like symptoms if disease transmitted"],
    treatments: ["proper tick removal", "cleaning bite area", "monitoring for symptoms", "antibiotics if infection develops"],
    specialties: ["Infectious Disease", "Dermatology", "Emergency Medicine"]
  },
  "tinnitus": {
    name: "Tinnitus",
    description: "Tinnitus is the perception of noise or ringing in the ears. It's a common problem that affects about 15-20% of people and can be caused by various conditions.",
    symptoms: ["ringing in ears", "buzzing", "hissing", "clicking", "roaring", "may be constant or intermittent"],
    treatments: ["treating underlying cause", "hearing aids", "sound therapy", "cognitive behavioral therapy", "medications"],
    specialties: ["Otolaryngology", "Audiology"]
  },
  "tonsillitis": {
    name: "Tonsillitis",
    description: "Tonsillitis is inflammation of the tonsils, two oval-shaped pads of tissue at the back of the throat. It's common in children but can occur at any age.",
    symptoms: ["sore throat", "swollen tonsils", "difficulty swallowing", "fever", "swollen lymph nodes", "white or yellow coating on tonsils"],
    treatments: ["rest and fluids", "pain relievers", "antibiotics if bacterial", "tonsillectomy if recurrent"],
    specialties: ["Otolaryngology", "Pediatrics"]
  },
  "tooth decay": {
    name: "Tooth Decay (Dental Caries)",
    description: "Tooth decay, or dental caries, is damage to the tooth enamel caused by acids produced by bacteria in plaque. It can lead to cavities and tooth loss if not treated.",
    symptoms: ["toothache", "sensitivity", "visible holes in teeth", "staining", "bad breath"],
    treatments: ["fillings", "crowns", "root canals", "extractions", "prevention through good oral hygiene"],
    specialties: ["Dentistry"]
  },
  "dental caries": {
    name: "Tooth Decay",
    description: "Dental caries is tooth decay caused by bacteria.",
    symptoms: ["toothache", "cavities"],
    treatments: ["fillings", "prevention"],
    specialties: ["Dentistry"]
  },
  "toothache": {
    name: "Toothache",
    description: "A toothache is pain in or around a tooth. It can be caused by various dental problems including decay, infection, or injury.",
    symptoms: ["tooth pain", "sensitivity", "swelling", "fever if infection"],
    treatments: ["treating underlying cause", "pain medications", "dental procedures", "antibiotics if infection"],
    specialties: ["Dentistry", "Oral Surgery"]
  },
  "tourette's syndrome": {
    name: "Tourette's Syndrome",
    description: "Tourette's syndrome is a neurological disorder characterized by repetitive, involuntary movements and vocalizations called tics. It typically begins in childhood.",
    symptoms: ["motor tics", "vocal tics", "may include coprolalia (involuntary swearing)", "tics may worsen with stress"],
    treatments: ["behavioral therapy", "medications", "treating co-occurring conditions", "supportive care"],
    specialties: ["Neurology", "Psychiatry", "Pediatrics"]
  },
  "tourettes syndrome": {
    name: "Tourette's Syndrome",
    description: "Tourette's syndrome causes involuntary tics.",
    symptoms: ["motor tics", "vocal tics"],
    treatments: ["behavioral therapy", "medications"],
    specialties: ["Neurology"]
  },
  "transient ischaemic attack": {
    name: "Transient Ischaemic Attack (TIA)",
    description: "A TIA, or mini-stroke, is a temporary period of symptoms similar to those of a stroke. It doesn't cause permanent damage but is a warning sign of a possible future stroke.",
    symptoms: ["sudden numbness or weakness", "confusion", "trouble speaking", "vision problems", "dizziness", "loss of balance"],
    treatments: ["immediate medical evaluation", "medications to prevent stroke", "lifestyle changes", "treating underlying causes"],
    specialties: ["Neurology", "Emergency Medicine"]
  },
  "tia": {
    name: "Transient Ischaemic Attack",
    description: "TIA is a temporary stroke-like episode.",
    symptoms: ["stroke-like symptoms", "temporary"],
    treatments: ["medical evaluation", "preventive medications"],
    specialties: ["Neurology"]
  },
  "transverse myelitis": {
    name: "Transverse Myelitis",
    description: "Transverse myelitis is inflammation of the spinal cord that can cause pain, muscle weakness, paralysis, and sensory problems. It can develop suddenly or gradually.",
    symptoms: ["back pain", "weakness in legs", "numbness or tingling", "bladder and bowel problems", "sensory changes"],
    treatments: ["corticosteroids", "plasma exchange", "pain medications", "physical therapy", "treating underlying cause"],
    specialties: ["Neurology"]
  },
  "trichomonas infection": {
    name: "Trichomonas Infection",
    description: "Trichomoniasis is a common sexually transmitted infection caused by a parasite. It can affect both men and women, though women are more likely to have symptoms.",
    symptoms: ["often no symptoms in men", "vaginal discharge", "itching", "burning during urination", "discomfort during intercourse"],
    treatments: ["antibiotics (metronidazole)", "treating sexual partners", "abstinence during treatment"],
    specialties: ["Infectious Disease", "Obstetrics & Gynecology", "Urology"]
  },
  "trichomoniasis": {
    name: "Trichomonas Infection",
    description: "Trichomoniasis is a sexually transmitted parasitic infection.",
    symptoms: ["discharge", "itching", "often asymptomatic"],
    treatments: ["antibiotics"],
    specialties: ["Infectious Disease"]
  },
  "trigeminal neuralgia": {
    name: "Trigeminal Neuralgia",
    description: "Trigeminal neuralgia is a chronic pain condition that affects the trigeminal nerve, which carries sensation from the face to the brain. It causes severe, sudden facial pain.",
    symptoms: ["severe facial pain", "brief episodes of sharp, stabbing pain", "pain triggered by touching face", "pain in jaw, cheek, or forehead"],
    treatments: ["medications (anticonvulsants)", "surgery", "injections", "radiofrequency ablation"],
    specialties: ["Neurology", "Neurosurgery"]
  },
  "trigger thumb or trigger finger in children": {
    name: "Trigger Thumb or Trigger Finger in Children and Young People",
    description: "Trigger thumb or trigger finger is a condition where a finger or thumb gets stuck in a bent position and then straightens with a snap. In children, it's often congenital.",
    symptoms: ["finger or thumb stuck in bent position", "snapping when straightening", "stiffness", "nodule at base of finger"],
    treatments: ["observation", "splinting", "stretching exercises", "surgery if persistent"],
    specialties: ["Pediatrics", "Pediatric Orthopedics", "Hand Surgery"]
  },
  "trigger finger": {
    name: "Trigger Finger",
    description: "Trigger finger is when a finger gets stuck in a bent position.",
    symptoms: ["stuck finger", "snapping"],
    treatments: ["splinting", "surgery"],
    specialties: ["Orthopedics", "Hand Surgery"]
  },
  "tuberculosis": {
    name: "Tuberculosis (TB)",
    description: "Tuberculosis is a serious bacterial infection that mainly affects the lungs but can spread to other parts of the body. It's spread through the air when an infected person coughs or sneezes.",
    symptoms: ["persistent cough", "coughing up blood", "chest pain", "fever", "night sweats", "weight loss", "fatigue"],
    treatments: ["antibiotics (long course)", "directly observed therapy", "treating latent TB", "prevention through vaccination"],
    specialties: ["Infectious Disease", "Pulmonology"]
  },
  "tb": {
    name: "Tuberculosis",
    description: "TB is a bacterial infection mainly affecting the lungs.",
    symptoms: ["persistent cough", "fever", "weight loss"],
    treatments: ["long course of antibiotics"],
    specialties: ["Infectious Disease"]
  },
  "type 1 diabetes": {
    name: "Type 1 Diabetes",
    description: "Type 1 diabetes is a chronic condition in which the pancreas produces little or no insulin. It's usually diagnosed in children and young adults and requires lifelong insulin therapy.",
    symptoms: ["increased thirst", "frequent urination", "extreme hunger", "unexplained weight loss", "fatigue", "blurred vision"],
    treatments: ["insulin therapy", "blood sugar monitoring", "carbohydrate counting", "regular exercise", "healthy diet"],
    specialties: ["Endocrinology", "Pediatric Endocrinology"]
  },
  "type 2 diabetes": {
    name: "Type 2 Diabetes",
    description: "Type 2 diabetes is a chronic condition that affects the way the body processes blood sugar. It's the most common type of diabetes and is often related to lifestyle factors.",
    symptoms: ["increased thirst", "frequent urination", "increased hunger", "fatigue", "blurred vision", "slow-healing sores"],
    treatments: ["lifestyle changes (diet, exercise)", "oral medications", "insulin if needed", "blood sugar monitoring", "managing complications"],
    specialties: ["Endocrinology", "Internal Medicine"]
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

