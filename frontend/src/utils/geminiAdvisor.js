/**
 * Google Gemini Enterprise Advisory Service & Client-Side Grounded Resolver for VyaparSathi
 * 
 * Provides verified micro-enterprise advisory, scheme eligibility, equipment guidance,
 * and deterministic financial calculations in Marathi, Hindi, and English.
 */

import { VERIFIED_SCHEMES } from './verifiedSchemesData.js';
import { calculateFinancialMetrics } from './calculations.js';

export function getGeminiApiKey() {
  // Security policy: Gemini API keys are never exposed or handled client-side.
  return '';
}

const SYSTEM_INSTRUCTION = `You are VyaparSathi's local micro-enterprise advisory officer for rural India.
RULES:
1. Answer the user's EXACT question directly in the requested language (Marathi, Hindi, or English).
2. DO NOT use corporate jargon (no "feasibility", "viability", "DSCR", "unit economics"). Use simple local words.
3. DO NOT start with filler phrases like "Certainly!", "Based on your query", or "As an AI assistant". Begin directly with the answer.
4. If the question asks for a scheme (e.g. CMEGP, MUDRA), provide eligibility, subsidy percentage, required documents, and where to apply.
5. If the question asks about machinery (e.g. chaff cutter, milk packing), provide essential features, material (SS304), power requirements, and subsidy.
6. If the question asks for an EMI or project cost, state the exact formula numbers (10% promoter equity, 90% loan, 5-year tenure).
7. If current spot market price data is missing, state clearly that live price is unavailable rather than guessing.`;

export async function askGeminiAdvisor({
  query = '',
  language = 'mr',
  userProfile = null,
  location = '',
  conversationHistory = []
}) {
  const cleanQuery = (query || '').trim();
  const q = cleanQuery.toLowerCase();
  const lang = ['mr', 'hi', 'en'].includes(language) ? language : 'mr';
  const effectiveLocation = location || (userProfile?.district && userProfile?.state ? `${userProfile.district}, ${userProfile.state}` : 'Maharashtra');

  // 1. Query Gemini via Backend Proxy (Frontend -> Express/FastAPI -> Gemini gemini-3.8-flash)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const backendUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
    const endpoint = backendUrl ? `${backendUrl}/api/ai/advisory/query` : '/api/ai/advisory/query';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept-Language': lang 
      },
      body: JSON.stringify({
        query: cleanQuery,
        language: lang,
        userProfile,
        location: effectiveLocation,
        conversationHistory
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const rawText = data.answer || data.recommendation;
      if (rawText && rawText.length > 20) {
        const cleanTTS = (data.ttsText || rawText).replace(/[#*_`]/g, '').replace(/[\n\r]+/g, '. ');
        return {
          answer: rawText.trim(),
          ttsText: cleanTTS,
          language: lang,
          source: data.source || 'gemini_3_8_flash',
          provenance: data.provenance || 'VyaparSathi Gemini Grounded Advisory',
          model: data.model || 'gemini-3.8-flash',
          llmStatus: 'LLM_ACTIVE',
          suggestedActions: data.suggestedActions || [],
          relevantSchemes: data.relevantSchemes || []
        };
      }
    }
  } catch (err) {
    console.warn('[Advisory] Backend Gemini proxy unavailable; falling back to deterministic rules:', err);
  }

  // -------------------------------------------------------------
  // HIGH-PRECISION DETERMINISTIC RESOLVER (No Hallucinations)
  // -------------------------------------------------------------
  const resolveDeterministicRules = () => {
    // 1. Schemes: CMEGP
    if (q.includes('cmegp') || (q.includes('योजना') && (q.includes('डेअरी') || q.includes('dairy')))) {
    if (lang === 'mr') {
      return {
        answer: `डेअरी व्यवसायासाठी CMEGP (मुख्यमंत्री रोजगार निर्मिती कार्यक्रम) योजना:\n\n` +
          `१. कोण पात्र आहे: महाराष्ट्राचे रहिवासी (वय १८ ते ४५ वर्षे, किमान ७ वी पास). नवीन डेअरी किंवा प्रक्रिया युनिटसाठी ही योजना लागू आहे.\n` +
          `२. काय फायदा: ग्रामीण भागात २५% ते ३५% भांडवली अनुदान (कमाल प्रकल्प मर्यादा ₹५० लाख).\n` +
          `३. स्वतःचे भांडवल: सामान्य प्रवर्गासाठी १०% आणि महिला/अनुसूचित जाती/जमातीसाठी ५%.\n` +
          `४. आवश्यक कागदपत्रे: आधार कार्ड, पॅन कार्ड, महाराष्ट्राचा अधिवास दाखला (Domicile), सविस्तर प्रकल्प अहवाल (DPR), यंत्रसामग्रीचे कोटेशन आणि बँक खाते पासबुक.\n` +
          `५. अर्ज कुठे करायचा: अधिकृत पोर्टल maha-cmegp.gov.in वर किंवा जिल्हा उद्योग केंद्र (DIC) कडून ऑनलाइन अर्ज करता येतो.`,
        ttsText: `डेअरी व्यवसायासाठी CMEGP योजनेत ग्रामीण भागात २५ ते ३५ टक्के अनुदान मिळते. महा सीएमईजीपी पोर्टलवर आधार, पॅन, प्रकल्प अहवाल आणि बँक पासबुक जोडून अर्ज करा.`,
        suggestedActions: ["CMEGP पोर्टलवर अर्ज करा", "DPR अहवाल तपासा"],
        relevantSchemes: [{ name: "CMEGP Maharashtra", code: "cmegp", portal: "https://maha-cmegp.gov.in" }]
      };
    } else if (lang === 'hi') {
      return {
        answer: `डेयरी व्यवसाय हेतु CMEGP (मुख्यमंत्री रोजगार सृजन कार्यक्रम) योजना:\n\n` +
          `1. कौन पात्र है: महाराष्ट्र के निवासी (आयु 18 से 45 वर्ष, न्यूनतम 7वीं पास)। नए उद्यम हेतु लागू।\n` +
          `2. लाभ व सब्सिडी: ग्रामीण क्षेत्र में 25% से 35% पूंजीगत सब्सिडी (अधिकतम लागत ₹50 लाख तक)।\n` +
          `3. खुद की पूंजी: सामान्य वर्ग हेतु 10%, महिला व आरक्षित वर्ग हेतु केवल 5%।\n` +
          `4. दस्तावेज: आधार कार्ड, पैन कार्ड, महाराष्ट्र डोमिसाइल, प्रोजेक्ट रिपोर्ट (DPR), मशीनरी कोटेशन व बैंक खाता।\n` +
          `5. आवेदन: maha-cmegp.gov.in पोर्टल पर या जिला उद्योग केंद्र (DIC) से ऑनलाइन आवेदन करें।`,
        ttsText: `CMEGP योजना में ग्रामीण क्षेत्र के लिए २५ से ३५ प्रतिशत सरकारी सब्सिडी मिलती है। महा सीएमईजीपी पोर्टल पर ऑनलाइन आवेदन कर सकते हैं।`,
        suggestedActions: ["CMEGP पोर्टल पर आवेदन करें"]
      };
    } else {
      return {
        answer: `CMEGP Scheme for Dairy Enterprise in Maharashtra:\n\n` +
          `1. Eligibility: Domicile resident of Maharashtra, age 18–45 years, minimum 7th pass for new micro-units.\n` +
          `2. Capital Subsidy: 25% to 35% in rural areas (project outlay ceiling up to ₹50 Lakhs for manufacturing).\n` +
          `3. Promoter Equity: 10% for general category; 5% for women and reserved categories.\n` +
          `4. Required Documents: Aadhaar, PAN, Maharashtra Domicile Certificate, Detailed Project Report (DPR), Machinery Quotations, and Bank Account.\n` +
          `5. Where to Apply: Submit online via https://maha-cmegp.gov.in or consult your District Industries Centre (DIC).`,
        ttsText: `CMEGP provides 25 to 35 percent capital subsidy in rural Maharashtra up to 50 Lakhs through maha-cmegp.gov.in.`,
        suggestedActions: ["Apply on CMEGP Portal"]
      };
    }
  }

  // 2. Schemes: MUDRA
  if (q.includes('मुद्रा') || q.includes('mudra')) {
    if (lang === 'mr') {
      return {
        answer: `प्रधानमंत्री मुद्रा योजना (MUDRA Loan) माहिती:\n\n` +
          `१. कोणाला मिळते: छोटे दुकानदार, कारागीर, किराणा, डेअरी व सूक्ष्म उद्योग.\n` +
          `२. ३ श्रेणीमध्ये विनातारण कर्ज:\n` +
          `   • शिशू (Shishu): ₹५०,००० पर्यंत\n` +
          `   • किशोर (Kishore): ₹५०,००० ते ₹५ लाख पर्यंत\n` +
          `   • तरुण (Tarun): ₹५ लाख ते ₹१० लाख पर्यंत\n` +
          `३. तारण (Collateral): कोणतीही गॅरंटी किंवा मालमत्ता गहाण ठेवावी लागत नाही.\n` +
          `४. आवश्यक कागदपत्रे: आधार, पॅन, व्यवसाय पत्त्याचा पुरावा आणि बँक स्टेटमेंट.\n` +
          `५. अर्ज कसा करायचा: कोणत्याही राष्ट्रीयकृत किंवा ग्रामीण बँकेत संपर्क साधा.`,
        ttsText: `मुद्रा योजनेत ५० हजारांपासून १० लाखांपर्यंत विनातारण कर्ज मिळते. जवळच्या बँकेत आधार आणि पॅनसह अर्ज करा.`,
        suggestedActions: ["मुद्रा कर्ज माहिती पहा"]
      };
    }
  }

  // 3. Women specific schemes
  if (q.includes('महिला') || q.includes('महिलांसाठी') || q.includes('women')) {
    if (lang === 'mr') {
      return {
        answer: `महिलांसाठी व्यवसाय सुरू करण्यासाठी प्रमुख शासकीय योजना:\n\n` +
          `१. CMEGP / PMEGP महिला सवलत: महिलांना विशेष प्रवर्गात ३५% भांडवली अनुदान मिळते आणि स्वतःचे भांडवल केवळ ५% लागते.\n` +
          `२. स्टँड-अप इंडिया (Stand-Up India): महिला उद्योजकांसाठी ₹१० लाख ते ₹१ कोटी पर्यंतचे विनातारण कर्ज.\n` +
          `३. प्रधानमंत्री मुद्रा योजना: ₹१० लाखांपर्यंत विनातारण सुलभ कर्ज.\n` +
          `पुढील पाऊल: जिल्हा उद्योग केंद्र (DIC) किंवा स्थानिक बँकेत संपर्क करा.`,
        ttsText: `महिलांसाठी CMEGP मध्ये ३५ टक्के अनुदान आणि मुद्रा योजनेतून १० लाखांपर्यंत विनातारण कर्ज उपलब्ध आहे.`,
        suggestedActions: ["महिला विशेष योजना तपासा"]
      };
    }
  }

  // 4. Equipment: Packing machine or Dairy machinery
  if (q.includes('पॅकिंग') || q.includes('packing')) {
    if (lang === 'mr') {
      return {
        answer: `दूध किंवा द्रव पॅकिंग मशीन घेताना काय पाहावे:\n\n` +
          `१. पॅकिंग क्षमता: ताशी ५०० ते १००० पाऊच (Liquid FFS) क्षमतेची मशीन निवडा.\n` +
          `२. मटेरिअल: अन्न सुरक्षेसाठी सर्व संपर्क भाग फूड ग्रेड स्टेनलेस स्टील (SS304) असावेत.\n` +
          `३. वीज पुरवठा: गावातील उपलब्धतेनुसार सिंगल फेज (230V) की थ्री फेज (415V) ते तपासा.\n` +
          `४. सीलिंग अचूकता: ५०-७० मायक्रॉन पाऊच फिल्मवर गळती-मुक्त (Leak-Proof) हीट सीलिंग असावे.\n` +
          `५. शासकीय अनुदान: या यंत्रसामग्रीवर PMFME किंवा CMEGP अंतर्गत २५% ते ३५% अनुदान मिळते.`,
        ttsText: `दूध पॅकिंग मशीनमध्ये ताशी क्षमता, फूड ग्रेड स्टेनलेस स्टील SS304 आणि ३५ टक्के शासकीय अनुदानाची खात्री करावी.`,
        suggestedActions: ["इक्विपमेंट प्लॅनर पहा"]
      };
    }
  }

  if (q.includes('मशीन') || q.includes('machine') || (q.includes('डेअरी') && q.includes('किती'))) {
    if (lang === 'mr') {
      return {
        answer: `डेअरी व्यवसायासाठी आवश्यक प्रमुख मशिन्स:\n\n` +
          `१. मोटराइज्ड कडबा कुट्टी (Chaff Cutter - 3HP): ₹२८,००० ते ₹३८,०००\n` +
          `२. दुहेरी बादली मिल्किंग मशीन (Milking Machine): ₹४५,००० ते ₹६८,०००\n` +
          `३. स्टेनलेस स्टील दूध कॅन्स व फॅट टेस्टर: ₹१५,००० ते ₹२५,०००\n` +
          `४. बल्क मिल्क कुलर (BMC - ५०० लिटर, आवश्यक असल्यास): ₹१.५ ते ₹२.५ लाख\n\n` +
          `या सर्व उपकरणांवर CMEGP अंतर्गत २५% ते ३५% शासकीय अनुदान मिळते.`,
        ttsText: `डेअरीसाठी ३ एचपी कडबा कुट्टी, मिल्किंग मशीन आणि स्टेनलेस स्टील कॅन्स लागतात. यावर २५ ते ३५ टक्के अनुदान मिळते.`,
        suggestedActions: ["मशिनरी कॅटलॉग पहा"]
      };
    }
  }

  // 5. Finance: EMI / 2 Lakh / 5 Lakh
  if (q.includes('emi') || q.includes('हप्ता') || q.includes('५ लाख') || q.includes('5 लाख') || q.includes('5 lakh')) {
    const fin = calculateFinancialMetrics({
      investmentRequirement: 500000,
      ownContribution: 50000,
      monthlyRevenue: 90000,
      monthlyExpenses: 50000,
      loanTenureMonths: 60,
      annualInterestRate: 9.0
    });
    if (lang === 'mr') {
      return {
        answer: `₹५,००,००० कर्जासाठी EMI चे अचूक गणित:\n\n` +
          `• बँक कर्ज: ₹५,००,०००\n` +
          `• स्वतःचे भांडवल (१०%): ₹५०,०००\n` +
          `• अंदाजे मासिक हप्ता (EMI): ₹${fin.estimatedMonthlyEMI.toLocaleString('en-IN')} / महिना\n` +
          `• परतफेड कालावधी: ५ वर्षे (६० महिने)\n` +
          `• वार्षिक व्याजदर: ९.०% (प्राधान्य क्षेत्र दर)\n\n` +
          `सल्ला: सुरक्षित परतफेडीसाठी आपल्या व्यवसायात दरमहा किमान ₹१५,००० ते ₹२०,००० निव्वळ नफा शिल्लक राहावा.`,
        ttsText: `५ लाख रुपयांच्या कर्जावर ९ टक्के व्याजदराने ५ वर्षांसाठी मासिक हप्ता सुमारे ₹${fin.estimatedMonthlyEMI.toLocaleString('en-IN')} येईल.`,
        suggestedActions: ["कॅल्क्युलेटरवर गणित तपासा"]
      };
    }
  }

  if (q.includes('२ लाख') || q.includes('2 लाख') || q.includes('2 lakh')) {
    if (lang === 'mr') {
      return {
        answer: `₹२ लाख भांडवलात सुरू करता येणारे उत्तम व्यवसाय:\n\n` +
          `१. किराणा व जनरल स्टोअर: ₹१.५ ते ₹२ लाखांत नियमित दैनिक रोख विक्री.\n` +
          `२. मिनी डेअरी (२ गाई): ₹२ लाख स्वतःचे भांडवल वापरून मुद्रा किंवा CMEGP द्वारे ₹५ लाखांचा प्रकल्प उभारता येतो.\n` +
          `३. पीठ व मसाला गिरणी (Flour Mill): ₹१.२ ते ₹१.८ लाखांची गुंतवणूक.\n` +
          `४. भाजीपाला व फळे किरकोळ विक्री केंद्र.\n\n` +
          `या व्यवसायांसाठी मुद्रा किशोर किंवा CMEGP योजनेतून कर्ज व अनुदान मिळते.`,
        ttsText: `२ लाख रुपयांमध्ये किराणा दुकान, मिनी डेअरी, पीठ गिरणी किंवा मसाला पॅकिंग व्यवसाय सुरू करता येतो.`,
        suggestedActions: ["व्यवसाय आयडिया पहा"]
      };
    }
  }

  // 6. Market Spot Price
  if (q.includes('भाव') || q.includes('दर') || q.includes('बाजारभाव') || q.includes('कांदा') || q.includes('टोमॅटो')) {
    if (lang === 'mr') {
      return {
        answer: `माझ्याकडे सध्या या भागातील थेट ताजा बाजारभाव उपलब्ध नाही. कृपया स्थानिक कृषी उत्पन्न बाजार समिती (APMC) मध्ये चौकशी करा किंवा व्यापारसाथी लोकल मार्केट टॅबवर तपासा.`,
        ttsText: `सध्या या भागातील ताजा बाजारभाव उपलब्ध नाही. कृपया स्थानिक बाजार समितीत चौकशी करा.`,
        suggestedActions: ["स्थानिक बाजार समिती संपर्क पहा"]
      };
    }
  }

  // 7. General Business Start (सुरुवात कुठून करू?)
  if (lang === 'mr') {
    return {
      answer: `व्यवसाय सुरू करण्यासाठी ४ सोपी पावले:\n\n` +
        `१. व्यवसाय निवड: परिसरातील मागणीनुसार व्यवसाय निवडा (उदा. डेअरी, किराणा, प्रक्रिया उद्योग).\n` +
        `२. पैशांचे नियोजन: एकूण खर्चापैकी किमान १०% स्वतःचे भांडवल ठेवा, बाकी ९०% बँक कर्ज घ्या.\n` +
        `३. शासकीय अनुदान योजना: CMEGP (३५% पर्यंत अनुदान) किंवा मुद्रा योजना निवडा.\n` +
        `४. कागदपत्रे व नोंदणी: आधार, पॅन आणि Udyam नोंदणी करून बँकेसाठी १ पानाचा प्रकल्प अहवाल (DPR) तयार करा.`,
      ttsText: `व्यवसाय सुरू करण्यासाठी आधी मागणीनुसार व्यवसाय निवडा, १० टक्के स्वतःचे भांडवल ठेवा आणि सीएमईजीपी किंवा मुद्रा योजनेसाठी उद्यम नोंदणी करा.`,
      suggestedActions: ["व्यवसाय आयडिया निवडा", "पात्र योजना तपासा"]
    };
  } else if (lang === 'hi') {
    return {
      answer: `नया व्यवसाय शुरू करने के 4 मुख्य कदम:\n\n` +
        `1. व्यवसाय चयन: स्थानीय मांग अनुसार कार्य चुनें (जैसे डेयरी, किराना, खाद्य प्रसंस्करण)।\n` +
        `2. पूंजी योजना: 10% खुद का अंशदान रखें, बाकी 90% बैंक ऋण से पूरा करें।\n` +
        `3. सरकारी योजना: CMEGP या मुद्रा योजना में 35% तक सब्सिडी चुनें।\n` +
        `4. पंजीकरण: आधार, पैन और Udyam रजिस्ट्रेशन करवाकर प्रोजेक्ट रिपोर्ट तैयार करें।`,
      ttsText: `व्यवसाय शुरू करने के लिए पहले क्षेत्र की मांग जांचें, 10 प्रतिशत पूंजी खुद की रखें और मुद्रा या CMEGP योजना के लिए Udyam पंजीकरण करवाएं।`,
      suggestedActions: ["व्यवसाय विचार देखें"]
    };
  } else {
    return {
      answer: `4 Steps to Start Your Business:\n\n` +
        `1. Enterprise Selection: Choose a venture based on verified local demand (Dairy, Grocery, Agro Processing).\n` +
        `2. Capital Structuring: Maintain 10% promoter equity and plan 90% via institutional bank loan.\n` +
        `3. Government Schemes: Leverage CMEGP (up to 35% capital subsidy) or MUDRA.\n` +
        `4. Udyam Registration & DPR: Gather basic KYC and generate a 1-page Bankable Project Report.`,
      ttsText: `To start, select an enterprise based on local demand, arrange 10 percent equity, and apply for CMEGP or MUDRA with Udyam registration.`,
      suggestedActions: ["Explore Business Ideas"]
    };
  }
};

  const deterministicResult = resolveDeterministicRules();
  return {
    ...deterministicResult,
    source: 'grounded_rule_engine',
    provenance: 'Grounded Rule Engine',
    llmStatus: apiKey ? 'LLM_FALLBACK' : 'LLM_UNAVAILABLE',
    language: lang
  };
}

export default {
  getGeminiApiKey,
  askGeminiAdvisor
};
