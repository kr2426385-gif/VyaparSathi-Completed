/**
 * Verified Maharashtra Districts and Government Support Centres
 */

export const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar (Ahilyanagar)", "Akola", "Amravati", "Chhatrapati Sambhajinagar (Aurangabad)", 
  "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", 
  "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", 
  "Nagpur", "Nanded", "Nandurbar", "Nashik", "Dharashiv (Osmanabad)", "Palghar", 
  "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", 
  "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
];

export const MAHARASHTRA_SUPPORT_POINTS = [
  // PUNE
  {
    id: "dic-pune",
    name: "District Industries Centre (DIC) Pune",
    nameMr: "जिल्हा उद्योग केंद्र, पुणे",
    category: "District Industries Centre",
    district: "Pune",
    address: "Agriculture College Compound, Shivajinagar, Pune - 411005",
    phone: "020-25537542",
    email: "dic.pune@maharashtra.gov.in",
    lat: 18.5314,
    lng: 73.8446,
    services: ["PMEGP / CMEGP Subsidies", "Udyam Assist Facilitation", "Cluster Development Guidance"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Shivajinagar+Pune"
  },
  {
    id: "kvk-baramati",
    name: "Krishi Vigyan Kendra (KVK) Baramati, Pune",
    nameMr: "कृषी विज्ञान केंद्र, बारामती",
    category: "Krishi Vigyan Kendra",
    district: "Pune",
    address: "Agricultural Development Trust, Shardanagar, Baramati, Dist. Pune - 413115",
    phone: "02112-255207",
    email: "kvkbaramati@yahoo.com",
    lat: 18.1726,
    lng: 74.5772,
    services: ["Agro-Processing Training", "Dairy & Fodder Management", "Bio-Fertilizer Guidance"],
    googleMapsUrl: "https://maps.google.com/?q=Krishi+Vigyan+Kendra+Baramati"
  },
  {
    id: "agri-pune",
    name: "District Superintending Agriculture Officer Pune",
    nameMr: "जिल्हा अधीक्षक कृषी अधिकारी कार्यालय, पुणे",
    category: "Agriculture Support Office",
    district: "Pune",
    address: "Central Building, Station Road, Pune - 411001",
    phone: "020-26123490",
    email: "dsao.pune@mahadbt.gov.in",
    lat: 18.5284,
    lng: 73.8743,
    services: ["MahaDBT Drip & Farm Equipment", "SMART Project Linkages", "Cold Storage Subsidies"],
    googleMapsUrl: "https://maps.google.com/?q=District+Superintending+Agriculture+Office+Pune"
  },

  // SATARA
  {
    id: "dic-satara",
    name: "District Industries Centre (DIC) Satara",
    nameMr: "जिल्हा उद्योग केंद्र, सातारा",
    category: "District Industries Centre",
    district: "Satara",
    address: "Old MIDC Area, Near Post Office, Satara - 415004",
    phone: "02162-244247",
    email: "dic.satara@maharashtra.gov.in",
    lat: 17.6805,
    lng: 73.9912,
    services: ["CMEGP Application Verification", "Food Processing DPR Assistance", "MUDRA Bank Liaison"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Satara"
  },
  {
    id: "kvk-borgaon",
    name: "Krishi Vigyan Kendra Borgaon, Satara",
    nameMr: "कृषी विज्ञान केंद्र, बोरगाव, सातारा",
    category: "Krishi Vigyan Kendra",
    district: "Satara",
    address: "National Agricultural Research Project, Borgaon, Dist. Satara - 415519",
    phone: "02162-261224",
    email: "kvkborgaon@gmail.com",
    lat: 17.6121,
    lng: 74.0722,
    services: ["Turmeric Processing & Packaging", "Strawberry & Fruit Drying", "Soil & Water Testing"],
    googleMapsUrl: "https://maps.google.com/?q=Krishi+Vigyan+Kendra+Borgaon+Satara"
  },

  // NASHIK
  {
    id: "dic-nashik",
    name: "District Industries Centre (DIC) Nashik",
    nameMr: "जिल्हा उद्योग केंद्र, नाशिक",
    category: "District Industries Centre",
    district: "Nashik",
    address: "Trimbak Road, Near Collector Office, Nashik - 422002",
    phone: "0253-2575412",
    email: "dic.nashik@maharashtra.gov.in",
    lat: 19.9975,
    lng: 73.7898,
    services: ["Agro-Export Guidance", "PMEGP/CMEGP Sanction Letters", "Industrial Land Allotment"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Nashik"
  },
  {
    id: "kvk-yeshwantrao",
    name: "Krishi Vigyan Kendra (YCMOU) Nashik",
    nameMr: "कृषी विज्ञान केंद्र, यशवंतराव चव्हाण मुक्त विद्यापीठ, नाशिक",
    category: "Krishi Vigyan Kendra",
    district: "Nashik",
    address: "YCMOU Campus, Dnyangangotri, Govardhan, Gangapur Road, Nashik - 422222",
    phone: "0253-2230717",
    email: "kvknashik@rediffmail.com",
    lat: 20.0152,
    lng: 73.7265,
    services: ["Grape & Onion Post-Harvest Processing", "Agri-Enterprise Incubation", "Organic Certification"],
    googleMapsUrl: "https://maps.google.com/?q=Krishi+Vigyan+Kendra+YCMOU+Nashik"
  },

  // AHMEDNAGAR (AHILYANAGAR)
  {
    id: "dic-ahmednagar",
    name: "District Industries Centre (DIC) Ahilyanagar",
    nameMr: "जिल्हा उद्योग केंद्र, अहिल्यानगर",
    category: "District Industries Centre",
    district: "Ahmednagar (Ahilyanagar)",
    address: "Station Road, Near Railway Station, Ahilyanagar - 414001",
    phone: "0241-2415132",
    email: "dic.ahmednagar@maharashtra.gov.in",
    lat: 19.0948,
    lng: 74.7480,
    services: ["Dairy Processing Subsidies", "Sugar & Jaggery Value Chains", "Rural Artisans Assistance"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Ahmednagar"
  },
  {
    id: "kvk-babhalewashwar",
    name: "Krishi Vigyan Kendra Babhaleshwar",
    nameMr: "कृषी विज्ञान केंद्र, बाभळेश्वर",
    category: "Krishi Vigyan Kendra",
    district: "Ahmednagar (Ahilyanagar)",
    address: "Pravara Rural Education Society, Babhaleshwar, Tal. Rahata - 413737",
    phone: "02422-252414",
    email: "kvk_babhaleshwar@yahoo.com",
    lat: 19.5532,
    lng: 74.5211,
    services: ["Pomegranate & Guava Processing", "Milch Cattle Artificial Breeding", "FPO Structuring"],
    googleMapsUrl: "https://maps.google.com/?q=Krishi+Vigyan+Kendra+Babhaleshwar"
  },

  // KOLHAPUR
  {
    id: "dic-kolhapur",
    name: "District Industries Centre (DIC) Kolhapur",
    nameMr: "जिल्हा उद्योग केंद्र, कोल्हापूर",
    category: "District Industries Centre",
    district: "Kolhapur",
    address: "Old Palace Road, Near Bhavani Mandap, Kolhapur - 416012",
    phone: "0231-2544211",
    email: "dic.kolhapur@maharashtra.gov.in",
    lat: 16.6946,
    lng: 74.2238,
    services: ["Jaggery Cluster Support", "Kolhapuri Chappal Artisan Schemes", "Foundry & Agro-Machinery Subsidies"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Kolhapur"
  },

  // CHHATRAPATI SAMBHAJINAGAR (AURANGABAD)
  {
    id: "dic-sambhajinagar",
    name: "District Industries Centre Chhatrapati Sambhajinagar",
    nameMr: "जिल्हा उद्योग केंद्र, छत्रपती संभाजीनगर",
    category: "District Industries Centre",
    district: "Chhatrapati Sambhajinagar (Aurangabad)",
    address: "Railway Station Road, MIDC Area, Chhatrapati Sambhajinagar - 431005",
    phone: "0240-2334861",
    email: "dic.aurangabad@maharashtra.gov.in",
    lat: 19.8654,
    lng: 75.3211,
    services: ["Marathwada Rural Startup Grants", "Food Tech Cluster Linkages", "MSME Registration"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Aurangabad"
  },

  // AMRAVATI
  {
    id: "dic-amravati",
    name: "District Industries Centre (DIC) Amravati",
    nameMr: "जिल्हा उद्योग केंद्र, अमरावती",
    category: "District Industries Centre",
    district: "Amravati",
    address: "Camp Road, Near Collector Office, Amravati - 444602",
    phone: "0721-2662843",
    email: "dic.amravati@maharashtra.gov.in",
    lat: 20.9320,
    lng: 77.7523,
    services: ["Vidarbha Agro-Processing Subsidies", "Orange & Citrus Processing DPRs", "PMEGP Rural Camps"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Amravati"
  },

  // NAGPUR
  {
    id: "dic-nagpur",
    name: "District Industries Centre (DIC) Nagpur",
    nameMr: "जिल्हा उद्योग केंद्र, नागपूर",
    category: "District Industries Centre",
    district: "Nagpur",
    address: "Civil Lines, Near High Court, Nagpur - 440001",
    phone: "0712-2561332",
    email: "dic.nagpur@maharashtra.gov.in",
    lat: 21.1539,
    lng: 79.0731,
    services: ["MahaMSME Schemes", "CMEGP State Desk", "DIC Helpdesk"],
    googleMapsUrl: "https://maps.google.com/?q=District+Industries+Centre+Nagpur"
  }
];

export function filterSupportPoints(districtName, category) {
  let list = MAHARASHTRA_SUPPORT_POINTS;
  if (districtName && districtName !== "All") {
    list = list.filter(pt => 
      pt.district.toLowerCase().includes(districtName.toLowerCase()) ||
      districtName.toLowerCase().includes(pt.district.toLowerCase())
    );
  }
  if (category && category !== "All") {
    list = list.filter(pt => pt.category.toLowerCase().includes(category.toLowerCase()));
  }
  return list;
}
