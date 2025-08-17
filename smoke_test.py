#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://element-mapper.preview.emergentagent.com/api"

class SmokeTestRunner:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_status_endpoint(self):
        """Test GET /api/status returns 200"""
        self.log("🔍 Testing GET /api/status...")
        
        try:
            response = self.session.get(f"{self.backend_url}/status")
            
            if response.status_code != 200:
                self.log(f"❌ GET /api/status failed: {response.status_code} - {response.text}")
                return False
                
            data = response.json()
            if "status" not in data or data["status"] != "healthy":
                self.log(f"❌ Status endpoint returned unhealthy status: {data}")
                return False
                
            self.log(f"✅ GET /api/status - Backend is healthy")
            self.log(f"   Response: {data}")
            return True
            
        except Exception as e:
            self.log(f"❌ GET /api/status - Exception: {str(e)}")
            return False
            
    def test_characters_endpoint(self):
        """Test GET /api/characters returns 200"""
        self.log("👤 Testing GET /api/characters...")
        
        try:
            response = self.session.get(f"{self.backend_url}/characters")
            
            if response.status_code != 200:
                self.log(f"❌ GET /api/characters failed: {response.status_code} - {response.text}")
                return False
                
            data = response.json()
            if not isinstance(data, list):
                self.log(f"❌ Characters endpoint should return a list")
                return False
                
            if len(data) == 0:
                self.log(f"⚠️ No characters found (this might be expected)")
            else:
                character = data[0]
                if "id" not in character or "name" not in character:
                    self.log(f"❌ Character missing required fields")
                    return False
                    
            self.log(f"✅ GET /api/characters - Working correctly")
            self.log(f"   Found {len(data)} characters")
            return True
            
        except Exception as e:
            self.log(f"❌ GET /api/characters - Exception: {str(e)}")
            return False
            
    def test_equipment_endpoint(self):
        """Test GET /api/equipment returns 200"""
        self.log("🎒 Testing GET /api/equipment...")
        
        try:
            response = self.session.get(f"{self.backend_url}/equipment")
            
            if response.status_code != 200:
                self.log(f"❌ GET /api/equipment failed: {response.status_code} - {response.text}")
                return False
                
            data = response.json()
            if not isinstance(data, list):
                self.log(f"❌ Equipment endpoint should return a list")
                return False
                
            if len(data) == 0:
                self.log(f"⚠️ No equipment found (this might be expected)")
            else:
                equipment = data[0]
                if "id" not in equipment or "name" not in equipment:
                    self.log(f"❌ Equipment missing required fields")
                    return False
                    
            self.log(f"✅ GET /api/equipment - Working correctly")
            self.log(f"   Found {len(data)} equipment items")
            return True
            
        except Exception as e:
            self.log(f"❌ GET /api/equipment - Exception: {str(e)}")
            return False
            
    def run_smoke_tests(self):
        """Run all smoke tests"""
        self.log("🚀 Starting Backend Smoke Tests")
        self.log("=" * 50)
        
        tests = [
            ("Status Endpoint", self.test_status_endpoint),
            ("Characters Endpoint", self.test_characters_endpoint),
            ("Equipment Endpoint", self.test_equipment_endpoint),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n📋 Running: {test_name}")
            self.log("-" * 30)
            
            try:
                if test_func():
                    passed += 1
                    self.log(f"✅ {test_name} - PASSED")
                else:
                    failed += 1
                    self.log(f"❌ {test_name} - FAILED")
            except Exception as e:
                failed += 1
                self.log(f"❌ {test_name} - ERROR: {str(e)}")
                
        self.log("\n" + "=" * 50)
        self.log("🏁 SMOKE TESTS COMPLETE")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            self.log("🎉 ALL SMOKE TESTS PASSED! Backend remains healthy after frontend changes.")
            return True
        else:
            self.log("⚠️ Some smoke tests failed. Backend may have issues.")
            return False

if __name__ == "__main__":
    tester = SmokeTestRunner()
    success = tester.run_smoke_tests()
    sys.exit(0 if success else 1)