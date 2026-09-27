# VyaparSathi RAG Knowledge Architecture

The Retrieval-Augmented Generation (RAG) system provides authoritative, verified answers to rural enterprise queries regarding government subsidies, bank lending guidelines, and regulatory documentation.

---

## 1. Directory Structure

```text
ai-service/
├── rag/
│   ├── documents/
│   │   └── schemes_knowledge.json    # Verified official schemes knowledge base
│   ├── ingestion/
│   │   └── indexer.py                # Parses, indexes, and maintains document repository
│   ├── retriever/
│   │   └── bm25_retriever.py         # BM25 cross-lingual keyword matching
│   └── rag_service.py                # High-level RAG orchestration & source preservation
```

---

## 2. Knowledge Base Documents

All documents are curated exclusively from official government gazettes, department portals, and SLBC guidelines:

1. **Chief Minister Employment Generation Programme (CMEGP)**  
   *Source*: Directorate of Industries, Govt. of Maharashtra (`maha-cmegp.gov.in`)
2. **Prime Minister's Employment Generation Programme (PMEGP)**  
   *Source*: KVIC & Ministry of MSME (`kviconline.gov.in`)
3. **PM Formalisation of Micro food processing Enterprises (PMFME)**  
   *Source*: Ministry of Food Processing Industries (`pmfme.mofpi.gov.in`)
4. **Pradhan Mantri MUDRA Yojana (PMMY)**  
   *Source*: Department of Financial Services (`mudra.org.in`)
5. **Maharashtra Agribusiness & Rural Transformation Project (SMART)**  
   *Source*: Dept. of Agriculture, Govt. of Maharashtra (`smart-mh.org`)
6. **Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)**  
   *Source*: Ministry of MSME & SIDBI (`cgtmse.in`)
7. **MSME Loan Documentation Guidelines**  
   *Source*: State Level Bankers' Committee (SLBC) Maharashtra
8. **Rural Financial Literacy & Capital Structuring**  
   *Source*: NABARD Rural Advisory

---

## 3. Cross-Lingual BM25 Retrieval

The retriever maps Devanagari and English terms seamlessly:
- Marathi: `कर्ज`, `अनुदान`, `कागदपत्रे`, `पात्रता`, `हळद`
- Hindi: `ऋण`, `सब्सिडी`, `दस्तावेज`, `योग्यता`
- English: `loan`, `subsidy`, `documents`, `eligibility`

Common function stop words are filtered out to prevent false-positive matching.

---

## 4. Source Preservation & Anti-Hallucination Guardrails

Every query returned by the RAG service retains full source metadata:

```json
{
  "answer": "PMFME provides a 35% credit-linked capital subsidy...",
  "sources": [
    {
      "id": "pmfme",
      "title": "PM Formalisation of Micro food processing Enterprises Scheme (PMFME)",
      "source": "Ministry of Food Processing Industries (MoFPI) (pmfme.mofpi.gov.in)",
      "documentType": "government",
      "officialPortal": "https://pmfme.mofpi.gov.in"
    }
  ]
}
```

### Out-of-Scope Rule
When verified official documentation is absent for a question, the system **never hallucinates** and explicitly responds:
- English: *"I don't have verified information for this requirement yet."*
- Marathi: *"मला या आवश्यकतेबद्दल अद्याप पडताळणी केलेली अधिकृत माहिती उपलब्ध नाही."*
- Hindi: *"मेरे पास इस आवश्यकता के लिए अभी तक सत्यापित जानकारी उपलब्ध नहीं है।"*
