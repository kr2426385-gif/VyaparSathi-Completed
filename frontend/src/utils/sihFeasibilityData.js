/**
 * SIH26091 - AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant
 * Core Feasibility Analysis & Financial Structuring Engine for Rural Micro-Entrepreneurs
 */

export const BUSINESS_CATEGORIES = [
  { id: 'Dairy', label: 'Dairy & Animal Husbandry', labelHi: 'डेयरी एवं पशुपालन', labelMr: 'दुग्ध व्यवसाय व पशुपालन', icon: 'Cow' },
  { id: 'Food Processing', label: 'Agro & Food Processing', labelHi: 'कृषि एवं खाद्य प्रसंस्करण', labelMr: 'कृषी व अन्न प्रक्रिया उद्योग', icon: 'Factory' },
  { id: 'Grocery & Retail', label: 'Village Retail & Kirana', labelHi: 'ग्रामीण किराना एवं खुदरा व्यापार', labelMr: 'ग्रामीण किराणा व किरकोळ व्यापार', icon: 'Store' },
  { id: 'Agri Machinery & Workshop', label: 'Agri Equipment & Workshop', labelHi: 'कृषि उपकरण एवं कार्यशाला', labelMr: 'कृषी अवजारे व कार्यशाळा', icon: 'Wrench' },
  { id: 'Textiles & Handloom', label: 'Textiles, Tailoring & Handloom', labelHi: 'वस्त्रोद्योग, सिलाई एवं हथकरघा', labelMr: 'वस्त्रोद्योग, शिलाई व हातमाग', icon: 'Scissors' },
  { id: 'Poultry & Goatry', label: 'Poultry & Goat Farming', labelHi: 'कुक्कुटपालन एवं बकरी पालन', labelMr: 'कुक्कुटपालन व शेळीपालन', icon: 'Egg' }
];

/**
 * Generate the 6 SIH Feasibility Pillars dynamically based on user inputs
 */
export function generateSIHFeasibilityCards({
  village = '',
  block = '',
  district = 'Satara',
  bizCategory = 'Dairy',
  marginCapital = 100000
}) {
  const locDisplay = [village, block, district].filter(Boolean).join(', ') || district || 'Selected Area';
  const marginNum = Number(marginCapital) || 100000;
  
  // SIH 26091 Financial Calculations:
  // Margin Capital is 10% promoter contribution -> Total Project Cost = Margin / 0.10
  const projectCost = Math.round(marginNum / 0.10);
  const maxLoan = Math.round(projectCost * 0.90);
  const schemeType = projectCost <= 140000 ? 'Micro Finance Scheme' : 'Term Loan Scheme';

  return [
    // 1. MARKET REACH
    {
      id: 'market-reach',
      pillarNum: 1,
      title: 'Market Reach',
      titleHi: 'बाजार पहुंच',
      titleMr: 'बाजारपेठ पोहोच',
      tagline: '5–10 km Local Market & Buyer Access',
      taglineHi: '५-१० किमी स्थानीय बाजार एवं खरीदार पहुंच',
      taglineMr: '५-१० किमी स्थानिक बाजारपेठ व ग्राहक जोडणी',
      badge: 'Pillar 01',
      bgGradient: 'from-blue-900/90 via-slate-900/95 to-slate-950',
      accentColor: '#3b82f6',
      iconName: 'MapPin',
      image: '/images/rural-biz-retail.jpg',
      frontInsight: 'Identify consumers and primary distribution channels within a 5–10 km local market.',
      frontInsightHi: '५-१० किमी के स्थानीय बाजार में ग्राहकों और प्राथमिक वितरण चैनलों की पहचान करें।',
      frontInsightMr: '५-१० किमी स्थानिक बाजारपेठेतील ग्राहक आणि प्राथमिक वितरण मार्गांची माहिती मिळवा.',
      frontMetrics: [
        { label: 'Target Reach', value: '5–10 km Radius' },
        { label: 'Channels', value: 'Haats & Local Buyers' }
      ],
      backData: {
        location: locDisplay,
        radius: '5–10 km local radius',
        consumerBase: 'Village households, weekly haats, local retail stores, and institutional buyers.',
        distributionChannels: [
          'Direct farm-gate and counter sales to local buyers',
          'Weekly village bazaar aggregation',
          'Supply arrangements with local shopkeepers'
        ],
        investigationSteps: [
          'Assess customer distance within 5–10 km',
          'Review weekly haat timings across the block',
          'Establish advance buyer linkages'
        ],
        actionLabel: 'Check Local Market Reach',
        actionRoute: '/journey/market'
      }
    },

    // 2. LOCAL OPPORTUNITY
    {
      id: 'local-opportunity',
      pillarNum: 2,
      title: 'Local Opportunity',
      titleHi: 'स्थानीय व्यवसाय अवसर',
      titleMr: 'स्थानिक व्यवसाय संधी',
      tagline: `Unserved Niche in ${bizCategory}`,
      taglineHi: `${bizCategory} में अप्रयुक्त व्यावसायिक अवसर`,
      taglineMr: `${bizCategory} मधील स्थानिक रिक्त संधी`,
      badge: 'Pillar 02',
      bgGradient: 'from-emerald-950/90 via-slate-900/95 to-slate-950',
      accentColor: '#10b981',
      iconName: 'Sparkles',
      image: '/images/rural-biz-planning.jpg',
      frontInsight: 'Find unserved or underserved needs within the selected business category and local economy.',
      frontInsightHi: 'चयनित व्यवसाय श्रेणी और स्थानीय अर्थव्यवस्था के भीतर अधूरी या कम पूरी हुई जरूरतों की खोज करें।',
      frontInsightMr: 'निवडलेल्या व्यवसाय प्रकारात स्थानिक पातळीवर उपलब्ध नसलेल्या सेवा व उत्पादने शोधा.',
      frontMetrics: [
        { label: 'Focus Area', value: 'Underserved Need' },
        { label: 'Category', value: bizCategory }
      ],
      backData: {
        businessCategory: bizCategory,
        nicheDescription: `Address unserved consumer demand for quality, hygienic, and locally available ${bizCategory} products in ${locDisplay}.`,
        localNeeds: [
          `Consistent local availability of ${bizCategory} goods`,
          'Reduced dependency on distant town intermediaries',
          'Freshness and packaging suited for rural households'
        ],
        actionPoints: [
          'Identify specific product gaps in village stores',
          'Test sample batches at nearby local markets',
          'Link with local producer groups for raw material'
        ],
        actionLabel: 'Explore Opportunity',
        actionRoute: '/journey/idea'
      }
    },

    // 3. SWOT ANALYSIS
    {
      id: 'swot-analysis',
      pillarNum: 3,
      title: 'SWOT Analysis',
      titleHi: 'स्वॉट विश्लेषण',
      titleMr: 'व्यवसाय स्वॉट विश्लेषण',
      tagline: `Strengths, Weaknesses & Budget Profile`,
      taglineHi: 'शक्तियाँ, कमजोरियाँ एवं पूंजी रूपरेखा',
      taglineMr: 'सामर्थ्य, उणिवा व भांडवल रूपरेषा',
      badge: 'Pillar 03',
      bgGradient: 'from-amber-950/90 via-slate-900/95 to-slate-950',
      accentColor: '#f59e0b',
      iconName: 'BarChart3',
      image: '/images/rural-biz-handshake.jpg',
      frontInsight: 'Review strengths, weaknesses, opportunities and threats for the proposed micro-enterprise and budget.',
      frontInsightHi: 'प्रस्तावित सूक्ष्म उद्यम और बजट के लिए ताकत, कमजोरियों, अवसरों और खतरों की समीक्षा करें।',
      frontInsightMr: 'प्रस्तावित ग्रामीण सूक्ष्म उद्योगासाठी सामर्थ्य, उणिवा, संधी व संभाव्य धोके तपासा.',
      frontMetrics: [
        { label: 'Promoter Margin', value: `₹${(marginNum / 100000).toFixed(2)} Lakh` },
        { label: 'Evaluation', value: 'Structured Profile' }
      ],
      backData: {
        strengths: `Direct promoter management, low operating overheads, and strong community relationships in ${locDisplay}.`,
        weaknesses: `Limited initial working capital reserve beyond the ₹${marginNum.toLocaleString('en-IN')} promoter margin.`,
        opportunities: `Government credit-linked schemes (${schemeType}) and rising rural purchasing power.`,
        threats: 'Raw material price fluctuations and seasonal monsoon transport delays.',
        actionLabel: 'Review SWOT Profile',
        actionRoute: '/advisor'
      }
    },

    // 4. THREATS & MITIGATION
    {
      id: 'local-threats',
      pillarNum: 4,
      title: 'Threats & Mitigation',
      titleHi: 'जोखिम एवं समाधान',
      titleMr: 'धोके व निवारण नियोजन',
      tagline: 'Supply-Chain & Demand Dependencies',
      taglineHi: 'आपूर्ति-श्रृंखला और मांग निर्भरता',
      taglineMr: 'पुरवठा साखळी व हंगामी मागणी नियोजन',
      badge: 'Pillar 04',
      bgGradient: 'from-rose-950/90 via-slate-900/95 to-slate-950',
      accentColor: '#f43f5e',
      iconName: 'ShieldAlert',
      image: '/images/rural-biz-food.jpg',
      frontInsight: 'Review critical operational factors such as supply-chain reliability, seasonal demand cycles and diversified customer linkages.',
      frontInsightHi: 'आपूर्ति-श्रृंखला विश्वसनीयता, मौसमी मांग चक्र और विविध ग्राहक संपर्कों जैसे महत्वपूर्ण परिचालन कारकों की समीक्षा करें।',
      frontInsightMr: 'पुरवठा साखळी, हंगामी मागणी चक्र आणि विविध ग्राहक यांसारख्या आवश्यक घटकांची पडताळणी करा.',
      frontMetrics: [
        { label: 'Key Focus', value: 'Supply & Seasonality' },
        { label: 'Mitigation', value: 'Diversified Buyers' }
      ],
      backData: {
        operationalFactors: [
          {
            name: 'Supply-Chain Reliability',
            desc: `Ensuring steady raw materials and agricultural input supplies during peak harvesting seasons in ${locDisplay}.`
          },
          {
            name: 'Seasonal Demand Variations',
            desc: 'Balancing post-harvest high-volume demand with steady year-round rural consumption.'
          },
          {
            name: 'Diversified Buyer Linkage',
            desc: 'Reducing single-buyer dependency through direct retail, SHGs, and local weekly haats.'
          }
        ],
        riskFactors: [
          {
            name: 'Supply-Chain Reliability',
            desc: `Ensuring steady raw materials and agricultural input supplies during peak harvesting seasons in ${locDisplay}.`
          },
          {
            name: 'Seasonal Demand Variations',
            desc: 'Balancing post-harvest high-volume demand with steady year-round rural consumption.'
          },
          {
            name: 'Diversified Buyer Linkage',
            desc: 'Reducing single-buyer dependency through direct retail, SHGs, and local weekly haats.'
          }
        ],
        mitigationStrategy: 'Maintain a diversified customer base across direct retail consumers, village shops, and weekly haat buyers.',
        actionLabel: 'Review Operational Plan',
        actionRoute: '/journey/growth'
      }
    },

    // 5. COMPETITOR MAPPING
    {
      id: 'competitor-mapping',
      pillarNum: 5,
      title: 'Competitor Mapping',
      titleHi: 'प्रतिस्पर्धी मैपिंग',
      titleMr: 'स्थानिक प्रतिस्पर्धी मॅपिंग',
      tagline: 'Block-Level Business Density',
      taglineHi: 'ब्लॉक-स्तरीय व्यवसाय घनता',
      taglineMr: 'तालुका पातळीवरील व्यवसाय घनता',
      badge: 'Pillar 05',
      bgGradient: 'from-indigo-950/90 via-slate-900/95 to-slate-950',
      accentColor: '#6366f1',
      iconName: 'Compass',
      image: '/images/rural-biz-manufacturing.jpg',
      frontInsight: 'Estimate the density of similar businesses in the selected block using available local demographic and economic data.',
      frontInsightHi: 'उपलब्ध स्थानीय जनसांख्यिकीय और आर्थिक आंकड़ों का उपयोग करके ब्लॉक में समान व्यवसायों के घनत्व का अनुमान लगाएं।',
      frontInsightMr: 'उपलब्ध स्थानिक आर्थिक आकडेवारीच्या आधारे तालुक्यात समान उद्योगांच्या स्पर्धेचा अंदाज घ्या.',
      frontMetrics: [
        { label: 'Coverage', value: block ? `${block} Block` : (district || 'Block Level') },
        { label: 'Mapping Focus', value: 'Similar Enterprises' }
      ],
      backData: {
        densityNote: `In ${locDisplay}, existing ${bizCategory} micro-units primarily serve localized demand with unorganized supply chains.`,
        differentiatorAreas: [
          'Hygienic and standardized packaging versus loose bulk sales',
          'Fair weight measurement and digital UPI payment acceptance',
          'Reliable daily availability matched to local buyer schedules'
        ],
        dataStatus: 'Mapped using available block-level economic and trade data.',
        actionLabel: 'Explore Competition Mapping',
        actionRoute: '/journey/market'
      }
    },

    // 6. PRODUCT MARKET VALUE
    {
      id: 'product-market-value',
      pillarNum: 6,
      title: 'Product Market Value',
      titleHi: 'उत्पाद बाजार मूल्य',
      titleMr: 'उत्पादन मूल्य व दर निश्चिती',
      tagline: 'Cost-Plus & Purchasing Context',
      taglineHi: 'लागत-आधारित मूल्य एवं क्रय संदर्भ',
      taglineMr: 'किंमत निश्चिती व स्थानिक क्रयशक्ती',
      badge: 'Pillar 06',
      bgGradient: 'from-cyan-950/90 via-slate-900/95 to-slate-950',
      accentColor: '#06b6d4',
      iconName: 'DollarSign',
      image: '/images/rural-biz-dairy.jpg',
      frontInsight: 'Assess pricing factors and local market value using product costs and regional purchasing context.',
      frontInsightHi: 'उत्पाद लागत और क्षेत्रीय क्रय क्षमता के आधार पर मूल्य निर्धारण और स्थानीय बाजार मूल्य का आकलन करें।',
      frontInsightMr: 'उत्पादन खर्च आणि स्थानिक ग्रामीण क्रयशक्तीच्या आधारे योग्य दर निश्चित करा.',
      frontMetrics: [
        { label: 'Pricing Model', value: 'Cost-Plus Framework' },
        { label: 'Context', value: 'Regional Purchasing Power' }
      ],
      backData: {
        pricingFramework: [
          'Raw Material Cost: 60%–65% of target retail price',
          'Direct Processing & Utilities: 10%–12%',
          'Packaging & Local Transport: 5%–8%',
          'Target Sustainable Net Margin: 15%–20%'
        ],
        localContextNote: `Pricing structured to remain accessible for rural households while maintaining sustainable margins.`,
        actionLabel: 'Plan Unit Economics',
        actionRoute: '/journey/finance'
      }
    }
  ];
}

/**
 * Exact SIH 26091 Financial Structuring Calculation
 */
export function calculateSIHFinancialStructure(marginCapital) {
  const margin = Math.max(10000, Number(marginCapital) || 100000);
  
  // SIH 26091 exact formula:
  // Margin capital represents standard 10% promoter contribution
  const projectCost = Math.round(margin / 0.10);
  const maxLoan = Math.round(projectCost * 0.90);
  
  // Scheme Routing rule:
  // Project Cost <= 1.40 Lakh -> Micro Finance Scheme
  // Project Cost > 1.40 Lakh and <= 50 Lakh -> Term Loan Scheme (CMEGP / PMEGP / PMFME)
  let schemeCategory = '';
  let schemeSubsidies = '';
  let eligibleSchemes = [];

  if (projectCost <= 140000) {
    schemeCategory = 'Micro Finance Scheme';
    schemeSubsidies = 'MUDRA Shishu / Micro-Credit / NRLM Interest Subvention';
    eligibleSchemes = [
      {
        name: 'Pradhan Mantri MUDRA Yojana (Shishu / Kishore)',
        coverage: 'Up to ₹1.4 Lakh collateral-free micro loan',
        subsidy: 'Low processing fee & interest subvention'
      },
      {
        name: 'NRLM / MAVIM Micro Enterprise Credit',
        coverage: 'Revolving fund & micro group credit for SHGs/individuals',
        subsidy: 'Subsidized 7% annual interest rate'
      }
    ];
  } else {
    schemeCategory = 'Term Loan Scheme';
    schemeSubsidies = 'CMEGP / PMEGP / PMFME (15% to 35% Capital Subsidy)';
    eligibleSchemes = [
      {
        name: 'Chief Minister Employment Generation Programme (CMEGP)',
        coverage: `Up to ₹${(projectCost / 100000).toFixed(1)} Lakh Term Loan in Maharashtra`,
        subsidy: '15% to 35% capital subsidy for rural entrepreneurs'
      },
      {
        name: 'Prime Minister Formalisation of Micro Food Enterprises (PMFME)',
        coverage: 'Credit-linked capital subsidy for agro/food processing',
        subsidy: '35% subsidy up to ₹10.0 Lakh maximum grant'
      },
      {
        name: 'Prime Minister’s Employment Generation Programme (PMEGP)',
        coverage: 'National Khadi & Village Industries (KVIC) credit link',
        subsidy: '25% to 35% margin money assistance in rural areas'
      }
    ];
  }

  // Monthly EMI estimation at standard 9% annual interest for 5-year (60-month) tenure
  const monthlyRate = 0.09 / 12;
  const tenureMonths = 60;
  const emi = Math.round(
    (maxLoan * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  return {
    marginCapital: margin,
    projectCost,
    maxLoan,
    schemeCategory,
    schemeSubsidies,
    eligibleSchemes,
    estimatedMonthlyEmi: emi,
    loanTenureMonths: tenureMonths,
    interestRatePercent: 9.0
  };
}
