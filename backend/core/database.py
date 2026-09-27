import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from pymongo import MongoClient
from core.config import settings

logger = logging.getLogger("vyaparsathi.database")

class DatabaseManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db = None
        self.is_connected = False
        self.fallback_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data",
            "store.json"
        )
        self.fallback_store: Dict[str, Any] = {
            "users": [],
            "profiles": {},
            "assessments": [],
            "equipment": [],
            "quotations": [],
            "maintenance": [],
            "feedback": []
        }
        self._load_fallback_store()
        self._init_mongo()

    def _load_fallback_store(self):
        try:
            if os.path.exists(self.fallback_file):
                with open(self.fallback_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for k in self.fallback_store.keys():
                        if k in data:
                            self.fallback_store[k] = data[k]
                logger.info(f"Loaded fallback store with {len(self.fallback_store.get('users', []))} users")
        except Exception as e:
            logger.warning(f"Could not load fallback store: {e}")

    def _persist_fallback_store(self):
        try:
            os.makedirs(os.path.dirname(self.fallback_file), exist_ok=True)
            with open(self.fallback_file, "w", encoding="utf-8") as f:
                json.dump(self.fallback_store, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error persisting fallback store: {e}")

    def _init_mongo(self):
        uri = settings.MONGODB_URI
        if uri:
            try:
                self.client = MongoClient(uri, serverSelectionTimeoutMS=3000)
                # Quick ping to test connection
                self.client.admin.command('ping')
                self.db = self.client[settings.DB_NAME]
                self.is_connected = True
                logger.info("[MongoDB] Connected successfully to Atlas")
            except Exception as e:
                self.is_connected = False
                logger.warning(f"[MongoDB] Atlas unavailable, running in resilient fallback mode: {e}")
        else:
            logger.info("[MongoDB] No MONGODB_URI provided, using local JSON persistent store.")

    # Generic Collection Methods
    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            return self.db[name]
        return None

    # User Store Operations
    def find_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        norm_email = email.strip().lower()
        if self.is_connected and self.db is not None:
            doc = self.db.users.find_one({"email": norm_email})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        for u in self.fallback_store.get("users", []):
            if u.get("email", "").lower() == norm_email:
                return u
        return None

    def find_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            from bson import ObjectId
            try:
                doc = self.db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                doc = self.db.users.find_one({"id": user_id})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        for u in self.fallback_store.get("users", []):
            if str(u.get("id")) == str(user_id) or str(u.get("_id")) == str(user_id):
                return u
        return None

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = f"usr_{int(datetime.utcnow().timestamp()*1000)}"
        record = {
            "id": user_id,
            **user_data,
            "createdAt": datetime.utcnow().isoformat()
        }
        if self.is_connected and self.db is not None:
            try:
                res = self.db.users.insert_one(record)
                record["_id"] = str(res.inserted_id)
                record["id"] = str(res.inserted_id)
                return record
            except Exception as e:
                logger.warning(f"Mongo insert failed, fallback to local store: {e}")

        self.fallback_store.setdefault("users", []).append(record)
        self._persist_fallback_store()
        return record

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            from bson import ObjectId
            try:
                self.db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
            except Exception:
                self.db.users.update_one({"id": user_id}, {"$set": updates})
        for u in self.fallback_store.get("users", []):
            if str(u.get("id")) == str(user_id) or str(u.get("_id")) == str(user_id):
                u.update(updates)
                self._persist_fallback_store()
                return u
        return self.find_user_by_id(user_id)

    # Profile Store Operations
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            doc = self.db.profiles.find_one({"userId": str(user_id)})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        return self.fallback_store.get("profiles", {}).get(str(user_id))

    def save_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        data = {
            **(self.get_profile(user_id) or {}),
            **profile_data,
            "userId": str(user_id),
            "updatedAt": datetime.utcnow().isoformat()
        }
        if self.is_connected and self.db is not None:
            try:
                self.db.profiles.update_one({"userId": str(user_id)}, {"$set": data}, upsert=True)
            except Exception as e:
                logger.warning(f"Mongo save profile failed, fallback: {e}")

        self.fallback_store.setdefault("profiles", {})[str(user_id)] = data
        self._persist_fallback_store()
        return data

    # Assessments Store Operations
    def save_assessment(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        aid = f"asm_{int(datetime.utcnow().timestamp()*1000)}"
        record = {
            "id": aid,
            **assessment_data,
            "createdAt": datetime.utcnow().isoformat()
        }
        if self.is_connected and self.db is not None:
            try:
                res = self.db.assessments.insert_one(record)
                record["_id"] = str(res.inserted_id)
                record["id"] = str(res.inserted_id)
                return record
            except Exception as e:
                logger.warning(f"Mongo save assessment failed: {e}")

        self.fallback_store.setdefault("assessments", []).append(record)
        self._persist_fallback_store()
        return record

    def get_latest_assessment(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            doc = self.db.assessments.find_one({"user": str(user_id)}, sort=[("createdAt", -1)])
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        asms = [a for a in self.fallback_store.get("assessments", []) if str(a.get("user")) == str(user_id)]
        return asms[-1] if asms else None

    def get_user_assessments(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            cursor = self.db.assessments.find({"user": str(user_id)}).sort("createdAt", -1)
            docs = []
            for d in cursor:
                d["id"] = str(d.get("_id", d.get("id")))
                docs.append(d)
            return docs
        return [a for a in reversed(self.fallback_store.get("assessments", [])) if str(a.get("user")) == str(user_id)]

    def get_assessment_by_id(self, assessment_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            from bson import ObjectId
            try:
                doc = self.db.assessments.find_one({"_id": ObjectId(assessment_id)})
            except Exception:
                doc = self.db.assessments.find_one({"id": assessment_id})
            if doc:
                doc["id"] = str(doc.get("_id", doc.get("id")))
                return doc
        for a in self.fallback_store.get("assessments", []):
            if str(a.get("id")) == str(assessment_id) or str(a.get("_id")) == str(assessment_id):
                return a
        return None

    def update_assessment_outcome(self, assessment_id: str, outcome_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        updates = {
            "outcome": {
                **outcome_data,
                "submittedAt": datetime.utcnow().isoformat()
            },
            "status": "outcome_reported"
        }
        if self.is_connected and self.db is not None:
            from bson import ObjectId
            try:
                self.db.assessments.update_one({"_id": ObjectId(assessment_id)}, {"$set": updates})
            except Exception:
                self.db.assessments.update_one({"id": assessment_id}, {"$set": updates})
        for a in self.fallback_store.get("assessments", []):
            if str(a.get("id")) == str(assessment_id) or str(a.get("_id")) == str(assessment_id):
                a.update(updates)
                self._persist_fallback_store()
                return a
        return self.get_assessment_by_id(assessment_id)

    # Feedback Operations
    def save_feedback(self, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        fid = f"fb_{int(datetime.utcnow().timestamp()*1000)}"
        record = {
            "id": fid,
            **feedback_data,
            "createdAt": datetime.utcnow().isoformat()
        }
        if self.is_connected and self.db is not None:
            try:
                self.db.feedback.insert_one(record)
            except Exception:
                pass
        self.fallback_store.setdefault("feedback", []).append(record)
        self._persist_fallback_store()
        return record

db_manager = DatabaseManager()
