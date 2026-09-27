"""
VyaparSathi Python Gemini Service
Model: gemini-3.8-flash
Used for: RAG-generated answers & Advisory reasoning
"""

import os
import json
import requests
from typing import Dict, Any, Optional

def get_gemini_api_key() -> Optional[str]:
    key = os.getenv("GEMINI_API_KEY")
    if key and key.strip():
        return key.strip()
    return None

def get_gemini_model() -> str:
    return os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

# STRICT QUOTA PROTECTION: User explicitly requested to NEVER test or call their Gemini API key
DISABLE_GEMINI_CALLS = os.getenv("DISABLE_GEMINI_CALLS", "true").lower() in ("true", "1", "yes")

def call_gemini_generate(
    system_instruction: str,
    user_content: str,
    thinking_level: str = "medium",
    tag: str = "[Gemini]"
) -> Optional[str]:
    if DISABLE_GEMINI_CALLS:
        # Respect user quota restriction: bypass remote Gemini calls and rely on verified local advisory engine
        return None

    api_key = get_gemini_api_key()
    if not api_key:
        print(f"{tag} GEMINI_API_KEY not configured on ai-service")
        return None

    model = get_gemini_model()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"{system_instruction}\n\n{user_content}"
                    }
                ]
            }
        ],
        "generationConfig": {
            "thinkingConfig": {
                "thinkingLevel": thinking_level
            }
        }
    }

    headers = {"Content-Type": "application/json"}
    
    for attempt in range(1, 4):
        try:
            print(f"{tag} request started (model: {model}, attempt: {attempt})")
            res = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if res.status_code == 200:
                print(f"{tag} response received")
                data = res.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    text_parts = [p.get("text", "") for p in parts if "text" in p]
                    combined = "".join(text_parts).strip()
                    if combined:
                        print(f"{tag} request completed")
                        return combined
                return None
            elif res.status_code in [429, 503]:
                print(f"{tag} API error ({res.status_code}), retrying...")
                import time
                time.sleep(attempt * 2)
            else:
                print(f"{tag} API error ({res.status_code}): {res.text[:200]}")
                break
        except Exception as e:
            print(f"{tag} exception ({type(e).__name__}): {e}")
            break

    return None

def generate_rag_answer(question: str, language: str, context_str: str) -> Optional[str]:
    lang_name = "Marathi" if language == "mr" else ("Hindi" if language == "hi" else "English")
    system_prompt = (
        f"You are VyaparSathi RAG Advisor for rural entrepreneurs in Maharashtra. "
        f"Answer the user's question accurately in {lang_name} using ONLY the provided official facts. "
        f"CRITICAL: Do NOT invent or alter loan amounts, subsidy rates, or criteria. "
        f"Do NOT calculate or modify exact financial numbers, EMI, or funding gaps. "
        f"If the answer is not in the facts, state clearly: 'I don't have verified information for this requirement yet.'"
    )
    user_msg = f"Official Facts:\n{context_str}\n\nUser Question: {question}"
    return call_gemini_generate(system_prompt, user_msg, thinking_level="medium", tag="[GeminiRAG]")

def generate_advisory_answer(query: str, language: str) -> Optional[str]:
    lang_name = "Marathi" if language == "mr" else ("Hindi" if language == "hi" else "English")
    system_prompt = (
        "You are VyaparSathi Senior Advisory Engine for MSME and rural entrepreneurs across all Indian states. "
        "Adhere strictly to this hierarchy of authority: "
        "1. Verified Official Government Data & Rules (CMEGP, PMEGP, PMFME, MUDRA). "
        "2. Deterministic Financial Engine (never override or fabricate EMI, funding gap, profit, or break-even). "
        "3. ML Predictions (labeled as model estimates). "
        "4. RAG Knowledge (cite official sources). "
        "5. Explanatory guidance. "
        "CRITICAL CONSTRAINTS: "
        "- Never invent or contradict mathematical values, interest rates, or subsidy percentages. "
        "- If local market prices or competitor counts are unverified or unavailable, explicitly state that data is currently unavailable. "
        "- If confidence is low, clearly state that verified information is pending official registration. "
        f"- Respond helpfully and concisely in {lang_name}."
    )
    user_msg = f"Entrepreneur Query: {query}"
    return call_gemini_generate(system_prompt, user_msg, thinking_level="medium", tag="[GeminiAdvisory]")
