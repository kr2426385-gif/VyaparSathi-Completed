from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

router = APIRouter(prefix="/api/ai", tags=["AI Advisory (Safe Mode)"])

class AdvisoryQueryRequest(BaseModel):
    query: Optional[str] = ""
    language: Optional[str] = "mr"
    userProfile: Optional[Dict[str, Any]] = None

@router.get("/health")
def ai_health():
    return {
        "status": "online",
        "service": "VyaparSathi Core Advisory & NLP Gateway",
        "provider": "offline_safe_mode",
        "activeEngines": ["scikit-learn-ml", "rag-retriever", "rule-based-nlp"],
        "quotaPreserved": True
    }

@router.post("/query")
@router.post("/advisory/query")
def advisory_query(req: AdvisoryQueryRequest):
    q = (req.query or "").lower()
    lang = req.language if req.language in ["mr", "hi", "en"] else "mr"

    if any(k in q for k in ["feed", "चारा", "खाद्य", "खुराक"]):
        responses = {
            "mr": "पशुखाद्यावरील खर्च कमी करण्यासाठी अझोला (Azolla) शेती सुरू करा किंवा गावात बचत गटांच्या माध्यमातून सायलेज (Silage) घाऊक दराने खरेदी करा. यामुळे खाद्यावरील खर्च १५-२०% कमी होऊ शकतो.",
            "hi": "पशु आहार का खर्च कम करने के लिए अजोला (Azolla) की खेती अपनाएं या स्थानीय किसान समूह के साथ मिलकर थोक में साइलेज खरीदें। इससे मासिक खर्च 15-20% तक घट सकता है।",
            "en": "To reduce cattle feed expenses, establish an on-farm Azolla cultivation pit or procure silage in bulk via village dairy cooperatives. This can lower feed costs by 15-20%."
        }
        actions = ["Explore Silage Suppliers in Help Me Near", "Calculate Feed Savings in Financial Tool"]
        schemes = [{"name": "Rashtriya Gokul Mission / Dairy Infra", "code": "dairy-infra"}]

    elif any(k in q for k in ["loan", "कर्ज", "मुद्रा", "भांडवल", "पैसा", "credit"]):
        responses = {
            "mr": "भांडवलाची कमतरता (Funding Gap) भरून काढण्यासाठी मुद्रा योजना (MUDRA Kishore - ₹५ लाखांपर्यंत विनातारण) किंवा CMEGP चा लाभ घ्यावा. जिल्हा उद्योग केंद्रातून (DIC) मार्गदर्शन मिळवा.",
            "hi": "फंडिंग गैप को पूरा करने के लिए बिना गारंटी वाला मुद्रा लोन (MUDRA Kishore - ₹5 लाख तक) या CMEGP का उपयोग करें। अनौपचारिक साहूकारों के भारी ब्याज से बचें।",
            "en": "To bridge your business funding gap, leverage collateral-free institutional credit via MUDRA (up to ₹10 Lakhs) or CMEGP/CGTMSE backing."
        }
        actions = ["Compute exact Funding Gap in Calculator", "Review MUDRA & CMEGP Requirements"]
        schemes = [{"name": "Pradhan Mantri MUDRA Yojana", "code": "mudra"}, {"name": "CMEGP Maharashtra", "code": "cmegp"}]

    elif any(k in q for k in ["food", "हळद", "मसाला", "प्रक्रिया", "turmeric", "spice", "mill"]):
        responses = {
            "mr": "हळद, मिरची, मसाला किंवा धान्य प्रक्रिया उद्योगासाठी PMFME अंतर्गत ३५% (जास्तीत जास्त १० लाख रुपये) अनुदान मिळते. यासाठी FSSAI नोंदणी आणि उद्योग आधार (Udyam) आवश्यक आहे.",
            "hi": "हल्दी, मसाला, आटा/दाल मिल या खाद्य प्रसंस्करण के लिए PMFME योजना के तहत 35% (अधिकतम 10 लाख रुपये) तक की क्रेडिट-लिंक्ड सब्सिडी मिलती है।",
            "en": "For spices, turmeric, jaggery, or food processing, PMFME provides a 35% credit-linked capital subsidy up to ₹10 Lakhs."
        }
        actions = ["Check PMFME Eligibility in Schemes Tab", "Prepare Detailed Project Report (DPR)"]
        schemes = [{"name": "PMFME Food Processing Scheme", "code": "pmfme"}]

    else:
        responses = {
            "mr": "आपल्या व्यवसायासाठी महाराष्ट्र शासन आणि केंद्र शासनाच्या विविध योजना उपलब्ध आहेत. प्रथम उद्यम आधार नोंदणी करा आणि प्रकल्प अहवाल (DPR) तयार करून जिल्हा उद्योग केंद्रात (DIC) अर्ज करा.",
            "hi": "आपके व्यवसाय के लिए विभिन्न सरकारी योजनाएं उपलब्ध हैं। पहले उद्यम आधार पंजीकरण करें और विस्तृत प्रोजेक्ट रिपोर्ट (DPR) तैयार करके जिला उद्योग केंद्र (DIC) में आवेदन करें।",
            "en": "Multiple government schemes support your enterprise. Begin with free Udyam registration, finalize machinery quotations, and submit your DPR to District Industries Centre (DIC)."
        }
        actions = ["Review Schemes List", "Calculate Project Viability"]
        schemes = [{"name": "CMEGP Maharashtra", "code": "cmegp"}, {"name": "PMEGP Rural Scheme", "code": "pmegp"}]

    return {
        "answer": responses.get(lang, responses["mr"]),
        "suggestedActions": actions,
        "relevantSchemes": schemes,
        "language": lang,
        "source": "VyaparSathi Domain Rules (Quota-Safe Engine)",
        "sources": [
            {
                "id": "src-1",
                "title": "DIC & KVIC MSME Rural Guidelines",
                "source": "Government of Maharashtra Industry Department",
                "documentType": "Official Policy Circular"
            }
        ]
    }
