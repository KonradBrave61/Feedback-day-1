#!/usr/bin/env python3
"""
Backend Smoke Test for Placeholder Endpoint Review Request
Testing: 1) GET /api/placeholder/150/150 returns 200 with image/png
         2) Existing core endpoints still work: GET /api/status, GET /api/characters, GET /api/equipment
"""

import requests
import sys
import os

# Get backend URL from environment
BACKEND_URL = "https://roster-transfer-fix.preview.emergentagent.com"

def test_placeholder_endpoint():
    """Test the new placeholder image endpoint"""
    print("🔍 Testing GET /api/placeholder/150/150...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/api/placeholder/150/150", timeout=10)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'image/png' in content_type:
                print("✅ GET /api/placeholder/150/150 - SUCCESS: Returns 200 with image/png content-type")
                print(f"   Content-Type: {content_type}")
                print(f"   Content-Length: {len(response.content)} bytes")
                return True
            else:
                print(f"❌ GET /api/placeholder/150/150 - FAILED: Wrong content-type: {content_type}")
                return False
        else:
            print(f"❌ GET /api/placeholder/150/150 - FAILED: Status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ GET /api/placeholder/150/150 - ERROR: {str(e)}")
        return False

def test_core_endpoints():
    """Test existing core endpoints to ensure they still work"""
    endpoints = [
        ("/api/status", "status endpoint"),
        ("/api/characters", "characters endpoint"),
        ("/api/equipment", "equipment endpoint")
    ]
    
    results = []
    
    for endpoint, description in endpoints:
        print(f"🔍 Testing GET {endpoint}...")
        
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                print(f"✅ GET {endpoint} - SUCCESS: {description} working")
                results.append(True)
            else:
                print(f"❌ GET {endpoint} - FAILED: Status {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                results.append(False)
                
        except Exception as e:
            print(f"❌ GET {endpoint} - ERROR: {str(e)}")
            results.append(False)
    
    return all(results)

def main():
    """Run smoke test for placeholder endpoint review request"""
    print("=" * 80)
    print("🚀 BACKEND SMOKE TEST - PLACEHOLDER ENDPOINT REVIEW")
    print("=" * 80)
    print(f"Backend URL: {BACKEND_URL}")
    print()
    
    # Test new placeholder endpoint
    placeholder_success = test_placeholder_endpoint()
    print()
    
    # Test existing core endpoints
    core_success = test_core_endpoints()
    print()
    
    # Summary
    print("=" * 80)
    print("📊 SMOKE TEST SUMMARY")
    print("=" * 80)
    
    if placeholder_success:
        print("✅ NEW PLACEHOLDER ENDPOINT: Working correctly")
    else:
        print("❌ NEW PLACEHOLDER ENDPOINT: Failed")
    
    if core_success:
        print("✅ CORE ENDPOINTS: All working correctly")
    else:
        print("❌ CORE ENDPOINTS: Some failures detected")
    
    overall_success = placeholder_success and core_success
    
    if overall_success:
        print("\n🎉 OVERALL RESULT: SMOKE TEST PASSED")
        print("   All endpoints are working correctly after placeholder addition")
    else:
        print("\n🚨 OVERALL RESULT: SMOKE TEST FAILED")
        print("   Some endpoints are not working correctly")
    
    print("=" * 80)
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)