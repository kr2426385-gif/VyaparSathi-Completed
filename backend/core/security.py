import datetime
from typing import Optional, Dict, Any
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import settings
from core.database import db_manager

security_scheme = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user: Dict[str, Any], expires_delta: Optional[datetime.timedelta] = None) -> str:
    user_id = str(user.get("id") or user.get("_id") or "")
    now = datetime.datetime.utcnow()
    expire = now + (expires_delta or datetime.timedelta(days=settings.JWT_EXPIRATION_DAYS))
    
    payload = {
        "id": user_id,
        "userId": user_id,
        "email": user.get("email"),
        "role": user.get("role", "entrepreneur"),
        "exp": expire,
        "iat": now
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        # Ignore mock offline client tokens gracefully
        if token.startswith("offline_token_"):
            return {
                "id": "usr_offline_demo",
                "email": "demo@vyaparsathi.org",
                "role": "entrepreneur"
            }
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("id") or payload.get("userId")
    user = db_manager.find_user_by_id(user_id)
    if not user:
        # Allow demo personas or payload claims directly
        return {
            "id": user_id,
            "_id": user_id,
            "email": payload.get("email", "user@vyaparsathi.org"),
            "name": payload.get("name", "Entrepreneur"),
            "role": payload.get("role", "entrepreneur")
        }
    return user

async def get_optional_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> Optional[Dict[str, Any]]:
    if not credentials:
        return None
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        if not payload:
            return None
        user_id = payload.get("id") or payload.get("userId")
        return db_manager.find_user_by_id(user_id) or {
            "id": user_id,
            "_id": user_id,
            "email": payload.get("email", ""),
            "role": payload.get("role", "entrepreneur")
        }
    except Exception:
        return None

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required."
        )
    return current_user
