import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, HelpCircle, FileCheck, Landmark, DollarSign, Shield } from 'lucide-react';

export default function FAQSection() {
  const { t, i18n } = useTranslation();
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "CMEGP आणि PMEGP या योजनांमध्ये मुख्य फरक काय आहे?",
      qEn: "What is the key difference between CMEGP and PMEGP schemes?",
      a: "CMEGP (मुख्यमंत्री रोजगार निर्मिती कार्यक्रम) ही महाराष्ट्र शासनाची योजना असून यासाठी महाराष्ट्र अधिवास (Domicile) आवश्यक आहे. यात ₹५० लाखांपर्यंतच्या उत्पादन प्रकल्पांना १५% ते ३५% भांडवली अनुदान मिळते. PMEGP ही केंद्र शासनाची खादी व ग्रामोद्योग आयोग (KVIC) अंतर्गत चालवली जाणारी देशव्यापी योजना असून ग्रामीण भागात विशेष प्रवर्गासाठी ३५% अनुदान दिले जाते. एका प्रकल्पासाठी एकाच योजनेचा लाभ घेता येतो.",
      aEn: "CMEGP is specific to Maharashtra state requiring a state domicile certificate, offering 15-35% subsidy on manufacturing projects up to ₹50 Lakhs. PMEGP is a central scheme run via KVIC offering up to 35% subsidy in rural areas nationwide. Beneficiaries can only avail of one capital subsidy scheme per business enterprise.",
      cat: "Schemes"
    },
    {
      q: "डेअरी किंवा शेतीपूरक व्यवसायासाठी ७/१२ उतारा आवश्यक आहे का?",
      qEn: "Is a 7/12 land extract mandatory for dairy or agro-allied business?",
      a: "जर आपण स्वतःच्या शेतात गोठा किंवा प्रक्रिया शेड बांधणार असाल, तर जागेचा ७/१२ व ८-अ उतारा आवश्यक असतो. मात्र जर व्यवसाय भाडेतत्त्वावर किंवा एमआयडीसी / ग्रामपंचायत क्षेत्रात सुरू करत असाल, तर नोंदणीकृत भाडेकरार (Registered Lease Agreement - किमान ३ ते ५ वर्षे) ग्राह्य धरला जातो.",
      aEn: "If you are setting up a cattle shed or processing unit on agricultural land, 7/12 and 8-A land records are required. However, for rented village or MIDC premises, a registered lease agreement of minimum 3 to 5 years is officially accepted.",
      cat: "Documents"
    },
    {
      q: "उद्यम नोंदणी (Udyam Registration) मोफत आहे का? कशी करावी?",
      qEn: "Is Udyam Registration free of cost? How to apply?",
      a: "होय, भारत सरकारच्या udyamregistration.gov.in या अधिकृत पोर्टलवर उद्यम नोंदणी १००% मोफत आहे. यासाठी कोणत्याही दलालाला पैसे देण्याची गरज नाही. केवळ आधार कार्ड, पॅन कार्ड आणि व्यवसायाचा पत्ता या आधारे अवघ्या १० मिनिटांत प्रमाणपत्र मिळते.",
      aEn: "Yes, Udyam Registration on the official government portal (udyamregistration.gov.in) is 100% free of cost. Never pay external agents. You only need your Aadhaar, PAN, and village business address.",
      cat: "Registration"
    },
    {
      q: "मुद्रा योजनेतून (MUDRA) कर्ज घेण्यासाठी तारण (Collateral) द्यावे लागते का?",
      qEn: "Is third-party collateral required for obtaining a MUDRA loan?",
      a: "नाही. प्रधानमंत्री मुद्रा योजनेअंतर्गत शिशु (₹५० हजारांपर्यंत), किशोर (₹५० हजार ते ₹५ लाख) आणि तरुण (₹५ लाख ते ₹१० लाख) या तिन्ही श्रेणींमध्ये कोणतेही तारण किंवा गॅरंटर लागत नाही. हे कर्ज CGTMSE हमी अंतर्गत बँकांद्वारे मंजूर केले जाते.",
      aEn: "No. Under Pradhan Mantri MUDRA Yojana (Shishu, Kishore, and Tarun brackets up to ₹10 Lakhs), loans are strictly collateral-free and backed by government credit guarantees.",
      cat: "Finance"
    },
    {
      q: "व्यापारसाथीवर माझी माहिती सुरक्षित राहते का?",
      qEn: "Is my business data secure and confidential on VyaparSathi?",
      a: "होय. आपण प्रविष्ट केलेले उत्पन्न, खर्च व भांडवली आकडे केवळ आपल्या खाजगी खात्यामध्ये सुरक्षित साठवले जातात. प्लॅटफॉर्मवर कोणताही बनावट डेटा वापरला जात नाही आणि सर्व आर्थिक आकडेवारी आपल्या खऱ्या नोंदींवरूनच मोजली जाते.",
      aEn: "Yes. Your business numbers (revenue, expenses, capital) remain strictly private to your authenticated entrepreneur account. VyaparSathi never uses fake figures or exposes private metrics.",
      cat: "Privacy"
    },
    {
      q: "शासकीय अनुदानाची रक्कम (Subsidy) थेट हातात मिळते का?",
      qEn: "Is the government subsidy disbursed directly in cash?",
      a: "नाही. सर्व शासकीय योजनांमध्ये अनुदान हे 'बॅक-एंडेड' (Back-Ended Subsidy) स्वरूपात असते. बँक मंजूर केलेल्या मुदत कर्जाच्या खात्यामध्ये अनुदानाची रक्कम जमा होते आणि ती ३ वर्षे विशिष्ट ठेव (TDR) म्हणून राहते. प्रकल्प व्यवस्थित सुरू राहिल्यास कर्जाची मुद्दल त्या प्रमाणात कमी होते.",
      aEn: "No. Government capital subsidies under CMEGP and PMEGP are 'back-ended'. The subsidy amount is kept in a term deposit at the lending bank branch for a lock-in period of 3 years and subsequently credited against the principal loan amount upon successful enterprise inspection.",
      cat: "Schemes"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 select-none space-y-6">
      
      {/* Title */}
      <div className="border-b border-stone-200 pb-3">
        <span className="text-xs font-black uppercase tracking-wider text-[#0b2545] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
          माहिती व मार्गदर्शन • Verified Knowledge Base
        </span>
        <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight mt-1">
          {t('faq_heading')}
        </h2>
        <p className="text-xs text-stone-500 font-medium mt-0.5">
          {t('faq_subheading')}
        </p>
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          const questionText = (i18n.language === 'en') ? faq.qEn : faq.q;
          const answerText = (i18n.language === 'en') ? faq.aEn : faq.a;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 text-[#0b2545] flex items-center justify-center text-xs font-black shrink-0">
                    Q{idx + 1}
                  </div>
                  <span className="font-extrabold text-sm md:text-base text-stone-900">
                    {questionText}
                  </span>
                </div>

                <div className="p-1 rounded-lg text-stone-400 shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-stone-100 text-xs md:text-sm text-stone-700 leading-relaxed font-medium bg-stone-50/30 animate-slideDown">
                  <p>{answerText}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
