#!/usr/bin/env python3
"""
Authentication System Test Suite
Tests all authentication endpoints as requested by the user
"""
import requests
import json
import os
import unittest
import uuid
import random
import string
from datetime import datetime

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure the URL doesn't have trailing slash
if BACKEND_URL.endswith('/'):
    BACKEND_URL = BACKEND_URL[:-1]

# Add the /api prefix
API_URL = f"{BACKEND_URL}/api"

print(f"Testing Authentication API at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class AuthenticationSystemTest(unittest.TestCase):
    """Comprehensive Authentication System Test Suite"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique test data as requested
        random_suffix = generate_random_string()
        self.test_username = "testuser"  # As requested by user
        self.test_email = "test@example.com"  # As requested by user
        self.test_password = "testpass123"  # As requested by user
        
        # Demo user credentials as requested
        self.demo_email = "demo@inazuma.com"
        self.demo_password = "demo123"
        
        # User registration data with kizuna_stars field
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 5,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Raimon",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Test user for authentication testing"
        }
        
        # Store tokens and IDs
        self.auth_token = None
        self.user_id = None
        self.demo_token = None
    
    def test_01_user_registration(self):
        """Test POST /api/auth/register with new user"""
        print("\n=== 1. USER REGISTRATION TEST ===")
        print(f"Testing registration with: username={self.test_username}, email={self.test_email}")
        
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        
        # Verify response
        self.assertEqual(response.status_code, 200, f"Registration failed: {response.text}")
        data = response.json()
        
        # Verify access token is returned
        self.assertIn("access_token", data, "Access token not returned")
        self.assertIn("token_type", data, "Token type not returned")
        self.assertEqual(data["token_type"], "bearer", "Token type should be bearer")
        
        # Verify user data is returned
        self.assertIn("user", data, "User data not returned")
        user = data["user"]
        self.assertEqual(user["username"], self.test_username, "Username mismatch")
        self.assertEqual(user["email"], self.test_email, "Email mismatch")
        
        # Verify all user fields are saved properly including kizuna_stars
        self.assertIn("id", user, "User ID not returned")
        self.assertIn("coach_level", user, "Coach level not saved")
        self.assertIn("favorite_position", user, "Favorite position not saved")
        self.assertIn("favorite_element", user, "Favorite element not saved")
        self.assertIn("favourite_team", user, "Favourite team not saved")
        self.assertIn("profile_picture", user, "Profile picture not saved")
        self.assertIn("bio", user, "Bio not saved")
        self.assertIn("kizuna_stars", user, "Kizuna stars not saved")
        
        # Verify kizuna_stars initial value
        self.assertEqual(user["kizuna_stars"], 50, "Initial kizuna_stars should be 50")
        
        # Store for subsequent tests
        self.auth_token = data["access_token"]
        self.user_id = user["id"]
        
        print(f"✅ User registration successful!")
        print(f"   - User ID: {self.user_id}")
        print(f"   - Access token received: {self.auth_token[:20]}...")
        print(f"   - Kizuna stars: {user['kizuna_stars']}")
        print(f"   - All user fields saved properly")
    
    def test_02_user_login(self):
        """Test POST /api/auth/login with created user credentials"""
        print("\n=== 2. USER LOGIN TEST ===")
        print(f"Testing login with: email={self.test_email}")
        
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        
        # Verify response
        self.assertEqual(response.status_code, 200, f"Login failed: {response.text}")
        data = response.json()
        
        # Verify access token is returned
        self.assertIn("access_token", data, "Access token not returned")
        self.assertIn("token_type", data, "Token type not returned")
        self.assertEqual(data["token_type"], "bearer", "Token type should be bearer")
        
        # Verify returned user data is complete
        self.assertIn("user", data, "User data not returned")
        user = data["user"]
        self.assertEqual(user["username"], self.test_username, "Username mismatch")
        self.assertEqual(user["email"], self.test_email, "Email mismatch")
        self.assertEqual(user["id"], self.user_id, "User ID mismatch")
        
        # Verify all enhanced fields are present
        self.assertIn("coach_level", user, "Coach level missing")
        self.assertIn("favorite_position", user, "Favorite position missing")
        self.assertIn("favorite_element", user, "Favorite element missing")
        self.assertIn("favourite_team", user, "Favourite team missing")
        self.assertIn("kizuna_stars", user, "Kizuna stars missing")
        self.assertIn("total_teams", user, "Total teams missing")
        self.assertIn("followers", user, "Followers missing")
        self.assertIn("following", user, "Following missing")
        
        # Update token
        self.auth_token = data["access_token"]
        
        print(f"✅ User login successful!")
        print(f"   - Access token received: {self.auth_token[:20]}...")
        print(f"   - User data complete with all fields")
        print(f"   - Kizuna stars: {user['kizuna_stars']}")
    
    def test_03_demo_user_test(self):
        """Test login with demo user or create if doesn't exist"""
        print("\n=== 3. DEMO USER TEST ===")
        print(f"Testing demo user login: email={self.demo_email}")
        
        # First try to login with demo user
        demo_login_data = {
            "email": self.demo_email,
            "password": self.demo_password
        }
        
        response = requests.post(f"{API_URL}/auth/login", json=demo_login_data)
        
        if response.status_code == 401:
            # Demo user doesn't exist, create it
            print("   Demo user doesn't exist, creating...")
            
            demo_user_data = {
                "username": "demo_user",
                "email": self.demo_email,
                "password": self.demo_password,
                "coach_level": 10,
                "favorite_position": "MF",
                "favorite_element": "Lightning",
                "favourite_team": "Inazuma Japan",
                "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                "bio": "Demo user for testing purposes"
            }
            
            # Create demo user
            create_response = requests.post(f"{API_URL}/auth/register", json=demo_user_data)
            self.assertEqual(create_response.status_code, 200, f"Demo user creation failed: {create_response.text}")
            
            print("   ✅ Demo user created successfully")
            
            # Now try to login again
            response = requests.post(f"{API_URL}/auth/login", json=demo_login_data)
        
        # Verify demo user login
        self.assertEqual(response.status_code, 200, f"Demo user login failed: {response.text}")
        data = response.json()
        
        # Verify access token is returned
        self.assertIn("access_token", data, "Demo user access token not returned")
        self.assertIn("user", data, "Demo user data not returned")
        
        user = data["user"]
        self.assertEqual(user["email"], self.demo_email, "Demo user email mismatch")
        
        # Store demo token
        self.demo_token = data["access_token"]
        
        print(f"✅ Demo user login successful!")
        print(f"   - Demo user ID: {user['id']}")
        print(f"   - Access token received: {self.demo_token[:20]}...")
    
    def test_04_protected_route_test(self):
        """Test GET /api/auth/me with valid authentication token"""
        print("\n=== 4. PROTECTED ROUTE TEST ===")
        print("Testing GET /api/auth/me with valid token")
        
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        
        # Verify response
        self.assertEqual(response.status_code, 200, f"Protected route failed: {response.text}")
        data = response.json()
        
        # Verify it returns current user information
        self.assertEqual(data["username"], self.test_username, "Username mismatch")
        self.assertEqual(data["email"], self.test_email, "Email mismatch")
        self.assertEqual(data["id"], self.user_id, "User ID mismatch")
        
        # Verify all user fields are present
        self.assertIn("coach_level", data, "Coach level missing")
        self.assertIn("favorite_position", data, "Favorite position missing")
        self.assertIn("favorite_element", data, "Favorite element missing")
        self.assertIn("favourite_team", data, "Favourite team missing")
        self.assertIn("kizuna_stars", data, "Kizuna stars missing")
        self.assertIn("profile_picture", data, "Profile picture missing")
        self.assertIn("bio", data, "Bio missing")
        self.assertIn("total_teams", data, "Total teams missing")
        self.assertIn("followers", data, "Followers missing")
        self.assertIn("following", data, "Following missing")
        self.assertIn("created_at", data, "Created at missing")
        
        print(f"✅ Protected route test successful!")
        print(f"   - Current user information returned correctly")
        print(f"   - All user fields present")
        print(f"   - Kizuna stars: {data['kizuna_stars']}")
    
    def test_05_error_handling_duplicate_email(self):
        """Test registration with duplicate email"""
        print("\n=== 5. ERROR HANDLING - DUPLICATE EMAIL ===")
        print(f"Testing duplicate email registration: {self.test_email}")
        
        # Try to register with the same email again
        duplicate_user_data = {
            "username": "another_user",
            "email": self.test_email,  # Same email as before
            "password": "anotherpass123",
            "coach_level": 3,
            "favorite_position": "GK",
            "favorite_element": "Earth"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=duplicate_user_data)
        
        # Verify error response
        self.assertEqual(response.status_code, 400, "Duplicate email should return 400")
        data = response.json()
        self.assertIn("detail", data, "Error detail not returned")
        
        print(f"✅ Duplicate email registration properly rejected!")
        print(f"   - Status code: {response.status_code}")
        print(f"   - Error message: {data.get('detail', 'No detail')}")
    
    def test_06_error_handling_invalid_credentials(self):
        """Test login with invalid credentials"""
        print("\n=== 6. ERROR HANDLING - INVALID CREDENTIALS ===")
        print("Testing login with invalid password")
        
        invalid_login_data = {
            "email": self.test_email,
            "password": "wrongpassword123"  # Wrong password
        }
        
        response = requests.post(f"{API_URL}/auth/login", json=invalid_login_data)
        
        # Verify error response
        self.assertEqual(response.status_code, 401, "Invalid credentials should return 401")
        data = response.json()
        self.assertIn("detail", data, "Error detail not returned")
        
        print(f"✅ Invalid credentials properly rejected!")
        print(f"   - Status code: {response.status_code}")
        print(f"   - Error message: {data.get('detail', 'No detail')}")
    
    def test_07_error_handling_no_authentication(self):
        """Test protected route without authentication"""
        print("\n=== 7. ERROR HANDLING - NO AUTHENTICATION ===")
        print("Testing protected route without authentication token")
        
        # Test accessing /api/auth/me without token
        response = requests.get(f"{API_URL}/auth/me")
        
        # Verify error response
        self.assertEqual(response.status_code, 403, "No auth should return 403")
        
        print(f"✅ Unauthorized access properly rejected!")
        print(f"   - Status code: {response.status_code}")
        print(f"   - Protected route blocked without authentication")
    
    def test_08_error_handling_invalid_token(self):
        """Test protected route with invalid authentication token"""
        print("\n=== 8. ERROR HANDLING - INVALID TOKEN ===")
        print("Testing protected route with invalid token")
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        
        # Verify error response
        self.assertEqual(response.status_code, 403, "Invalid token should return 403")
        
        print(f"✅ Invalid token properly rejected!")
        print(f"   - Status code: {response.status_code}")
        print(f"   - Invalid token blocked")

def run_authentication_tests():
    """Run all authentication tests"""
    print("=" * 60)
    print("AUTHENTICATION SYSTEM COMPREHENSIVE TEST")
    print("=" * 60)
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(AuthenticationSystemTest)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Print summary
    print("\n" + "=" * 60)
    print("AUTHENTICATION TEST SUMMARY")
    print("=" * 60)
    
    total_tests = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    success_count = total_tests - failures - errors
    
    print(f"Total Tests: {total_tests}")
    print(f"Successful: {success_count}")
    print(f"Failures: {failures}")
    print(f"Errors: {errors}")
    
    if failures > 0:
        print("\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
    
    if errors > 0:
        print("\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
    
    if success_count == total_tests:
        print("\n🎉 ALL AUTHENTICATION TESTS PASSED!")
        return True
    else:
        print(f"\n❌ {failures + errors} AUTHENTICATION TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = run_authentication_tests()
    exit(0 if success else 1)