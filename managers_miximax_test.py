#!/usr/bin/env python3
"""
Managers and Mixi Max Functionality Testing Suite
Tests the newly added managers and Mixi Max techniques functionality
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BACKEND_URL = "https://formation-update.preview.emergentagent.com/api"

class ManagersMixiMaxTester:
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
        print("\n🔐 AUTHENTICATION SETUP")
        
        # Register a test user
        register_data = {
            "username": f"miximax_test_{uuid.uuid4().hex[:8]}",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPassword123!",
            "favourite_team": "Raimon",
            "profile_picture": "https://example.com/avatar.jpg",
            "bio": "Mixi Max test user"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/auth/register", json=register_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                self.log_result("User Registration", True, f"Token obtained, User ID: {self.user_id}")
                return True
            else:
                self.log_result("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
            return False
    
    def get_headers(self):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    def test_new_managers_availability(self):
        """Test GET /api/coaches/ endpoint to verify new managers are available"""
        print("\n👨‍💼 NEW MANAGERS AVAILABILITY TESTING")
        
        expected_new_managers = [
            "Nelly Raimon",
            "Aki Kino", 
            "Haruna Otonashi",
            "Midori Seto"
        ]
        
        try:
            # Test get all coaches
            response = requests.get(f"{BACKEND_URL}/teams/coaches/")
            if response.status_code == 200:
                coaches = response.json()
                self.log_result("GET /api/coaches/", True, f"Retrieved {len(coaches)} coaches")
                
                # Check for new managers
                coach_names = [coach.get("name", "") for coach in coaches]
                found_new_managers = []
                missing_managers = []
                
                for expected_manager in expected_new_managers:
                    if expected_manager in coach_names:
                        found_new_managers.append(expected_manager)
                    else:
                        missing_managers.append(expected_manager)
                
                if len(found_new_managers) == len(expected_new_managers):
                    self.log_result("New Managers Availability", True, 
                                  f"All new managers found: {', '.join(found_new_managers)}")
                else:
                    self.log_result("New Managers Availability", False, 
                                  f"Found: {found_new_managers}, Missing: {missing_managers}")
                
                # Verify existing coaches are still available
                existing_coaches_found = len(coaches) > len(expected_new_managers)
                self.log_result("Existing Coaches Preserved", existing_coaches_found,
                              f"Total coaches: {len(coaches)} (should be more than {len(expected_new_managers)})")
                
                return coaches
            else:
                self.log_result("GET /api/coaches/", False, f"Status: {response.status_code}")
                return []
        except Exception as e:
            self.log_result("New Managers Test", False, f"Exception: {str(e)}")
            return []
    
    def test_new_managers_data_structure(self, coaches):
        """Verify new coaches have proper data structure"""
        print("\n📋 NEW MANAGERS DATA STRUCTURE TESTING")
        
        expected_new_managers = [
            "Nelly Raimon",
            "Aki Kino", 
            "Haruna Otonashi",
            "Midori Seto"
        ]
        
        required_fields = ["id", "name", "title", "portrait", "bonuses", "specialties"]
        
        for coach in coaches:
            coach_name = coach.get("name", "")
            if coach_name in expected_new_managers:
                # Check required fields
                missing_fields = []
                for field in required_fields:
                    if field not in coach or coach[field] is None:
                        missing_fields.append(field)
                
                if not missing_fields:
                    self.log_result(f"Data Structure - {coach_name}", True, 
                                  f"All required fields present: {required_fields}")
                    
                    # Verify bonuses structure
                    bonuses = coach.get("bonuses", {})
                    if isinstance(bonuses, dict) and bonuses:
                        self.log_result(f"Bonuses Structure - {coach_name}", True,
                                      f"Bonuses: {list(bonuses.keys())}")
                    else:
                        self.log_result(f"Bonuses Structure - {coach_name}", False,
                                      "Bonuses should be a non-empty dictionary")
                    
                    # Verify specialties structure
                    specialties = coach.get("specialties", [])
                    if isinstance(specialties, list) and specialties:
                        self.log_result(f"Specialties Structure - {coach_name}", True,
                                      f"Specialties: {specialties}")
                    else:
                        self.log_result(f"Specialties Structure - {coach_name}", False,
                                      "Specialties should be a non-empty list")
                else:
                    self.log_result(f"Data Structure - {coach_name}", False,
                                  f"Missing fields: {missing_fields}")
    
    def test_mixi_max_techniques_availability(self):
        """Test GET /api/techniques/ endpoint to verify Mixi Max techniques are available"""
        print("\n⚡ MIXI MAX TECHNIQUES AVAILABILITY TESTING")
        
        try:
            # Test filtering by technique_type=mixi-max
            response = requests.get(f"{BACKEND_URL}/techniques/?technique_type=mixi-max")
            if response.status_code == 200:
                mixi_max_techniques = response.json()
                self.log_result("GET /api/techniques/?technique_type=mixi-max", True, 
                              f"Retrieved {len(mixi_max_techniques)} Mixi Max techniques")
                
                if len(mixi_max_techniques) > 0:
                    # Verify technique structure
                    sample_technique = mixi_max_techniques[0]
                    required_fields = ["name", "description", "technique_type", "category", "element", "power", "rarity"]
                    
                    missing_fields = []
                    for field in required_fields:
                        if field not in sample_technique:
                            missing_fields.append(field)
                    
                    if not missing_fields:
                        self.log_result("Mixi Max Technique Structure", True,
                                      f"Sample technique '{sample_technique.get('name')}' has all required fields")
                    else:
                        self.log_result("Mixi Max Technique Structure", False,
                                      f"Missing fields in sample technique: {missing_fields}")
                    
                    # Verify technique_type is correct
                    correct_type_count = sum(1 for tech in mixi_max_techniques 
                                           if tech.get("technique_type") == "mixi-max")
                    
                    if correct_type_count == len(mixi_max_techniques):
                        self.log_result("Mixi Max Type Consistency", True,
                                      f"All {len(mixi_max_techniques)} techniques have correct type")
                    else:
                        self.log_result("Mixi Max Type Consistency", False,
                                      f"Only {correct_type_count}/{len(mixi_max_techniques)} have correct type")
                    
                    # List some Mixi Max techniques found
                    technique_names = [tech.get("name", "Unknown") for tech in mixi_max_techniques[:5]]
                    self.log_result("Mixi Max Techniques Sample", True,
                                  f"Found techniques: {', '.join(technique_names)}")
                    
                    return mixi_max_techniques
                else:
                    self.log_result("Mixi Max Techniques Count", False, "No Mixi Max techniques found")
                    return []
            else:
                self.log_result("GET /api/techniques/?technique_type=mixi-max", False, 
                              f"Status: {response.status_code}")
                return []
        except Exception as e:
            self.log_result("Mixi Max Techniques Test", False, f"Exception: {str(e)}")
            return []
    
    def test_regular_techniques_without_mixi_max(self):
        """Test if regular techniques can still be retrieved without Mixi Max techniques"""
        print("\n🎯 REGULAR TECHNIQUES FILTERING TESTING")
        
        try:
            # Test getting all techniques
            response = requests.get(f"{BACKEND_URL}/techniques/")
            if response.status_code == 200:
                all_techniques = response.json()
                self.log_result("GET /api/techniques/ (all)", True, 
                              f"Retrieved {len(all_techniques)} total techniques")
                
                # Count different technique types
                type_counts = {}
                for tech in all_techniques:
                    tech_type = tech.get("technique_type", "unknown")
                    type_counts[tech_type] = type_counts.get(tech_type, 0) + 1
                
                self.log_result("Technique Types Distribution", True,
                              f"Types found: {dict(type_counts)}")
                
                # Test filtering by other technique types (excluding mixi-max)
                regular_types = ["avatar", "totem", "mix-max"]
                for tech_type in regular_types:
                    response = requests.get(f"{BACKEND_URL}/techniques/?technique_type={tech_type}")
                    if response.status_code == 200:
                        filtered_techniques = response.json()
                        
                        # Verify no mixi-max techniques in results
                        mixi_max_in_results = sum(1 for tech in filtered_techniques 
                                                if tech.get("technique_type") == "mixi-max")
                        
                        if mixi_max_in_results == 0:
                            self.log_result(f"Regular Techniques Filter ({tech_type})", True,
                                          f"Found {len(filtered_techniques)} {tech_type} techniques, no mixi-max contamination")
                        else:
                            self.log_result(f"Regular Techniques Filter ({tech_type})", False,
                                          f"Found {mixi_max_in_results} mixi-max techniques in {tech_type} filter")
                    else:
                        self.log_result(f"Regular Techniques Filter ({tech_type})", False,
                                      f"Status: {response.status_code}")
                
                return all_techniques
            else:
                self.log_result("GET /api/techniques/ (all)", False, f"Status: {response.status_code}")
                return []
        except Exception as e:
            self.log_result("Regular Techniques Test", False, f"Exception: {str(e)}")
            return []
    
    def test_backend_services_status(self):
        """Confirm that backend services are running properly after database updates"""
        print("\n🔧 BACKEND SERVICES STATUS TESTING")
        
        try:
            # Test root endpoint
            response = requests.get(f"{BACKEND_URL.replace('/api', '')}/")
            if response.status_code == 200:
                self.log_result("Root Endpoint", True, "Backend root is responding")
            else:
                self.log_result("Root Endpoint", False, f"Status: {response.status_code}")
            
            # Test status endpoint
            response = requests.get(f"{BACKEND_URL}/status")
            if response.status_code == 200:
                status_data = response.json()
                self.log_result("Status Endpoint", True, f"Status: {status_data.get('status', 'unknown')}")
            else:
                self.log_result("Status Endpoint", False, f"Status: {response.status_code}")
            
            # Test key endpoints are still working
            endpoints_to_test = [
                ("/characters/", "Characters"),
                ("/equipment/", "Equipment"),
                ("/teams/formations/", "Formations"),
                ("/teams/tactics/", "Tactics")
            ]
            
            for endpoint, name in endpoints_to_test:
                try:
                    response = requests.get(f"{BACKEND_URL}{endpoint}")
                    if response.status_code == 200:
                        data = response.json()
                        self.log_result(f"{name} Endpoint", True, f"Retrieved {len(data)} items")
                    else:
                        self.log_result(f"{name} Endpoint", False, f"Status: {response.status_code}")
                except Exception as e:
                    self.log_result(f"{name} Endpoint", False, f"Exception: {str(e)}")
            
        except Exception as e:
            self.log_result("Backend Services Test", False, f"Exception: {str(e)}")
    
    def test_individual_coach_details(self, coaches):
        """Test individual coach details endpoints for new managers"""
        print("\n🔍 INDIVIDUAL COACH DETAILS TESTING")
        
        expected_new_managers = [
            "Nelly Raimon",
            "Aki Kino", 
            "Haruna Otonashi",
            "Midori Seto"
        ]
        
        for coach in coaches:
            coach_name = coach.get("name", "")
            if coach_name in expected_new_managers:
                coach_id = coach.get("id")
                if coach_id:
                    try:
                        response = requests.get(f"{BACKEND_URL}/teams/coaches/{coach_id}")
                        if response.status_code == 200:
                            coach_details = response.json()
                            self.log_result(f"Individual Coach Details - {coach_name}", True,
                                          f"Retrieved details for coach ID: {coach_id}")
                            
                            # Verify the returned data matches the list data
                            if coach_details.get("name") == coach_name:
                                self.log_result(f"Coach Data Consistency - {coach_name}", True,
                                              "Individual endpoint data matches list data")
                            else:
                                self.log_result(f"Coach Data Consistency - {coach_name}", False,
                                              "Individual endpoint data doesn't match list data")
                        else:
                            self.log_result(f"Individual Coach Details - {coach_name}", False,
                                          f"Status: {response.status_code}")
                    except Exception as e:
                        self.log_result(f"Individual Coach Details - {coach_name}", False,
                                      f"Exception: {str(e)}")
                else:
                    self.log_result(f"Coach ID Check - {coach_name}", False, "No coach ID found")
    
    def run_all_tests(self):
        """Run all managers and Mixi Max tests"""
        print("🚀 STARTING MANAGERS AND MIXI MAX TESTING")
        print("=" * 60)
        
        # Authentication (optional for these tests, but good to have)
        if not self.authenticate():
            print("⚠️ Authentication failed. Continuing with public endpoint tests.")
        
        # Test new managers
        coaches = self.test_new_managers_availability()
        if coaches:
            self.test_new_managers_data_structure(coaches)
            self.test_individual_coach_details(coaches)
        
        # Test Mixi Max techniques
        mixi_max_techniques = self.test_mixi_max_techniques_availability()
        
        # Test regular techniques filtering
        all_techniques = self.test_regular_techniques_without_mixi_max()
        
        # Test backend services status
        self.test_backend_services_status()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 MANAGERS AND MIXI MAX TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n✅ MANAGERS AND MIXI MAX TESTING COMPLETED")
        return passed, failed, total

if __name__ == "__main__":
    tester = ManagersMixiMaxTester()
    tester.run_all_tests()