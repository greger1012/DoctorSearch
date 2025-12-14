/**
 * Script to add diseases starting with D, E, F from NHS Inform with detailed descriptions
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
  "deafblindness": {
    name: "Deafblindness",
    description: "Deafblindness is a combination of sight and hearing loss that affects a person's ability to communicate, access information, and get around. It can be present from birth or develop later in life.",
    symptoms: ["hearing loss", "vision loss", "difficulty communicating", "isolation", "challenges with mobility"],
    treatments: ["communication support", "assistive technology", "orientation and mobility training", "specialized education", "support services"],
    specialties: ["Otolaryngology", "Ophthalmology", "Rehabilitation Medicine"]
  },
  "deep vein thrombosis": {
    name: "Deep Vein Thrombosis (DVT)",
    description: "Deep vein thrombosis is a serious condition where a blood clot forms in a deep vein, usually in the leg. It can be life-threatening if the clot breaks loose and travels to the lungs.",
    symptoms: ["swelling in affected leg", "pain in leg", "red or discolored skin", "warmth in affected area", "tenderness"],
    treatments: ["anticoagulant medications (blood thinners)", "compression stockings", "elevating leg", "thrombolytic therapy in severe cases", "prevention of complications"],
    specialties: ["Hematology", "Vascular Surgery", "Emergency Medicine"]
  },
  "dvt": {
    name: "Deep Vein Thrombosis",
    description: "DVT is a blood clot in a deep vein, usually in the leg.",
    symptoms: ["leg swelling", "pain", "redness"],
    treatments: ["blood thinners", "compression stockings"],
    specialties: ["Hematology", "Vascular Surgery"]
  },
  "degenerative cervical myelopathy": {
    name: "Degenerative Cervical Myelopathy",
    description: "Degenerative cervical myelopathy is a condition where the spinal cord in the neck is compressed due to age-related changes in the spine, such as disc degeneration or bone spurs.",
    symptoms: ["neck pain", "numbness or weakness in arms and hands", "difficulty with fine motor skills", "balance problems", "gait disturbances", "urinary problems"],
    treatments: ["physical therapy", "pain medications", "cervical collar", "surgery to decompress spinal cord", "lifestyle modifications"],
    specialties: ["Neurosurgery", "Orthopedics", "Neurology"]
  },
  "dehydration": {
    name: "Dehydration",
    description: "Dehydration occurs when you use or lose more fluid than you take in, and your body doesn't have enough water and other fluids to carry out its normal functions.",
    symptoms: ["extreme thirst", "less frequent urination", "dark-colored urine", "fatigue", "dizziness", "confusion"],
    treatments: ["oral rehydration solutions", "IV fluids in severe cases", "treating underlying cause", "preventing further fluid loss"],
    specialties: ["Emergency Medicine", "Internal Medicine", "Pediatrics"]
  },
  "delirium": {
    name: "Delirium",
    description: "Delirium is a serious disturbance in mental abilities that results in confused thinking and reduced awareness of the environment. It develops quickly and can be caused by various medical conditions.",
    symptoms: ["reduced awareness of environment", "poor thinking skills", "behavior changes", "emotional disturbances", "hallucinations"],
    treatments: ["treating underlying cause", "supportive care", "medications if needed", "environmental modifications", "family support"],
    specialties: ["Internal Medicine", "Geriatrics", "Psychiatry", "Neurology"]
  },
  "dementia": {
    name: "Dementia",
    description: "Dementia is a general term for a decline in mental ability severe enough to interfere with daily life. Alzheimer's is the most common type, but there are many other forms.",
    symptoms: ["memory loss", "difficulty communicating", "impaired reasoning", "personality changes", "inability to perform daily tasks", "confusion"],
    treatments: ["medications to slow progression", "supportive care", "cognitive therapy", "lifestyle modifications", "family support"],
    specialties: ["Neurology", "Geriatrics"]
  },
  "dementia with lewy bodies": {
    name: "Dementia with Lewy Bodies",
    description: "Dementia with Lewy bodies is a type of progressive dementia that leads to a decline in thinking, reasoning, and independent function. It's associated with abnormal protein deposits in the brain.",
    symptoms: ["visual hallucinations", "parkinsonian symptoms (tremor, stiffness)", "fluctuating cognitive function", "sleep disorders", "autonomic dysfunction"],
    treatments: ["medications (cholinesterase inhibitors)", "managing parkinsonian symptoms", "treating hallucinations", "supportive care"],
    specialties: ["Neurology", "Geriatrics"]
  },
  "dental abscess": {
    name: "Dental Abscess",
    description: "A dental abscess is a collection of pus that can form inside the teeth, in the gums, or in the bone that holds the teeth in place. It's caused by a bacterial infection.",
    symptoms: ["severe, persistent toothache", "sensitivity to hot and cold", "fever", "swelling in face or cheek", "tender, swollen lymph nodes"],
    treatments: ["drainage of abscess", "root canal treatment", "tooth extraction", "antibiotics", "pain medications"],
    specialties: ["Dentistry", "Oral Surgery"]
  },
  "depression": {
    name: "Depression",
    description: "Depression is a mood disorder that causes persistent feelings of sadness, loss of interest, and can affect how you think, feel, and handle daily activities.",
    symptoms: ["persistent sadness", "loss of interest in activities", "fatigue", "changes in appetite or sleep", "difficulty concentrating", "feelings of worthlessness", "thoughts of death or suicide"],
    treatments: ["psychotherapy", "antidepressant medications", "lifestyle changes", "support groups", "electroconvulsive therapy in severe cases"],
    specialties: ["Psychiatry", "Psychology"]
  },
  "dermatitis herpetiformis": {
    name: "Dermatitis Herpetiformis",
    description: "Dermatitis herpetiformis is a chronic, intensely itchy skin rash associated with celiac disease. It's characterized by clusters of small blisters and bumps.",
    symptoms: ["intensely itchy rash", "small blisters", "bumps that look like hives", "burning sensation", "usually on elbows, knees, buttocks"],
    treatments: ["strict gluten-free diet", "medications (dapsone)", "topical treatments", "treating underlying celiac disease"],
    specialties: ["Dermatology", "Gastroenterology"]
  },
  "diabetic foot issues": {
    name: "Diabetic Foot Issues",
    description: "Diabetic foot problems are common complications of diabetes that can include infections, ulcers, and in severe cases, amputation. They result from poor circulation and nerve damage.",
    symptoms: ["foot ulcers", "infections", "poor wound healing", "numbness or tingling", "loss of sensation", "foot deformities"],
    treatments: ["wound care", "antibiotics for infections", "offloading pressure", "vascular interventions", "amputation in severe cases", "preventive foot care"],
    specialties: ["Podiatry", "Endocrinology", "Vascular Surgery", "Infectious Disease"]
  },
  "diabetic ketoacidosis": {
    name: "Diabetic Ketoacidosis (DKA)",
    description: "Diabetic ketoacidosis is a serious complication of diabetes that occurs when the body produces high levels of blood acids called ketones. It's a medical emergency.",
    symptoms: ["excessive thirst", "frequent urination", "nausea and vomiting", "abdominal pain", "weakness", "fruity-scented breath", "confusion"],
    treatments: ["emergency medical treatment", "IV fluids", "insulin therapy", "electrolyte replacement", "treating underlying cause"],
    specialties: ["Endocrinology", "Emergency Medicine", "Critical Care"]
  },
  "dka": {
    name: "Diabetic Ketoacidosis",
    description: "DKA is a serious diabetes complication requiring emergency treatment.",
    symptoms: ["excessive thirst", "nausea", "confusion"],
    treatments: ["IV fluids", "insulin", "emergency care"],
    specialties: ["Endocrinology", "Emergency Medicine"]
  },
  "diabetic retinopathy": {
    name: "Diabetic Retinopathy",
    description: "Diabetic retinopathy is a diabetes complication that affects the eyes. It's caused by damage to the blood vessels of the light-sensitive tissue at the back of the eye (retina).",
    symptoms: ["often no symptoms in early stages", "blurred vision", "fluctuating vision", "dark or empty areas in vision", "impaired color vision", "vision loss"],
    treatments: ["tight blood sugar control", "blood pressure control", "laser treatment", "injections into eye", "vitrectomy in advanced cases"],
    specialties: ["Ophthalmology", "Endocrinology"]
  },
  "diarrhoea in adults": {
    name: "Diarrhoea in Adults",
    description: "Diarrhoea in adults is the passage of loose or watery stools three or more times per day. It can be acute (short-term) or chronic (lasting more than 4 weeks).",
    symptoms: ["loose, watery stools", "frequent bowel movements", "abdominal cramps", "bloating", "nausea", "urgency"],
    treatments: ["staying hydrated", "oral rehydration solutions", "avoiding certain foods", "medications if needed", "treating underlying cause"],
    specialties: ["Gastroenterology", "Infectious Disease", "Internal Medicine"]
  },
  "diarrhea in adults": {
    name: "Diarrhoea in Adults",
    description: "Diarrhea is loose, watery stools occurring frequently.",
    symptoms: ["loose stools", "abdominal cramps", "urgency"],
    treatments: ["hydration", "dietary changes", "treating cause"],
    specialties: ["Gastroenterology"]
  },
  "diarrhoea in children and babies": {
    name: "Diarrhoea in Children and Babies",
    description: "Diarrhoea in children and babies can be serious, especially in infants, as it can lead to dehydration quickly. It's often caused by viral or bacterial infections.",
    symptoms: ["loose, watery stools", "frequent bowel movements", "fever", "vomiting", "signs of dehydration", "irritability"],
    treatments: ["oral rehydration solutions", "continuing breastfeeding or formula", "avoiding fruit juices", "medical attention if severe", "preventing dehydration"],
    specialties: ["Pediatrics", "Pediatric Gastroenterology"]
  },
  "diarrhea in children": {
    name: "Diarrhoea in Children",
    description: "Diarrhea in children requires careful monitoring for dehydration.",
    symptoms: ["loose stools", "fever", "vomiting"],
    treatments: ["oral rehydration", "medical monitoring"],
    specialties: ["Pediatrics"]
  },
  "discoid eczema": {
    name: "Discoid Eczema",
    description: "Discoid eczema, also known as nummular eczema, is a chronic skin condition that causes coin-shaped patches of irritated skin. It can be very itchy.",
    symptoms: ["coin-shaped patches of irritated skin", "intense itching", "dry, scaly patches", "oozing and crusting", "discoloration"],
    treatments: ["moisturizers", "topical corticosteroids", "antihistamines", "avoiding triggers", "phototherapy"],
    specialties: ["Dermatology"]
  },
  "diverticular disease": {
    name: "Diverticular Disease",
    description: "Diverticular disease includes both diverticulosis (presence of small pouches in the colon) and diverticulitis (inflammation of these pouches).",
    symptoms: ["often no symptoms", "abdominal pain", "bloating", "constipation", "diarrhea", "bleeding"],
    treatments: ["high-fiber diet", "medications", "antibiotics if infected", "surgery in severe cases"],
    specialties: ["Gastroenterology", "General Surgery"]
  },
  "diverticulitis": {
    name: "Diverticulitis",
    description: "Diverticulitis occurs when small pouches (diverticula) that form in the wall of the colon become inflamed or infected.",
    symptoms: ["abdominal pain, usually on left side", "fever", "nausea", "constipation or diarrhea", "bloating"],
    treatments: ["antibiotics", "liquid diet", "pain medications", "surgery in severe or recurrent cases"],
    specialties: ["Gastroenterology", "General Surgery"]
  },
  "dizziness": {
    name: "Dizziness (Lightheadedness)",
    description: "Dizziness is a term used to describe a range of sensations, such as feeling faint, woozy, weak, or unsteady. It can have many causes.",
    symptoms: ["feeling faint", "lightheadedness", "unsteadiness", "loss of balance", "spinning sensation (vertigo)"],
    treatments: ["treating underlying cause", "medications", "balance therapy", "lifestyle modifications", "staying hydrated"],
    specialties: ["Neurology", "Otolaryngology", "Internal Medicine"]
  },
  "lightheadedness": {
    name: "Dizziness",
    description: "Lightheadedness is a feeling of faintness or unsteadiness.",
    symptoms: ["feeling faint", "unsteadiness"],
    treatments: ["treating cause", "hydration"],
    specialties: ["Internal Medicine", "Neurology"]
  },
  "down's syndrome": {
    name: "Down's Syndrome",
    description: "Down's syndrome is a genetic disorder caused by the presence of an extra chromosome 21. It causes developmental delays and characteristic physical features.",
    symptoms: ["distinctive facial features", "intellectual disability", "developmental delays", "heart defects", "hearing and vision problems"],
    treatments: ["early intervention programs", "educational support", "treating associated health conditions", "supportive therapies"],
    specialties: ["Pediatrics", "Genetics", "Developmental-Behavioral Pediatrics"]
  },
  "downs syndrome": {
    name: "Down's Syndrome",
    description: "Down syndrome is a genetic condition causing developmental delays.",
    symptoms: ["developmental delays", "distinctive features", "health conditions"],
    treatments: ["early intervention", "supportive care"],
    specialties: ["Pediatrics", "Genetics"]
  },
  "dry mouth": {
    name: "Dry Mouth (Xerostomia)",
    description: "Dry mouth, or xerostomia, is a condition in which the salivary glands don't produce enough saliva to keep the mouth wet. It can be caused by medications, medical conditions, or treatments.",
    symptoms: ["dryness in mouth", "thick or stringy saliva", "bad breath", "difficulty chewing and swallowing", "dry throat", "cracked lips"],
    treatments: ["treating underlying cause", "artificial saliva", "medications to stimulate saliva", "good oral hygiene", "staying hydrated"],
    specialties: ["Dentistry", "Otolaryngology", "Internal Medicine"]
  },
  "xerostomia": {
    name: "Dry Mouth",
    description: "Xerostomia is the medical term for dry mouth.",
    symptoms: ["mouth dryness", "difficulty swallowing"],
    treatments: ["artificial saliva", "treating cause"],
    specialties: ["Dentistry"]
  },
  "duchenne muscular dystrophy": {
    name: "Duchenne Muscular Dystrophy (DMD)",
    description: "Duchenne muscular dystrophy is a genetic disorder characterized by progressive muscle degeneration and weakness. It primarily affects boys and is caused by a mutation in the dystrophin gene.",
    symptoms: ["progressive muscle weakness", "difficulty walking", "frequent falls", "large calf muscles", "learning disabilities", "heart and breathing problems"],
    treatments: ["corticosteroids to slow progression", "physical therapy", "respiratory support", "cardiac monitoring", "assistive devices", "gene therapy research"],
    specialties: ["Neurology", "Pediatrics", "Physical Medicine", "Cardiology", "Pulmonology"]
  },
  "dmd": {
    name: "Duchenne Muscular Dystrophy",
    description: "DMD is a genetic muscle disorder causing progressive weakness.",
    symptoms: ["muscle weakness", "difficulty walking"],
    treatments: ["corticosteroids", "physical therapy", "supportive care"],
    specialties: ["Neurology", "Pediatrics"]
  },
  "dysphagia": {
    name: "Dysphagia (Swallowing Problems)",
    description: "Dysphagia is the medical term for swallowing difficulties. It can occur at any age and can be caused by various conditions affecting the throat or esophagus.",
    symptoms: ["difficulty swallowing", "pain when swallowing", "feeling of food stuck in throat", "drooling", "hoarseness", "regurgitation"],
    treatments: ["speech and swallowing therapy", "diet modifications", "medications", "dilation procedures", "surgery in some cases"],
    specialties: ["Otolaryngology", "Gastroenterology", "Speech-Language Pathology", "Neurology"]
  },
  "swallowing problems": {
    name: "Dysphagia",
    description: "Swallowing problems can have many causes and require evaluation.",
    symptoms: ["difficulty swallowing", "choking", "pain"],
    treatments: ["swallowing therapy", "diet changes"],
    specialties: ["Otolaryngology", "Speech-Language Pathology"]
  },
  "dystonia": {
    name: "Dystonia",
    description: "Dystonia is a movement disorder in which muscles contract involuntarily, causing repetitive or twisting movements. It can affect one part of the body or multiple parts.",
    symptoms: ["involuntary muscle contractions", "twisting movements", "abnormal postures", "tremor", "pain"],
    treatments: ["botulinum toxin injections", "medications", "deep brain stimulation", "physical therapy", "occupational therapy"],
    specialties: ["Neurology", "Movement Disorders"]
  },
  "eating disorders": {
    name: "Eating Disorders",
    description: "Eating disorders are serious mental health conditions characterized by abnormal eating habits that negatively affect physical and mental health. They include anorexia, bulimia, and binge eating disorder.",
    symptoms: ["varies by disorder", "extreme weight changes", "preoccupation with food and weight", "distorted body image", "secretive eating behaviors"],
    treatments: ["psychotherapy", "nutritional counseling", "medical monitoring", "medications", "hospitalization in severe cases"],
    specialties: ["Psychiatry", "Psychology", "Nutrition", "Adolescent Medicine"]
  },
  "earache": {
    name: "Earache",
    description: "Earache, or ear pain, can be caused by various conditions including ear infections, injury, or referred pain from other areas. It's common in children but can affect people of all ages.",
    symptoms: ["ear pain", "feeling of pressure in ear", "hearing loss", "drainage from ear", "fever"],
    treatments: ["pain medications", "antibiotics if bacterial infection", "warm compress", "ear drops", "treating underlying cause"],
    specialties: ["Otolaryngology", "Pediatrics"]
  },
  "early miscarriage": {
    name: "Early Miscarriage",
    description: "An early miscarriage is the loss of a pregnancy before 12 weeks. It's unfortunately common and can be emotionally devastating. Most occur due to chromosomal abnormalities.",
    symptoms: ["vaginal bleeding", "abdominal cramping", "passing tissue", "back pain"],
    treatments: ["medical monitoring", "supportive care", "emotional support", "medical or surgical management if needed", "follow-up care"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "miscarriage": {
    name: "Miscarriage",
    description: "Miscarriage is the loss of a pregnancy before 20 weeks.",
    symptoms: ["bleeding", "cramping", "tissue passing"],
    treatments: ["supportive care", "medical management"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "earwax build-up": {
    name: "Earwax Build-up",
    description: "Earwax build-up occurs when earwax (cerumen) accumulates in the ear canal and causes symptoms. It's a common problem that can usually be easily treated.",
    symptoms: ["hearing loss", "earache", "feeling of fullness in ear", "tinnitus", "dizziness"],
    treatments: ["ear drops to soften wax", "ear irrigation", "manual removal by healthcare provider", "avoiding cotton swabs"],
    specialties: ["Otolaryngology"]
  },
  "ebola virus disease": {
    name: "Ebola Virus Disease",
    description: "Ebola virus disease is a severe, often fatal illness in humans. It's transmitted through contact with infected animals or people. Outbreaks occur primarily in Africa.",
    symptoms: ["fever", "severe headache", "muscle pain", "weakness", "diarrhea", "vomiting", "bleeding"],
    treatments: ["supportive care", "IV fluids", "treating symptoms", "experimental treatments", "isolation", "contact tracing"],
    specialties: ["Infectious Disease", "Emergency Medicine", "Critical Care"]
  },
  "ectopic pregnancy": {
    name: "Ectopic Pregnancy",
    description: "An ectopic pregnancy occurs when a fertilized egg implants outside the uterus, usually in a fallopian tube. It's a medical emergency that requires immediate treatment.",
    symptoms: ["abdominal pain", "vaginal bleeding", "shoulder pain", "dizziness", "fainting"],
    treatments: ["emergency medical treatment", "medication (methotrexate) for early cases", "surgery to remove ectopic pregnancy", "monitoring"],
    specialties: ["Obstetrics & Gynecology", "Emergency Medicine"]
  },
  "elbow fracture": {
    name: "Elbow (Radial Head or Neck) Fracture",
    description: "An elbow fracture involving the radial head or neck is a break in the top part of the radius bone in the forearm. It's a common injury, often from falling on an outstretched hand.",
    symptoms: ["elbow pain", "swelling", "bruising", "difficulty moving elbow", "deformity"],
    treatments: ["splinting or casting", "pain medications", "ice", "physical therapy", "surgery for displaced fractures"],
    specialties: ["Orthopedics", "Emergency Medicine"]
  },
  "radial head fracture": {
    name: "Elbow Fracture",
    description: "A radial head fracture is a break in the elbow area.",
    symptoms: ["elbow pain", "swelling", "limited movement"],
    treatments: ["splinting", "surgery if displaced"],
    specialties: ["Orthopedics"]
  },
  "edwards' syndrome": {
    name: "Edwards' Syndrome (Trisomy 18)",
    description: "Edwards' syndrome, also known as trisomy 18, is a genetic disorder caused by the presence of an extra chromosome 18. It causes severe developmental delays and multiple physical abnormalities.",
    symptoms: ["severe intellectual disability", "multiple physical abnormalities", "heart defects", "feeding difficulties", "growth problems"],
    treatments: ["supportive care", "treating associated health conditions", "palliative care", "family support"],
    specialties: ["Pediatrics", "Genetics", "Palliative Medicine"]
  },
  "edwards syndrome": {
    name: "Edwards' Syndrome",
    description: "Edwards syndrome is a genetic condition with severe developmental delays.",
    symptoms: ["severe delays", "physical abnormalities", "heart defects"],
    treatments: ["supportive care"],
    specialties: ["Pediatrics", "Genetics"]
  },
  "emery-dreifuss muscular dystrophy": {
    name: "Emery-Dreifuss Muscular Dystrophy",
    description: "Emery-Dreifuss muscular dystrophy is a rare genetic condition that causes progressive muscle weakness and wasting, particularly in the upper arms and lower legs, along with heart problems.",
    symptoms: ["progressive muscle weakness", "joint contractures", "heart problems (arrhythmias, cardiomyopathy)", "difficulty walking"],
    treatments: ["physical therapy", "cardiac monitoring and treatment", "pacemaker if needed", "assistive devices"],
    specialties: ["Neurology", "Cardiology", "Physical Medicine"]
  },
  "endometriosis": {
    name: "Endometriosis",
    description: "Endometriosis is a condition where tissue similar to the lining of the uterus grows outside the uterus, causing pain and sometimes fertility problems.",
    symptoms: ["pelvic pain", "painful periods", "pain during intercourse", "pain with bowel movements or urination", "infertility", "heavy periods"],
    treatments: ["pain medications", "hormonal treatments", "surgery to remove endometrial tissue", "hysterectomy in severe cases"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "epilepsy": {
    name: "Epilepsy",
    description: "Epilepsy is a neurological disorder marked by recurrent, unprovoked seizures. Seizures are sudden bursts of electrical activity in the brain.",
    symptoms: ["seizures", "temporary confusion", "staring spells", "uncontrollable jerking movements", "loss of consciousness"],
    treatments: ["antiepileptic medications", "surgery in some cases", "vagus nerve stimulation", "ketogenic diet", "lifestyle modifications"],
    specialties: ["Neurology", "Epileptology"]
  },
  "erectile dysfunction": {
    name: "Erectile Dysfunction (Impotence)",
    description: "Erectile dysfunction is the inability to get or keep an erection firm enough for sexual intercourse. It can be caused by physical or psychological factors.",
    symptoms: ["inability to achieve erection", "trouble keeping erection", "reduced sexual desire"],
    treatments: ["oral medications (PDE5 inhibitors)", "lifestyle changes", "psychological counseling", "vacuum devices", "penile injections", "surgery"],
    specialties: ["Urology"]
  },
  "impotence": {
    name: "Erectile Dysfunction",
    description: "Impotence is the inability to achieve or maintain an erection.",
    symptoms: ["erection problems", "reduced sexual function"],
    treatments: ["medications", "lifestyle changes"],
    specialties: ["Urology"]
  },
  "escherichia coli o157": {
    name: "Escherichia coli (E. coli) O157",
    description: "E. coli O157 is a strain of bacteria that can cause severe foodborne illness. It produces toxins that can lead to serious complications, especially in children and the elderly.",
    symptoms: ["severe stomach cramps", "diarrhea (often bloody)", "vomiting", "fever", "dehydration"],
    treatments: ["supportive care", "hydration", "avoiding antibiotics (can worsen)", "monitoring for complications", "hospitalization if severe"],
    specialties: ["Infectious Disease", "Gastroenterology", "Pediatrics"]
  },
  "e. coli": {
    name: "E. coli O157",
    description: "E. coli O157 is a dangerous bacterial strain causing severe food poisoning.",
    symptoms: ["bloody diarrhea", "severe cramps", "vomiting"],
    treatments: ["supportive care", "hydration"],
    specialties: ["Infectious Disease"]
  },
  "ewing sarcoma": {
    name: "Ewing Sarcoma",
    description: "Ewing sarcoma is a rare type of cancer that occurs in bones or soft tissue. It's most common in children and young adults, particularly in the bones of the legs, pelvis, and chest wall.",
    symptoms: ["bone pain", "swelling near affected bone", "fever", "fatigue", "unexplained weight loss", "fractures"],
    treatments: ["chemotherapy", "surgery", "radiation therapy", "stem cell transplant in some cases"],
    specialties: ["Oncology", "Pediatric Oncology", "Orthopedic Surgery"]
  },
  "ewing sarcoma: children": {
    name: "Ewing Sarcoma in Children",
    description: "Ewing sarcoma in children requires specialized pediatric oncology care with protocols designed for growing bodies.",
    symptoms: ["bone pain", "swelling", "fever", "fatigue"],
    treatments: ["pediatric chemotherapy", "surgery", "radiation", "long-term follow-up"],
    specialties: ["Pediatric Oncology", "Orthopedic Surgery"]
  },
  "eye cancer": {
    name: "Eye Cancer",
    description: "Eye cancer is a rare type of cancer that can occur in various parts of the eye. The most common type is uveal melanoma, which affects the middle layer of the eye.",
    symptoms: ["often no early symptoms", "vision changes", "flashes of light", "dark spot on iris", "bulging eye", "change in eye appearance"],
    treatments: ["radiation therapy", "surgery", "laser therapy", "enucleation (removal of eye) in severe cases"],
    specialties: ["Ophthalmology", "Oncology", "Radiation Oncology"]
  },
  "facioscapulohumeral muscular dystrophy": {
    name: "Facioscapulohumeral Muscular Dystrophy (FSHD)",
    description: "FSHD is a genetic muscle disorder that causes progressive muscle weakness, typically starting in the face, shoulders, and upper arms. It's the third most common muscular dystrophy.",
    symptoms: ["weakness in facial muscles", "shoulder weakness", "difficulty raising arms", "foot drop", "scapular winging"],
    treatments: ["physical therapy", "occupational therapy", "assistive devices", "surgery for some complications"],
    specialties: ["Neurology", "Physical Medicine"]
  },
  "fshd": {
    name: "Facioscapulohumeral Muscular Dystrophy",
    description: "FSHD is a genetic muscle disorder causing progressive weakness.",
    symptoms: ["facial weakness", "shoulder weakness"],
    treatments: ["physical therapy", "supportive care"],
    specialties: ["Neurology"]
  },
  "farting": {
    name: "Excessive Flatulence (Farting)",
    description: "Excessive flatulence, or passing gas, is normal but can be embarrassing. It's usually caused by swallowed air or the breakdown of food in the digestive system.",
    symptoms: ["passing gas frequently", "bloating", "abdominal discomfort"],
    treatments: ["dietary changes", "avoiding gas-producing foods", "eating slowly", "over-the-counter medications", "treating underlying digestive issues"],
    specialties: ["Gastroenterology", "Internal Medicine"]
  },
  "flatulence": {
    name: "Excessive Flatulence",
    description: "Excessive flatulence is passing gas more frequently than normal.",
    symptoms: ["frequent gas", "bloating"],
    treatments: ["dietary changes"],
    specialties: ["Gastroenterology"]
  },
  "febrile seizures": {
    name: "Febrile Seizures",
    description: "Febrile seizures are convulsions that can occur in young children when they have a fever. They're usually harmless and don't indicate epilepsy.",
    symptoms: ["convulsions during fever", "loss of consciousness", "stiffening of body", "jerking movements"],
    treatments: ["treating the fever", "supportive care during seizure", "medical evaluation", "usually no long-term treatment needed"],
    specialties: ["Pediatrics", "Neurology"]
  },
  "feeling of something in your throat": {
    name: "Globus Sensation",
    description: "Globus sensation is the feeling of having a lump or something stuck in the throat when there's nothing there. It's often related to stress or acid reflux.",
    symptoms: ["feeling of lump in throat", "sensation of something stuck", "no actual obstruction", "may worsen with stress"],
    treatments: ["treating underlying cause (reflux, stress)", "reassurance", "speech therapy", "medications if needed"],
    specialties: ["Otolaryngology", "Gastroenterology", "Psychiatry"]
  },
  "globus": {
    name: "Globus Sensation",
    description: "Globus is the feeling of a lump in the throat with no actual obstruction.",
    symptoms: ["lump sensation", "no actual blockage"],
    treatments: ["treating cause", "reassurance"],
    specialties: ["Otolaryngology"]
  },
  "fever in adults": {
    name: "Fever in Adults",
    description: "Fever in adults is a temporary increase in body temperature, usually due to an illness. A fever is generally considered to be a temperature above 100.4°F (38°C).",
    symptoms: ["elevated body temperature", "sweating", "chills", "headache", "muscle aches", "dehydration"],
    treatments: ["rest and fluids", "fever-reducing medications", "treating underlying cause", "cooling measures"],
    specialties: ["Internal Medicine", "Infectious Disease"]
  },
  "fever in children": {
    name: "Fever in Children",
    description: "Fever in children is common and usually indicates an infection. It's important to monitor for signs of serious illness and ensure proper hydration.",
    symptoms: ["elevated temperature", "irritability", "lethargy", "poor feeding", "dehydration"],
    treatments: ["fever-reducing medications (age-appropriate)", "ensuring hydration", "comfort measures", "medical evaluation if concerning"],
    specialties: ["Pediatrics", "Emergency Medicine"]
  },
  "fibroids": {
    name: "Fibroids (Uterine Fibroids)",
    description: "Fibroids are non-cancerous growths that develop in or around the uterus. They're very common and often cause no symptoms, but can cause heavy periods and pelvic pain.",
    symptoms: ["heavy menstrual bleeding", "prolonged periods", "pelvic pain", "frequent urination", "constipation", "backache"],
    treatments: ["medications to control symptoms", "hormonal treatments", "uterine artery embolization", "surgery (myomectomy or hysterectomy)"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "uterine fibroids": {
    name: "Fibroids",
    description: "Uterine fibroids are non-cancerous growths in the uterus.",
    symptoms: ["heavy periods", "pelvic pain"],
    treatments: ["medications", "surgery"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "fibromyalgia": {
    name: "Fibromyalgia",
    description: "Fibromyalgia is a disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory, and mood issues.",
    symptoms: ["widespread pain", "fatigue", "sleep disturbances", "cognitive difficulties (fibro fog)", "headaches", "irritable bowel syndrome"],
    treatments: ["pain medications", "antidepressants", "antiseizure drugs", "physical therapy", "lifestyle modifications", "stress management"],
    specialties: ["Rheumatology", "Physical Medicine", "Pain Medicine"]
  },
  "flat feet in children": {
    name: "Flat Feet in Children and Young People",
    description: "Flat feet, or fallen arches, is a condition where the arches of the feet are flattened, allowing the entire sole to touch the ground. In children, it's often normal and may correct with age.",
    symptoms: ["flattened arches", "feet turning outward", "foot pain", "difficulty with shoes", "tired feet"],
    treatments: ["usually no treatment needed", "supportive shoes", "orthotics if causing problems", "stretching exercises", "surgery rarely needed"],
    specialties: ["Pediatrics", "Orthopedics", "Podiatry"]
  },
  "flat feet": {
    name: "Flat Feet",
    description: "Flat feet is a condition where the foot arches are flattened.",
    symptoms: ["flattened arches", "foot pain"],
    treatments: ["supportive shoes", "orthotics if needed"],
    specialties: ["Orthopedics", "Podiatry"]
  },
  "flu": {
    name: "Flu (Influenza)",
    description: "The flu is a contagious respiratory illness caused by influenza viruses. It can cause mild to severe illness and can lead to serious complications.",
    symptoms: ["fever", "cough", "sore throat", "runny or stuffy nose", "muscle or body aches", "headaches", "fatigue"],
    treatments: ["rest and fluids", "antiviral medications if started early", "fever reducers", "vaccination for prevention"],
    specialties: ["Infectious Disease", "Internal Medicine", "Pediatrics"]
  },
  "influenza": {
    name: "Flu",
    description: "Influenza is a viral respiratory illness.",
    symptoms: ["fever", "cough", "body aches"],
    treatments: ["rest", "antivirals", "vaccination"],
    specialties: ["Infectious Disease"]
  },
  "foetal alcohol syndrome": {
    name: "Foetal Alcohol Syndrome (FAS)",
    description: "Foetal alcohol syndrome is a condition that occurs in children whose mothers drank alcohol during pregnancy. It causes brain damage and growth problems.",
    symptoms: ["facial abnormalities", "growth problems", "intellectual disability", "behavioral problems", "learning difficulties"],
    treatments: ["early intervention", "educational support", "behavioral therapy", "treating associated conditions", "family support"],
    specialties: ["Pediatrics", "Developmental-Behavioral Pediatrics", "Genetics"]
  },
  "fetal alcohol syndrome": {
    name: "Foetal Alcohol Syndrome",
    description: "FAS is caused by alcohol exposure during pregnancy.",
    symptoms: ["developmental delays", "facial features", "learning problems"],
    treatments: ["early intervention", "supportive care"],
    specialties: ["Pediatrics"]
  },
  "food allergy": {
    name: "Food Allergy",
    description: "A food allergy is an immune system reaction that occurs soon after eating a certain food. Even a tiny amount of the allergy-causing food can trigger symptoms.",
    symptoms: ["hives", "itching", "swelling", "nausea", "vomiting", "diarrhea", "anaphylaxis in severe cases"],
    treatments: ["avoiding trigger foods", "antihistamines", "epinephrine for severe reactions", "allergy testing", "education"],
    specialties: ["Allergy & Immunology", "Pediatrics"]
  },
  "food poisoning": {
    name: "Food Poisoning",
    description: "Food poisoning is an illness caused by eating contaminated food. It's usually caused by bacteria, viruses, or parasites and can range from mild to severe.",
    symptoms: ["nausea", "vomiting", "diarrhea", "abdominal cramps", "fever", "dehydration"],
    treatments: ["rest and fluids", "oral rehydration solutions", "avoiding solid foods initially", "antibiotics if bacterial", "medical attention if severe"],
    specialties: ["Infectious Disease", "Gastroenterology", "Emergency Medicine"]
  },
  "fragility fracture of the hip": {
    name: "Fragility Fracture of the Hip",
    description: "A fragility fracture of the hip is a break in the hip bone that occurs from a fall from standing height or less. It's often associated with osteoporosis and is common in older adults.",
    symptoms: ["hip pain", "inability to bear weight", "swelling", "bruising", "leg may appear shorter or turned outward"],
    treatments: ["surgery (hip replacement or internal fixation)", "pain management", "physical therapy", "treating underlying osteoporosis", "preventing falls"],
    specialties: ["Orthopedics", "Geriatrics"]
  },
  "hip fracture": {
    name: "Hip Fracture",
    description: "A hip fracture is a break in the upper part of the thigh bone near the hip joint.",
    symptoms: ["hip pain", "inability to walk", "swelling"],
    treatments: ["surgery", "physical therapy"],
    specialties: ["Orthopedics"]
  },
  "frozen shoulder": {
    name: "Frozen Shoulder (Adhesive Capsulitis)",
    description: "Frozen shoulder is a condition that causes stiffness and pain in the shoulder joint. It develops gradually and can take years to fully resolve.",
    symptoms: ["shoulder pain", "stiffness", "limited range of motion", "pain that worsens at night"],
    treatments: ["physical therapy", "pain medications", "corticosteroid injections", "manipulation under anesthesia", "surgery in severe cases"],
    specialties: ["Orthopedics", "Physical Medicine", "Sports Medicine"]
  },
  "adhesive capsulitis": {
    name: "Frozen Shoulder",
    description: "Adhesive capsulitis is the medical term for frozen shoulder.",
    symptoms: ["shoulder stiffness", "pain", "limited movement"],
    treatments: ["physical therapy", "injections"],
    specialties: ["Orthopedics"]
  },
  "functional neurological disorder": {
    name: "Functional Neurological Disorder (FND)",
    description: "Functional neurological disorder is a condition where patients experience neurological symptoms that can't be explained by a traditional neurological disease. It's a real condition that requires specialized care.",
    symptoms: ["varies widely", "weakness", "movement disorders", "seizure-like episodes", "sensory symptoms", "speech problems"],
    treatments: ["specialized rehabilitation", "psychological therapy", "physical therapy", "education about condition", "treating associated conditions"],
    specialties: ["Neurology", "Physical Medicine", "Psychology"]
  },
  "fnd": {
    name: "Functional Neurological Disorder",
    description: "FND is a condition with neurological symptoms not explained by traditional disease.",
    symptoms: ["varies", "weakness", "movement problems"],
    treatments: ["rehabilitation", "therapy"],
    specialties: ["Neurology"]
  },
  "fungal nail infection": {
    name: "Fungal Nail Infection (Onychomycosis)",
    description: "A fungal nail infection is a common condition that begins as a white or yellow spot under the tip of the fingernail or toenail. As it spreads deeper, it can cause discoloration and thickening.",
    symptoms: ["thickened nails", "discolored nails (yellow, brown, white)", "brittle or crumbly nails", "distorted shape", "slight odor"],
    treatments: ["antifungal medications (oral or topical)", "nail removal in severe cases", "laser treatment", "good foot hygiene"],
    specialties: ["Dermatology", "Podiatry"]
  },
  "onychomycosis": {
    name: "Fungal Nail Infection",
    description: "Onychomycosis is a fungal infection of the nails.",
    symptoms: ["thickened nails", "discoloration", "brittle nails"],
    treatments: ["antifungal medications"],
    specialties: ["Dermatology"]
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
    key.replace(/\s+and\s+/gi, ' & ')
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

