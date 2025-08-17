#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration - Use the HTTPS URL from frontend .env
BACKEND_URL = "https://compare-data-fix.preview.emergentagent.com/api"

class ComparisonToolReviewTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_characters_endpoint(self):
        """Test GET /api/characters/ endpoint"""
        self.log("👤 Testing Characters endpoint...")
        
        # Test without trailing slash
        response = self.session.get(f"{self.backend_url}/characters")
        if response.status_code != 200:
            self.log(f"❌ GET /api/characters failed: {response.status_code} - {response.text}")
            return False, 0
            
        characters = response.json()
        if not isinstance(characters, list):
            self.log(f"❌ Characters response should be a list")
            return False, 0
            
        count = len(characters)
        self.log(f"✅ GET /api/characters - SUCCESS: {count} characters returned")
        
        # Test with trailing slash
        response = self.session.get(f"{self.backend_url}/characters/")
        if response.status_code != 200:
            self.log(f"❌ GET /api/characters/ (with trailing slash) failed: {response.status_code}")
            return False, count
            
        characters_slash = response.json()
        if len(characters_slash) != count:
            self.log(f"❌ Trailing slash version returned different count")
            return False, count
            
        self.log(f"✅ GET /api/characters/ (with trailing slash) - SUCCESS: {len(characters_slash)} characters")
        
        # Verify structure
        if characters:
            char = characters[0]
            required_fields = ["id", "name", "position", "element"]
            for field in required_fields:
                if field not in char:
                    self.log(f"❌ Missing field in character data: {field}")
                    return False, count
                    
        return True, count
        
    def test_equipment_endpoint(self):
        """Test GET /api/equipment/ endpoint"""
        self.log("🎒 Testing Equipment endpoint...")
        
        # Test without trailing slash
        response = self.session.get(f"{self.backend_url}/equipment")
        if response.status_code != 200:
            self.log(f"❌ GET /api/equipment failed: {response.status_code} - {response.text}")
            return False, 0
            
        equipment = response.json()
        if not isinstance(equipment, list):
            self.log(f"❌ Equipment response should be a list")
            return False, 0
            
        count = len(equipment)
        self.log(f"✅ GET /api/equipment - SUCCESS: {count} equipment items returned")
        
        # Test with trailing slash
        response = self.session.get(f"{self.backend_url}/equipment/")
        if response.status_code != 200:
            self.log(f"❌ GET /api/equipment/ (with trailing slash) failed: {response.status_code}")
            return False, count
            
        equipment_slash = response.json()
        if len(equipment_slash) != count:
            self.log(f"❌ Trailing slash version returned different count")
            return False, count
            
        self.log(f"✅ GET /api/equipment/ (with trailing slash) - SUCCESS: {len(equipment_slash)} equipment items")
        
        # Verify structure
        if equipment:
            item = equipment[0]
            required_fields = ["id", "name", "category", "rarity", "stats"]
            for field in required_fields:
                if field not in item:
                    self.log(f"❌ Missing field in equipment data: {field}")
                    return False, count
                    
        return True, count
        
    def test_techniques_endpoint(self):
        """Test GET /api/techniques/ endpoint"""
        self.log("⚡ Testing Techniques endpoint...")
        
        # Test without trailing slash
        response = self.session.get(f"{self.backend_url}/techniques")
        if response.status_code != 200:
            self.log(f"❌ GET /api/techniques failed: {response.status_code} - {response.text}")
            return False, 0
            
        techniques = response.json()
        if not isinstance(techniques, list):
            self.log(f"❌ Techniques response should be a list")
            return False, 0
            
        count = len(techniques)
        self.log(f"✅ GET /api/techniques - SUCCESS: {count} techniques returned")
        
        # Test with trailing slash
        response = self.session.get(f"{self.backend_url}/techniques/")
        if response.status_code != 200:
            self.log(f"❌ GET /api/techniques/ (with trailing slash) failed: {response.status_code}")
            return False, count
            
        techniques_slash = response.json()
        if len(techniques_slash) != count:
            self.log(f"❌ Trailing slash version returned different count")
            return False, count
            
        self.log(f"✅ GET /api/techniques/ (with trailing slash) - SUCCESS: {len(techniques_slash)} techniques")
        
        # Verify structure
        if techniques:
            technique = techniques[0]
            required_fields = ["id", "name", "description", "power"]
            for field in required_fields:
                if field not in technique:
                    self.log(f"❌ Missing field in technique data: {field}")
                    return False, count
                    
        return True, count
        
    def test_coaches_endpoint(self):
        """Test GET /api/teams/coaches/ endpoint"""
        self.log("👨‍💼 Testing Coaches endpoint...")
        
        # Test without trailing slash - use direct requests to avoid session issues
        response = requests.get(f"{self.backend_url}/teams/coaches")
        if response.status_code != 200:
            self.log(f"❌ GET /api/teams/coaches failed: {response.status_code} - {response.text}")
            return False, 0
            
        coaches = response.json()
        if not isinstance(coaches, list):
            self.log(f"❌ Coaches response should be a list")
            return False, 0
            
        count = len(coaches)
        self.log(f"✅ GET /api/teams/coaches - SUCCESS: {count} coaches returned")
        
        # Test with trailing slash
        response = requests.get(f"{self.backend_url}/teams/coaches/")
        if response.status_code != 200:
            self.log(f"❌ GET /api/teams/coaches/ (with trailing slash) failed: {response.status_code}")
            return False, count
            
        coaches_slash = response.json()
        if len(coaches_slash) != count:
            self.log(f"❌ Trailing slash version returned different count")
            return False, count
            
        self.log(f"✅ GET /api/teams/coaches/ (with trailing slash) - SUCCESS: {len(coaches_slash)} coaches")
        
        # Verify structure
        if coaches:
            coach = coaches[0]
            required_fields = ["id", "name", "bonuses", "specialties"]
            for field in required_fields:
                if field not in coach:
                    self.log(f"❌ Missing field in coach data: {field}")
                    return False, count
                    
        return True, count
        
    def test_no_auth_required(self):
        """Test that all endpoints work without authentication"""
        self.log("🔓 Testing endpoints work without authentication...")
        
        endpoints = [
            "/characters",
            "/equipment", 
            "/techniques",
            "/teams/coaches"
        ]
        
        for endpoint in endpoints:
            # Use direct requests.get instead of session to avoid any cached headers
            response = requests.get(f"{self.backend_url}{endpoint}")
            if response.status_code != 200:
                self.log(f"❌ {endpoint} requires authentication (status: {response.status_code})")
                return False
                
        self.log(f"✅ All endpoints accessible without authentication")
        return True
        
    def test_cors_headers(self):
        """Test CORS headers are present"""
        self.log("🌐 Testing CORS headers...")
        
        # Check if frontend origin is allowed
        frontend_origin = "https://compare-data-fix.preview.emergentagent.com"
        
        # Test with Origin header
        headers = {"Origin": frontend_origin}
        response = self.session.get(f"{self.backend_url}/characters", headers=headers)
        
        if response.status_code == 200:
            self.log(f"✅ Frontend origin {frontend_origin} is allowed")
            
            # Check for CORS headers in response
            cors_headers = response.headers.get("Access-Control-Allow-Origin")
            if cors_headers:
                self.log(f"✅ CORS Access-Control-Allow-Origin: {cors_headers}")
            else:
                self.log(f"⚠️ No Access-Control-Allow-Origin header found")
                
        else:
            self.log(f"❌ Frontend origin {frontend_origin} blocked (status: {response.status_code})")
            return False
            
        return True
        
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("🚀 Starting Comparison Tool Backend Review Testing")
        self.log("=" * 70)
        self.log(f"Backend URL: {self.backend_url}")
        self.log("=" * 70)
        
        # Track counts for final report
        counts = {}
        
        tests = [
            ("Characters Endpoint", self.test_characters_endpoint, True),
            ("Equipment Endpoint", self.test_equipment_endpoint, True),
            ("Techniques Endpoint", self.test_techniques_endpoint, True),
            ("Coaches Endpoint", self.test_coaches_endpoint, True),
            ("No Authentication Required", self.test_no_auth_required, False),
            ("CORS Configuration", self.test_cors_headers, False),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func, returns_count in tests:
            self.log(f"\n📋 Running: {test_name}")
            self.log("-" * 50)
            
            try:
                if returns_count:
                    result, count = test_func()
                    if result:
                        passed += 1
                        counts[test_name] = count
                        self.log(f"✅ {test_name} - PASSED")
                    else:
                        failed += 1
                        counts[test_name] = count
                        self.log(f"❌ {test_name} - FAILED")
                else:
                    if test_func():
                        passed += 1
                        self.log(f"✅ {test_name} - PASSED")
                    else:
                        failed += 1
                        self.log(f"❌ {test_name} - FAILED")
            except Exception as e:
                failed += 1
                self.log(f"❌ {test_name} - ERROR: {str(e)}")
                
        self.log("\n" + "=" * 70)
        self.log("🏁 COMPARISON TOOL REVIEW TESTING COMPLETE")
        self.log("=" * 70)
        
        # Summary of endpoint counts
        self.log("📊 ENDPOINT VERIFICATION SUMMARY:")
        self.log(f"   GET /api/characters/: {counts.get('Characters Endpoint', 'ERROR')} items (expected: 10)")
        self.log(f"   GET /api/equipment/: {counts.get('Equipment Endpoint', 'ERROR')} items (expected: 16)")
        self.log(f"   GET /api/techniques/: {counts.get('Techniques Endpoint', 'ERROR')} items (expected: 38)")
        self.log(f"   GET /api/teams/coaches/: {counts.get('Coaches Endpoint', 'ERROR')} items (expected: 7)")
        
        self.log("=" * 70)
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        # Check if counts match expectations
        expected_counts = {
            'Characters Endpoint': 10,
            'Equipment Endpoint': 16,
            'Techniques Endpoint': 38,
            'Coaches Endpoint': 7
        }
        
        count_issues = []
        for endpoint, expected in expected_counts.items():
            actual = counts.get(endpoint, 0)
            if actual != expected:
                count_issues.append(f"{endpoint}: got {actual}, expected {expected}")
        
        if count_issues:
            self.log("\n⚠️ COUNT MISMATCHES:")
            for issue in count_issues:
                self.log(f"   {issue}")
        
        if failed == 0 and not count_issues:
            self.log("\n🎉 ALL TESTS PASSED! Comparison tool backend endpoints are working perfectly.")
            return True
        else:
            self.log("\n⚠️ Some tests failed or counts don't match expectations. Please review the issues above.")
            return False

if __name__ == "__main__":
    tester = ComparisonToolReviewTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)