import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "VyaparSathi Unified API Gateway"
    VERSION: str = "2.0.0"
    API_PREFIX: str = "/api"
    
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "vyaparsathi_super_secret_jwt_key_2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 7
    
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DB_NAME: str = "vyaparsathi"
    
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Safe Mode: Never invoke Gemini API in testing/eval
    SAFE_EVAL_MODE: bool = True

settings = Settings()
