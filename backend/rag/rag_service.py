import os
import json
from typing import Dict, Any, List, Optional
from rag.retriever.bm25_retriever import retriever

class RAGService:
    def __init__(self):
        self.retriever = retriever

    def query(
        self,
        question: str,
        language: str = "mr",
        user_profile: Optional[Dict[str, Any]] = None,
        assessment_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process user question through RAG pipeline:
        1. Retrieve verified official documents
        2. Format answer based on retrieved context and user profile
        3. Never hallucinate unverified data
        """
        clean_q = question.strip()
        lang = language if language in ["mr", "hi", "en"] else "mr"

        # Step 1: Retrieve relevant official documents
        retrieval_results = self.retriever.retrieve(clean_q, top_k=3)

        if not retrieval_results:
            # Honest transparency when information is unavailable
            unavailable_messages = {
                "mr": "मला या आवश्यकतेबद्दल अद्याप पडताळणी केलेली अधिकृत माहिती उपलब्ध नाही.",
                "hi": "मेरे पास इस आवश्यकता के लिए अभी तक सत्यापित जानकारी उपलब्ध नहीं है।",
                "en": "I don't have verified information for this requirement yet."
            }
            return {
                "answer": unavailable_messages.get(lang, unavailable_messages["en"]),
                "sources": [],
                "suggestedActions": ["Explore Verified Government Schemes", "Consult District Industries Centre"],
                "relevantSchemes": [],
                "language": lang
            }

        sources = [r["source"] for r in retrieval_results]
        top_doc = retrieval_results[0]["document"]

        # Step 2: Contextual response generation via Google Gemini (gemini-3.8-flash)
        try:
            from services.gemini_service import generate_rag_answer, get_gemini_model
            context_str = json.dumps([{
                "title": r["document"]["title"],
                "subsidy": r["document"].get("subsidyPercentage"),
                "eligibility": r["document"].get("eligibility"),
                "documents": r["document"].get("documents"),
                "summary": r["document"].get(f"summary_{lang}") or r["document"].get("summary_en")
            } for r in retrieval_results], ensure_ascii=False)

            content = generate_rag_answer(clean_q, lang, context_str)
            if content and len(content) > 20:
                relevant_schemes = [
                    {"name": s["title"], "code": s["id"]}
                    for s in sources if s.get("documentType") == "government"
                ]
                return {
                    "answer": content,
                    "sources": sources,
                    "suggestedActions": ["Review Official Portal", "Prepare Required Documents"],
                    "relevantSchemes": relevant_schemes,
                    "language": lang,
                    "source": "gemini_3_8_flash",
                    "model": get_gemini_model(),
                    "provenance": "Google Gemini Grounded RAG"
                }
        except Exception as e:
            print(f"[RAGService] Gemini query failed ({type(e).__name__}), falling back to deterministic synthesizer.")

        # Step 3: High-precision deterministic RAG answer using official snippets
        summary_key = f"summary_{lang}"
        top_summary = top_doc.get(summary_key) or top_doc.get("summary_en", "")

        # Incorporate eligibility details if asked about eligibility or documents
        q_lower = clean_q.lower()
        extra_details = []
        if any(w in q_lower for w in ["कागदपत्रे", "दस्तावेज", "document", "documents", "proof"]):
            docs_list = top_doc.get("documents", [])
            if docs_list:
                doc_prefix = "आवश्यक कागदपत्रे:" if lang == "mr" else ("आवश्यक दस्तावेज:" if lang == "hi" else "Required documents:")
                extra_details.append(f"{doc_prefix} {', '.join(docs_list[:4])}.")
        elif any(w in q_lower for w in ["पात्रता", "योग्यता", "eligible", "eligibility", "why"]):
            elig_list = top_doc.get("eligibility", [])
            if elig_list:
                elig_prefix = "पात्रता निकष:" if lang == "mr" else ("पात्रता मानदंड:" if lang == "hi" else "Eligibility criteria:")
                extra_details.append(f"{elig_prefix} {' '.join(elig_list[:2])}")

        full_answer = f"{top_summary} {' '.join(extra_details)}".strip()

        relevant_schemes = [
            {"name": s["title"], "code": s["id"]}
            for s in sources if s.get("documentType") == "government"
        ]

        return {
            "answer": full_answer,
            "sources": sources,
            "suggestedActions": ["Check Scheme Guidelines", "Verify Local DIC Support"],
            "relevantSchemes": relevant_schemes,
            "language": lang
        }

rag_service = RAGService()
