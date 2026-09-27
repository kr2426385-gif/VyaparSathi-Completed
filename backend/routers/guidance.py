from fastapi import APIRouter

router = APIRouter(prefix="/api/guidance", tags=["Entrepreneur Guidance"])

@router.get("/steps")
def get_guidance_steps():
    return {
        "success": True,
        "stages": [
            {
                "step": 1,
                "title": "Business Concept & Feasibility Assessment",
                "titleMr": "व्यवसाय संकल्पना व व्यवहार्यता तपासणी",
                "description": "Run VyaparSathi AI Suitability & Profit Prediction model to validate viability.",
                "actions": ["Complete Assessment", "Download Feasibility Scorecard"]
            },
            {
                "step": 2,
                "title": "Official Entity Registration",
                "titleMr": "अधिकृत व्यवसाय नोंदणी",
                "description": "Register on Udyam Assist Portal (free & paperless) to obtain MSME recognition.",
                "actions": ["Visit udyamregistration.gov.in", "Save Udyam Certificate"]
            },
            {
                "step": 3,
                "title": "Regulatory & Food Safety Licenses",
                "titleMr": "परवाने व अन्न सुरक्षा मंजुरी",
                "description": "Apply for Maharashtra Shop Act (Gumasta) and FSSAI registration if handling food products.",
                "actions": ["Apply on Aaple Sarkar", "FOSCOS Portal Registration"]
            },
            {
                "step": 4,
                "title": "Government Subsidy Application (PMEGP / CMEGP)",
                "titleMr": "शासकीय अनुदान अर्ज (CMEGP / PMEGP)",
                "description": "Submit online project proposal via KVIC portal or DIC district portal for 25-35% capital subsidy.",
                "actions": ["Submit DPR to DIC", "Bank Verification"]
            },
            {
                "step": 5,
                "title": "Machinery Procurement & Production Launch",
                "titleMr": "मशिनरी खरेदी व उत्पादन सुरू करणे",
                "description": "Procure ISI/CE verified equipment with GST invoices and initiate commercial operations.",
                "actions": ["Compare Vendor Quotes", "Record Maintenance in Digital Passport"]
            }
        ]
    }
