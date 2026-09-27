import math
import re
from typing import List, Dict, Any, Tuple
from rag.ingestion.indexer import indexer

# Multilingual synonyms and token mappings for rural Indian business concepts
TERM_SYNONYMS = {
    "कर्ज": ["loan", "credit", "funding", "mudra", "cgtmse"],
    "ऋण": ["loan", "credit", "funding", "mudra", "cgtmse"],
    "loan": ["कर्ज", "ऋण", "credit", "funding", "mudra"],
    "अनुदान": ["subsidy", "grant", "cmegp", "pmegp", "pmfme"],
    "सब्सिडी": ["subsidy", "grant", "cmegp", "pmegp", "pmfme"],
    "subsidy": ["अनुदान", "सब्सिडी", "grant", "cmegp", "pmegp", "pmfme"],
    "कागदपत्रे": ["document", "documents", "eligibility", "7/12", "udyam"],
    "दस्तावेज": ["document", "documents", "eligibility", "7/12", "udyam"],
    "document": ["कागदपत्रे", "दस्तावेज", "eligibility", "udyam", "kyc"],
    "डेअरी": ["dairy", "milk", "दूध", "cattle", "cow", "buffalo", "fodder"],
    "dairy": ["डेअरी", "milk", "दूध", "cattle", "cow", "buffalo"],
    "दूध": ["dairy", "milk", "डेअरी", "cattle"],
    "अन्न": ["food", "processing", "मसाला", "हळद", "pmfme"],
    "food": ["अन्न", "processing", "मसाला", "हळद", "pmfme"],
    "पात्रता": ["eligibility", "criteria", "वय", "age"],
    "योग्यता": ["eligibility", "criteria", "age"],
    "eligibility": ["पात्रता", "योग्यता", "criteria", "conditions"]
}

STOP_WORDS = {
    "in", "on", "at", "to", "for", "of", "and", "is", "are", "a", "an", "the",
    "by", "with", "from", "as", "it", "this", "that", "these", "those",
    "का", "की", "के", "में", "से", "पर", "है", "हैं", "को", "और",
    "चा", "ची", "चे", "च्या", "मध्ये", "वर", "आहे", "आहेत", "आणि", "व"
}

def tokenize(text: str) -> List[str]:
    clean = re.sub(r'[^\w\s\u0900-\u097F]', ' ', text.lower())
    return [w for w in clean.split() if len(w) > 1 and w not in STOP_WORDS]

class BM25Retriever:
    def __init__(self):
        self.indexer = indexer
        self.documents = []
        self.doc_tokens = []
        self.df = {}
        self.avg_dl = 0
        self.k1 = 1.5
        self.b = 0.75
        self._build_index()

    def _build_index(self):
        self.documents = self.indexer.get_all_documents()
        self.doc_tokens = []
        self.df = {}

        total_length = 0
        for doc in self.documents:
            # Combine all searchable content
            searchable_text = " ".join([
                doc.get("title", ""),
                doc.get("id", ""),
                " ".join(doc.get("sector", [])),
                " ".join(doc.get("eligibility", [])),
                " ".join(doc.get("documents", [])),
                doc.get("summary_mr", ""),
                doc.get("summary_hi", ""),
                doc.get("summary_en", "")
            ])
            tokens = tokenize(searchable_text)
            self.doc_tokens.append(tokens)
            total_length += len(tokens)

            # Document frequency
            unique_tokens = set(tokens)
            for t in unique_tokens:
                self.df[t] = self.df.get(t, 0) + 1

        num_docs = len(self.documents)
        self.avg_dl = total_length / num_docs if num_docs > 0 else 1

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.documents:
            self._build_index()
        if not self.documents:
            return []

        raw_tokens = tokenize(query)
        expanded_tokens = list(raw_tokens)
        for token in raw_tokens:
            if token in TERM_SYNONYMS:
                expanded_tokens.extend(TERM_SYNONYMS[token])

        num_docs = len(self.documents)
        scores = [0.0] * num_docs

        for token in expanded_tokens:
            n = self.df.get(token, 0)
            if n == 0:
                continue
            # Standard BM25 IDF
            idf = math.log((num_docs - n + 0.5) / (n + 0.5) + 1.0)
            for i, d_tokens in enumerate(self.doc_tokens):
                f = d_tokens.count(token)
                if f > 0:
                    doc_len = len(d_tokens)
                    num = f * (self.k1 + 1)
                    denom = f + self.k1 * (1 - self.b + self.b * (doc_len / self.avg_dl))
                    scores[i] += idf * (num / denom)

        # Rank documents
        ranked_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
        results = []
        for idx in ranked_indices:
            score = scores[idx]
            if score > 0.4: # Minimum relevance threshold
                doc = self.documents[idx]
                results.append({
                    "score": round(score, 3),
                    "document": doc,
                    "source": {
                        "id": doc.get("id"),
                        "title": doc.get("title"),
                        "scheme": doc.get("scheme", doc.get("id", "").upper()),
                        "department": doc.get("department", ""),
                        "source": doc.get("source"),
                        "sourceUrl": doc.get("sourceUrl", doc.get("officialPortal", "")),
                        "documentType": doc.get("documentType", "government"),
                        "officialPortal": doc.get("officialPortal", ""),
                        "lastVerified": doc.get("lastVerified", "2026-03-01"),
                        "verificationStatus": doc.get("verificationStatus", "Verified"),
                        "language": doc.get("language", ["en", "mr", "hi"])
                    }
                })
            if len(results) >= top_k:
                break

        return results

retriever = BM25Retriever()
