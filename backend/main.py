import os
from fastapi import FastAPI, HTTPException, Response, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from services.ml_service import ml_service
from rag.rag_service import rag_service
from voice.voice_service import voice_service
from services.indic_asr_service import IndicConformerASRService
from services.indic_tts_service import IndicParlerTTSService

load_dotenv()

indic_asr = IndicConformerASRService.get_instance()
indic_tts = IndicParlerTTSService.get_instance()

app = FastAPI(
    title="VyaparSathi AI Advisory & NLP Service",
    description="Contextual business advisory, multi-lingual query parsing, and ML prediction services for MSME and rural entrepreneurs across all Indian states.",
    version="1.1.0"
)

# Enable CORS for frontend and backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Business & Feature Routers
from routers.auth import router as auth_router
from routers.profile import router as profile_router
from routers.calculator import router as calculator_router
from routers.schemes import router as schemes_router
from routers.locations import router as locations_router
from routers.assessments import router as assessments_router
from routers.loan_readiness import router as loan_readiness_router
from routers.equipment import router as equipment_router
from routers.market_intelligence import router as market_intelligence_router
from routers.pricing import router as pricing_router
from routers.competitors import router as competitors_router
from routers.guidance import router as guidance_router
from routers.dashboard import router as dashboard_router
from routers.reports import router as reports_router
from routers.ondc import router as ondc_router
from routers.roles import router as roles_router
from routers.ai_advisory import router as ai_advisory_router
from routers.recommendations import router as recommendations_router

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(calculator_router)
app.include_router(schemes_router)
app.include_router(locations_router)
app.include_router(assessments_router)
app.include_router(loan_readiness_router)
app.include_router(equipment_router)
app.include_router(market_intelligence_router)
app.include_router(pricing_router)
app.include_router(competitors_router)
app.include_router(guidance_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(ondc_router)
app.include_router(roles_router)
app.include_router(ai_advisory_router)
app.include_router(recommendations_router)

@app.get("/api/health")
def api_health():
    return {
        "status": "healthy",
        "service": "VyaparSathi Unified API Gateway",
        "version": "2.0.0",
        "database": "connected_with_fallback",
        "region": "Maharashtra & Pan-India"
    }


class AdvisorySourceItem(BaseModel):
    id: Optional[str] = None
    title: str
    source: str
    documentType: str
    officialPortal: Optional[str] = None
    verificationStatus: Optional[str] = None
    department: Optional[str] = None
    sourceUrl: Optional[str] = None
    lastVerified: Optional[str] = None
    scheme: Optional[str] = None

class AdvisoryQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "mr" # mr, hi, en
    userProfile: Optional[Dict[str, Any]] = None

class AdvisoryQueryResponse(BaseModel):
    answer: str
    suggestedActions: List[str]
    relevantSchemes: List[Dict[str, str]]
    language: str
    source: str
    sources: Optional[List[AdvisorySourceItem]] = []

class RAGQueryRequest(BaseModel):
    question: Optional[str] = None
    query: Optional[str] = None
    language: Optional[str] = "mr"
    userProfile: Optional[Dict[str, Any]] = None
    assessmentData: Optional[Dict[str, Any]] = None

class RAGQueryResponse(BaseModel):
    answer: str
    sources: List[AdvisorySourceItem]
    suggestedActions: List[str]
    relevantSchemes: List[Dict[str, str]]
    language: str

class VoiceTranscribeRequest(BaseModel):
    audioContent: Optional[str] = None # Base64 encoded audio
    audioBase64: Optional[str] = None
    mimeType: Optional[str] = "audio/wav"
    language: Optional[str] = "mr"

class VoiceSpeakRequest(BaseModel):
    text: str
    language: Optional[str] = "mr"

class TranscribeRequest(BaseModel):
    audio: Optional[str] = None
    audioContent: Optional[str] = None
    audioBase64: Optional[str] = None
    language: Optional[str] = "mr"
    mimeType: Optional[str] = "audio/wav"

class TranscribeResponse(BaseModel):
    text: str
    language: str

class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "mr"
    speaker: Optional[str] = None
    gender: Optional[str] = "female"
    format: Optional[str] = "wav" # "wav" | "json"

class VoiceResponse(BaseModel):
    available: bool
    provider: Optional[str] = None
    message: Optional[str] = None
    text: Optional[str] = None
    audioContent: Optional[str] = None
    mimeType: Optional[str] = None
    language: Optional[str] = None
    supportedLanguages: Optional[List[str]] = None
    error: Optional[str] = None

class ProfitPredictionRequest(BaseModel):
    budget: Optional[float] = None
    investment_budget: Optional[float] = None
    investmentRequirement: Optional[float] = None
    business_category: Optional[str] = "Dairy"
    location_type: Optional[str] = "Rural"
    experience_years: Optional[float] = 2.0
    land_available: Optional[int] = 1
    workers: Optional[float] = 3.0
    electricity_available: Optional[int] = 1
    water_available: Optional[int] = 1
    market_distance_km: Optional[float] = 5.0
    business_suitability_score: Optional[float] = 0.82
    budget_per_worker: Optional[float] = None

class ProfitPredictionResponse(BaseModel):
    success: bool
    predicted_monthly_profit: float
    modelVersion: Optional[str] = "1.0.0-baseline"
    modelStatus: Optional[str] = "active"
    dataStatus: Optional[str] = "synthetic_prototype"

class BusinessSuitabilityRequest(BaseModel):
    investment_budget: Optional[float] = None
    budget: Optional[float] = None
    experience_years: Optional[float] = 2.0
    land_available: Optional[int] = 1
    water_available: Optional[int] = 1
    electricity_available: Optional[int] = 1
    market_distance_km: Optional[float] = 5.0
    competitor_count: Optional[float] = 3.0
    workers: Optional[float] = 3.0
    skill_level: Optional[str] = "Medium"
    location_type: Optional[str] = "Rural"

class BusinessSuitabilityResponse(BaseModel):
    success: bool
    business_suitability_score: float
    suitability_level: str
    recommendations: List[str]
    model_type: str
    modelVersion: Optional[str] = "1.0.0-baseline"
    modelStatus: Optional[str] = "active"
    dataStatus: Optional[str] = "synthetic_prototype"

class BusinessCategoryRequest(BaseModel):
    budget: float
    experience_years: float
    skill_level: str
    land_available: int
    water_available: int
    electricity_available: int
    location_type: str

class BusinessCategoryRecommendationItem(BaseModel):
    business_category: str
    probability: float

class BusinessCategoryResponse(BaseModel):
    success: bool
    recommended_business: str
    recommendations: List[BusinessCategoryRecommendationItem]
    model_disclaimer: str
    modelVersion: Optional[str] = "1.0.0-baseline"
    modelStatus: Optional[str] = "active"
    dataStatus: Optional[str] = "synthetic_prototype"

class DemandPredictionRequest(BaseModel):
    market_distance_km: float
    budget: float
    business_category: str
    location_type: str

class DemandPredictionResponse(BaseModel):
    success: bool
    predicted_demand: str
    probabilities: Dict[str, float]
    model_disclaimer: str
    modelVersion: Optional[str] = "1.0.0-baseline"
    modelStatus: Optional[str] = "active"
    dataStatus: Optional[str] = "synthetic_prototype"

class EquipmentVisionTestRequest(BaseModel):
    image: Optional[str] = None
    imageBase64: Optional[str] = None
    equipmentType: Optional[str] = "Machinery"
    equipmentCategory: Optional[str] = "General"
    statedAgeYears: Optional[float] = None

# Curated rural advisory rules (Deterministic NLP fallback)
ADVISORY_KNOWLEDGE = {
    "feed": {
        "mr": "पशुखाद्यावरील खर्च कमी करण्यासाठी अझोला (Azolla) शेती सुरू करा किंवा गावात बचत गटांच्या माध्यमातून सायलेज (Silage) घाऊक दराने खरेदी करा. यामुळे खाद्यावरील खर्च १५-२०% कमी होऊ शकतो आणि दुधाचे फॅट व प्रमाण वाढू शकते.",
        "hi": "पशु आहार का खर्च कम करने के लिए अजोला (Azolla) की खेती अपनाएं या स्थानीय किसान समूह के साथ मिलकर थोक में साइलेज खरीदें। इससे मासिक खर्च 15-20% तक घट सकता है और दूध की गुणवत्ता बेहतर होगी।",
        "en": "To reduce cattle feed expenses, establish an on-farm Azolla cultivation pit or procure silage in bulk via village dairy cooperatives. This can lower feed costs by 15-20% while sustaining fat and SNF yield.",
        "actions": ["Explore Silage Suppliers in Help Me Near", "Calculate Feed Savings in Financial Tool"],
        "schemes": [{"name": "Rastriya Gokul Mission / Dairy Infra Support", "code": "dairy-infra"}]
    },
    "dairy": {
        "mr": "डेअरी व्यवसायासाठी महाराष्ट्र शासनाचा CMEGP किंवा केंद्र शासनाचा PMEGP अंतर्गत २५% ते ३५% भांडवली अनुदान मिळू शकते. गाई/म्हशी खरेदी व गोठा बांधकामासाठी जिल्हा मध्यवर्ती सहकारी बँक किंवा राष्ट्रीयकृत बँकेत अर्ज करू शकता.",
        "hi": "डेयरी व्यवसाय के लिए CMEGP या PMEGP के तहत 25% से 35% तक का पूंजीगत अनुदान (Subsidy) उपलब्ध है। पशुपालन और शेड निर्माण के लिए नजदीकी बैंक या DIC कार्यालय में संपर्क करें।",
        "en": "For a dairy enterprise in Maharashtra, capital subsidies between 25% and 35% are available under CMEGP and PMEGP. Eligible investments include sheds, chaff cutters, chilling units, and high-yield milch cattle.",
        "actions": ["Open Know Your Schemes for CMEGP", "Visit District Industries Centre (DIC)"],
        "schemes": [{"name": "CMEGP Maharashtra", "code": "cmegp"}, {"name": "PMEGP (Rural)", "code": "pmegp"}]
    },
    "food": {
        "mr": "हळद, मिरची, मसाला किंवा धान्य प्रक्रिया उद्योगासाठी PMFME (पंतप्रधान सूक्ष्म अन्न प्रक्रिया योजना) अंतर्गत ३५% (जास्तीत जास्त १० लाख रुपये) अनुदान मिळते. यासाठी FSSAI नोंदणी आणि उद्योग आधार (Udyam) आवश्यक आहे.",
        "hi": "हल्दी, मसाला, आटा/दाल मिल या खाद्य प्रसंस्करण के लिए PMFME योजना के तहत 35% (अधिकतम 10 लाख रुपये) तक की क्रेडिट-लिंक्ड सब्सिडी मिलती है।",
        "en": "For spices, turmeric, jaggery, or flour/dal processing, PMFME provides a 35% credit-linked capital subsidy up to ₹10 Lakhs. Udyam and basic FSSAI registration are recommended prerequisites.",
        "actions": ["Check PMFME Eligibility in Schemes Tab", "Prepare Detailed Project Report (DPR)"],
        "schemes": [{"name": "PMFME Food Processing Scheme", "code": "pmfme"}]
    },
    "loan": {
        "mr": "भांडवलाची कमतरता (Funding Gap) भरून काढण्यासाठी मुद्रा योजना (MUDRA Kishore - ₹५ लाखांपर्यंत विनातारण) किंवा CMEGP चा लाभ घ्यावा. खाजगी सावकारांकडून जादा व्याजाने कर्ज घेणे टाळा.",
        "hi": "फंडिंग गैप को पूरा करने के लिए बिना गारंटी वाला मुद्रा लोन (MUDRA Kishore - ₹5 लाख तक) या CMEGP का उपयोग करें। अनौपचारिक साहूकारों के भारी ब्याज से बचें।",
        "en": "To bridge your business funding gap, leverage collateral-free institutional credit via MUDRA (up to ₹10 Lakhs) or CMEGP/CGTMSE backing, avoiding high-interest informal village moneylenders.",
        "actions": ["Compute exact Funding Gap in Calculator", "Review MUDRA & CMEGP Requirements"],
        "schemes": [{"name": "Pradhan Mantri MUDRA Yojana", "code": "mudra"}, {"name": "CGTMSE Collateral-Free Cover", "code": "cgtmse"}]
    },
    "documents": {
        "mr": "शासकीय योजनांसाठी लागणारी मुख्य कागदपत्रे: १) आधार कार्ड २) पॅन कार्ड ३) ७/१२ व ८-अ उतारा (शेतजमीन असल्यास) ४) उद्यम नोंदणी प्रमाणपत्र ५) बँक पासबुक व ६ महिन्यांचे स्टेटमेंट ६) मशिनरीचे दरपत्रक (कोटेशन) ७) व्यवसाय प्रकल्प अहवाल (DPR).",
        "hi": "सरकारी योजनाओं हेतु मुख्य दस्तावेज: 1) आधार कार्ड 2) पैन कार्ड 3) 7/12 व 8-ए खतौनी 4) उद्यम आधार 5) बैंक पासबुक व 6 महीने का स्टेटमेंट 6) मशीनरी कोटेशन 7) प्रोजेक्ट रिपोर्ट (DPR)।",
        "en": "Essential documentation for government schemes: 1) Aadhaar & PAN 2) 7/12 & 8-A land record 3) Udyam Registration 4) Bank passbook (6 months) 5) Machinery quotation 6) Detailed Project Report (DPR).",
        "actions": ["Download DPR Checklist", "Register on Udyam Assist Portal"],
        "schemes": [{"name": "Udyam Registration Facilitation", "code": "udyam"}]
    }
}

@app.get("/health")
def health_check():
    asr_stat = indic_asr.get_status()
    tts_stat = indic_tts.get_status()
    return {
        "status": "ok",
        "service": "VyaparSathi AI & NLP Advisory",
        "profitModelLoaded": ml_service.is_profit_available(),
        "suitabilityModelLoaded": ml_service.is_suitability_available(),
        "businessCategoryModelLoaded": ml_service.is_business_category_available(),
        "demandModelLoaded": ml_service.is_demand_available(),
        "asrModelLoaded": asr_stat["is_loaded"],
        "ttsModelLoaded": tts_stat["is_loaded"],
        "asrDevice": asr_stat["device"],
        "ttsDevice": tts_stat["device"],
        "asrStatus": asr_stat,
        "ttsStatus": tts_stat,
        "targetRegion": "Maharashtra, India"
    }

@app.get("/vision/health")
@app.get("/api/vision/health")
def vision_health_check():
    key = os.getenv("GEMINI_API_KEY")
    return {
        "reachable": bool(key),
        "modelAvailable": bool(key),
        "model": os.getenv("GEMINI_VISION_MODEL", "gemini-3.8-flash"),
        "provider": "gemini"
    }

@app.post("/vision/equipment-test")
@app.post("/api/vision/equipment-test")
def test_equipment_vision(req: EquipmentVisionTestRequest):
    from routers.equipment import verify_equipment
    return verify_equipment({
        "imageBase64": req.imageBase64,
        "equipmentType": req.equipmentType,
        "equipmentCategory": req.equipmentCategory
    })

@app.post("/api/ai/predict-profit", response_model=ProfitPredictionResponse)
@app.post("/api/ml/predict-profit", response_model=ProfitPredictionResponse)
@app.post("/ml/predict-profit", response_model=ProfitPredictionResponse)
def predict_monthly_profit(req: ProfitPredictionRequest):
    try:
        eff_budget = float(req.budget if req.budget is not None else (req.investment_budget if req.investment_budget is not None else (req.investmentRequirement or 650000.0)))
        if eff_budget < 0:
            raise HTTPException(status_code=400, detail="Budget cannot be negative.")
        workers = max(1.0, float(req.workers or 1.0))
        budget_per_worker = req.budget_per_worker if req.budget_per_worker is not None else (eff_budget / workers)
        
        feature_dict = {
            "budget": eff_budget,
            "experience_years": float(req.experience_years or 2.0),
            "land_available": int(req.land_available if req.land_available is not None else 1),
            "workers": workers,
            "electricity_available": int(req.electricity_available if req.electricity_available is not None else 1),
            "water_available": int(req.water_available if req.water_available is not None else 1),
            "market_distance_km": float(req.market_distance_km or 5.0),
            "business_suitability_score": float(req.business_suitability_score or 0.82),
            "budget_per_worker": float(budget_per_worker)
        }
        raw_pred = ml_service.predict_profit(feature_dict)
        meta = ml_service.get_metadata("profit_prediction")
        return ProfitPredictionResponse(
            success=True,
            predicted_monthly_profit=round(raw_pred, 2),
            modelVersion=meta.get("modelVersion", "1.0.0-baseline"),
            modelStatus=meta.get("modelStatus", "active"),
            dataStatus=meta.get("dataStatus", "synthetic_prototype")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/api/ai/predict-business-suitability", response_model=BusinessSuitabilityResponse)
@app.post("/api/ai/predict-suitability", response_model=BusinessSuitabilityResponse)
@app.post("/api/ml/predict-business-suitability", response_model=BusinessSuitabilityResponse)
@app.post("/api/ml/predict-suitability", response_model=BusinessSuitabilityResponse)
@app.post("/ml/predict-business-suitability", response_model=BusinessSuitabilityResponse)
def predict_business_suitability(req: BusinessSuitabilityRequest):
    try:
        inv_budget = req.investment_budget if req.investment_budget is not None else (req.budget if req.budget is not None else 500000.0)
        if inv_budget < 0:
            raise HTTPException(status_code=400, detail="Investment budget cannot be negative.")
        
        feature_dict = {
            "investment_budget": float(inv_budget),
            "experience_years": float(req.experience_years or 2.0),
            "land_available": int(req.land_available if req.land_available is not None else 1),
            "water_available": int(req.water_available if req.water_available is not None else 1),
            "electricity_available": int(req.electricity_available if req.electricity_available is not None else 1),
            "market_distance_km": float(req.market_distance_km or 5.0),
            "competitor_count": float(req.competitor_count or 3.0),
            "workers": max(1.0, float(req.workers or 3.0))
        }
        result = ml_service.predict_business_suitability(feature_dict)
        meta = ml_service.get_metadata("business_suitability")
        return BusinessSuitabilityResponse(
            success=True,
            business_suitability_score=result["business_suitability_score"],
            suitability_level=result["suitability_level"],
            recommendations=result["recommendations"],
            model_type=result["model_type"],
            modelVersion=meta.get("modelVersion", "1.0.0-baseline"),
            modelStatus=meta.get("modelStatus", "active"),
            dataStatus=meta.get("dataStatus", "synthetic_prototype")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Business suitability prediction error: {str(e)}")

@app.post("/api/ai/predict-business-category", response_model=BusinessCategoryResponse)
@app.post("/api/ml/predict-business-category", response_model=BusinessCategoryResponse)
@app.post("/ml/predict-business-category", response_model=BusinessCategoryResponse)
def predict_business_category(req: BusinessCategoryRequest):
    try:
        if req.budget < 0:
            raise HTTPException(status_code=400, detail="Budget cannot be negative.")
        if req.experience_years < 0:
            raise HTTPException(status_code=400, detail="Experience years cannot be negative.")
        if req.land_available not in (0, 1):
            raise HTTPException(status_code=400, detail="land_available must be 0 or 1.")
        if req.water_available not in (0, 1):
            raise HTTPException(status_code=400, detail="water_available must be 0 or 1.")
        if req.electricity_available not in (0, 1):
            raise HTTPException(status_code=400, detail="electricity_available must be 0 or 1.")
        if not req.skill_level or not req.skill_level.strip():
            raise HTTPException(status_code=400, detail="skill_level cannot be empty.")
        if not req.location_type or not req.location_type.strip():
            raise HTTPException(status_code=400, detail="location_type cannot be empty.")

        feature_dict = req.model_dump()
        result = ml_service.predict_business_category(feature_dict)
        meta = ml_service.get_metadata("business_category")
        return BusinessCategoryResponse(
            **result,
            modelVersion=meta.get("modelVersion", "1.0.0-baseline"),
            modelStatus=meta.get("modelStatus", "active"),
            dataStatus=meta.get("dataStatus", "synthetic_prototype")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Business category prediction error: {str(e)}")

@app.post("/api/ai/predict-demand", response_model=DemandPredictionResponse)
@app.post("/api/ml/predict-demand", response_model=DemandPredictionResponse)
@app.post("/ml/predict-demand", response_model=DemandPredictionResponse)
def predict_demand(req: DemandPredictionRequest):
    try:
        if req.market_distance_km < 0:
            raise HTTPException(status_code=400, detail="Market distance cannot be negative.")
        if req.budget < 0:
            raise HTTPException(status_code=400, detail="Budget cannot be negative.")
        if not req.business_category or not req.business_category.strip():
            raise HTTPException(status_code=400, detail="business_category cannot be empty.")
        if not req.location_type or not req.location_type.strip():
            raise HTTPException(status_code=400, detail="location_type cannot be empty.")

        feature_dict = req.model_dump()
        result = ml_service.predict_demand(feature_dict)
        meta = ml_service.get_metadata("demand_prediction")
        return DemandPredictionResponse(
            **result,
            modelVersion=meta.get("modelVersion", "1.0.0-baseline"),
            modelStatus=meta.get("modelStatus", "active"),
            dataStatus=meta.get("dataStatus", "synthetic_prototype")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demand prediction error: {str(e)}")

class RetrainRequest(BaseModel):
    modelName: Optional[str] = "all"
    dryRun: Optional[bool] = True
    minSamples: Optional[int] = None

@app.get("/api/ml/status")
@app.get("/ml/status")
def get_ml_status():
    from training.model_registry import registry
    return {
        "status": "online",
        "models": registry.list_all(),
        "runtime_metadata": ml_service.model_metadata
    }

@app.get("/api/ml/models")
@app.get("/ml/models")
def get_ml_models():
    from training.model_registry import registry
    return registry.list_all()

@app.post("/api/ml/retrain")
@app.post("/ml/retrain")
def trigger_retrain(req: RetrainRequest):
    from training.run_pipeline import run_pipeline_for_model
    from training.extract_mongodb import extract_raw_assessments

    model_target = req.modelName or "all"
    dry_run = True if req.dryRun is None else req.dryRun

    try:
        raw_records = extract_raw_assessments()
    except Exception as e:
        raw_records = []

    model_map = {
        "profit": ["profit_prediction"],
        "profit_prediction": ["profit_prediction"],
        "demand": ["demand_prediction"],
        "demand_prediction": ["demand_prediction"],
        "category": ["business_category"],
        "business_category": ["business_category"],
        "suitability": ["business_suitability"],
        "business_suitability": ["business_suitability"],
        "all": ["profit_prediction", "demand_prediction", "business_category", "business_suitability"]
    }

    targets = model_map.get(model_target, ["profit_prediction", "demand_prediction", "business_category", "business_suitability"])
    results = {}
    for m in targets:
        results[m] = run_pipeline_for_model(m, raw_records, dry_run=dry_run, min_samples=req.minSamples)

    return {
        "success": True,
        "dryRun": dry_run,
        "results": results
    }

@app.post("/api/rag/query", response_model=RAGQueryResponse)
@app.post("/rag/query", response_model=RAGQueryResponse)
def process_rag_query(req: RAGQueryRequest):
    q = req.question or req.query or ""
    result = rag_service.query(
        question=q,
        language=req.language or "mr",
        user_profile=req.userProfile,
        assessment_data=req.assessmentData
    )
    return RAGQueryResponse(
        answer=result["answer"],
        sources=result["sources"],
        suggestedActions=result["suggestedActions"],
        relevantSchemes=result["relevantSchemes"],
        language=result["language"]
    )

# ---------------------------------------------------------
# Indic-Conformer ASR & Indic-Parler-TTS Endpoints
# ---------------------------------------------------------
@app.post("/transcribe", response_model=TranscribeResponse)
@app.post("/api/transcribe", response_model=TranscribeResponse)
@app.post("/api/ai/transcribe", response_model=TranscribeResponse)
async def transcribe_speech(request: Request, req: Optional[TranscribeRequest] = None):
    """
    POST /transcribe or /api/ai/transcribe
    Transcribes speech using local Indic-Conformer ASR model.
    Accepts JSON body with audio base64 or multipart form upload.
    Output: { "text": "...", "language": "mr" }
    """
    audio_data = None
    lang = "mr"
    mime = "audio/wav"

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            audio_data = body.get("audio") or body.get("audioContent") or body.get("audioBase64")
            lang = body.get("language") or "mr"
            mime = body.get("mimeType") or "audio/wav"
        except Exception:
            pass
    elif "multipart/form-data" in content_type:
        form = await request.form()
        lang = form.get("language", "mr")
        file_obj = form.get("audio") or form.get("file")
        if file_obj and hasattr(file_obj, "read"):
            audio_data = await file_obj.read()
            mime = getattr(file_obj, "content_type", "audio/wav")

    if not audio_data and req:
        audio_data = req.audio or req.audioContent or req.audioBase64
        lang = req.language or "mr"
        mime = req.mimeType or "audio/wav"

    if not audio_data:
        raise HTTPException(
            status_code=400,
            detail="Audio input is required (base64 string in JSON or audio file in multipart form)."
        )

    try:
        res = indic_asr.transcribe(audio_input=audio_data, language=lang, mime_type=mime)
        return TranscribeResponse(text=res["text"], language=res["language"])
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ASR transcription error: {str(e)}")

@app.post("/tts")
@app.post("/api/tts")
@app.post("/api/ai/tts")
async def text_to_speech(req: TTSRequest, request: Request):
    """
    POST /tts or /api/ai/tts
    Synthesizes text into speech using local Indic-Parler-TTS model.
    Input: { "text": "...", "language": "mr", "speaker": "Sunita" }
    Output: Playable WAV audio (binary or base64 JSON based on Accept header)
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text payload cannot be empty.")

    try:
        result = indic_tts.synthesize(
            text=req.text,
            language=req.language or "mr",
            speaker=req.speaker,
            gender=req.gender or "female"
        )
        
        # If client explicitly asked for JSON format
        accept_header = request.headers.get("accept", "")
        if req.format == "json" or "application/json" in accept_header:
            return {
                "success": True,
                "audioContent": result["audio_base64"],
                "mimeType": "audio/wav",
                "speaker": result["speaker"],
                "language": result["language"],
                "device": result["device"]
            }

        # Otherwise return playable binary WAV stream
        return Response(
            content=result["audio_bytes"],
            media_type="audio/wav",
            headers={
                "Content-Disposition": f'inline; filename="indic_speech_{result["language"]}.wav"',
                "X-Speaker": result["speaker"],
                "X-Language": result["language"],
                "X-Device": result["device"]
            }
        )
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis error: {str(e)}")


@app.post("/api/advisory/query", response_model=AdvisoryQueryResponse)
@app.post("/advisory/query", response_model=AdvisoryQueryResponse)
@app.post("/api/voice/query", response_model=AdvisoryQueryResponse)
@app.post("/voice/query", response_model=AdvisoryQueryResponse)
def process_advisory_query(req: AdvisoryQueryRequest):
    q = req.query.lower().strip()
    lang = req.language if req.language in ["mr", "hi", "en"] else "mr"

    # Step 1: Consult RAG service for knowledge and scheme queries
    rag_result = rag_service.query(
        question=req.query,
        language=lang,
        user_profile=req.userProfile
    )

    if rag_result.get("sources") and len(rag_result["sources"]) > 0:
        return AdvisoryQueryResponse(
            answer=rag_result["answer"],
            suggestedActions=rag_result["suggestedActions"],
            relevantSchemes=rag_result["relevantSchemes"],
            language=lang,
            source="rag_official_knowledge",
            sources=rag_result["sources"]
        )

    matched_key = None
    if any(w in q for w in ["खाद्य", "चारा", "feed", "fodder", "घास", "azolla"]):
        matched_key = "feed"
    elif any(w in q for w in ["डेअरी", "दूध", "गाई", "म्हैस", "dairy", "milk", "cattle", "cow", "buffalo"]):
        matched_key = "dairy"
    elif any(w in q for w in ["अन्न", "प्रक्रिया", "मसाला", "हळद", "food", "processing", "spice", "turmeric", "mill"]):
        matched_key = "food"
    elif any(w in q for w in ["कर्ज", "भांडवल", "loan", "funding", "gap", "mudra", "मुद्रा", "पैसा"]):
        matched_key = "loan"
    elif any(w in q for w in ["कागदपत्रे", "दस्तावेज", "document", "documents", "7/12", "उतारा", "certificate"]):
        matched_key = "documents"

    # Query Google Gemini gemini-3.8-flash for contextual advisory reasoning
    if not matched_key:
        try:
            from services.gemini_service import generate_advisory_answer, get_gemini_model
            content = generate_advisory_answer(req.query, lang)
            if content and len(content) > 20:
                return AdvisoryQueryResponse(
                    answer=content,
                    suggestedActions=["Review Scheme Eligibility", "Check Help Me Near Support Points"],
                    relevantSchemes=[{"name": "CMEGP Maharashtra", "code": "cmegp"}],
                    language=lang,
                    source="gemini_3_8_flash",
                    sources=[]
                )
        except Exception as e:
            print(f"Gemini advisory fallback triggered ({type(e).__name__})")

    # Deterministic high-precision fallback
    if matched_key and matched_key in ADVISORY_KNOWLEDGE:
        entry = ADVISORY_KNOWLEDGE[matched_key]
        return AdvisoryQueryResponse(
            answer=entry[lang],
            suggestedActions=entry["actions"],
            relevantSchemes=entry["schemes"],
            language=lang,
            source="deterministic_advisory_engine",
            sources=[]
        )

    # General welcome response per language
    fallback_messages = {
        "mr": "व्यापारसाथी सल्लागार सेवेत आपले स्वागत आहे. आपण डेअरी, शेतीमाल प्रक्रिया, शासकीय योजना (CMEGP, PMEGP), आवश्यक कागदपत्रे किंवा भांडवली नियोजनाबाबत प्रश्न विचारू शकता.",
        "hi": "व्यापारसाथी सलाहकार सेवा में आपका स्वागत है। आप डेयरी, खाद्य प्रसंस्करण, सरकारी योजनाओं (CMEGP, PMEGP), आवश्यक दस्तावेजों या फंडिंग गैप के बारे में प्रश्न पूछ सकते हैं।",
        "en": "Welcome to VyaparSathi Advisory. You can ask queries regarding dairy, food processing, CMEGP/PMEGP subsidies, required documents, or capital funding gap structuring."
    }

    return AdvisoryQueryResponse(
        answer=fallback_messages.get(lang, fallback_messages["mr"]),
        suggestedActions=["Explore Maharashtra Schemes", "Find Support Centers Nearby", "Calculate Business Financials"],
        relevantSchemes=[{"name": "Chief Minister Employment Generation Programme", "code": "cmegp"}],
        language=lang,
        source="deterministic_advisory_engine",
        sources=[]
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)

