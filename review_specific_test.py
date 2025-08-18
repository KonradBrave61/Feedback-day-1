#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://tree-image-clone.preview.emergentagent.com/api"

class ReviewSpecificTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_specific_requirements(self):
        """Test the exact requirements from the review request"""
        self.log("🎯 Testing Specific Review Requirements...")
        self.log("=" * 70)
        
        all_passed = True
        
        # Test 1: GET /api/characters - should return 10 characters with proper data structure
        self.log("1️⃣ Testing GET /api/characters - should return 10 characters")
        response = self.session.get(f"{self.backend_url}/characters")
        
        if response.status_code != 200:
            self.log(f"❌ FAILED: Status {response.status_code} - {response.text}")
            all_passed = False
        else:
            try:
                characters = response.json()
                if len(characters) == 10:
                    self.log(f"✅ SUCCESS: Returns exactly 10 characters")
                    # Check data structure
                    if characters:
                        char = characters[0]
                        required_fields = ["id", "name", "position", "element", "base_stats"]
                        missing = [f for f in required_fields if f not in char]
                        if missing:
                            self.log(f"❌ FAILED: Missing fields {missing}")
                            all_passed = False
                        else:
                            self.log(f"✅ SUCCESS: Proper data structure with all required fields")
                            self.log(f"   Sample: {char['name']} ({char['position']}, {char['element']})")
                else:
                    self.log(f"❌ FAILED: Expected 10 characters, got {len(characters)}")
                    all_passed = False
            except json.JSONDecodeError:
                self.log(f"❌ FAILED: Invalid JSON response")
                all_passed = False
                
        # Test 2: GET /api/equipment - should return 16 equipment items
        self.log("\n2️⃣ Testing GET /api/equipment - should return 16 equipment items")
        response = self.session.get(f"{self.backend_url}/equipment")
        
        if response.status_code != 200:
            self.log(f"❌ FAILED: Status {response.status_code} - {response.text}")
            all_passed = False
        else:
            try:
                equipment = response.json()
                if len(equipment) == 16:
                    self.log(f"✅ SUCCESS: Returns exactly 16 equipment items")
                    # Check data structure
                    if equipment:
                        item = equipment[0]
                        required_fields = ["id", "name", "category", "rarity", "stats"]
                        missing = [f for f in required_fields if f not in item]
                        if missing:
                            self.log(f"❌ FAILED: Missing fields {missing}")
                            all_passed = False
                        else:
                            self.log(f"✅ SUCCESS: Proper data structure with all required fields")
                            self.log(f"   Sample: {item['name']} ({item['category']}, {item['rarity']})")
                else:
                    self.log(f"❌ FAILED: Expected 16 equipment items, got {len(equipment)}")
                    all_passed = False
            except json.JSONDecodeError:
                self.log(f"❌ FAILED: Invalid JSON response")
                all_passed = False
                
        # Test 3: GET /api/techniques - should return 38 techniques
        self.log("\n3️⃣ Testing GET /api/techniques - should return 38 techniques")
        response = self.session.get(f"{self.backend_url}/techniques")
        
        if response.status_code != 200:
            self.log(f"❌ FAILED: Status {response.status_code} - {response.text}")
            all_passed = False
        else:
            try:
                techniques = response.json()
                if len(techniques) == 38:
                    self.log(f"✅ SUCCESS: Returns exactly 38 techniques")
                    # Check data structure
                    if techniques:
                        tech = techniques[0]
                        required_fields = ["id", "name", "description", "power"]
                        missing = [f for f in required_fields if f not in tech]
                        if missing:
                            self.log(f"❌ FAILED: Missing fields {missing}")
                            all_passed = False
                        else:
                            self.log(f"✅ SUCCESS: Proper data structure with all required fields")
                            self.log(f"   Sample: {tech['name']} (Power: {tech['power']})")
                else:
                    self.log(f"❌ FAILED: Expected 38 techniques, got {len(techniques)}")
                    all_passed = False
            except json.JSONDecodeError:
                self.log(f"❌ FAILED: Invalid JSON response")
                all_passed = False
                
        # Test 4: GET /api/teams/coaches/ - should return 7 coaches/managers
        self.log("\n4️⃣ Testing GET /api/teams/coaches/ - should return 7 coaches/managers")
        response = self.session.get(f"{self.backend_url}/teams/coaches/")
        
        if response.status_code != 200:
            self.log(f"❌ FAILED: Status {response.status_code} - {response.text}")
            all_passed = False
        else:
            try:
                coaches = response.json()
                if len(coaches) == 7:
                    self.log(f"✅ SUCCESS: Returns exactly 7 coaches/managers")
                    # Check data structure
                    if coaches:
                        coach = coaches[0]
                        required_fields = ["id", "name", "bonuses", "specialties"]
                        missing = [f for f in required_fields if f not in coach]
                        if missing:
                            self.log(f"❌ FAILED: Missing fields {missing}")
                            all_passed = False
                        else:
                            self.log(f"✅ SUCCESS: Proper data structure with all required fields")
                            self.log(f"   Sample: {coach['name']}")
                            self.log(f"   Bonuses: {list(coach['bonuses'].keys())}")
                            self.log(f"   Specialties: {len(coach['specialties'])} items")
                else:
                    self.log(f"❌ FAILED: Expected 7 coaches, got {len(coaches)}")
                    all_passed = False
            except json.JSONDecodeError:
                self.log(f"❌ FAILED: Invalid JSON response")
                all_passed = False
                
        # Test 5: Check if endpoints are accessible without authentication
        self.log("\n5️⃣ Testing accessibility without authentication")
        endpoints = [
            ("/characters", "Characters"),
            ("/equipment", "Equipment"), 
            ("/techniques", "Techniques"),
            ("/teams/coaches/", "Coaches")
        ]
        
        for endpoint, name in endpoints:
            # Make request without any authentication headers
            clean_session = requests.Session()
            response = clean_session.get(f"{self.backend_url}{endpoint}")
            
            if response.status_code == 200:
                self.log(f"✅ SUCCESS: {name} endpoint accessible without authentication")
            elif response.status_code in [401, 403]:
                self.log(f"❌ FAILED: {name} endpoint requires authentication ({response.status_code})")
                all_passed = False
            else:
                self.log(f"❌ FAILED: {name} endpoint returned unexpected status {response.status_code}")
                all_passed = False
                
        return all_passed
        
    def test_frontend_integration_data(self):
        """Test that the data format matches what frontend comparison tool expects"""
        self.log("\n🔗 Testing Frontend Integration Data Format...")
        
        # Test that availableItems.length would not be 0
        endpoints = [
            ("/characters", "characters"),
            ("/equipment", "equipment"), 
            ("/techniques", "techniques"),
            ("/teams/coaches/", "coaches")
        ]
        
        all_good = True
        
        for endpoint, item_type in endpoints:
            response = self.session.get(f"{self.backend_url}{endpoint}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        self.log(f"✅ {item_type}: {len(data)} items available (availableItems.length = {len(data)})")
                        
                        # Check that each item has the basic fields needed for comparison
                        item = data[0]
                        if "id" in item and "name" in item:
                            self.log(f"   ✅ Items have required id and name fields for frontend")
                        else:
                            self.log(f"   ❌ Items missing id or name fields")
                            all_good = False
                    else:
                        self.log(f"❌ {item_type}: Empty or invalid data (availableItems.length = 0)")
                        all_good = False
                except json.JSONDecodeError:
                    self.log(f"❌ {item_type}: Invalid JSON response")
                    all_good = False
            else:
                self.log(f"❌ {item_type}: API call failed ({response.status_code})")
                all_good = False
                
        return all_good
        
    def run_review_tests(self):
        """Run all tests specific to the review request"""
        self.log("🚀 Starting Review-Specific Comparison Tool API Testing")
        self.log("📋 Review Request: Test all comparison tool backend APIs to verify they're working correctly")
        self.log("=" * 70)
        
        # Run specific requirements test
        requirements_passed = self.test_specific_requirements()
        
        # Run frontend integration test
        integration_passed = self.test_frontend_integration_data()
        
        self.log("\n" + "=" * 70)
        self.log("🏁 REVIEW-SPECIFIC TESTING COMPLETE")
        
        if requirements_passed and integration_passed:
            self.log("🎉 ALL REVIEW REQUIREMENTS PASSED!")
            self.log("📋 FINDINGS:")
            self.log("   ✅ GET /api/characters returns exactly 10 characters with proper structure")
            self.log("   ✅ GET /api/equipment returns exactly 16 equipment items with proper structure")
            self.log("   ✅ GET /api/techniques returns exactly 38 techniques with proper structure")
            self.log("   ✅ GET /api/teams/coaches/ returns exactly 7 coaches with proper structure")
            self.log("   ✅ All endpoints are accessible without authentication")
            self.log("   ✅ All endpoints return proper data structures for frontend consumption")
            self.log("   ✅ Frontend availableItems.length should NOT be 0 - all endpoints return data")
            self.log("")
            self.log("🔍 ROOT CAUSE ANALYSIS:")
            self.log("   The backend APIs are working perfectly and returning the expected data.")
            self.log("   If frontend is showing 'availableItems.length = 0', the issue is likely:")
            self.log("   1. Frontend making incorrect API calls (wrong URLs)")
            self.log("   2. Frontend not handling the response data correctly")
            self.log("   3. Frontend authentication issues (but APIs don't require auth)")
            self.log("   4. CORS or network connectivity issues")
            return True
        else:
            self.log("❌ SOME REVIEW REQUIREMENTS FAILED!")
            self.log("   Please review the specific failures above.")
            return False

if __name__ == "__main__":
    tester = ReviewSpecificTester()
    success = tester.run_review_tests()
    sys.exit(0 if success else 1)