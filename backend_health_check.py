#!/usr/bin/env python3
"""
Backend Health Check - Quick verification of core API endpoints
Focus: API status, authentication, team management, character/equipment endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Use the production URL from frontend/.env
BASE_URL = "https://7e5fd1e7-6da1-4487-a765-fd3642f91aa7.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class BackendHealthChecker:
    def __init__(self):
        self.results = []
        self.auth_token = None
        self.test_user_id = None
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_api_status(self):
        """Test basic API status endpoints"""
        print("\n🔍 Testing API Status Endpoints...")
        
        # Test root endpoint
        try:
            response = requests.get(f"{BASE_URL}/", timeout=10)
            if response.status_code == 200:
                self.log_result("Root Endpoint", True, "API root accessible")
            else:
                self.log_result("Root Endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Root Endpoint", False, "Connection failed", str(e))
        
        # Test status endpoint
        try:
            response = requests.get(f"{API_BASE}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Status Endpoint", True, "API status healthy")
                else:
                    self.log_result("Status Endpoint", False, f"Unhealthy status: {data}")
            else:
                self.log_result("Status Endpoint", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Status Endpoint", False, "Connection failed", str(e))
    
    def test_authentication(self):
        """Test authentication endpoints basic functionality"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test user registration
        test_user = {
            "username": f"healthcheck_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "email": f"healthcheck_{datetime.now().strftime('%Y%m%d_%H%M%S')}@test.com",
            "password": "TestPass123!",
            "favourite_team": "Raimon",
            "bio": "Health check test user"
        }
        
        try:
            response = requests.post(f"{API_BASE}/auth/register", json=test_user, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    self.test_user_id = data.get("user_id")
                    self.log_result("User Registration", True, "User registered successfully")
                else:
                    self.log_result("User Registration", False, "No access token in response", data)
            else:
                self.log_result("User Registration", False, f"Status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("User Registration", False, "Registration failed", str(e))
        
        # Test token validation
        if self.auth_token:
            try:
                headers = {"Authorization": f"Bearer {self.auth_token}"}
                response = requests.get(f"{API_BASE}/auth/me", headers=headers, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("username") == test_user["username"]:
                        self.log_result("Token Validation", True, "Token validation successful")
                    else:
                        self.log_result("Token Validation", False, "User data mismatch", data)
                else:
                    self.log_result("Token Validation", False, f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result("Token Validation", False, "Token validation failed", str(e))
        
        # Test unauthorized access rejection
        try:
            response = requests.get(f"{API_BASE}/auth/me", timeout=10)
            if response.status_code in [401, 403]:
                self.log_result("Unauthorized Access", True, "Properly rejects unauthorized access")
            else:
                self.log_result("Unauthorized Access", False, f"Should reject but got: {response.status_code}")
        except Exception as e:
            self.log_result("Unauthorized Access", False, "Test failed", str(e))
    
    def test_team_management(self):
        """Test team management endpoints basic functionality"""
        print("\n⚽ Testing Team Management Endpoints...")
        
        if not self.auth_token:
            self.log_result("Team Management", False, "No auth token available for testing")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test get user teams
        try:
            response = requests.get(f"{API_BASE}/teams", headers=headers, timeout=10)
            if response.status_code == 200:
                teams = response.json()
                self.log_result("Get User Teams", True, f"Retrieved {len(teams)} teams")
            else:
                self.log_result("Get User Teams", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Get User Teams", False, "Request failed", str(e))
        
        # Test team creation
        test_team = {
            "name": f"Health Check Team {datetime.now().strftime('%H%M%S')}",
            "formation": "4-3-3",
            "description": "Test team for health check",
            "is_public": False,
            "tags": ["test", "health-check"]
        }
        
        try:
            response = requests.post(f"{API_BASE}/teams", json=test_team, headers=headers, timeout=10)
            if response.status_code == 200:
                team_data = response.json()
                team_id = team_data.get("id")  # Changed from team_id to id
                self.log_result("Team Creation", True, f"Team created with ID: {team_id}")
                
                # Test team update (privacy toggle)
                if team_id:
                    try:
                        update_data = {"is_public": True}
                        response = requests.put(f"{API_BASE}/teams/{team_id}", json=update_data, headers=headers, timeout=10)
                        if response.status_code == 200:
                            self.log_result("Team Update", True, "Team privacy toggle successful")
                        else:
                            self.log_result("Team Update", False, f"Status code: {response.status_code}")
                    except Exception as e:
                        self.log_result("Team Update", False, "Update failed", str(e))
            else:
                self.log_result("Team Creation", False, f"Status code: {response.status_code}", response.text)
        except Exception as e:
            self.log_result("Team Creation", False, "Creation failed", str(e))
    
    def test_character_equipment(self):
        """Test character and equipment endpoints basic functionality"""
        print("\n👤 Testing Character & Equipment Endpoints...")
        
        # Test characters endpoint
        try:
            response = requests.get(f"{API_BASE}/characters", timeout=10)
            if response.status_code == 200:
                characters = response.json()
                self.log_result("Get Characters", True, f"Retrieved {len(characters)} characters")
                
                # Test character filtering
                if characters:
                    try:
                        response = requests.get(f"{API_BASE}/characters?position=GK", timeout=10)
                        if response.status_code == 200:
                            gk_chars = response.json()
                            self.log_result("Character Filtering", True, f"Position filter returned {len(gk_chars)} GK characters")
                        else:
                            self.log_result("Character Filtering", False, f"Status code: {response.status_code}")
                    except Exception as e:
                        self.log_result("Character Filtering", False, "Filter test failed", str(e))
            else:
                self.log_result("Get Characters", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Get Characters", False, "Request failed", str(e))
        
        # Test equipment endpoint
        try:
            response = requests.get(f"{API_BASE}/equipment", timeout=10)
            if response.status_code == 200:
                equipment = response.json()
                self.log_result("Get Equipment", True, f"Retrieved {len(equipment)} equipment items")
                
                # Test equipment filtering
                if equipment:
                    try:
                        response = requests.get(f"{API_BASE}/equipment?category=Boots", timeout=10)
                        if response.status_code == 200:
                            boots = response.json()
                            self.log_result("Equipment Filtering", True, f"Category filter returned {len(boots)} boots")
                        else:
                            self.log_result("Equipment Filtering", False, f"Status code: {response.status_code}")
                    except Exception as e:
                        self.log_result("Equipment Filtering", False, "Filter test failed", str(e))
            else:
                self.log_result("Get Equipment", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_result("Get Equipment", False, "Request failed", str(e))
        
        # Test formations/tactics endpoints
        if self.auth_token:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            try:
                response = requests.get(f"{API_BASE}/teams/formations/", headers=headers, timeout=10)
                if response.status_code == 200:
                    formations = response.json()
                    self.log_result("Get Formations", True, f"Retrieved {len(formations)} formations")
                else:
                    self.log_result("Get Formations", False, f"Status code: {response.status_code}")
            except Exception as e:
                self.log_result("Get Formations", False, "Request failed", str(e))
        else:
            self.log_result("Get Formations", False, "No auth token available")
    
    def run_health_check(self):
        """Run complete health check"""
        print("🏥 BACKEND HEALTH CHECK STARTING...")
        print(f"Testing against: {BASE_URL}")
        print("=" * 60)
        
        # Run all tests
        self.test_api_status()
        self.test_authentication()
        self.test_team_management()
        self.test_character_equipment()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 HEALTH CHECK SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.results)
        passed_tests = len([r for r in self.results if "✅ PASS" in r["status"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if "❌ FAIL" in result["status"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    checker = BackendHealthChecker()
    success = checker.run_health_check()
    sys.exit(0 if success else 1)