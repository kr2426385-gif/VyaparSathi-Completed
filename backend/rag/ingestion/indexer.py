import os
import json
from typing import List, Dict, Any

class DocumentIndexer:
    def __init__(self, documents_path: str = None):
        if not documents_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            documents_path = os.path.join(base_dir, "documents", "schemes_knowledge.json")
        self.documents_path = documents_path
        self.documents: List[Dict[str, Any]] = []
        self._load_documents()

    def _load_documents(self):
        if os.path.exists(self.documents_path):
            try:
                with open(self.documents_path, "r", encoding="utf-8") as f:
                    self.documents = json.load(f)
                print(f"[DocumentIndexer] Successfully indexed {len(self.documents)} official documents from {self.documents_path}")
            except Exception as e:
                print(f"[DocumentIndexer] Error reading documents file: {e}")
                self.documents = []
        else:
            print(f"[DocumentIndexer] Documents file not found at: {self.documents_path}")
            self.documents = []

    def get_all_documents(self) -> List[Dict[str, Any]]:
        return self.documents

indexer = DocumentIndexer()
