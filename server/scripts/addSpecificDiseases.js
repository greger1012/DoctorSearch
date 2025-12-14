/**
 * Script to add specific diseases from NHS Inform with detailed descriptions
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

// Specific diseases to add/update with detailed descriptions
const specificDiseases = {
  "abdominal aortic aneurysm": {
    name: "Abdominal Aortic Aneurysm",
    description: "An abdominal aortic aneurysm (AAA) is a swelling of the aorta, the main blood vessel that runs from the heart down through the chest and abdomen. It can be life-threatening if it bursts.",
    symptoms: ["often no symptoms until rupture", "pulsating feeling in abdomen", "persistent back pain", "abdominal pain", "sudden severe pain if ruptured"],
    treatments: ["monitoring for small aneurysms", "surgery (open repair or endovascular repair) for larger aneurysms", "lifestyle changes (quitting smoking, controlling blood pressure)"],
    specialties: ["Vascular Surgery", "Cardiology"]
  },
  "achilles tendinopathy": {
    name: "Achilles Tendinopathy",
    description: "Achilles tendinopathy is a condition that causes pain, swelling, and stiffness of the Achilles tendon, which connects the calf muscles to the heel bone.",
    symptoms: ["pain and stiffness along the Achilles tendon", "swelling", "pain that worsens with activity", "thickening of the tendon"],
    treatments: ["rest and ice", "physical therapy", "orthotics", "pain medications", "eccentric strengthening exercises", "surgery in severe cases"],
    specialties: ["Orthopedics", "Sports Medicine", "Physical Medicine"]
  },
  "acne": {
    name: "Acne",
    description: "Acne is a common skin condition that occurs when hair follicles become plugged with oil and dead skin cells. It most commonly affects teenagers but can occur at any age.",
    symptoms: ["whiteheads", "blackheads", "pimples", "oily skin", "redness", "scarring in severe cases"],
    treatments: ["topical treatments (benzoyl peroxide, retinoids)", "oral antibiotics", "hormonal therapy", "isotretinoin for severe cases", "light therapy"],
    specialties: ["Dermatology"]
  },
  "acute cholecystitis": {
    name: "Acute Cholecystitis",
    description: "Acute cholecystitis is inflammation of the gallbladder, usually caused by gallstones blocking the cystic duct. It causes severe abdominal pain and requires prompt medical attention.",
    symptoms: ["severe pain in upper right abdomen", "pain that may radiate to shoulder or back", "fever", "nausea and vomiting", "tenderness when touching abdomen"],
    treatments: ["hospitalization", "antibiotics", "pain medications", "fasting to rest gallbladder", "surgery (cholecystectomy) to remove gallbladder"],
    specialties: ["General Surgery", "Gastroenterology", "Emergency Medicine"]
  },
  "acute lymphoblastic leukaemia": {
    name: "Acute Lymphoblastic Leukaemia (ALL)",
    description: "Acute lymphoblastic leukaemia is a type of cancer that affects white blood cells. It progresses quickly and requires immediate treatment. It's the most common type of leukaemia in children.",
    symptoms: ["fatigue", "frequent infections", "bruising and bleeding easily", "bone pain", "swollen lymph nodes", "fever", "weight loss"],
    treatments: ["chemotherapy", "radiation therapy", "stem cell transplant", "targeted therapy", "supportive care"],
    specialties: ["Hematology-Oncology", "Pediatric Hematology-Oncology"]
  },
  "acute lymphoblastic leukaemia: children": {
    name: "Acute Lymphoblastic Leukaemia in Children",
    description: "ALL is the most common type of childhood cancer, affecting white blood cells. It requires specialized pediatric oncology care.",
    symptoms: ["fatigue", "pale skin", "frequent infections", "bruising", "bone pain", "fever"],
    treatments: ["pediatric chemotherapy protocols", "stem cell transplant", "supportive care", "long-term follow-up"],
    specialties: ["Pediatric Hematology-Oncology", "Hematology-Oncology"]
  },
  "acute myeloid leukaemia": {
    name: "Acute Myeloid Leukaemia (AML)",
    description: "Acute myeloid leukaemia is a cancer of the blood and bone marrow that affects myeloid cells. It progresses rapidly and requires immediate treatment.",
    symptoms: ["fatigue", "fever", "frequent infections", "easy bruising and bleeding", "shortness of breath", "bone pain"],
    treatments: ["chemotherapy", "stem cell transplant", "targeted therapy", "supportive care", "clinical trials"],
    specialties: ["Hematology-Oncology"]
  },
  "acute myeloid leukaemia: children": {
    name: "Acute Myeloid Leukaemia in Children",
    description: "AML in children is a rapidly progressing blood cancer requiring specialized pediatric oncology treatment.",
    symptoms: ["fatigue", "fever", "infections", "bruising", "bone pain"],
    treatments: ["pediatric chemotherapy", "stem cell transplant", "targeted therapy"],
    specialties: ["Pediatric Hematology-Oncology"]
  },
  "acute pancreatitis": {
    name: "Acute Pancreatitis",
    description: "Acute pancreatitis is sudden inflammation of the pancreas, often caused by gallstones or alcohol. It can be life-threatening and requires immediate medical care.",
    symptoms: ["severe upper abdominal pain", "pain radiating to back", "nausea and vomiting", "fever", "rapid pulse", "tenderness when touching abdomen"],
    treatments: ["hospitalization", "fasting to rest pancreas", "IV fluids", "pain medications", "treating underlying cause", "surgery if complications occur"],
    specialties: ["Gastroenterology", "General Surgery", "Emergency Medicine"]
  },
  "acute respiratory infection": {
    name: "Acute Respiratory Infection (ARI)",
    description: "Acute respiratory infections are infections that affect the breathing passages, including the nose, throat, airways, and lungs. They can be caused by viruses or bacteria.",
    symptoms: ["cough", "sore throat", "runny or stuffy nose", "fever", "shortness of breath", "chest congestion"],
    treatments: ["rest and fluids", "over-the-counter medications for symptoms", "antibiotics if bacterial", "antiviral medications for some viral infections"],
    specialties: ["Pulmonology", "Internal Medicine", "Infectious Disease"]
  },
  "ari": {
    name: "Acute Respiratory Infection",
    description: "ARI is an infection affecting the respiratory system, including the nose, throat, and lungs.",
    symptoms: ["cough", "sore throat", "congestion", "fever"],
    treatments: ["symptomatic treatment", "antibiotics if bacterial"],
    specialties: ["Pulmonology", "Internal Medicine"]
  },
  "addison's disease": {
    name: "Addison's disease",
    description: "Addison's disease, also known as primary adrenal insufficiency, is a rare disorder where the adrenal glands don't produce enough cortisol and often aldosterone. This occurs when the adrenal cortex is damaged, usually by an autoimmune response.",
    symptoms: ["fatigue and weakness", "weight loss and decreased appetite", "darkening of the skin (hyperpigmentation)", "low blood pressure", "salt craving", "nausea and vomiting", "muscle and joint pain"],
    treatments: ["hormone replacement therapy with corticosteroids", "lifelong medication to replace missing hormones", "dietary adjustments including increased salt intake"],
    specialties: ["Endocrinology"]
  },
  "addisons disease": {
    name: "Addison's disease",
    description: "Addison's disease is a rare disorder where the adrenal glands don't produce enough hormones, particularly cortisol and aldosterone.",
    symptoms: ["fatigue", "weight loss", "darkening of the skin", "low blood pressure"],
    treatments: ["hormone replacement therapy"],
    specialties: ["Endocrinology"]
  },
  "adenomyosis": {
    name: "Adenomyosis",
    description: "Adenomyosis is a condition where the inner lining of the uterus (endometrium) breaks through the muscle wall of the uterus. It can cause heavy, painful periods.",
    symptoms: ["heavy or prolonged menstrual bleeding", "severe menstrual cramps", "chronic pelvic pain", "pain during intercourse", "enlarged uterus"],
    treatments: ["anti-inflammatory medications", "hormonal treatments", "uterine artery embolization", "endometrial ablation", "hysterectomy in severe cases"],
    specialties: ["Obstetrics & Gynecology"]
  },
  "alcohol-related liver disease": {
    name: "Alcohol-Related Liver Disease",
    description: "Alcohol-related liver disease is liver damage caused by excessive alcohol consumption over many years. It can progress from fatty liver to hepatitis to cirrhosis.",
    symptoms: ["fatigue", "nausea", "abdominal pain", "jaundice (yellowing of skin)", "swelling in legs and abdomen", "confusion in advanced stages"],
    treatments: ["stopping alcohol consumption", "nutritional support", "medications to manage complications", "liver transplant in severe cases"],
    specialties: ["Gastroenterology", "Hepatology", "Addiction Medicine"]
  },
  "allergic rhinitis": {
    name: "Allergic Rhinitis",
    description: "Allergic rhinitis, also known as hay fever, is inflammation of the inside of the nose caused by an allergic reaction to allergens such as pollen, dust mites, or animal dander.",
    symptoms: ["sneezing", "runny or stuffy nose", "itchy eyes, nose, or throat", "watery eyes", "postnasal drip"],
    treatments: ["avoiding allergens", "antihistamines", "nasal corticosteroids", "decongestants", "allergy shots (immunotherapy)"],
    specialties: ["Allergy & Immunology", "Otolaryngology"]
  },
  "allergies": {
    name: "Allergies",
    description: "Allergies are an immune system reaction to substances that are typically harmless to most people. Common allergens include pollen, food, medications, and insect stings.",
    symptoms: ["sneezing", "runny nose", "itchy eyes", "skin rash", "swelling", "difficulty breathing in severe cases"],
    treatments: ["avoiding allergens", "antihistamines", "corticosteroids", "epinephrine for severe reactions", "allergy shots"],
    specialties: ["Allergy & Immunology"]
  },
  "alzheimer's disease": {
    name: "Alzheimer's disease",
    description: "Alzheimer's disease is a progressive brain disorder that slowly destroys memory and thinking skills, and eventually the ability to carry out simple tasks. It is the most common cause of dementia.",
    symptoms: ["memory loss", "difficulty with problem-solving", "confusion about time and place", "trouble understanding visual images", "problems with words in speaking or writing", "misplacing things", "poor judgment", "withdrawal from social activities"],
    treatments: ["medications to slow progression", "cognitive training", "supportive care", "lifestyle modifications"],
    specialties: ["Neurology", "Geriatrics"]
  },
  "alzheimers disease": {
    name: "Alzheimer's disease",
    description: "Alzheimer's disease is a progressive brain disorder that causes memory loss and cognitive decline, and is the most common form of dementia.",
    symptoms: ["memory loss", "confusion", "difficulty with daily tasks"],
    treatments: ["medications", "cognitive support"],
    specialties: ["Neurology"]
  },
  "anal cancer": {
    name: "Anal Cancer",
    description: "Anal cancer is a rare type of cancer that forms in tissues of the anus. It's often associated with human papillomavirus (HPV) infection.",
    symptoms: ["bleeding from anus", "pain or pressure in anal area", "itching", "lump near anus", "change in bowel habits"],
    treatments: ["chemotherapy", "radiation therapy", "surgery", "targeted therapy"],
    specialties: ["Oncology", "Colon and Rectal Surgery", "Radiation Oncology"]
  },
  "anaphylaxis": {
    name: "Anaphylaxis",
    description: "Anaphylaxis is a severe, potentially life-threatening allergic reaction that can occur within seconds or minutes of exposure to an allergen. It requires immediate emergency treatment.",
    symptoms: ["difficulty breathing", "swelling of face and throat", "rapid, weak pulse", "skin rash", "nausea and vomiting", "dizziness", "loss of consciousness"],
    treatments: ["immediate epinephrine injection", "emergency medical care", "antihistamines", "corticosteroids", "oxygen therapy"],
    specialties: ["Emergency Medicine", "Allergy & Immunology"]
  },
  "angina": {
    name: "Angina",
    description: "Angina is chest pain or discomfort caused by reduced blood flow to the heart muscle. It's a symptom of coronary artery disease.",
    symptoms: ["chest pain or pressure", "pain in arms, neck, jaw, shoulder, or back", "shortness of breath", "fatigue", "nausea"],
    treatments: ["nitroglycerin", "lifestyle changes", "medications (beta blockers, calcium channel blockers)", "angioplasty", "coronary artery bypass surgery"],
    specialties: ["Cardiology", "Interventional Cardiology"]
  },
  "angioedema": {
    name: "Angioedema",
    description: "Angioedema is swelling beneath the skin, often around the eyes and lips, and sometimes in the throat. It can be caused by allergies or hereditary factors.",
    symptoms: ["swelling of face, lips, tongue, or throat", "swelling of hands, feet, or genitals", "difficulty breathing if throat is affected", "abdominal pain"],
    treatments: ["antihistamines", "corticosteroids", "epinephrine for severe cases", "avoiding triggers", "medications for hereditary angioedema"],
    specialties: ["Allergy & Immunology", "Emergency Medicine", "Dermatology"]
  },
  "ankle sprain": {
    name: "Ankle Sprain",
    description: "An ankle sprain is an injury to the ligaments that support the ankle. It occurs when the ankle is twisted or turned in an awkward way.",
    symptoms: ["pain", "swelling", "bruising", "tenderness", "instability", "difficulty walking"],
    treatments: ["RICE (rest, ice, compression, elevation)", "pain medications", "physical therapy", "ankle brace or support", "surgery in severe cases"],
    specialties: ["Orthopedics", "Sports Medicine", "Emergency Medicine"]
  },
  "ankle avulsion fracture": {
    name: "Ankle Avulsion Fracture",
    description: "An ankle avulsion fracture occurs when a small piece of bone is pulled away from the main bone by a tendon or ligament. It's common in athletes.",
    symptoms: ["pain at the site of injury", "swelling", "bruising", "difficulty moving ankle", "tenderness"],
    treatments: ["rest and immobilization", "ice", "pain medications", "crutches if needed", "physical therapy", "surgery if fragment is large"],
    specialties: ["Orthopedics", "Sports Medicine"]
  },
  "ankylosing spondylitis": {
    name: "Ankylosing Spondylitis",
    description: "Ankylosing spondylitis is a type of arthritis that primarily affects the spine, causing inflammation and eventual fusion of vertebrae. It can also affect other joints.",
    symptoms: ["chronic back pain and stiffness", "pain that improves with exercise", "reduced flexibility in spine", "fatigue", "pain in other joints"],
    treatments: ["nonsteroidal anti-inflammatory drugs", "disease-modifying antirheumatic drugs", "biologics", "physical therapy", "exercise"],
    specialties: ["Rheumatology"]
  },
  "anorexia nervosa": {
    name: "Anorexia Nervosa",
    description: "Anorexia nervosa is an eating disorder characterized by an intense fear of gaining weight, leading to severe food restriction and dangerously low body weight.",
    symptoms: ["extreme weight loss", "fear of gaining weight", "distorted body image", "restricted eating", "excessive exercise", "fatigue", "hair loss"],
    treatments: ["nutritional rehabilitation", "psychotherapy", "family therapy", "medications for co-occurring conditions", "hospitalization in severe cases"],
    specialties: ["Psychiatry", "Psychology", "Nutrition", "Adolescent Medicine"]
  },
  "anorexia": {
    name: "Anorexia Nervosa",
    description: "Anorexia is an eating disorder involving severe food restriction and fear of weight gain.",
    symptoms: ["extreme weight loss", "fear of gaining weight", "restricted eating"],
    treatments: ["nutritional support", "psychotherapy", "medical monitoring"],
    specialties: ["Psychiatry"]
  },
  "anxiety disorders in children and young people": {
    name: "Anxiety Disorders in Children and Young People",
    description: "Anxiety disorders in children and young people involve excessive worry, fear, or nervousness that interferes with daily activities, school, or relationships.",
    symptoms: ["excessive worry", "irritability", "difficulty concentrating", "sleep problems", "physical symptoms (headaches, stomachaches)", "avoidance of situations"],
    treatments: ["cognitive behavioral therapy", "family therapy", "medications if needed", "school support", "lifestyle modifications"],
    specialties: ["Child Psychiatry", "Pediatrics", "Psychology"]
  },
  "aplastic anaemia": {
    name: "Aplastic Anaemia",
    description: "Aplastic anaemia is a rare condition where the bone marrow fails to produce enough blood cells. It can be acquired or inherited.",
    symptoms: ["fatigue", "shortness of breath", "frequent infections", "easy bruising and bleeding", "pale skin", "rapid heart rate"],
    treatments: ["blood transfusions", "immunosuppressive therapy", "bone marrow transplant", "antibiotics to prevent infections", "growth factors"],
    specialties: ["Hematology"]
  },
  "aplastic anemia": {
    name: "Aplastic Anaemia",
    description: "Aplastic anaemia is a condition where bone marrow fails to produce enough blood cells.",
    symptoms: ["fatigue", "infections", "bleeding"],
    treatments: ["blood transfusions", "bone marrow transplant"],
    specialties: ["Hematology"]
  },
  "appendicitis": {
    name: "Appendicitis",
    description: "Appendicitis is inflammation of the appendix, a small pouch attached to the large intestine. It requires prompt medical attention and often surgery.",
    symptoms: ["sudden pain in lower right abdomen", "pain that worsens with movement", "nausea and vomiting", "loss of appetite", "fever", "constipation or diarrhea"],
    treatments: ["surgery to remove appendix (appendectomy)", "antibiotics", "pain medications"],
    specialties: ["General Surgery", "Emergency Medicine"]
  },
  "arterial thrombosis": {
    name: "Arterial Thrombosis",
    description: "Arterial thrombosis is the formation of a blood clot in an artery, which can block blood flow and cause serious complications like heart attack or stroke.",
    symptoms: ["sudden pain", "coldness in affected area", "pale skin", "weak or absent pulse", "numbness or tingling", "muscle weakness"],
    treatments: ["anticoagulant medications", "thrombolytic therapy", "surgical removal of clot", "angioplasty", "treating underlying causes"],
    specialties: ["Vascular Surgery", "Cardiology", "Emergency Medicine", "Hematology"]
  },
  "arthritis": {
    name: "Arthritis",
    description: "Arthritis is inflammation of one or more joints, causing pain and stiffness that can worsen with age. The most common types are osteoarthritis and rheumatoid arthritis.",
    symptoms: ["joint pain", "stiffness", "swelling", "reduced range of motion", "redness around joints"],
    treatments: ["pain medications", "anti-inflammatory drugs", "physical therapy", "joint injections", "surgery in severe cases"],
    specialties: ["Rheumatology", "Orthopedics"]
  },
  "asbestosis": {
    name: "Asbestosis",
    description: "Asbestosis is a chronic lung disease caused by inhaling asbestos fibers. It causes scarring of lung tissue and breathing difficulties.",
    symptoms: ["shortness of breath", "persistent dry cough", "chest tightness", "loss of appetite", "fingertips and toes that appear wider and rounder (clubbing)"],
    treatments: ["oxygen therapy", "pulmonary rehabilitation", "medications to help breathing", "lung transplant in severe cases", "preventing further exposure"],
    specialties: ["Pulmonology", "Occupational Medicine"]
  },
  "asthma": {
    name: "Asthma",
    description: "Asthma is a chronic condition in which the airways become inflamed, narrow, and produce extra mucus, making breathing difficult.",
    symptoms: ["shortness of breath", "chest tightness", "wheezing", "coughing, especially at night"],
    treatments: ["inhalers (bronchodilators and corticosteroids)", "avoiding triggers", "allergy medications", "lifestyle modifications"],
    specialties: ["Pulmonology", "Allergy & Immunology"]
  },
  "ataxia": {
    name: "Ataxia",
    description: "Ataxia is a lack of muscle coordination that affects speech, eye movements, and the ability to swallow, walk, and perform fine motor tasks. It can be caused by various neurological conditions.",
    symptoms: ["poor coordination", "unsteady walk", "difficulty with fine motor tasks", "slurred speech", "difficulty swallowing", "involuntary eye movements"],
    treatments: ["treating underlying cause", "physical therapy", "occupational therapy", "speech therapy", "medications to manage symptoms"],
    specialties: ["Neurology"]
  },
  "atopic eczema": {
    name: "Atopic Eczema",
    description: "Atopic eczema, also known as atopic dermatitis, is a chronic skin condition that makes the skin red, itchy, and inflamed. It's common in children but can occur at any age.",
    symptoms: ["dry, sensitive skin", "red, inflamed skin", "severe itching", "dark colored patches", "rough, scaly patches", "cracking and weeping"],
    treatments: ["moisturizers", "topical corticosteroids", "antihistamines", "avoiding triggers", "phototherapy", "immunosuppressants for severe cases"],
    specialties: ["Dermatology", "Allergy & Immunology"]
  },
  "atrial fibrillation": {
    name: "Atrial Fibrillation",
    description: "Atrial fibrillation is an irregular and often rapid heart rate that can increase the risk of stroke, heart failure, and other heart-related complications.",
    symptoms: ["irregular heartbeat", "palpitations", "weakness", "reduced ability to exercise", "fatigue", "lightheadedness", "shortness of breath", "chest pain"],
    treatments: ["medications to control heart rate", "anticoagulants to prevent stroke", "cardioversion", "catheter ablation", "pacemaker if needed"],
    specialties: ["Cardiology", "Electrophysiology"]
  },
  "attention deficit hyperactivity disorder": {
    name: "Attention Deficit Hyperactivity Disorder (ADHD)",
    description: "ADHD is a neurodevelopmental disorder characterized by persistent patterns of inattention, hyperactivity, and impulsivity that interfere with functioning or development.",
    symptoms: ["difficulty paying attention", "hyperactivity", "impulsiveness", "forgetfulness", "difficulty organizing tasks", "trouble following instructions"],
    treatments: ["behavioral therapy", "medications such as stimulants", "educational support", "lifestyle modifications", "parent training"],
    specialties: ["Psychiatry", "Pediatrics", "Child Psychiatry"]
  },
  "adhd": {
    name: "ADHD",
    description: "ADHD is a condition that affects attention, hyperactivity, and impulsivity.",
    symptoms: ["difficulty focusing", "hyperactivity", "impulsiveness"],
    treatments: ["therapy", "medications"],
    specialties: ["Psychiatry", "Pediatrics"]
  },
  "autism": {
    name: "Autism Spectrum Disorder",
    description: "Autism spectrum disorder is a developmental disorder that affects communication and behavior. It includes a wide range of symptoms and severity levels.",
    symptoms: ["difficulty with social interaction", "repetitive behaviors", "restricted interests", "communication challenges", "sensory sensitivities"],
    treatments: ["behavioral therapy", "speech therapy", "occupational therapy", "educational support", "medications for co-occurring conditions"],
    specialties: ["Pediatrics", "Child Psychiatry", "Developmental-Behavioral Pediatrics"]
  },
  "autism spectrum disorder": {
    name: "Autism Spectrum Disorder",
    description: "Autism is a developmental disorder affecting social communication and behavior.",
    symptoms: ["social challenges", "repetitive behaviors", "communication difficulties"],
    treatments: ["therapy", "educational support"],
    specialties: ["Pediatrics", "Psychiatry"]
  }
};

// Merge with existing descriptions
for (const [key, value] of Object.entries(specificDiseases)) {
  const lowerKey = key.toLowerCase();
  allDescriptions[lowerKey] = value;
  
  // Also add variations
  const variations = [
    key.replace(/'/g, ''),
    key.replace(/'/g, 's'),
    key.replace(/:/g, ''),
    key.replace(/\s+/g, '-'),
    key.replace(/\s+/g, ' ')
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
console.log(`   New/updated conditions: ${Object.keys(specificDiseases).length}`);
console.log(`   File: ${outputPath}`);

