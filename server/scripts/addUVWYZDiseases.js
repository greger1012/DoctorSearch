/**
 * Script to add diseases starting with U, V, W, Y, Z from NHS Inform with detailed descriptions
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
  "ulcerative colitis": {
    name: "Ulcerative Colitis",
    description: "Ulcerative colitis is a chronic inflammatory bowel disease that causes inflammation and ulcers in the digestive tract. It affects the innermost lining of the large intestine and rectum.",
    symptoms: ["diarrhea with blood or pus", "abdominal pain and cramping", "rectal pain", "urgency to defecate", "weight loss", "fatigue", "fever"],
    treatments: ["anti-inflammatory medications", "immune system suppressors", "biologics", "surgery (colectomy) in severe cases", "nutrition therapy"],
    specialties: ["Gastroenterology"]
  },
  "underactive thyroid": {
    name: "Underactive Thyroid (Hypothyroidism)",
    description: "An underactive thyroid, or hypothyroidism, occurs when the thyroid gland doesn't produce enough thyroid hormone. This slows down the body's metabolism.",
    symptoms: ["fatigue", "weight gain", "sensitivity to cold", "dry skin", "hair loss", "muscle weakness", "depression", "constipation"],
    treatments: ["thyroid hormone replacement (levothyroxine)", "regular monitoring", "lifestyle modifications"],
    specialties: ["Endocrinology"]
  },
  "hypothyroidism": {
    name: "Underactive Thyroid",
    description: "Hypothyroidism is insufficient thyroid hormone production.",
    symptoms: ["fatigue", "weight gain", "sensitivity to cold"],
    treatments: ["thyroid hormone replacement"],
    specialties: ["Endocrinology"]
  },
  "urinary incontinence": {
    name: "Urinary Incontinence",
    description: "Urinary incontinence is the loss of bladder control, ranging from occasional leakage to complete inability to control urination. It's common and can be treated.",
    symptoms: ["leakage of urine", "inability to hold urine", "frequent urination", "urgency"],
    treatments: ["pelvic floor exercises", "bladder training", "medications", "medical devices", "surgery in severe cases"],
    specialties: ["Urology", "Urogynecology"]
  },
  "urinary incontinence in women": {
    name: "Urinary Incontinence in Women",
    description: "Urinary incontinence is more common in women, often due to pregnancy, childbirth, menopause, or pelvic floor weakness. Various treatment options are available.",
    symptoms: ["urine leakage", "inability to control urination", "stress incontinence (leakage with coughing/sneezing)", "urge incontinence"],
    treatments: ["pelvic floor exercises", "bladder training", "medications", "pessaries", "surgery"],
    specialties: ["Urogynecology", "Obstetrics & Gynecology", "Urology"]
  },
  "urinary tract infection": {
    name: "Urinary Tract Infection (UTI)",
    description: "A UTI is an infection in any part of the urinary system, including kidneys, bladder, ureters, and urethra. Most infections involve the lower urinary tract (bladder and urethra).",
    symptoms: ["frequent, urgent need to urinate", "burning sensation when urinating", "passing small amounts of urine", "cloudy urine", "blood in urine", "pelvic pain"],
    treatments: ["antibiotics", "drinking plenty of water", "pain relievers", "avoiding irritants"],
    specialties: ["Urology", "Infectious Disease"]
  },
  "uti": {
    name: "Urinary Tract Infection",
    description: "UTI is an infection in the urinary system.",
    symptoms: ["burning urination", "frequent urination", "cloudy urine"],
    treatments: ["antibiotics"],
    specialties: ["Urology"]
  },
  "urinary tract infection (uti) in children": {
    name: "Urinary Tract Infection in Children",
    description: "UTIs in children require prompt treatment to prevent complications. Symptoms may be different from adults, and young children may not be able to describe their symptoms.",
    symptoms: ["fever", "irritability", "poor feeding", "frequent urination", "burning during urination", "abdominal pain", "bedwetting"],
    treatments: ["antibiotics", "ensuring adequate fluids", "medical monitoring", "preventing recurrence"],
    specialties: ["Pediatrics", "Pediatric Urology"]
  },
  "urticaria": {
    name: "Urticaria (Hives)",
    description: "Urticaria, commonly known as hives, is a skin reaction that causes raised, itchy welts. It can be acute (short-term) or chronic (lasting more than 6 weeks).",
    symptoms: ["raised, red welts", "itching", "burning or stinging", "may come and go", "can last hours to days"],
    treatments: ["antihistamines", "avoiding triggers", "corticosteroids for severe cases", "identifying and treating underlying cause"],
    specialties: ["Dermatology", "Allergy & Immunology"]
  },
  "hives": {
    name: "Urticaria",
    description: "Hives are raised, itchy welts on the skin.",
    symptoms: ["itchy welts", "redness"],
    treatments: ["antihistamines"],
    specialties: ["Dermatology", "Allergy"]
  },
  "vaginal cancer": {
    name: "Vaginal Cancer",
    description: "Vaginal cancer is a rare type of cancer that forms in the vagina. It's most common in women over 60 and is often associated with HPV infection.",
    symptoms: ["abnormal vaginal bleeding", "watery vaginal discharge", "lump in vagina", "pelvic pain", "painful urination"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy"],
    specialties: ["Gynecologic Oncology", "Oncology", "Radiation Oncology"]
  },
  "vaginal discharge": {
    name: "Vaginal Discharge",
    description: "Vaginal discharge is normal and helps keep the vagina clean. However, changes in color, odor, or amount can indicate an infection or other problem.",
    symptoms: ["discharge that is abnormal in color, odor, or amount", "itching", "irritation", "may be accompanied by other symptoms"],
    treatments: ["treating underlying cause", "good hygiene", "avoiding douching", "medications if infection"],
    specialties: ["Obstetrics & Gynecology", "Infectious Disease"]
  },
  "varicose eczema": {
    name: "Varicose Eczema (Stasis Dermatitis)",
    description: "Varicose eczema, also called stasis dermatitis, is a skin condition that occurs in people with poor circulation, usually in the lower legs. It's associated with varicose veins.",
    symptoms: ["red, inflamed skin", "itching", "scaling", "ulceration", "discoloration", "swelling"],
    treatments: ["compression stockings", "moisturizers", "topical corticosteroids", "treating underlying circulation problems"],
    specialties: ["Dermatology", "Vascular Medicine"]
  },
  "stasis dermatitis": {
    name: "Varicose Eczema",
    description: "Stasis dermatitis is eczema related to poor circulation.",
    symptoms: ["red, inflamed skin", "itching"],
    treatments: ["compression", "moisturizers"],
    specialties: ["Dermatology"]
  },
  "varicose veins": {
    name: "Varicose Veins",
    description: "Varicose veins are twisted, enlarged veins that usually occur in the legs. They're caused by weakened valves in the veins that allow blood to flow backward.",
    symptoms: ["twisted, bulging veins", "aching legs", "heaviness", "itching", "swelling", "skin discoloration"],
    treatments: ["compression stockings", "lifestyle changes", "sclerotherapy", "laser treatment", "surgery"],
    specialties: ["Vascular Surgery", "Dermatology"]
  },
  "vascular dementia": {
    name: "Vascular Dementia",
    description: "Vascular dementia is a general term describing problems with reasoning, planning, judgment, memory, and other thought processes caused by brain damage from impaired blood flow to the brain.",
    symptoms: ["confusion", "difficulty concentrating", "memory problems", "difficulty organizing thoughts", "depression", "mood changes"],
    treatments: ["treating underlying vascular conditions", "medications to slow progression", "lifestyle changes", "supportive care"],
    specialties: ["Neurology", "Geriatrics"]
  },
  "venous leg ulcer": {
    name: "Venous Leg Ulcer",
    description: "A venous leg ulcer is a long-lasting sore that takes more than 4 to 6 weeks to heal. It usually develops on the inside of the leg, just above the ankle.",
    symptoms: ["open sore on leg", "swelling", "aching", "discolored skin", "hardened skin around ulcer"],
    treatments: ["compression therapy", "wound care", "elevating leg", "treating underlying venous problems", "surgery if needed"],
    specialties: ["Vascular Medicine", "Wound Care", "Dermatology"]
  },
  "vertigo": {
    name: "Vertigo",
    description: "Vertigo is a sensation of spinning or dizziness, often described as feeling like you or your surroundings are moving when they're not. It can be caused by various inner ear or brain conditions.",
    symptoms: ["sensation of spinning", "dizziness", "nausea", "vomiting", "balance problems", "nystagmus (involuntary eye movements)"],
    treatments: ["treating underlying cause", "vestibular rehabilitation", "medications", "maneuvers for BPPV", "lifestyle modifications"],
    specialties: ["Otolaryngology", "Neurology"]
  },
  "vitamin b12 or folate deficiency anaemia": {
    name: "Vitamin B12 or Folate Deficiency Anaemia",
    description: "Vitamin B12 or folate deficiency anaemia occurs when a lack of these vitamins causes the body to produce abnormally large red blood cells that can't function properly.",
    symptoms: ["fatigue", "weakness", "pale skin", "shortness of breath", "dizziness", "smooth, red tongue", "pins and needles"],
    treatments: ["vitamin B12 or folate supplements", "dietary changes", "treating underlying cause", "injections if absorption problems"],
    specialties: ["Hematology", "Internal Medicine"]
  },
  "vitamin b12 deficiency": {
    name: "Vitamin B12 Deficiency",
    description: "B12 deficiency causes anemia and neurological problems.",
    symptoms: ["fatigue", "weakness", "pins and needles"],
    treatments: ["B12 supplements", "injections"],
    specialties: ["Hematology"]
  },
  "folate deficiency": {
    name: "Folate Deficiency",
    description: "Folate deficiency causes anemia.",
    symptoms: ["fatigue", "weakness"],
    treatments: ["folate supplements"],
    specialties: ["Hematology"]
  },
  "vomiting in adults": {
    name: "Vomiting in Adults",
    description: "Vomiting in adults can be caused by various conditions including infections, food poisoning, motion sickness, medications, or underlying medical conditions.",
    symptoms: ["nausea", "vomiting", "may be accompanied by other symptoms depending on cause"],
    treatments: ["treating underlying cause", "staying hydrated", "rest", "medications for nausea", "avoiding solid foods initially"],
    specialties: ["Internal Medicine", "Gastroenterology", "Emergency Medicine"]
  },
  "vomiting in children and babies": {
    name: "Vomiting in Children and Babies",
    description: "Vomiting in children and babies is common and usually not serious, but it can lead to dehydration quickly. It's important to monitor for signs of dehydration and seek medical attention if needed.",
    symptoms: ["vomiting", "may be accompanied by diarrhea", "fever", "signs of dehydration", "lethargy"],
    treatments: ["oral rehydration solutions", "continuing breastfeeding or formula", "medical attention if severe", "preventing dehydration"],
    specialties: ["Pediatrics", "Emergency Medicine"]
  },
  "vulval cancer": {
    name: "Vulval Cancer",
    description: "Vulval cancer is a rare type of cancer that occurs on the outer surface area of the female genitalia. It's most common in older women and is often associated with HPV infection.",
    symptoms: ["lump or sore on vulva", "itching", "bleeding", "pain", "changes in skin color"],
    treatments: ["surgery", "radiation therapy", "chemotherapy", "targeted therapy"],
    specialties: ["Gynecologic Oncology", "Oncology"]
  },
  "warts and verrucas": {
    name: "Warts and Verrucas",
    description: "Warts are small, rough growths on the skin caused by the human papillomavirus (HPV). Verrucas are warts on the soles of the feet. They're contagious but usually harmless.",
    symptoms: ["small, rough growths", "may be raised or flat", "may have black dots", "painful if on feet"],
    treatments: ["salicylic acid", "cryotherapy (freezing)", "surgical removal", "laser treatment", "usually resolve on their own"],
    specialties: ["Dermatology", "Podiatry"]
  },
  "verrucas": {
    name: "Verrucas",
    description: "Verrucas are warts on the soles of the feet.",
    symptoms: ["rough growth on foot", "may be painful"],
    treatments: ["salicylic acid", "cryotherapy"],
    specialties: ["Dermatology", "Podiatry"]
  },
  "whiplash": {
    name: "Whiplash",
    description: "Whiplash is a neck injury caused by a sudden, forceful back-and-forth movement of the neck, like the cracking of a whip. It's commonly caused by rear-end car accidents.",
    symptoms: ["neck pain", "stiffness", "headaches", "shoulder pain", "dizziness", "fatigue", "difficulty concentrating"],
    treatments: ["pain medications", "ice or heat", "physical therapy", "gentle exercises", "cervical collar if needed"],
    specialties: ["Orthopedics", "Physical Medicine", "Emergency Medicine"]
  },
  "whooping cough": {
    name: "Whooping Cough (Pertussis)",
    description: "Whooping cough is a highly contagious respiratory tract infection. It's characterized by severe coughing fits followed by a high-pitched 'whoop' sound when breathing in.",
    symptoms: ["severe coughing fits", "whooping sound", "runny nose", "fever", "vomiting after coughing", "exhaustion"],
    treatments: ["antibiotics", "supportive care", "prevention through vaccination", "isolation to prevent spread"],
    specialties: ["Infectious Disease", "Pediatrics"]
  },
  "pertussis": {
    name: "Whooping Cough",
    description: "Pertussis is a highly contagious respiratory infection.",
    symptoms: ["severe coughing", "whooping sound"],
    treatments: ["antibiotics", "vaccination"],
    specialties: ["Infectious Disease"]
  },
  "wolff-parkinson-white syndrome": {
    name: "Wolff-Parkinson-White Syndrome (WPW)",
    description: "WPW is a condition in which there's an extra electrical pathway in the heart that can cause a rapid heartbeat. It's present at birth but may not cause symptoms until later in life.",
    symptoms: ["rapid heartbeat", "palpitations", "dizziness", "shortness of breath", "chest pain", "fainting"],
    treatments: ["medications", "catheter ablation", "cardioversion", "lifestyle modifications"],
    specialties: ["Cardiology", "Electrophysiology"]
  },
  "wpw": {
    name: "Wolff-Parkinson-White Syndrome",
    description: "WPW is a heart condition with an extra electrical pathway.",
    symptoms: ["rapid heartbeat", "palpitations"],
    treatments: ["medications", "ablation"],
    specialties: ["Cardiology"]
  },
  "womb (uterus) cancer": {
    name: "Womb (Uterus) Cancer (Endometrial Cancer)",
    description: "Womb cancer, also called endometrial cancer, is cancer that begins in the lining of the uterus. It's the most common type of gynecologic cancer.",
    symptoms: ["abnormal vaginal bleeding", "pelvic pain", "pain during intercourse", "unexplained weight loss", "watery discharge"],
    treatments: ["surgery (hysterectomy)", "radiation therapy", "chemotherapy", "hormone therapy"],
    specialties: ["Gynecologic Oncology", "Oncology", "Radiation Oncology"]
  },
  "endometrial cancer": {
    name: "Womb Cancer",
    description: "Endometrial cancer is cancer of the uterine lining.",
    symptoms: ["abnormal bleeding", "pelvic pain"],
    treatments: ["surgery", "radiation", "chemotherapy"],
    specialties: ["Gynecologic Oncology"]
  },
  "wrist fracture": {
    name: "Wrist Fracture",
    description: "A wrist fracture is a break in one or more of the bones in the wrist. The most common type is a Colles' fracture, which occurs at the end of the radius bone.",
    symptoms: ["wrist pain", "swelling", "bruising", "deformity", "difficulty moving wrist", "tenderness"],
    treatments: ["splinting or casting", "pain medications", "ice", "surgery for displaced fractures", "physical therapy"],
    specialties: ["Orthopedics", "Hand Surgery", "Emergency Medicine"]
  },
  "yellow fever": {
    name: "Yellow Fever",
    description: "Yellow fever is a viral disease spread by mosquitoes in tropical and subtropical areas of Africa and South America. It can cause serious illness and death, but vaccination can prevent it.",
    symptoms: ["fever", "headache", "muscle pain", "nausea", "vomiting", "jaundice", "bleeding in severe cases"],
    treatments: ["supportive care", "prevention through vaccination", "mosquito avoidance"],
    specialties: ["Infectious Disease", "Tropical Medicine"]
  },
  "zika virus": {
    name: "Zika Virus",
    description: "Zika virus is a mosquito-borne virus that can cause birth defects if a pregnant woman is infected. It's found in tropical and subtropical areas and can also be sexually transmitted.",
    symptoms: ["often no symptoms", "fever", "rash", "joint pain", "red eyes", "headache"],
    treatments: ["supportive care", "rest and fluids", "preventing mosquito bites", "preventing sexual transmission"],
    specialties: ["Infectious Disease", "Tropical Medicine", "Obstetrics & Gynecology"]
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

