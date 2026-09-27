/**
 * VyaparSathi SWOT Matrix Localization Engine
 * 
 * Safely translates dynamic ground-truth SWOT statements into clean, natural Hindi ('hi')
 * and Marathi ('mr') while preserving raw values in English ('en').
 * Never returns undefined; falls back to original text if unmapped.
 */

export function localizeSWOTText(text, lang = 'en') {
  if (!text || typeof text !== 'string') return text || '';
  if (lang === 'en') return text;

  const t = text.trim();

  // 1. Demand & Market Score
  if (t.includes('Strong local market demand tier identified for')) {
    const biz = t.replace('Strong local market demand tier identified for', '').replace(/\.$/, '').trim();
    if (lang === 'mr') return `${biz} व्यवसायासाठी स्थानिक बाजारपेठेत उच्च मागणी नोंदवली गेली आहे.`;
    return `${biz} व्यवसाय के लिए स्थानीय बाजार में मजबूत मांग दर्ज की गई है।`;
  }

  if (t.includes('High estimated market opportunity score')) {
    const match = t.match(/\((\d+\/\d+)\)/);
    const score = match ? match[1] : '';
    if (lang === 'mr') return `अनुकूल स्थानिक आर्थिक घटकांमुळे उच्च बाजारपेठ संधी गुण (${score}) प्राप्त.`;
    return `अनुकूल स्थानीय आर्थिक संकेतकों के आधार पर उच्च बाजार अवसर स्कोर (${score})।`;
  }

  if (t.includes('Uncontested local cluster with zero direct mapped competitors')) {
    if (lang === 'mr') return 'स्थानिक कार्यक्षेत्रात कोणतीही थेट स्पर्धा नसलेला मोकळा बाजार उपलब्ध.';
    return 'स्थानीय क्लस्टर में कोई सीधा प्रतिस्पर्धी नहीं, खुला बाजार उपलब्ध।';
  }

  if (t.includes('Low competitor density')) {
    if (lang === 'mr') return 'परिसरात कमी व्यावसायिक स्पर्धा, स्थानिक ग्राहक जोडणी सुलभ.';
    return 'परिसर में कम प्रतिस्पर्धी घनत्व, स्थानीय ग्राहकों तक सीधी पहुंच।';
  }

  // 2. Electricity & Water
  if (t.includes('Assured 3-phase commercial grid electricity')) {
    if (lang === 'mr') return 'व्यवसाय जागेवर ३-फेज अखंड वीज पुरवठा उपलब्ध आहे.';
    return 'व्यवसाय स्थल पर ३-फेज वाणिज्यिक ग्रिड बिजली की सुनिश्चित उपलब्धता।';
  }

  if (t.includes('Assured on-site water supply')) {
    if (lang === 'mr') return 'सातत्यपूर्ण उत्पादनासाठी जागेवर खात्रीशीर पाणी पुरवठा उपलब्ध.';
    return 'निरंतर उत्पादन संचालन के लिए स्थल पर सुनिश्चित जल आपूर्ति उपलब्ध।';
  }

  // 3. Subsidies & Schemes
  if (t.includes('Prime Minister’s Employment Generation Programme (PMEGP)') || t.includes("Prime Minister's Employment Generation Programme (PMEGP)")) {
    if (t.includes('Subsidized expansion and credit guarantee')) {
      if (lang === 'mr') return 'PMEGP योजनेअंतर्गत २५% ते ३५% भांडवली अनुदान व हमीमुक्त कर्ज सहाय्य उपलब्ध.';
      return 'PMEGP योजना के तहत २५% से ३५% पूंजीगत सब्सिडी एवं बैंक क्रेडिट गारंटी उपलब्ध।';
    }
    if (lang === 'mr') return 'पंतप्रधान रोजगार निर्मिती कार्यक्रमांतर्गत (PMEGP) भांडवली अनुदानासाठी पात्र.';
    return 'प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP) के तहत पूंजीगत सब्सिडी सहायता हेतु पात्र।';
  }

  if (t.includes('PMFME') || t.includes('Food Processing')) {
    if (lang === 'mr') return 'PMFME योजनेअंतर्गत ३५% क्रेडिट-लिंक्ड भांडवली अनुदानासाठी पात्र.';
    return 'पीएमएफएमई (PMFME) योजना के तहत ३५% क्रेडिट लिंक्ड सब्सिडी हेतु पात्र।';
  }

  if (t.includes('Healthy net operating margin')) {
    if (lang === 'mr') return 'चांगला नफा दर, ज्यामुळे बँक कर्जाची परतफेड सुलभपणे शक्य.';
    return 'सशक्त शुद्ध परिचालन मार्जिन, जिससे बैंक ऋण की मासिक किस्त (EMI) चुकाना सुगम।';
  }

  if (t.includes('Accessible capital entry barrier')) {
    if (lang === 'mr') return 'कमी भांडवली गुंतवणूक मर्यादा; स्वतःचे भांडवल सुलभपणे उभे करणे शक्य.';
    return 'सुलभ पूंजीगत प्रवेश; उद्यमी का स्वयं का अंशदान अनुकूल सीमा में।';
  }

  // 4. Opportunities
  if (t.includes('Expanding market reach into adjacent villages')) {
    if (lang === 'mr') return '१० किमी परिसरातील लगतच्या गावांमध्ये व्यवसाय विस्ताराची मोठी संधी.';
    return '१० किमी क्लस्टर के आसपास के गांवों में बाजार पहुंच का विस्तार करने का अवसर।';
  }

  if (t.includes('Stable regular demand') && t.includes('weekly haats')) {
    if (lang === 'mr') return 'स्थानिक आठवडी बाजार व तालुक्याच्या ठिकाणी उत्पादनांना नियमित मागणी.';
    return 'स्थानीय साप्ताहिक हाटों और तालुका बाजारों में उत्पादों की नियमित मांग।';
  }

  // 5. Weaknesses & Threats
  if (t.includes('Small operational scale requiring continuous working capital discipline')) {
    if (lang === 'mr') return 'सुरुवातीचा मर्यादित आकार, ज्यामुळे खेळत्या भांडवलाचे काटेकोर नियोजन आवश्यक आहे.';
    return 'सीमित प्रारंभिक पैमाना, जिसके लिए निरंतर कार्यशील पूंजी अनुशासन आवश्यक है।';
  }

  if (t.includes('High dependency on seasonal raw materials') || t.includes('seasonal raw materials')) {
    if (lang === 'mr') return 'हंगामी कच्च्या मालावर अवलंबित्व; योग्य साठवणूक नियोजन आवश्यक.';
    return 'मौसमी कच्चे माल पर निर्भरता; उचित भंडारण योजना आवश्यक।';
  }

  if (t.includes('Competitor Proximity')) {
    const match = t.match(/Direct competitor "([^"]+)" operates within ([^.]+)/);
    if (match) {
      const compName = match[1];
      const dist = match[2];
      if (lang === 'mr') return `स्पर्धक अंतर: थेट व्यावसायिक स्पर्धक "${compName}" सुमारे ${dist} परिसरात कार्यरत.`;
      return `प्रतिस्पर्धी निकटता: प्रत्यक्ष प्रतिस्पर्धी "${compName}" लगभग ${dist} के दायरे में संचालित है।`;
    }
    if (lang === 'mr') return 'नजीकच्या अंतरावर प्रतिस्पर्धी दुकानांची उपस्थिती.';
    return 'समीप के दायरे में प्रतिस्पर्धी इकाइयों की उपस्थिति।';
  }

  if (t.includes('Price Volatility')) {
    if (lang === 'mr') return 'स्थानिक बाजारभावातील चढ-उतार; किंमत संरक्षणासाठी थेट ग्राहक विक्री फायदेशीर.';
    return 'स्थानीय बाजार भावों में उतार-चढ़ाव; मूल्य स्थिरता हेतु सीधे खुदरा बिक्री अनुशंसित।';
  }

  return t;
}

export default localizeSWOTText;
