/**
 * Script to add more specific diseases from NHS Inform with detailed descriptions
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
  "back problems": {
    name: "Back Problems",
    description: "Back problems encompass a wide range of conditions affecting the spine, muscles, and nerves of the back. Common issues include lower back pain, sciatica, herniated discs, and spinal stenosis.",
    symptoms: ["back pain", "stiffness", "muscle spasms", "limited range of motion", "pain radiating to legs", "numbness or tingling"],
    treatments: ["pain medications", "physical therapy", "exercise", "heat or cold therapy", "injections", "surgery in severe cases"],
    specialties: ["Orthopedics", "Physical Medicine", "Neurosurgery"]
  },
  "bacterial vaginosis": {
    name: "Bacterial Vaginosis",
    description: "Bacterial vaginosis is a common vaginal infection caused by an imbalance of bacteria in the vagina. It's not a sexually transmitted infection but can increase the risk of other infections.",
    symptoms: ["thin, gray, white, or green vaginal discharge", "fishy odor", "vaginal itching", "burning during urination"],
    treatments: ["antibiotics (metronidazole or clindamycin)", "probiotics", "avoiding douching"],
    specialties: ["Obstetrics & Gynecology", "Infectious Disease"]
  },
  "becker muscular dystrophy": {
    name: "Becker Muscular Dystrophy",
    description: "Becker muscular dystrophy is a genetic disorder that causes progressive muscle weakness and wasting. It's similar to Duchenne muscular dystrophy but progresses more slowly.",
    symptoms: ["progressive muscle weakness", "difficulty walking", "frequent falls", "muscle cramps", "heart problems", "breathing difficulties"],
    treatments: ["physical therapy", "respiratory support", "cardiac monitoring", "medications to slow progression", "assistive devices"],
    specialties: ["Neurology", "Physical Medicine", "Cardiology", "Pulmonology"]
  },
  "benign prostate enlargement": {
    name: "Benign Prostate Enlargement (BPH)",
    description: "Benign prostate enlargement, also known as benign prostatic hyperplasia (BPH), is a non-cancerous enlargement of the prostate gland that commonly affects older men.",
    symptoms: ["frequent urination", "difficulty starting urination", "weak urine stream", "dribbling at end of urination", "inability to empty bladder completely", "urinary urgency"],
    treatments: ["medications (alpha blockers, 5-alpha reductase inhibitors)", "minimally invasive procedures", "surgery (TURP) in severe cases"],
    specialties: ["Urology"]
  },
  "bph": {
    name: "Benign Prostate Enlargement",
    description: "BPH is a non-cancerous enlargement of the prostate gland affecting older men.",
    symptoms: ["frequent urination", "weak stream", "difficulty urinating"],
    treatments: ["medications", "surgery if needed"],
    specialties: ["Urology"]
  },
  "bile duct cancer": {
    name: "Bile Duct Cancer (Cholangiocarcinoma)",
    description: "Bile duct cancer, or cholangiocarcinoma, is a rare cancer that forms in the bile ducts, which carry bile from the liver to the small intestine. It can occur inside or outside the liver.",
    symptoms: ["jaundice (yellowing of skin)", "abdominal pain", "weight loss", "fever", "itching", "dark urine", "pale stools"],
    treatments: ["surgery to remove tumor", "chemotherapy", "radiation therapy", "liver transplant in some cases", "palliative care"],
    specialties: ["Oncology", "Hepatology", "Surgical Oncology"]
  },
  "cholangiocarcinoma": {
    name: "Bile Duct Cancer",
    description: "Cholangiocarcinoma is a rare cancer of the bile ducts.",
    symptoms: ["jaundice", "abdominal pain", "weight loss"],
    treatments: ["surgery", "chemotherapy", "radiation"],
    specialties: ["Oncology", "Hepatology"]
  },
  "binge eating disorder": {
    name: "Binge Eating Disorder (BED)",
    description: "Binge eating disorder is a serious eating disorder characterized by recurrent episodes of eating large quantities of food, often quickly and to the point of discomfort, with feelings of loss of control and distress.",
    symptoms: ["eating unusually large amounts of food", "eating even when not hungry", "eating rapidly during binge episodes", "eating alone due to embarrassment", "feelings of guilt or distress after binging"],
    treatments: ["psychotherapy (CBT)", "interpersonal therapy", "dialectical behavior therapy", "medications (antidepressants)", "nutritional counseling"],
    specialties: ["Psychiatry", "Psychology", "Nutrition"]
  },
  "bed": {
    name: "Binge Eating Disorder",
    description: "BED is an eating disorder involving recurrent episodes of excessive eating.",
    symptoms: ["eating large amounts", "loss of control", "distress after eating"],
    treatments: ["therapy", "medications"],
    specialties: ["Psychiatry"]
  },
  "bipolar disorder": {
    name: "Bipolar Disorder",
    description: "Bipolar disorder is a mental health condition that causes extreme mood swings that include emotional highs (mania or hypomania) and lows (depression).",
    symptoms: ["manic episodes (elevated mood, increased energy)", "depressive episodes (sadness, hopelessness)", "rapid mood changes", "irritability", "sleep disturbances", "impulsive behavior"],
    treatments: ["mood stabilizers", "antipsychotics", "antidepressants", "psychotherapy", "lifestyle management"],
    specialties: ["Psychiatry"]
  },
  "bladder cancer": {
    name: "Bladder Cancer",
    description: "Bladder cancer is a type of cancer that begins in the cells of the bladder, the organ that stores urine. It's more common in older adults and smokers.",
    symptoms: ["blood in urine", "painful urination", "frequent urination", "pelvic pain", "back pain"],
    treatments: ["surgery (transurethral resection, cystectomy)", "chemotherapy", "radiation therapy", "immunotherapy", "BCG therapy"],
    specialties: ["Urology", "Oncology", "Surgical Oncology"]
  },
  "blood poisoning": {
    name: "Blood Poisoning (Sepsis)",
    description: "Sepsis, also known as blood poisoning, is a life-threatening condition that occurs when the body's response to an infection causes injury to its own tissues and organs. It requires immediate medical attention.",
    symptoms: ["fever or low body temperature", "rapid heart rate", "rapid breathing", "confusion", "extreme pain or discomfort", "clammy or sweaty skin"],
    treatments: ["immediate antibiotics", "IV fluids", "oxygen therapy", "vasopressors to maintain blood pressure", "treatment of underlying infection", "intensive care"],
    specialties: ["Emergency Medicine", "Critical Care", "Infectious Disease"]
  },
  "sepsis": {
    name: "Sepsis",
    description: "Sepsis is a life-threatening response to infection that can cause organ failure.",
    symptoms: ["fever", "rapid heart rate", "confusion", "extreme pain"],
    treatments: ["immediate antibiotics", "IV fluids", "intensive care"],
    specialties: ["Emergency Medicine", "Critical Care"]
  },
  "bone cancer": {
    name: "Bone Cancer",
    description: "Bone cancer is a rare type of cancer that begins in the bones. Primary bone cancer starts in the bone itself, while secondary bone cancer spreads from elsewhere.",
    symptoms: ["bone pain", "swelling near affected bone", "weakened bones leading to fractures", "fatigue", "unintended weight loss"],
    treatments: ["surgery to remove tumor", "chemotherapy", "radiation therapy", "targeted therapy", "limb-sparing surgery when possible"],
    specialties: ["Oncology", "Orthopedic Surgery", "Surgical Oncology"]
  },
  "bowel cancer": {
    name: "Bowel Cancer (Colorectal Cancer)",
    description: "Bowel cancer, also known as colorectal cancer, is cancer that starts in the colon or rectum. It's one of the most common types of cancer and is highly treatable when caught early.",
    symptoms: ["changes in bowel habits", "blood in stool", "persistent abdominal discomfort", "unexplained weight loss", "fatigue", "feeling that bowel doesn't empty completely"],
    treatments: ["surgery to remove tumor", "chemotherapy", "radiation therapy", "targeted therapy", "immunotherapy"],
    specialties: ["Oncology", "Gastroenterology", "Surgical Oncology", "Colon and Rectal Surgery"]
  },
  "bowel incontinence": {
    name: "Bowel Incontinence",
    description: "Bowel incontinence, also called fecal incontinence, is the inability to control bowel movements, causing stool to leak unexpectedly from the rectum.",
    symptoms: ["inability to control bowel movements", "leakage of stool", "urgency to defecate", "diarrhea"],
    treatments: ["dietary changes", "medications to control diarrhea", "bowel training", "pelvic floor exercises", "biofeedback", "surgery in severe cases"],
    specialties: ["Gastroenterology", "Colon and Rectal Surgery", "Urogynecology"]
  },
  "fecal incontinence": {
    name: "Bowel Incontinence",
    description: "Fecal incontinence is the inability to control bowel movements.",
    symptoms: ["uncontrolled stool leakage", "urgency"],
    treatments: ["dietary changes", "medications", "pelvic floor exercises"],
    specialties: ["Gastroenterology"]
  },
  "bowel polyps": {
    name: "Bowel Polyps",
    description: "Bowel polyps are small growths on the inner lining of the colon or rectum. Most are harmless, but some can develop into cancer over time.",
    symptoms: ["often no symptoms", "rectal bleeding", "blood in stool", "changes in bowel habits", "abdominal pain"],
    treatments: ["polypectomy (removal during colonoscopy)", "surgical removal for larger polyps", "regular screening colonoscopies"],
    specialties: ["Gastroenterology", "Colon and Rectal Surgery"]
  },
  "bow legs and knock knees in children": {
    name: "Bow Legs and Knock Knees in Children",
    description: "Bow legs and knock knees are common conditions in children where the legs curve outward (bow legs) or inward (knock knees). Most cases are normal and correct themselves as the child grows.",
    symptoms: ["legs curving outward (bow legs)", "knees pointing inward (knock knees)", "awkward walking", "knee pain in some cases"],
    treatments: ["observation (most correct naturally)", "physical therapy", "braces in rare cases", "surgery only in severe persistent cases"],
    specialties: ["Pediatrics", "Orthopedics", "Pediatric Orthopedics"]
  },
  "bow legs": {
    name: "Bow Legs",
    description: "Bow legs is a condition where legs curve outward, common in young children and usually corrects naturally.",
    symptoms: ["outward curving of legs", "awkward gait"],
    treatments: ["observation", "rarely requires treatment"],
    specialties: ["Pediatrics", "Orthopedics"]
  },
  "knock knees": {
    name: "Knock Knees",
    description: "Knock knees is a condition where knees point inward, common in children and usually corrects naturally.",
    symptoms: ["knees pointing inward", "awkward walking"],
    treatments: ["observation", "rarely requires treatment"],
    specialties: ["Pediatrics", "Orthopedics"]
  },
  "brain stem death": {
    name: "Brain Stem Death",
    description: "Brain stem death is the irreversible loss of all brain stem functions. It's a legal definition of death in many countries, meaning the person has died even if the heart is still beating with life support.",
    symptoms: ["no brain stem reflexes", "no response to stimuli", "no breathing without ventilator", "fixed and dilated pupils"],
    treatments: ["confirmation through clinical tests", "organ donation may be possible"],
    specialties: ["Neurology", "Critical Care", "Intensive Care"]
  },
  "brain tumours": {
    name: "Brain Tumours",
    description: "Brain tumours are abnormal growths of cells in the brain. They can be benign (non-cancerous) or malignant (cancerous). Symptoms and treatment depend on the type, location, and size of the tumour.",
    symptoms: ["headaches", "seizures", "vision problems", "personality changes", "memory problems", "nausea and vomiting", "difficulty with balance"],
    treatments: ["surgery to remove tumour", "radiation therapy", "chemotherapy", "targeted therapy", "rehabilitation"],
    specialties: ["Neurosurgery", "Neurology", "Oncology", "Radiation Oncology"]
  },
  "brain tumors": {
    name: "Brain Tumours",
    description: "Brain tumours are abnormal growths in the brain that can be benign or malignant.",
    symptoms: ["headaches", "seizures", "vision problems"],
    treatments: ["surgery", "radiation", "chemotherapy"],
    specialties: ["Neurosurgery", "Oncology"]
  },
  "brain tumours: children": {
    name: "Brain Tumours in Children",
    description: "Brain tumours in children are the second most common type of childhood cancer. They require specialized pediatric neuro-oncology care.",
    symptoms: ["headaches", "nausea and vomiting", "vision problems", "balance problems", "seizures", "behavioral changes"],
    treatments: ["pediatric neurosurgery", "radiation therapy (age-appropriate)", "chemotherapy", "rehabilitation", "long-term follow-up"],
    specialties: ["Pediatric Neurosurgery", "Pediatric Oncology", "Neurology"]
  },
  "brain tumours: teenagers and young adults": {
    name: "Brain Tumours in Teenagers and Young Adults",
    description: "Brain tumours in teenagers and young adults require specialized care that considers both pediatric and adult treatment approaches, as well as the unique developmental needs of this age group.",
    symptoms: ["headaches", "seizures", "cognitive changes", "vision problems", "personality changes"],
    treatments: ["specialized neuro-oncology care", "surgery", "radiation therapy", "chemotherapy", "psychosocial support"],
    specialties: ["Neurosurgery", "Oncology", "Adolescent Medicine"]
  },
  "breast cancer (female)": {
    name: "Breast Cancer (Female)",
    description: "Breast cancer is cancer that forms in tissues of the breast, most commonly in the ducts or lobules. It's the most common cancer in women worldwide.",
    symptoms: ["breast lump or thickening", "change in breast size or shape", "skin changes (dimpling, redness)", "nipple discharge", "nipple inversion", "breast pain"],
    treatments: ["surgery (lumpectomy or mastectomy)", "chemotherapy", "radiation therapy", "hormone therapy", "targeted therapy", "reconstruction surgery"],
    specialties: ["Surgical Oncology", "Medical Oncology", "Radiation Oncology", "Breast Surgery"]
  },
  "breast cancer": {
    name: "Breast Cancer",
    description: "Breast cancer is cancer that forms in breast tissue.",
    symptoms: ["breast lump", "skin changes", "nipple changes"],
    treatments: ["surgery", "chemotherapy", "radiation"],
    specialties: ["Oncology", "Surgical Oncology"]
  },
  "breast cancer (male)": {
    name: "Breast Cancer (Male)",
    description: "Male breast cancer is a rare cancer that forms in the breast tissue of men. Although rare, it requires the same comprehensive treatment approach as female breast cancer.",
    symptoms: ["breast lump", "nipple discharge", "nipple inversion", "skin changes", "breast pain"],
    treatments: ["surgery (mastectomy)", "chemotherapy", "radiation therapy", "hormone therapy", "targeted therapy"],
    specialties: ["Surgical Oncology", "Medical Oncology", "Radiation Oncology"]
  },
  "male breast cancer": {
    name: "Male Breast Cancer",
    description: "Male breast cancer is a rare cancer affecting breast tissue in men.",
    symptoms: ["breast lump", "nipple changes"],
    treatments: ["surgery", "chemotherapy", "radiation"],
    specialties: ["Oncology"]
  },
  "breathing problems in children": {
    name: "Breathing Problems in Children",
    description: "Breathing problems in children can range from common conditions like asthma to more serious issues. They require prompt evaluation, especially if severe.",
    symptoms: ["rapid breathing", "wheezing", "shortness of breath", "coughing", "chest retractions", "bluish lips or nails"],
    treatments: ["depends on cause", "bronchodilators for asthma", "antibiotics for infections", "oxygen therapy", "respiratory support"],
    specialties: ["Pediatrics", "Pediatric Pulmonology", "Emergency Medicine"]
  },
  "breathlessness": {
    name: "Breathlessness (Shortness of Breath)",
    description: "Breathlessness, or shortness of breath, is a sensation of not being able to breathe well enough. It can be caused by various conditions affecting the heart, lungs, or other systems.",
    symptoms: ["difficulty breathing", "feeling of suffocation", "rapid breathing", "chest tightness", "inability to take deep breaths"],
    treatments: ["treating underlying cause", "oxygen therapy", "bronchodilators", "medications for heart conditions", "pulmonary rehabilitation"],
    specialties: ["Pulmonology", "Cardiology", "Emergency Medicine", "Internal Medicine"]
  },
  "shortness of breath": {
    name: "Breathlessness",
    description: "Shortness of breath is difficulty breathing that can have many causes.",
    symptoms: ["difficulty breathing", "rapid breathing"],
    treatments: ["treating underlying cause", "oxygen if needed"],
    specialties: ["Pulmonology", "Cardiology"]
  },
  "bronchiectasis": {
    name: "Bronchiectasis",
    description: "Bronchiectasis is a long-term condition where the airways of the lungs become abnormally widened, leading to a build-up of excess mucus that can make the lungs more vulnerable to infection.",
    symptoms: ["persistent cough with phlegm", "shortness of breath", "chest pain", "wheezing", "recurrent chest infections", "fatigue"],
    treatments: ["antibiotics for infections", "physiotherapy to clear mucus", "bronchodilators", "mucolytics", "oxygen therapy", "surgery in severe cases"],
    specialties: ["Pulmonology"]
  },
  "bronchitis": {
    name: "Bronchitis",
    description: "Bronchitis is inflammation of the lining of the bronchial tubes, which carry air to and from the lungs. It can be acute (short-term) or chronic (long-term).",
    symptoms: ["cough with mucus", "fatigue", "shortness of breath", "slight fever and chills", "chest discomfort"],
    treatments: ["rest and fluids", "cough medicine", "pain relievers", "antibiotics if bacterial", "bronchodilators", "quitting smoking for chronic bronchitis"],
    specialties: ["Pulmonology", "Internal Medicine"]
  },
  "bulimia nervosa": {
    name: "Bulimia Nervosa",
    description: "Bulimia nervosa is a serious eating disorder characterized by episodes of binge eating followed by compensatory behaviors such as self-induced vomiting, excessive exercise, or misuse of laxatives.",
    symptoms: ["recurrent episodes of binge eating", "purging behaviors (vomiting, laxatives)", "excessive exercise", "preoccupation with body weight", "dental problems", "swollen salivary glands"],
    treatments: ["psychotherapy (CBT)", "nutritional counseling", "medications (antidepressants)", "medical monitoring", "hospitalization in severe cases"],
    specialties: ["Psychiatry", "Psychology", "Nutrition", "Adolescent Medicine"]
  },
  "bulimia": {
    name: "Bulimia Nervosa",
    description: "Bulimia is an eating disorder involving binge eating followed by purging behaviors.",
    symptoms: ["binge eating", "purging", "preoccupation with weight"],
    treatments: ["therapy", "nutritional support"],
    specialties: ["Psychiatry"]
  },
  "bunion": {
    name: "Bunion (Hallux Valgus)",
    description: "A bunion is a bony bump that forms on the joint at the base of the big toe. It occurs when the big toe pushes against the next toe, forcing the joint to stick out.",
    symptoms: ["bony bump on side of big toe", "swelling and redness", "pain", "limited movement of big toe", "corn or callus on bump"],
    treatments: ["comfortable, wide shoes", "bunion pads", "pain medications", "ice", "orthotics", "surgery if severe"],
    specialties: ["Orthopedics", "Podiatry"]
  },
  "hallux valgus": {
    name: "Bunion",
    description: "Hallux valgus is the medical term for a bunion, a deformity of the big toe joint.",
    symptoms: ["bony bump", "pain", "toe deformity"],
    treatments: ["shoe modifications", "surgery if needed"],
    specialties: ["Orthopedics", "Podiatry"]
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
    key.replace(/\)/g, '')
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

