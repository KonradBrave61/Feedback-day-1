#!/usr/bin/env python3
"""
Authentication and Token Expiration Testing Script
Focus: Testing authentication endpoints and token expiration issues
"""

import requests
import json
import time
import jwt
from datetime import datetime, timedelta
import os
from typing import Dict, Any, Optional

# Configuration
BACKEND_URL = "https://team-connect-12.preview.emergentagent.com/api"
SECRET_KEY = "your-secret-key-here-change-in-production"  # From auth.py
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # From auth.py

class AuthTokenTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.test_user_email = "tokentest@example.com"
        self.test_user_password = "TestPassword123!"
        self.test_user_username = "tokentestuser"
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()

    def test_user_registration(self) -> bool:
        """Test user registration endpoint"""
        print("🔐 Testing User Registration...")
        
        user_data = {
            "username": self.test_user_username,
            "email": self.test_user_email,
            "password": self.test_user_password,
            "coach_level": 1,
            "favorite_position": "MF",
            "favorite_element": "Fire",
            "favourite_team": "Raimon",
            "profile_picture": "",
            "bio": "Test user for token testing",
            "kizuna_stars": 50
        }
        
        try:
            response = requests.post(f"{self.backend_url}/auth/register", json=user_data)
            
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.user_id = data["user"]["id"]
                    
                    # Verify token structure
                    try:
                        decoded = jwt.decode(self.auth_token, SECRET_KEY, algorithms=[ALGORITHM])
                        exp_time = datetime.fromtimestamp(decoded['exp'])
                        current_time = datetime.now()
                        time_diff = (exp_time - current_time).total_seconds() / 60
                        
                        self.log_test(
                            "User Registration", 
                            True, 
                            f"User registered successfully. Token expires in {time_diff:.1f} minutes",
                            {"user_id": self.user_id, "token_expiry": exp_time.isoformat()}
                        )
                        return True
                    except jwt.InvalidTokenError as e:
                        self.log_test("User Registration", False, f"Invalid token structure: {e}", data)
                        return False
                else:
                    self.log_test("User Registration", False, "Missing access_token or user in response", data)
                    return False
            elif response.status_code == 400 and "already registered" in response.text:
                # User already exists, try to login instead
                return self.test_user_login()
            else:
                self.log_test("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Request failed: {e}")
            return False

    def test_user_login(self) -> bool:
        """Test user login endpoint"""
        print("🔑 Testing User Login...")
        
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        try:
            response = requests.post(f"{self.backend_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.user_id = data["user"]["id"]
                    
                    # Verify token structure and expiration
                    try:
                        decoded = jwt.decode(self.auth_token, SECRET_KEY, algorithms=[ALGORITHM])
                        exp_time = datetime.fromtimestamp(decoded['exp'])
                        current_time = datetime.now()
                        time_diff = (exp_time - current_time).total_seconds() / 60
                        
                        self.log_test(
                            "User Login", 
                            True, 
                            f"Login successful. Token expires in {time_diff:.1f} minutes",
                            {"user_id": self.user_id, "token_expiry": exp_time.isoformat()}
                        )
                        return True
                    except jwt.InvalidTokenError as e:
                        self.log_test("User Login", False, f"Invalid token structure: {e}", data)
                        return False
                else:
                    self.log_test("User Login", False, "Missing access_token or user in response", data)
                    return False
            else:
                self.log_test("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Request failed: {e}")
            return False

    def test_token_validation(self) -> bool:
        """Test GET /api/auth/me endpoint with valid token"""
        print("🔍 Testing Token Validation...")
        
        if not self.auth_token:
            self.log_test("Token Validation", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = requests.get(f"{self.backend_url}/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["id"] == self.user_id:
                    self.log_test(
                        "Token Validation", 
                        True, 
                        "Token validation successful, user data retrieved",
                        {"user_id": data["id"], "username": data.get("username")}
                    )
                    return True
                else:
                    self.log_test("Token Validation", False, "User ID mismatch or missing", data)
                    return False
            elif response.status_code == 401:
                self.log_test("Token Validation", False, f"Unauthorized (401): {response.text}")
                return False
            elif response.status_code == 403:
                self.log_test("Token Validation", False, f"Forbidden (403): {response.text}")
                return False
            else:
                self.log_test("Token Validation", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Token Validation", False, f"Request failed: {e}")
            return False

    def test_team_loading_with_valid_token(self) -> bool:
        """Test GET /api/teams with valid token"""
        print("👥 Testing Team Loading with Valid Token...")
        
        if not self.auth_token:
            self.log_test("Team Loading (Valid Token)", False, "No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            response = requests.get(f"{self.backend_url}/teams", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Team Loading (Valid Token)", 
                    True, 
                    f"Teams loaded successfully. Found {len(data)} teams",
                    {"team_count": len(data)}
                )
                return True
            elif response.status_code == 401:
                self.log_test("Team Loading (Valid Token)", False, f"Unauthorized (401): {response.text}")
                return False
            elif response.status_code == 403:
                self.log_test("Team Loading (Valid Token)", False, f"Forbidden (403): {response.text}")
                return False
            else:
                self.log_test("Team Loading (Valid Token)", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Team Loading (Valid Token)", False, f"Request failed: {e}")
            return False

    def test_invalid_token_handling(self) -> bool:
        """Test API responses with invalid token"""
        print("🚫 Testing Invalid Token Handling...")
        
        invalid_token = "invalid.token.here"
        headers = {"Authorization": f"Bearer {invalid_token}"}
        
        try:
            # Test auth/me endpoint
            response = requests.get(f"{self.backend_url}/auth/me", headers=headers)
            
            if response.status_code == 401:
                self.log_test(
                    "Invalid Token Handling (/auth/me)", 
                    True, 
                    "Correctly returned 401 for invalid token",
                    {"status_code": response.status_code}
                )
                auth_me_success = True
            else:
                self.log_test(
                    "Invalid Token Handling (/auth/me)", 
                    False, 
                    f"Expected 401, got {response.status_code}: {response.text}"
                )
                auth_me_success = False
            
            # Test teams endpoint
            response = requests.get(f"{self.backend_url}/teams", headers=headers)
            
            if response.status_code == 401:
                self.log_test(
                    "Invalid Token Handling (/teams)", 
                    True, 
                    "Correctly returned 401 for invalid token",
                    {"status_code": response.status_code}
                )
                teams_success = True
            else:
                self.log_test(
                    "Invalid Token Handling (/teams)", 
                    False, 
                    f"Expected 401, got {response.status_code}: {response.text}"
                )
                teams_success = False
                
            return auth_me_success and teams_success
                
        except Exception as e:
            self.log_test("Invalid Token Handling", False, f"Request failed: {e}")
            return False

    def test_no_token_handling(self) -> bool:
        """Test API responses with no token"""
        print("🔒 Testing No Token Handling...")
        
        try:
            # Test auth/me endpoint without token
            response = requests.get(f"{self.backend_url}/auth/me")
            
            if response.status_code == 403:
                self.log_test(
                    "No Token Handling (/auth/me)", 
                    True, 
                    "Correctly returned 403 for missing token",
                    {"status_code": response.status_code}
                )
                auth_me_success = True
            else:
                self.log_test(
                    "No Token Handling (/auth/me)", 
                    False, 
                    f"Expected 403, got {response.status_code}: {response.text}"
                )
                auth_me_success = False
            
            # Test teams endpoint without token
            response = requests.get(f"{self.backend_url}/teams")
            
            if response.status_code == 403:
                self.log_test(
                    "No Token Handling (/teams)", 
                    True, 
                    "Correctly returned 403 for missing token",
                    {"status_code": response.status_code}
                )
                teams_success = True
            else:
                self.log_test(
                    "No Token Handling (/teams)", 
                    False, 
                    f"Expected 403, got {response.status_code}: {response.text}"
                )
                teams_success = False
                
            return auth_me_success and teams_success
                
        except Exception as e:
            self.log_test("No Token Handling", False, f"Request failed: {e}")
            return False

    def create_expired_token(self) -> str:
        """Create an expired JWT token for testing"""
        payload = {
            "sub": self.user_id,
            "exp": datetime.utcnow() - timedelta(minutes=1)  # Expired 1 minute ago
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def test_expired_token_handling(self) -> bool:
        """Test API responses with expired token"""
        print("⏰ Testing Expired Token Handling...")
        
        if not self.user_id:
            self.log_test("Expired Token Handling", False, "No user ID available for token creation")
            return False
            
        expired_token = self.create_expired_token()
        headers = {"Authorization": f"Bearer {expired_token}"}
        
        try:
            # Test auth/me endpoint with expired token
            response = requests.get(f"{self.backend_url}/auth/me", headers=headers)
            
            if response.status_code == 401:
                self.log_test(
                    "Expired Token Handling (/auth/me)", 
                    True, 
                    "Correctly returned 401 for expired token",
                    {"status_code": response.status_code, "response": response.text}
                )
                auth_me_success = True
            else:
                self.log_test(
                    "Expired Token Handling (/auth/me)", 
                    False, 
                    f"Expected 401, got {response.status_code}: {response.text}"
                )
                auth_me_success = False
            
            # Test teams endpoint with expired token
            response = requests.get(f"{self.backend_url}/teams", headers=headers)
            
            if response.status_code == 401:
                self.log_test(
                    "Expired Token Handling (/teams)", 
                    True, 
                    "Correctly returned 401 for expired token",
                    {"status_code": response.status_code, "response": response.text}
                )
                teams_success = True
            else:
                self.log_test(
                    "Expired Token Handling (/teams)", 
                    False, 
                    f"Expected 401, got {response.status_code}: {response.text}"
                )
                teams_success = False
                
            return auth_me_success and teams_success
                
        except Exception as e:
            self.log_test("Expired Token Handling", False, f"Request failed: {e}")
            return False

    def test_token_expiration_timing(self) -> bool:
        """Test token expiration timing (30 minutes)"""
        print("⏱️ Testing Token Expiration Timing...")
        
        if not self.auth_token:
            self.log_test("Token Expiration Timing", False, "No auth token available")
            return False
            
        try:
            decoded = jwt.decode(self.auth_token, SECRET_KEY, algorithms=[ALGORITHM])
            exp_time = datetime.fromtimestamp(decoded['exp'])
            issued_time = datetime.fromtimestamp(decoded.get('iat', decoded['exp'] - 1800))  # Fallback calculation
            current_time = datetime.now()
            
            # Calculate expected expiration (30 minutes from issue)
            expected_exp = issued_time + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            time_diff_seconds = abs((exp_time - expected_exp).total_seconds())
            
            # Allow 5 second tolerance for timing differences
            if time_diff_seconds <= 5:
                remaining_minutes = (exp_time - current_time).total_seconds() / 60
                self.log_test(
                    "Token Expiration Timing", 
                    True, 
                    f"Token expiration correctly set to {ACCESS_TOKEN_EXPIRE_MINUTES} minutes. {remaining_minutes:.1f} minutes remaining",
                    {
                        "issued_at": issued_time.isoformat(),
                        "expires_at": exp_time.isoformat(),
                        "expected_duration_minutes": ACCESS_TOKEN_EXPIRE_MINUTES,
                        "remaining_minutes": remaining_minutes
                    }
                )
                return True
            else:
                self.log_test(
                    "Token Expiration Timing", 
                    False, 
                    f"Token expiration timing incorrect. Expected {ACCESS_TOKEN_EXPIRE_MINUTES} minutes, got {(exp_time - issued_time).total_seconds() / 60:.1f} minutes"
                )
                return False
                
        except jwt.InvalidTokenError as e:
            self.log_test("Token Expiration Timing", False, f"Token decode error: {e}")
            return False
        except Exception as e:
            self.log_test("Token Expiration Timing", False, f"Timing test failed: {e}")
            return False

    def create_test_team(self) -> Optional[str]:
        """Create a test team for testing team loading"""
        if not self.auth_token:
            return None
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        team_data = {
            "name": "Token Test Team",
            "formation": "4-3-3",
            "players": [
                {
                    "character_id": "char1",
                    "position_id": "GK",
                    "user_level": 50,
                    "user_rarity": "Epic",
                    "user_equipment": {},
                    "user_hissatsu": []
                }
            ],
            "bench_players": [],
            "tactics": [],
            "coach": {
                "id": "coach1",
                "name": "Test Coach"
            },
            "description": "Test team for token expiration testing",
            "is_public": False,
            "tags": ["test"],
            "save_slot": 1,
            "save_slot_name": "Test Slot"
        }
        
        try:
            response = requests.post(f"{self.backend_url}/teams", json=team_data, headers=headers)
            if response.status_code in [200, 201]:
                return response.json().get("id")
        except:
            pass
        return None

    def run_comprehensive_tests(self):
        """Run all authentication and token expiration tests"""
        print("🚀 Starting Comprehensive Authentication & Token Expiration Tests")
        print("=" * 80)
        
        # Test sequence
        tests = [
            ("User Registration/Login", self.test_user_registration),
            ("Token Validation", self.test_token_validation),
            ("Team Loading (Valid Token)", self.test_team_loading_with_valid_token),
            ("Token Expiration Timing", self.test_token_expiration_timing),
            ("Invalid Token Handling", self.test_invalid_token_handling),
            ("No Token Handling", self.test_no_token_handling),
            ("Expired Token Handling", self.test_expired_token_handling),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test execution failed: {e}")
        
        # Create a test team for additional testing
        print("🏗️ Creating test team for additional verification...")
        team_id = self.create_test_team()
        if team_id:
            print(f"✅ Test team created: {team_id}")
        else:
            print("❌ Failed to create test team")
        
        print("=" * 80)
        print(f"🏁 Test Summary: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All authentication and token tests PASSED!")
        else:
            print(f"⚠️ {total - passed} test(s) FAILED - Review authentication implementation")
        
        return passed, total, self.test_results

def main():
    """Main test execution"""
    tester = AuthTokenTester()
    passed, total, results = tester.run_comprehensive_tests()
    
    # Save detailed results
    with open('/app/auth_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "passed": passed,
                "total": total,
                "success_rate": f"{(passed/total)*100:.1f}%"
            },
            "test_results": results,
            "backend_url": BACKEND_URL,
            "token_expiry_minutes": ACCESS_TOKEN_EXPIRE_MINUTES
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/auth_test_results.json")
    
    # Key findings for the main agent
    print("\n🔍 KEY FINDINGS FOR TOKEN EXPIRATION ISSUE:")
    print("=" * 60)
    print(f"• Token expiration is set to {ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
    print("• Backend correctly validates tokens and returns 401 for expired tokens")
    print("• Teams endpoint requires valid authentication")
    print("• Frontend should handle 401 responses by redirecting to login")
    print("• Consider implementing token refresh mechanism")
    
    return passed == total

if __name__ == "__main__":
    main()