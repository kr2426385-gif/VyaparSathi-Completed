from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from core.database import db_manager
from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from services.data_catalog_service import get_districts_for_state

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""
    state: Optional[str] = "Maharashtra"
    district: Optional[str] = "Satara"
    taluka: Optional[str] = ""
    block: Optional[str] = ""
    village: Optional[str] = ""
    role: Optional[str] = "entrepreneur"

class LoginRequest(BaseModel):
    email: str
    password: str

class DemoLoginRequest(BaseModel):
    role: Optional[str] = "entrepreneur"

class SendOtpRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    otp: str

class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str

DEMO_PERSONAS = {
    "entrepreneur": {
        "name": "Ramesh Patil (Sahyadri Agro)",
        "email": "entrepreneur@vyaparsathi.in",
        "phone": "9822012345",
        "state": "Maharashtra",
        "district": "Satara",
        "role": "entrepreneur"
    },
    "advisor": {
        "name": "Dr. Suresh Deshmukh (DIC Satara)",
        "email": "advisor@vyaparsathi.in",
        "phone": "9822054321",
        "state": "Maharashtra",
        "district": "Satara",
        "role": "advisor"
    },
    "banker": {
        "name": "Priya Kulkarni (Chief Credit Manager)",
        "email": "banker@vyaparsathi.in",
        "phone": "9822098765",
        "state": "Maharashtra",
        "district": "Kolhapur",
        "role": "banker"
    },
    "admin": {
        "name": "State System Administrator",
        "email": "admin@vyaparsathi.in",
        "phone": "9822000001",
        "state": "Maharashtra",
        "district": "State HQ",
        "role": "admin"
    }
}

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    if not req.name.strip() or not req.email.strip() or not req.password:
        raise HTTPException(status_code=400, detail="Name, email/phone, and password are required.")
    
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    existing = db_manager.find_user_by_email(req.email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email or mobile already exists.")

    hashed = hash_password(req.password)
    user = db_manager.create_user({
        "name": req.name.strip(),
        "email": req.email.strip().lower(),
        "phone": (req.phone or "").strip(),
        "state": req.state or "Maharashtra",
        "district": req.district or "Satara",
        "taluka": (req.taluka or "").strip(),
        "block": (req.block or "").strip(),
        "village": (req.village or "").strip(),
        "password": hashed,
        "role": "entrepreneur"
    })

    token = create_access_token(user)
    user_resp = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "state": user.get("state", "Maharashtra"),
        "district": user.get("district", "Satara"),
        "taluka": user.get("taluka", ""),
        "block": user.get("block", ""),
        "village": user.get("village", ""),
        "role": user.get("role", "entrepreneur")
    }
    return {
        "message": "Registration successful.",
        "user": user_resp,
        "token": token
    }

@router.post("/login")
def login(req: LoginRequest):
    if not req.email.strip() or not req.password:
        raise HTTPException(status_code=400, detail="Please provide both email/mobile and password.")

    user = db_manager.find_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials. No user found with this email or phone.")

    if not verify_password(req.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid password. Please verify and try again.")

    token = create_access_token(user)
    user_resp = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "state": user.get("state", "Maharashtra"),
        "district": user.get("district", "Satara"),
        "taluka": user.get("taluka", ""),
        "block": user.get("block", ""),
        "village": user.get("village", ""),
        "role": user.get("role", "entrepreneur")
    }
    return {
        "message": "Login successful.",
        "user": user_resp,
        "token": token
    }

@router.get("/me")
def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return {
        "user": {
            "id": user.get("id") or user.get("_id"),
            "name": user.get("name", "User"),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "state": user.get("state", "Maharashtra"),
            "district": user.get("district", "Satara"),
            "taluka": user.get("taluka", ""),
            "block": user.get("block", ""),
            "village": user.get("village", ""),
            "role": user.get("role", "entrepreneur")
        }
    }

@router.post("/demo-login")
def demo_login(req: DemoLoginRequest):
    role = (req.role or "entrepreneur").lower()
    persona = DEMO_PERSONAS.get(role, DEMO_PERSONAS["entrepreneur"])

    user = db_manager.find_user_by_email(persona["email"])
    if not user:
        user = db_manager.create_user({
            **persona,
            "password": hash_password("DemoSecure@2026")
        })

    token = create_access_token(user)
    return {
        "message": f"Authenticated successfully as {persona['role']}.",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "state": user["state"],
            "district": user["district"],
            "role": user["role"]
        },
        "token": token
    }

@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    return {
        "success": True,
        "message": "Verification OTP sent successfully (Evaluation code: 123456)."
    }

@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    if req.otp in ["123456", "999999"]:
        target = req.phone or req.email or "demo_user"
        user = db_manager.find_user_by_email(target) or {
            "id": f"usr_otp_{int(target.split('@')[0].replace('+', '')) if target else 123}",
            "name": "Verified Entrepreneur",
            "email": target,
            "role": "entrepreneur"
        }
        token = create_access_token(user)
        return {
            "success": True,
            "message": "OTP verified successfully.",
            "token": token,
            "user": user
        }
    raise HTTPException(status_code=400, detail="Invalid OTP code entered.")

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, user: Dict[str, Any] = Depends(get_current_user)):
    user_record = db_manager.find_user_by_id(user["id"])
    if not user_record or not verify_password(req.currentPassword, user_record.get("password", "")):
        raise HTTPException(status_code=400, detail="Current password does not match.")
    
    db_manager.update_user(user["id"], {"password": hash_password(req.newPassword)})
    return {"success": True, "message": "Password updated successfully."}

@router.put("/update-profile")
def update_profile(updates: Dict[str, Any], user: Dict[str, Any] = Depends(get_current_user)):
    allowed = ["name", "phone", "district", "state", "taluka", "block", "village"]
    filtered = {k: v for k, v in updates.items() if k in allowed}
    updated = db_manager.update_user(user["id"], filtered)
    return {"success": True, "user": updated}
