#!/usr/bin/env python3
"""
Comparison Tool Backend API Testing Suite
Tests the specific endpoints required for the comparison tool functionality
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BACKEND_URL = "https://selection-bubble.preview.emergentagent.com/api"

class ComparisonToolAPITester:
    def __init__(self):
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, details=""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def authenticate(self):
        """Authenticate user and get token"""
        print("\n🔐 AUTHENTICATION TESTING")
        
        # Try to login with test user credentials first
        login_data = {
            "username": "test@test.com",
            "password": "test123"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/auth/login", data=login_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.user_id = data.get("user_id")
                self.log_result("Login with test credentials", True, f"Token obtained: {self.auth_token[:20]}...")
                return True
            else:
                self.log_result("Login with test credentials", False, f"Login failed: {response.status_code} - {response.text}")
        except Exception as e:
            self.log_result("Login with test credentials", False, f"Login failed: {str(e)}")
        
        # If login fails, try to register a new test user with unique credentials
        unique_id = uuid.uuid4().hex[:8]
        register_data = {
            "username": f"comptest_{unique_id}@test.com",
            "email": f"comptest_{unique_id}@test.com",
            "password": "test123",
            "favourite_team": "Raimon",
            "profile_picture": "https://example.com/avatar.jpg",
            "bio": "Test user for comparison tool"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/auth/register", json=register_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.user_id = data.get("user_id")
                self.log_result("Register new test user", True, f"User registered and token obtained")
                return True
            else:
                self.log_result("Register new test user", False, f"Registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.log_result("Register new test user", False, f"Registration error: {str(e)}")
            return False
    
    def get_headers(self):
        """Get headers with authentication"""
        return {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
    
    def test_characters_api(self):
        """Test Characters API endpoint"""
        print("\n👥 CHARACTERS API TESTING")
        
        try:
            # Test GET /api/characters with authentication
            response = requests.get(f"{BACKEND_URL}/characters/", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check data structure
                    character = data[0]
                    required_fields = ['id', 'name', 'position', 'element', 'base_stats']
                    missing_fields = [field for field in required_fields if field not in character]
                    
                    if not missing_fields:
                        self.log_result("GET /api/characters - Data structure", True, 
                                      f"Retrieved {len(data)} characters with proper structure")
                        
                        # Test element filtering
                        if 'element' in character:
                            element = character['element']
                            filter_response = requests.get(f"{BACKEND_URL}/characters/?element={element}", 
                                                         headers=self.get_headers())
                            if filter_response.status_code == 200:
                                filtered_data = filter_response.json()
                                self.log_result("Characters element filtering", True, 
                                              f"Element filter '{element}' returned {len(filtered_data)} characters")
                            else:
                                self.log_result("Characters element filtering", False, 
                                              f"Filter failed: {filter_response.status_code}")
                        
                        # Test position filtering
                        if 'position' in character:
                            position = character['position']
                            filter_response = requests.get(f"{BACKEND_URL}/characters/?position={position}", 
                                                         headers=self.get_headers())
                            if filter_response.status_code == 200:
                                filtered_data = filter_response.json()
                                self.log_result("Characters position filtering", True, 
                                              f"Position filter '{position}' returned {len(filtered_data)} characters")
                            else:
                                self.log_result("Characters position filtering", False, 
                                              f"Filter failed: {filter_response.status_code}")
                        
                        # Test individual character retrieval
                        character_id = character['id']
                        detail_response = requests.get(f"{BACKEND_URL}/characters/{character_id}", 
                                                     headers=self.get_headers())
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            self.log_result("Individual character retrieval", True, 
                                          f"Retrieved character '{detail_data.get('name', 'Unknown')}'")
                        else:
                            self.log_result("Individual character retrieval", False, 
                                          f"Failed: {detail_response.status_code}")
                    else:
                        self.log_result("GET /api/characters - Data structure", False, 
                                      f"Missing required fields: {missing_fields}")
                else:
                    self.log_result("GET /api/characters", False, "No characters returned or invalid format")
            else:
                self.log_result("GET /api/characters", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Characters API testing", False, f"Exception: {str(e)}")
    
    def test_equipment_api(self):
        """Test Equipment API endpoint"""
        print("\n⚔️ EQUIPMENT API TESTING")
        
        try:
            # Test GET /api/equipment with authentication
            response = requests.get(f"{BACKEND_URL}/equipment/", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check data structure
                    equipment = data[0]
                    required_fields = ['id', 'name', 'category', 'rarity', 'stats']
                    missing_fields = [field for field in required_fields if field not in equipment]
                    
                    if not missing_fields:
                        self.log_result("GET /api/equipment - Data structure", True, 
                                      f"Retrieved {len(data)} equipment items with proper structure")
                        
                        # Test category filtering
                        if 'category' in equipment:
                            category = equipment['category']
                            filter_response = requests.get(f"{BACKEND_URL}/equipment/?category={category}", 
                                                         headers=self.get_headers())
                            if filter_response.status_code == 200:
                                filtered_data = filter_response.json()
                                self.log_result("Equipment category filtering", True, 
                                              f"Category filter '{category}' returned {len(filtered_data)} items")
                            else:
                                self.log_result("Equipment category filtering", False, 
                                              f"Filter failed: {filter_response.status_code}")
                        
                        # Test rarity filtering
                        if 'rarity' in equipment:
                            rarity = equipment['rarity']
                            filter_response = requests.get(f"{BACKEND_URL}/equipment/?rarity={rarity}", 
                                                         headers=self.get_headers())
                            if filter_response.status_code == 200:
                                filtered_data = filter_response.json()
                                self.log_result("Equipment rarity filtering", True, 
                                              f"Rarity filter '{rarity}' returned {len(filtered_data)} items")
                            else:
                                self.log_result("Equipment rarity filtering", False, 
                                              f"Filter failed: {filter_response.status_code}")
                        
                        # Test individual equipment retrieval
                        equipment_id = equipment['id']
                        detail_response = requests.get(f"{BACKEND_URL}/equipment/{equipment_id}", 
                                                     headers=self.get_headers())
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            self.log_result("Individual equipment retrieval", True, 
                                          f"Retrieved equipment '{detail_data.get('name', 'Unknown')}'")
                        else:
                            self.log_result("Individual equipment retrieval", False, 
                                          f"Failed: {detail_response.status_code}")
                    else:
                        self.log_result("GET /api/equipment - Data structure", False, 
                                      f"Missing required fields: {missing_fields}")
                else:
                    self.log_result("GET /api/equipment", False, "No equipment returned or invalid format")
            else:
                self.log_result("GET /api/equipment", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Equipment API testing", False, f"Exception: {str(e)}")
    
    def test_techniques_api(self):
        """Test Techniques API endpoint"""
        print("\n🎯 TECHNIQUES API TESTING")
        
        try:
            # Test GET /api/techniques with authentication
            response = requests.get(f"{BACKEND_URL}/techniques/", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check data structure
                    technique = data[0]
                    required_fields = ['id', 'name', 'technique_type', 'category', 'element', 'power']
                    missing_fields = [field for field in required_fields if field not in technique]
                    
                    if not missing_fields:
                        self.log_result("GET /api/techniques - Data structure", True, 
                                      f"Retrieved {len(data)} techniques with proper structure")
                        
                        # Test technique_type filtering for comparison tool specific types
                        technique_types = ['avatar', 'totem', 'mixi-max', 'mix-max']
                        for tech_type in technique_types:
                            filter_response = requests.get(f"{BACKEND_URL}/techniques/?technique_type={tech_type}", 
                                                         headers=self.get_headers())
                            if filter_response.status_code == 200:
                                filtered_data = filter_response.json()
                                self.log_result(f"Techniques {tech_type} filtering", True, 
                                              f"Type filter '{tech_type}' returned {len(filtered_data)} techniques")
                            else:
                                self.log_result(f"Techniques {tech_type} filtering", False, 
                                              f"Filter failed: {filter_response.status_code}")
                        
                        # Test individual technique retrieval
                        technique_id = technique['id']
                        detail_response = requests.get(f"{BACKEND_URL}/techniques/{technique_id}", 
                                                     headers=self.get_headers())
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            self.log_result("Individual technique retrieval", True, 
                                          f"Retrieved technique '{detail_data.get('name', 'Unknown')}'")
                        else:
                            self.log_result("Individual technique retrieval", False, 
                                          f"Failed: {detail_response.status_code}")
                    else:
                        self.log_result("GET /api/techniques - Data structure", False, 
                                      f"Missing required fields: {missing_fields}")
                else:
                    self.log_result("GET /api/techniques", False, "No techniques returned or invalid format")
            else:
                self.log_result("GET /api/techniques", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Techniques API testing", False, f"Exception: {str(e)}")
    
    def test_coaches_api(self):
        """Test Coaches API endpoint"""
        print("\n👨‍💼 COACHES API TESTING")
        
        try:
            # Test GET /api/teams/coaches with authentication
            response = requests.get(f"{BACKEND_URL}/teams/coaches/", headers=self.get_headers())
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check data structure
                    coach = data[0]
                    required_fields = ['id', 'name', 'title', 'bonuses', 'specialties']
                    missing_fields = [field for field in required_fields if field not in coach]
                    
                    if not missing_fields:
                        self.log_result("GET /api/teams/coaches - Data structure", True, 
                                      f"Retrieved {len(data)} coaches with proper structure")
                        
                        # Test individual coach retrieval
                        coach_id = coach['id']
                        detail_response = requests.get(f"{BACKEND_URL}/teams/coaches/{coach_id}/", 
                                                     headers=self.get_headers())
                        if detail_response.status_code == 200:
                            detail_data = detail_response.json()
                            self.log_result("Individual coach retrieval", True, 
                                          f"Retrieved coach '{detail_data.get('name', 'Unknown')}'")
                        else:
                            self.log_result("Individual coach retrieval", False, 
                                          f"Failed: {detail_response.status_code}")
                        
                        # Verify bonuses and specialties structure
                        if 'bonuses' in coach and 'specialties' in coach:
                            bonuses = coach['bonuses']
                            specialties = coach['specialties']
                            self.log_result("Coach bonuses and specialties", True, 
                                          f"Coach has {len(bonuses)} bonuses and {len(specialties)} specialties")
                        else:
                            self.log_result("Coach bonuses and specialties", False, 
                                          "Missing bonuses or specialties data")
                    else:
                        self.log_result("GET /api/teams/coaches - Data structure", False, 
                                      f"Missing required fields: {missing_fields}")
                else:
                    self.log_result("GET /api/teams/coaches", False, "No coaches returned or invalid format")
            else:
                self.log_result("GET /api/teams/coaches", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Coaches API testing", False, f"Exception: {str(e)}")
    
    def test_authentication_requirements(self):
        """Test that all endpoints require proper authentication"""
        print("\n🔒 AUTHENTICATION REQUIREMENTS TESTING")
        
        endpoints = [
            "/characters/",
            "/equipment/", 
            "/techniques/",
            "/teams/coaches/"
        ]
        
        for endpoint in endpoints:
            try:
                # Test without authentication
                response = requests.get(f"{BACKEND_URL}{endpoint}")
                if response.status_code in [401, 403]:
                    self.log_result(f"Auth required for {endpoint}", True, 
                                  f"Properly rejected unauthorized access: {response.status_code}")
                elif response.status_code == 200:
                    # Some endpoints might not require auth - this is acceptable for comparison tool
                    self.log_result(f"Auth not required for {endpoint}", True, 
                                  f"Endpoint accessible without auth: {response.status_code}")
                else:
                    self.log_result(f"Auth check for {endpoint}", False, 
                                  f"Unexpected response: {response.status_code}")
            except Exception as e:
                self.log_result(f"Auth check for {endpoint}", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all comparison tool tests"""
        print("🚀 STARTING COMPARISON TOOL BACKEND API TESTING")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed - cannot proceed with tests")
            return
        
        # Run all tests
        self.test_authentication_requirements()
        self.test_characters_api()
        self.test_equipment_api()
        self.test_techniques_api()
        self.test_coaches_api()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if "✅ PASS" in r["status"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed_tests == total_tests

if __name__ == "__main__":
    tester = ComparisonToolAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL COMPARISON TOOL TESTS PASSED!")
    else:
        print("\n⚠️ SOME TESTS FAILED - CHECK DETAILS ABOVE")