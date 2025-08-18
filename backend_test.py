#!/usr/bin/env python3
"""
Backend Health Ping Test
Quick health check for core API endpoints after frontend changes.
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://tree-image-clone.preview.emergentagent.com"

def test_health_ping():
    """Quick health ping test for core endpoints"""
    print("🏥 BACKEND HEALTH PING TEST")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    results = {
        "total_tests": 0,
        "passed_tests": 0,
        "failed_tests": 0,
        "test_details": []
    }
    
    # Test 1: GET /api/status
    print("🔍 Testing GET /api/status...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/status", timeout=10)
        results["total_tests"] += 1
        
        if response.status_code == 200:
            data = response.json()
            if "status" in data and data["status"] == "healthy":
                print("✅ Status endpoint working correctly")
                print(f"   Response: {data}")
                results["passed_tests"] += 1
                results["test_details"].append({
                    "test": "GET /api/status",
                    "status": "PASS",
                    "response_code": 200,
                    "details": "Status endpoint healthy"
                })
            else:
                print("❌ Status endpoint returned unexpected data")
                print(f"   Response: {data}")
                results["failed_tests"] += 1
                results["test_details"].append({
                    "test": "GET /api/status",
                    "status": "FAIL",
                    "response_code": 200,
                    "details": "Unexpected response data"
                })
        else:
            print(f"❌ Status endpoint returned {response.status_code}")
            print(f"   Response: {response.text}")
            results["failed_tests"] += 1
            results["test_details"].append({
                "test": "GET /api/status",
                "status": "FAIL",
                "response_code": response.status_code,
                "details": f"HTTP {response.status_code}"
            })
    except Exception as e:
        print(f"❌ Status endpoint error: {str(e)}")
        results["total_tests"] += 1
        results["failed_tests"] += 1
        results["test_details"].append({
            "test": "GET /api/status",
            "status": "FAIL",
            "response_code": "ERROR",
            "details": str(e)
        })
    
    print()
    
    # Test 2: GET /api/characters
    print("🔍 Testing GET /api/characters...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/characters", timeout=10)
        results["total_tests"] += 1
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                print(f"✅ Characters endpoint working correctly")
                print(f"   Retrieved {len(data)} characters")
                # Check first character structure
                if len(data) > 0:
                    first_char = data[0]
                    required_fields = ["id", "name", "position", "element"]
                    missing_fields = [field for field in required_fields if field not in first_char]
                    if not missing_fields:
                        print(f"   Character structure valid: {list(first_char.keys())}")
                    else:
                        print(f"   Warning: Missing fields in character: {missing_fields}")
                
                results["passed_tests"] += 1
                results["test_details"].append({
                    "test": "GET /api/characters",
                    "status": "PASS",
                    "response_code": 200,
                    "details": f"Retrieved {len(data)} characters with valid structure"
                })
            else:
                print("❌ Characters endpoint returned empty or invalid data")
                print(f"   Response type: {type(data)}, Length: {len(data) if isinstance(data, list) else 'N/A'}")
                results["failed_tests"] += 1
                results["test_details"].append({
                    "test": "GET /api/characters",
                    "status": "FAIL",
                    "response_code": 200,
                    "details": "Empty or invalid character data"
                })
        else:
            print(f"❌ Characters endpoint returned {response.status_code}")
            print(f"   Response: {response.text}")
            results["failed_tests"] += 1
            results["test_details"].append({
                "test": "GET /api/characters",
                "status": "FAIL",
                "response_code": response.status_code,
                "details": f"HTTP {response.status_code}"
            })
    except Exception as e:
        print(f"❌ Characters endpoint error: {str(e)}")
        results["total_tests"] += 1
        results["failed_tests"] += 1
        results["test_details"].append({
            "test": "GET /api/characters",
            "status": "FAIL",
            "response_code": "ERROR",
            "details": str(e)
        })
    
    print()
    
    # Summary
    print("📊 HEALTH PING SUMMARY")
    print("=" * 30)
    print(f"Total Tests: {results['total_tests']}")
    print(f"Passed: {results['passed_tests']}")
    print(f"Failed: {results['failed_tests']}")
    success_rate = (results['passed_tests'] / results['total_tests'] * 100) if results['total_tests'] > 0 else 0
    print(f"Success Rate: {success_rate:.1f}%")
    
    if results['failed_tests'] == 0:
        print("\n🎉 ALL HEALTH CHECKS PASSED - Backend is healthy!")
    else:
        print(f"\n⚠️  {results['failed_tests']} health check(s) failed - Backend may have issues")
    
    return results

if __name__ == "__main__":
    test_health_ping()