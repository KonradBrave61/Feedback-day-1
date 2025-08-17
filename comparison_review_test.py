#!/usr/bin/env python3
"""
Comparison Tool Backend API Testing - Review Request
Testing comparison tool endpoints without authentication as requested.

Endpoints to test:
1. GET /api/characters - should return character data without auth
2. GET /api/equipment - should return equipment data without auth 
3. GET /api/techniques - should return techniques data without auth
4. GET /api/teams/coaches/ - should return coaches data without auth

For each endpoint:
- Test that the response is successful (200 status)
- Verify the data structure is correct
- Test that no authentication is required
"""

import requests
import json
import os
from typing import Dict, Any

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://compare-items.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class ComparisonToolTester:
    def __init__(self):
        self.results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_result(self, test_name: str, success: bool, message: str, details: Dict[str, Any] = None):
        """Log test result"""
        self.total_tests += 1
        if success:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details or {}
        }
        self.results.append(result)
        print(f"{status}: {test_name} - {message}")
        
    def test_characters_endpoint(self):
        """Test GET /api/characters endpoint without authentication"""
        print("\n🎯 TESTING CHARACTERS ENDPOINT")
        
        try:
            # Test basic endpoint access without auth
            response = requests.get(f"{BASE_URL}/characters", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify data structure
                if isinstance(data, list) and len(data) > 0:
                    # Check first character structure
                    char = data[0]
                    required_fields = ['id', 'name', 'position', 'element', 'base_stats']
                    
                    missing_fields = [field for field in required_fields if field not in char]
                    
                    if not missing_fields:
                        self.log_result(
                            "Characters Endpoint Structure",
                            True,
                            f"Retrieved {len(data)} characters with proper structure (id, name, position, element, base_stats)",
                            {"character_count": len(data), "sample_character": char}
                        )
                        
                        # Test that base_stats exists and has proper structure
                        if 'base_stats' in char and isinstance(char['base_stats'], dict):
                            self.log_result(
                                "Characters Base Stats Structure",
                                True,
                                "Characters have proper base_stats dictionary structure",
                                {"base_stats_keys": list(char['base_stats'].keys())}
                            )
                        else:
                            self.log_result(
                                "Characters Base Stats Structure",
                                False,
                                "Characters missing proper base_stats structure"
                            )
                            
                    else:
                        self.log_result(
                            "Characters Endpoint Structure",
                            False,
                            f"Characters missing required fields: {missing_fields}"
                        )
                else:
                    self.log_result(
                        "Characters Endpoint Data",
                        False,
                        "Characters endpoint returned empty or invalid data"
                    )
                    
            else:
                self.log_result(
                    "Characters Endpoint Access",
                    False,
                    f"Characters endpoint returned {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result(
                "Characters Endpoint Error",
                False,
                f"Error accessing characters endpoint: {str(e)}"
            )
            
    def test_equipment_endpoint(self):
        """Test GET /api/equipment endpoint without authentication"""
        print("\n🎯 TESTING EQUIPMENT ENDPOINT")
        
        try:
            # Test basic endpoint access without auth
            response = requests.get(f"{BASE_URL}/equipment", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify data structure
                if isinstance(data, list) and len(data) > 0:
                    # Check first equipment structure
                    equipment = data[0]
                    required_fields = ['id', 'name', 'category', 'rarity', 'stats', 'icon']
                    
                    missing_fields = [field for field in required_fields if field not in equipment]
                    
                    if not missing_fields:
                        self.log_result(
                            "Equipment Endpoint Structure",
                            True,
                            f"Retrieved {len(data)} equipment items with proper structure (id, name, category, rarity, stats, icon)",
                            {"equipment_count": len(data), "sample_equipment": equipment}
                        )
                        
                        # Test that stats exists and has proper structure
                        if 'stats' in equipment and isinstance(equipment['stats'], dict):
                            self.log_result(
                                "Equipment Stats Structure",
                                True,
                                "Equipment has proper stats dictionary structure",
                                {"stats_keys": list(equipment['stats'].keys())}
                            )
                        else:
                            self.log_result(
                                "Equipment Stats Structure",
                                False,
                                "Equipment missing proper stats structure"
                            )
                            
                        # Test that icon field exists
                        if 'icon' in equipment:
                            self.log_result(
                                "Equipment Icon Field",
                                True,
                                "Equipment has icon field for display",
                                {"icon_value": equipment['icon']}
                            )
                        else:
                            self.log_result(
                                "Equipment Icon Field",
                                False,
                                "Equipment missing icon field"
                            )
                            
                    else:
                        self.log_result(
                            "Equipment Endpoint Structure",
                            False,
                            f"Equipment missing required fields: {missing_fields}"
                        )
                else:
                    self.log_result(
                        "Equipment Endpoint Data",
                        False,
                        "Equipment endpoint returned empty or invalid data"
                    )
                    
            else:
                self.log_result(
                    "Equipment Endpoint Access",
                    False,
                    f"Equipment endpoint returned {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result(
                "Equipment Endpoint Error",
                False,
                f"Error accessing equipment endpoint: {str(e)}"
            )
            
    def test_techniques_endpoint(self):
        """Test GET /api/techniques endpoint without authentication"""
        print("\n🎯 TESTING TECHNIQUES ENDPOINT")
        
        try:
            # Test basic endpoint access without auth
            response = requests.get(f"{BASE_URL}/techniques", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify data structure
                if isinstance(data, list) and len(data) > 0:
                    # Check first technique structure
                    technique = data[0]
                    required_fields = ['id', 'name', 'description', 'power']
                    
                    missing_fields = [field for field in required_fields if field not in technique]
                    
                    if not missing_fields:
                        self.log_result(
                            "Techniques Endpoint Structure",
                            True,
                            f"Retrieved {len(data)} techniques with proper structure (id, name, description, power)",
                            {"technique_count": len(data), "sample_technique": technique}
                        )
                        
                        # Test that description exists and is not empty
                        if 'description' in technique and technique['description']:
                            self.log_result(
                                "Techniques Description Field",
                                True,
                                "Techniques have proper description field",
                                {"description_sample": technique['description'][:100]}
                            )
                        else:
                            self.log_result(
                                "Techniques Description Field",
                                False,
                                "Techniques missing or empty description field"
                            )
                            
                        # Test that power field exists and is numeric
                        if 'power' in technique and isinstance(technique['power'], (int, float)):
                            self.log_result(
                                "Techniques Power Field",
                                True,
                                "Techniques have proper numeric power field",
                                {"power_value": technique['power']}
                            )
                        else:
                            self.log_result(
                                "Techniques Power Field",
                                False,
                                "Techniques missing or invalid power field"
                            )
                            
                    else:
                        self.log_result(
                            "Techniques Endpoint Structure",
                            False,
                            f"Techniques missing required fields: {missing_fields}"
                        )
                else:
                    self.log_result(
                        "Techniques Endpoint Data",
                        False,
                        "Techniques endpoint returned empty or invalid data"
                    )
                    
            else:
                self.log_result(
                    "Techniques Endpoint Access",
                    False,
                    f"Techniques endpoint returned {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result(
                "Techniques Endpoint Error",
                False,
                f"Error accessing techniques endpoint: {str(e)}"
            )
            
    def test_coaches_endpoint(self):
        """Test GET /api/teams/coaches/ endpoint without authentication"""
        print("\n🎯 TESTING COACHES ENDPOINT")
        
        try:
            # Test basic endpoint access without auth
            response = requests.get(f"{BASE_URL}/teams/coaches/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify data structure
                if isinstance(data, list) and len(data) > 0:
                    # Check first coach structure
                    coach = data[0]
                    required_fields = ['id', 'name', 'bonuses', 'specialties']
                    
                    missing_fields = [field for field in required_fields if field not in coach]
                    
                    if not missing_fields:
                        self.log_result(
                            "Coaches Endpoint Structure",
                            True,
                            f"Retrieved {len(data)} coaches with proper structure (id, name, bonuses, specialties)",
                            {"coach_count": len(data), "sample_coach": coach}
                        )
                        
                        # Test that bonuses exists and has proper structure
                        if 'bonuses' in coach and isinstance(coach['bonuses'], dict):
                            self.log_result(
                                "Coaches Bonuses Structure",
                                True,
                                "Coaches have proper bonuses dictionary structure",
                                {"bonuses_keys": list(coach['bonuses'].keys())}
                            )
                        else:
                            self.log_result(
                                "Coaches Bonuses Structure",
                                False,
                                "Coaches missing proper bonuses structure"
                            )
                            
                        # Test that specialties exists and is a list
                        if 'specialties' in coach and isinstance(coach['specialties'], list):
                            self.log_result(
                                "Coaches Specialties Structure",
                                True,
                                "Coaches have proper specialties list structure",
                                {"specialties_count": len(coach['specialties'])}
                            )
                        else:
                            self.log_result(
                                "Coaches Specialties Structure",
                                False,
                                "Coaches missing proper specialties structure"
                            )
                            
                    else:
                        self.log_result(
                            "Coaches Endpoint Structure",
                            False,
                            f"Coaches missing required fields: {missing_fields}"
                        )
                else:
                    self.log_result(
                        "Coaches Endpoint Data",
                        False,
                        "Coaches endpoint returned empty or invalid data"
                    )
                    
            else:
                self.log_result(
                    "Coaches Endpoint Access",
                    False,
                    f"Coaches endpoint returned {response.status_code}: {response.text}"
                )
                
        except Exception as e:
            self.log_result(
                "Coaches Endpoint Error",
                False,
                f"Error accessing coaches endpoint: {str(e)}"
            )
            
    def test_no_authentication_required(self):
        """Test that all endpoints work without authentication headers"""
        print("\n🎯 TESTING NO AUTHENTICATION REQUIREMENT")
        
        endpoints = [
            ("/characters", "Characters"),
            ("/equipment", "Equipment"), 
            ("/techniques", "Techniques"),
            ("/teams/coaches/", "Coaches")
        ]
        
        for endpoint, name in endpoints:
            try:
                # Make request without any authentication headers
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    self.log_result(
                        f"{name} No Auth Required",
                        True,
                        f"{name} endpoint accessible without authentication (200 status)"
                    )
                elif response.status_code in [401, 403]:
                    self.log_result(
                        f"{name} No Auth Required",
                        False,
                        f"{name} endpoint requires authentication ({response.status_code} status)"
                    )
                else:
                    self.log_result(
                        f"{name} No Auth Required",
                        False,
                        f"{name} endpoint returned unexpected status: {response.status_code}"
                    )
                    
            except Exception as e:
                self.log_result(
                    f"{name} No Auth Test Error",
                    False,
                    f"Error testing {name} endpoint without auth: {str(e)}"
                )
                
    def run_all_tests(self):
        """Run all comparison tool tests"""
        print("🎯 COMPARISON TOOL BACKEND API TESTING - REVIEW REQUEST")
        print("=" * 60)
        print(f"Testing backend URL: {BASE_URL}")
        print("=" * 60)
        
        # Test each endpoint
        self.test_characters_endpoint()
        self.test_equipment_endpoint()
        self.test_techniques_endpoint()
        self.test_coaches_endpoint()
        self.test_no_authentication_required()
        
        # Print summary
        print("\n" + "=" * 60)
        print("🎯 COMPARISON TOOL TESTING SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.total_tests}")
        print(f"Passed: {self.passed_tests}")
        print(f"Failed: {self.total_tests - self.passed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        
        if self.passed_tests == self.total_tests:
            print("\n✅ ALL COMPARISON TOOL ENDPOINTS WORKING PERFECTLY!")
            print("All endpoints return proper data structures without authentication.")
        else:
            print(f"\n⚠️ {self.total_tests - self.passed_tests} TESTS FAILED")
            print("Some comparison tool endpoints have issues.")
            
        return self.passed_tests == self.total_tests

if __name__ == "__main__":
    tester = ComparisonToolTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎯 COMPARISON TOOL BACKEND TESTING COMPLETED SUCCESSFULLY")
        exit(0)
    else:
        print("\n🚨 COMPARISON TOOL BACKEND TESTING FOUND ISSUES")
        exit(1)