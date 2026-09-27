import urllib.request
import urllib.error
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

FASTAPI_URL = "http://127.0.0.1:8000"
EXPRESS_URL = "http://127.0.0.1:5000"

def post_json(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as res:
        return res.status, json.loads(res.read().decode("utf-8"))

def test_rag():
    print("=== Testing Phase 5 & 6: RAG Knowledge System & Improved AI Advisor ===\n")
    passed = 0

    # Test 1: Direct RAG query in English
    print("1. Testing RAG query for dairy business loan in Maharashtra (English)...")
    status, data = post_json(f"{FASTAPI_URL}/api/rag/query", {
        "question": "Which loan can I get for dairy processing in Maharashtra?",
        "language": "en"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert "sources" in data and len(data["sources"]) > 0, "Expected non-empty sources list"
    top_src = data["sources"][0]
    print(f"   Top Source: {top_src['title']} ({top_src['source']})")
    valid_sources = ["maha", "kvic", "mofpi", "mudra", "department", "slbc", "nabard", "msme"]
    assert any(vs in top_src.get("source", "").lower() for vs in valid_sources), "Source must be official government entity"
    assert "answer" in data and len(data["answer"]) > 10, "Answer must be substantive"
    print(f"   Answer: {data['answer'][:120]}...")
    print("   PASS: English RAG retrieval with source preservation verified.")
    passed += 1

    # Test 2: Direct RAG query in Marathi (हळद प्रक्रिया / PMFME)
    print("\n2. Testing RAG query in Marathi (Turmeric/Spice food processing)...")
    status, data = post_json(f"{FASTAPI_URL}/api/rag/query", {
        "question": "हळद प्रक्रिया उद्योगासाठी कोणते अनुदान मिळेल?",
        "language": "mr"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert len(data["sources"]) > 0, "Must retrieve official sources for food processing"
    src_ids = [s.get("id") for s in data["sources"]]
    print(f"   Retrieved Source IDs: {src_ids}")
    assert "pmfme" in src_ids or "cmegp" in src_ids, "Should retrieve PMFME or CMEGP"
    print(f"   Answer (Marathi): {data['answer'][:120]}...")
    print("   PASS: Marathi query successfully matched and answered with official sources.")
    passed += 1

    # Test 3: Required documents query
    print("\n3. Testing RAG query for required bank documents...")
    status, data = post_json(f"{FASTAPI_URL}/api/rag/query", {
        "question": "बँकेत व्यवसाय कर्जासाठी कोणती कागदपत्रे लागतात?",
        "language": "mr"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert len(data["sources"]) > 0, "Must retrieve documentation guidance"
    print(f"   Top Document: {data['sources'][0]['title']}")
    assert any("कागदपत्रे" in data["answer"] or "आधार" in data["answer"] or "7/12" in data["answer"] for s in [data["answer"]]), "Should mention required documents"
    print("   PASS: Official document guidance verified.")
    passed += 1

    # Test 4: Information unavailable transparency (Out-of-scope query)
    print("\n4. Testing RAG behavior when verified information is unavailable (Out-of-scope)...")
    status, data = post_json(f"{FASTAPI_URL}/api/rag/query", {
        "question": "quantum cryptography semiconductor fabrication in space colony",
        "language": "en"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert data["sources"] == [], "Must NOT fabricate sources for unavailable information"
    assert "I don't have verified information for this requirement yet" in data["answer"], "Must explicitly state verified info unavailable"
    print("   PASS: Honest transparency verified for unavailable information.")
    passed += 1

    # Test 5: Improved AI Advisor API via FastAPI
    print("\n5. Testing FastAPI /api/advisory/query integrating RAG sources...")
    status, data = post_json(f"{FASTAPI_URL}/api/advisory/query", {
        "query": "CMEGP योजनेसाठी वयाची अट काय आहे आणि किती अनुदान मिळते?",
        "language": "mr"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert "answer" in data and len(data["answer"]) > 10, "Advisory response must be present"
    assert "sources" in data and len(data["sources"]) > 0, "Must contain official sources"
    print(f"   Advisory Source: {data['source']} | Cited Sources: {len(data['sources'])}")
    print("   PASS: AI Advisor successfully integrated with RAG and source metadata.")
    passed += 1

    # Test 6: Express Gateway proxy to AI Advisor
    print("\n6. Testing Express Gateway POST /api/advisory/query...")
    status, data = post_json(f"{EXPRESS_URL}/api/advisory/query", {
        "query": "What is the maximum subsidy under PMEGP for rural areas?",
        "language": "en"
    })
    assert status == 200, f"Expected 200, got {status}"
    assert "answer" in data, "Express gateway must return advisory answer"
    print(f"   Gateway Response: {data['answer'][:120]}...")
    print("   PASS: Express AI Gateway endpoint verified.")
    passed += 1

    print(f"\n=== ALL {passed} RAG & AI ADVISOR TESTS PASSED ===\n")

if __name__ == "__main__":
    try:
        test_rag()
    except Exception as e:
        print(f"\n[FAIL] Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
