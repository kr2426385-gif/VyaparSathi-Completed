/**
 * VyaparSathi Machine Learning & Advisory Display Localization Dictionary
 *
 * Translates categorical ML predictions, demand tiers, and provenance status badges
 * for UI presentation across Marathi ('mr'), Hindi ('hi'), and English ('en').
 *
 * IMPORTANT: Underlying Python models, inference engines, and API contracts remain
 * strictly untouched and continue using standard English canonical keys.
 */

export const ML_CATEGORIES = {
  'Fruit & Vegetable Processing': {
    mr: 'फळे व भाजीपाला प्रक्रिया',
    hi: 'फल एवं सब्जी प्रसंस्करण',
    en: 'Fruit & Vegetable Processing'
  },
  'Dairy Processing': {
    mr: 'दुग्ध प्रक्रिया व दुग्धजन्य उत्पादने',
    hi: 'डेयरी प्रसंस्करण एवं उत्पाद',
    en: 'Dairy Processing'
  },
  'Dairy Farming': {
    mr: 'डेअरी व्यवसाय व पशुपालन',
    hi: 'डेयरी व्यवसाय एवं पशुपालन',
    en: 'Dairy Farming'
  },
  'Food Processing': {
    mr: 'अन्न प्रक्रिया उद्योग',
    hi: 'खाद्य प्रसंस्करण उद्योग',
    en: 'Food Processing'
  },
  'Bakery': {
    mr: 'बेकरी व कन्फेक्शनरी उद्योग',
    hi: 'बेकरी एवं कन्फेक्शनरी',
    en: 'Bakery'
  },
  'Textile & Apparel': {
    mr: 'वस्त्रोद्योग व गारमेंट्स',
    hi: 'वस्त्र एवं परिधान उद्योग',
    en: 'Textile & Apparel'
  },
  'Agro Processing': {
    mr: 'कृषी प्रक्रिया उद्योग',
    hi: 'कृषि प्रसंस्करण उद्योग',
    en: 'Agro Processing'
  },
  'Animal Husbandry': {
    mr: 'पशुसंवर्धन व कुक्कुटपालन',
    hi: 'पशुपालन एवं कुक्कुट पालन',
    en: 'Animal Husbandry'
  },
  'Bio-Fertilizer & Organic Agro': {
    mr: 'सेंद्रिय खत व जैव-निविष्ठा',
    hi: 'जैविक खाद एवं कृषि इनपुट',
    en: 'Bio-Fertilizer & Organic Agro'
  },
  'Agri Service & Farm Mechanization': {
    mr: 'कृषी सेवा व अवजारे केंद्र',
    hi: 'कृषि सेवा एवं यंत्रीकरण',
    en: 'Agri Service & Farm Mechanization'
  },
  'Dairy & Cattle Farming': {
    mr: 'डेअरी व पशुपालन',
    hi: 'डेयरी एवं पशुपालन',
    en: 'Dairy & Cattle Farming'
  },
  'Agri Enterprise': {
    mr: 'कृषी उद्योग',
    hi: 'कृषि उद्यम',
    en: 'Agri Enterprise'
  },
  'Dairy': {
    mr: 'डेअरी व दुग्ध प्रक्रिया',
    hi: 'डेयरी एवं दुग्ध प्रसंस्करण',
    en: 'Dairy'
  },
  'Rural Enterprise': {
    mr: 'ग्रामीण उद्योग',
    hi: 'ग्रामीण उद्यम',
    en: 'Rural Enterprise'
  }
};

export const ML_DEMAND_LEVELS = {
  'High': {
    mr: 'उच्च',
    hi: 'उच्च',
    en: 'High'
  },
  'Medium': {
    mr: 'मध्यम',
    hi: 'मध्यम',
    en: 'Medium'
  },
  'Low': {
    mr: 'कमी',
    hi: 'कम',
    en: 'Low'
  },
  'High Demand': {
    mr: 'उच्च मागणी',
    hi: 'उच्च मांग',
    en: 'High Demand'
  },
  'Medium Demand': {
    mr: 'मध्यम मागणी',
    hi: 'मध्यम मांग',
    en: 'Medium Demand'
  },
  'Low Demand': {
    mr: 'कमी मागणी',
    hi: 'कम मांग',
    en: 'Low Demand'
  }
};

export const ML_SUITABILITY_LEVELS = {
  'High': {
    mr: 'उच्च अनुकूलता',
    hi: 'उच्च अनुकूलता',
    en: 'High Suitability'
  },
  'Medium': {
    mr: 'मध्यम अनुकूलता',
    hi: 'मध्यम अनुकूलता',
    en: 'Medium Suitability'
  },
  'Low': {
    mr: 'मर्यादित अनुकूलता',
    hi: 'सीमित अनुकूलता',
    en: 'Limited Suitability'
  }
};

export const ML_PROVENANCE_LABELS = {
  'ML Prediction': {
    mr: 'मशीन लर्निंग भाकीत',
    hi: 'एमएल भविष्यवाणी',
    en: 'ML Prediction'
  },
  'Banking Calculation': {
    mr: 'बँकिंग गणितीय सूत्र',
    hi: 'बैंकिंग गणना सूत्र',
    en: 'Banking Calculation'
  },
  'Verified Scheme Data': {
    mr: 'अधिकृत शासकीय योजना माहिती',
    hi: 'सत्यापित सरकारी योजना डेटा',
    en: 'Verified Scheme Data'
  },
  'Grounded Rule Engine': {
    mr: 'नियम आधारित कृषी सल्ला',
    hi: 'नियम-आधारित कृषि सलाह',
    en: 'Grounded Rule Engine'
  },
  'AI-generated explanation': {
    mr: 'एआय-निर्मित स्पष्टीकरण',
    hi: 'एआई-जनरेटेड स्पष्टीकरण',
    en: 'AI-generated explanation'
  },
  'ML Service Offline': {
    mr: 'एमएल सेवा तात्पुरती ऑफलाइन',
    hi: 'एमएल सेवा अस्थायी रूप से ऑफलाइन',
    en: 'ML Service Offline'
  },
  'LLM Active': {
    mr: 'एआय सल्लागार सक्रिय',
    hi: 'एआई सलाहकार सक्रिय',
    en: 'LLM Active'
  },
  'LLM Fallback': {
    mr: 'स्थानिक पडताळणी पर्याय सक्रिय',
    hi: 'स्थानीय सत्यापित विकल्प सक्रिय',
    en: 'LLM Fallback'
  },
  'LLM Unavailable': {
    mr: 'एआय सेवा अनुपलब्ध (स्थानिक नियम लागू)',
    hi: 'एआई सेवा अनुपलब्ध (स्थानीय नियम सक्रिय)',
    en: 'LLM Unavailable'
  },
  'Vision AI Assessment': {
    mr: 'यंत्र तपासणी व्हिजन एआय',
    hi: 'मशीन निरीक्षण विज़न एआई',
    en: 'Vision AI Assessment'
  },
  'Official Verified Source': {
    mr: 'अधिकृत पडताळणी स्त्रोत',
    hi: 'आधिकारिक सत्यापित स्रोत',
    en: 'Official Verified Source'
  },
  'Empirical Benchmark': {
    mr: 'अनुभवजन्य बँकिंग निकष',
    hi: 'अनुभवजन्य बैंकिंग मानदंड',
    en: 'Empirical Benchmark'
  },
  'Field Validation Recommended': {
    mr: 'प्रत्यक्ष क्षेत्र पडताळणी आवश्यक',
    hi: 'प्रत्यक्ष क्षेत्रीय सत्यापन अनुशंसित',
    en: 'Field Validation Recommended'
  }
};

/**
 * Safely translates an ML category term into the active language.
 * Falls back to the original term if no mapping exists (never throws or returns undefined).
 */
export function translateMLCategory(category, lang = 'mr') {
  if (!category) return '';
  return ML_CATEGORIES[category]?.[lang] || ML_CATEGORIES[category]?.en || category;
}

/**
 * Safely translates a demand tier or suitability level.
 */
export function translateMLDemand(demand, lang = 'mr') {
  if (!demand) return '';
  return ML_DEMAND_LEVELS[demand]?.[lang] || ML_DEMAND_LEVELS[demand]?.en || demand;
}

/**
 * Safely translates a suitability tier.
 */
export function translateMLSuitability(suitability, lang = 'mr') {
  if (!suitability) return '';
  return ML_SUITABILITY_LEVELS[suitability]?.[lang] || ML_SUITABILITY_LEVELS[suitability]?.en || suitability;
}

/**
 * Safely translates a provenance or system status badge.
 */
export function translateMLProvenance(label, lang = 'mr') {
  if (!label) return '';
  return ML_PROVENANCE_LABELS[label]?.[lang] || ML_PROVENANCE_LABELS[label]?.en || label;
}

/**
 * Unified helper that checks across all dictionaries before falling back to raw string.
 */
export function translateMLTerm(term, lang = 'mr') {
  if (!term || typeof term !== 'string') return term;
  return (
    ML_CATEGORIES[term]?.[lang] ||
    ML_DEMAND_LEVELS[term]?.[lang] ||
    ML_SUITABILITY_LEVELS[term]?.[lang] ||
    ML_PROVENANCE_LABELS[term]?.[lang] ||
    term
  );
}

export default {
  translateMLCategory,
  translateMLDemand,
  translateMLSuitability,
  translateMLProvenance,
  translateMLTerm,
  ML_CATEGORIES,
  ML_DEMAND_LEVELS,
  ML_SUITABILITY_LEVELS,
  ML_PROVENANCE_LABELS
};
