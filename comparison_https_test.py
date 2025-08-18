#!/usr/bin/env python3
"""
Comparison Tool HTTPS Backend Testing
Testing comparison tool endpoints to verify HTTPS functionality and Mixed Content Security Error resolution
"""

import requests
import json
import sys
from typing import Dict, Any

# Get the HTTPS backend URL from frontend/.env
BACKEND_URL = "https://tree-image-clone.preview.emergentagent.com/api"

def test_endpoint(endpoint: str, expected_count: int = None, description: str = "") -> Dict[str, Any]:
    """Test a single endpoint and return results"""
    print(f"\n🔍 Testing {endpoint}")
    print(f"📝 {description}")
    
    try:
        url = f"{BACKEND_URL}{endpoint}"
        print(f"🌐 URL: {url}")
        
        # Test HTTPS access without authentication
        response = requests.get(url, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"🔒 Protocol: {'HTTPS' if url.startswith('https://') else 'HTTP'}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if data is a list or dict
            if isinstance(data, list):
                count = len(data)
                print(f"📈 Data Count: {count}")
                
                if expected_count and count != expected_count:
                    print(f"⚠️  Expected {expected_count} items, got {count}")
                
                # Show sample data structure
                if count > 0:
                    print(f"📋 Sample Item Structure:")
                    sample = data[0]
                    for key in sample.keys():
                        print(f"   - {key}: {type(sample[key]).__name__}")
                
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "count": count,
                    "data_type": "list",
                    "sample_keys": list(data[0].keys()) if count > 0 else [],
                    "https": url.startswith('https://'),
                    "url": url
                }
            
            elif isinstance(data, dict):
                print(f"📋 Response Structure:")
                for key in data.keys():
                    print(f"   - {key}: {type(data[key]).__name__}")
                
                return {
                    "success": True,
                    "status_code": response.status_code,
                    "data_type": "dict",
                    "keys": list(data.keys()),
                    "https": url.startswith('https://'),
                    "url": url
                }
        
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"📄 Response: {response.text[:200]}...")
            
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text[:200],
                "https": url.startswith('https://'),
                "url": url
            }
    
    except requests.exceptions.SSLError as e:
        print(f"🔒 SSL/HTTPS Error: {str(e)}")
        return {
            "success": False,
            "error": f"SSL Error: {str(e)}",
            "https": url.startswith('https://'),
            "url": url
        }
    
    except requests.exceptions.RequestException as e:
        print(f"🌐 Network Error: {str(e)}")
        return {
            "success": False,
            "error": f"Network Error: {str(e)}",
            "https": url.startswith('https://'),
            "url": url
        }
    
    except Exception as e:
        print(f"💥 Unexpected Error: {str(e)}")
        return {
            "success": False,
            "error": f"Unexpected Error: {str(e)}",
            "https": url.startswith('https://'),
            "url": url
        }

def main():
    """Main testing function"""
    print("🚀 COMPARISON TOOL HTTPS BACKEND TESTING")
    print("=" * 60)
    print(f"🎯 Testing HTTPS endpoints for Mixed Content Security Error resolution")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    
    # Test cases based on review request
    test_cases = [
        {
            "endpoint": "/characters",
            "expected_count": 10,
            "description": "Characters data for comparison tool - should return ~10 characters with proper structure"
        },
        {
            "endpoint": "/equipment", 
            "expected_count": 16,
            "description": "Equipment/items data for comparison tool - should return ~16 equipment items"
        },
        {
            "endpoint": "/techniques",
            "expected_count": 38, 
            "description": "Techniques data for comparison tool - should return ~38 techniques"
        },
        {
            "endpoint": "/teams/coaches/",
            "expected_count": 7,
            "description": "Coaches data for comparison tool - should return ~7 coaches"
        }
    ]
    
    results = []
    
    # Run all tests
    for test_case in test_cases:
        result = test_endpoint(
            test_case["endpoint"],
            test_case["expected_count"], 
            test_case["description"]
        )
        results.append({
            "endpoint": test_case["endpoint"],
            "expected_count": test_case["expected_count"],
            **result
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TESTING SUMMARY")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r["success"])
    https_tests = sum(1 for r in results if r.get("https", False))
    
    print(f"✅ Passed: {passed_tests}/{total_tests}")
    print(f"🔒 HTTPS: {https_tests}/{total_tests}")
    
    # Detailed results
    for i, result in enumerate(results, 1):
        endpoint = result["endpoint"]
        success = "✅" if result["success"] else "❌"
        https = "🔒" if result.get("https", False) else "🔓"
        
        print(f"\n{i}. {endpoint} {success} {https}")
        
        if result["success"]:
            if "count" in result:
                expected = result["expected_count"]
                actual = result["count"]
                count_match = "✅" if actual == expected else "⚠️"
                print(f"   Count: {actual}/{expected} {count_match}")
                
                if "sample_keys" in result and result["sample_keys"]:
                    print(f"   Keys: {', '.join(result['sample_keys'][:5])}{'...' if len(result['sample_keys']) > 5 else ''}")
        else:
            print(f"   Error: {result.get('error', 'Unknown error')[:50]}...")
    
    # Mixed Content Security Check
    print(f"\n🔒 MIXED CONTENT SECURITY CHECK:")
    if https_tests == total_tests:
        print("✅ All endpoints using HTTPS - Mixed Content Security Error should be resolved")
    else:
        print("❌ Some endpoints not using HTTPS - Mixed Content Security Error may persist")
    
    # Final verdict
    if passed_tests == total_tests and https_tests == total_tests:
        print(f"\n🎉 ALL TESTS PASSED - Comparison tool backend endpoints are working correctly with HTTPS!")
        return True
    else:
        print(f"\n⚠️  SOME TESTS FAILED - Issues detected with comparison tool backend endpoints")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)