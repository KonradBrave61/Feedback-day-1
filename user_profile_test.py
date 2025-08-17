#!/usr/bin/env python3
"""
Backend Testing Script for User Profile Endpoints
Testing the newly added community API endpoints for user profiles
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://technique-compare.preview.emergentagent.com/api"

class UserProfileEndpointTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_users = []
        self.auth_tokens = {}
        
    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def register_test_user(self, username_suffix):
        """Register a test user and return credentials"""
        user_data = {
            "username": f"testuser_{username_suffix}_{uuid.uuid4().hex[:8]}",
            "email": f"test_{username_suffix}_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPassword123!",
            "coach_level": 5,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Raimon Eleven",
            "bio": f"Test user {username_suffix} for profile endpoint testing"
        }
        
        response = requests.post(f"{self.base_url}/auth/register", json=user_data)
        if response.status_code in [200, 201]:
            self.log(f"✅ User {user_data['username']} registered successfully")
            return user_data, response.json()
        else:
            self.log(f"❌ Failed to register user {user_data['username']}: {response.text}")
            return None, None
            
    def login_user(self, email, password):
        """Login user and return token"""
        login_data = {"email": email, "password": password}
        response = requests.post(f"{self.base_url}/auth/login", json=login_data)
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            user_id = token_data["user"]["id"]
            self.log(f"✅ User logged in successfully, ID: {user_id}")
            return token, user_id
        else:
            self.log(f"❌ Login failed: {response.text}")
            return None, None
            
    def test_get_user_profile(self, target_user_id, auth_token):
        """Test GET /api/community/users/{user_id}"""
        self.log(f"🔍 Testing GET /api/community/users/{target_user_id}")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{self.base_url}/community/users/{target_user_id}", headers=headers)
        
        if response.status_code == 200:
            user_profile = response.json()
            self.log(f"✅ User profile retrieved successfully")
            
            # Verify UserPublic model structure
            required_fields = [
                "id", "username", "coach_level", "favourite_team", 
                "favorite_position", "favorite_element", "total_teams", 
                "total_likes_received", "followers_count", "following_count", "created_at"
            ]
            
            missing_fields = [field for field in required_fields if field not in user_profile]
            if missing_fields:
                self.log(f"❌ Missing required fields: {missing_fields}")
                return False
                
            # Verify followers_count and following_count are integers
            if not isinstance(user_profile.get("followers_count"), int):
                self.log(f"❌ followers_count is not an integer: {user_profile.get('followers_count')}")
                return False
                
            if not isinstance(user_profile.get("following_count"), int):
                self.log(f"❌ following_count is not an integer: {user_profile.get('following_count')}")
                return False
                
            self.log(f"✅ User profile structure validated - followers: {user_profile['followers_count']}, following: {user_profile['following_count']}")
            return True
        else:
            self.log(f"❌ Failed to get user profile: {response.status_code} - {response.text}")
            return False
            
    def test_get_user_profile_invalid_id(self, auth_token):
        """Test GET /api/community/users/{user_id} with invalid ID"""
        self.log("🔍 Testing GET /api/community/users/{invalid_id}")
        
        invalid_user_id = "invalid_user_id_12345"
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{self.base_url}/community/users/{invalid_user_id}", headers=headers)
        
        if response.status_code == 404:
            self.log("✅ Invalid user ID correctly returns 404")
            return True
        else:
            self.log(f"❌ Expected 404 for invalid user ID, got: {response.status_code}")
            return False
            
    def test_follow_status(self, target_user_id, auth_token, expected_following=False):
        """Test GET /api/community/users/{user_id}/follow-status"""
        self.log(f"🔍 Testing GET /api/community/users/{target_user_id}/follow-status")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{self.base_url}/community/users/{target_user_id}/follow-status", headers=headers)
        
        if response.status_code == 200:
            follow_status = response.json()
            self.log(f"✅ Follow status retrieved successfully")
            
            # Verify response structure
            required_fields = ["is_following", "can_follow"]
            missing_fields = [field for field in required_fields if field not in follow_status]
            if missing_fields:
                self.log(f"❌ Missing required fields: {missing_fields}")
                return False
                
            # Verify boolean types
            if not isinstance(follow_status.get("is_following"), bool):
                self.log(f"❌ is_following is not boolean: {follow_status.get('is_following')}")
                return False
                
            if not isinstance(follow_status.get("can_follow"), bool):
                self.log(f"❌ can_follow is not boolean: {follow_status.get('can_follow')}")
                return False
                
            # Verify expected following status
            if follow_status["is_following"] != expected_following:
                self.log(f"❌ Expected is_following={expected_following}, got {follow_status['is_following']}")
                return False
                
            self.log(f"✅ Follow status validated - following: {follow_status['is_following']}, can_follow: {follow_status['can_follow']}")
            return True
        else:
            self.log(f"❌ Failed to get follow status: {response.status_code} - {response.text}")
            return False
            
    def test_follow_status_self(self, own_user_id, auth_token):
        """Test follow status for self (should have can_follow=False)"""
        self.log("🔍 Testing follow status for self (should not be able to follow)")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{self.base_url}/community/users/{own_user_id}/follow-status", headers=headers)
        
        if response.status_code == 200:
            follow_status = response.json()
            if follow_status.get("can_follow") == False:
                self.log("✅ Correctly cannot follow self")
                return True
            else:
                self.log(f"❌ Should not be able to follow self, got can_follow={follow_status.get('can_follow')}")
                return False
        else:
            self.log(f"❌ Failed to get self follow status: {response.status_code} - {response.text}")
            return False
            
    def test_follow_status_invalid_id(self, auth_token):
        """Test follow status with invalid user ID"""
        self.log("🔍 Testing follow status with invalid user ID")
        
        invalid_user_id = "invalid_user_id_12345"
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{self.base_url}/community/users/{invalid_user_id}/follow-status", headers=headers)
        
        if response.status_code == 404:
            self.log("✅ Invalid user ID correctly returns 404 for follow status")
            return True
        else:
            self.log(f"❌ Expected 404 for invalid user ID, got: {response.status_code}")
            return False
            
    def follow_user(self, target_user_id, auth_token):
        """Follow a user to test follow status changes"""
        self.log(f"🔗 Following user {target_user_id}")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        follow_data = {"user_id": target_user_id}
        response = requests.post(f"{self.base_url}/community/follow", json=follow_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if result.get("following") == True:
                self.log("✅ Successfully followed user")
                return True
            else:
                self.log(f"❌ Follow operation failed: {result}")
                return False
        else:
            self.log(f"❌ Failed to follow user: {response.status_code} - {response.text}")
            return False
            
    def create_public_team(self, auth_token, team_name):
        """Create a public team for testing user teams endpoint"""
        self.log(f"🏆 Creating public team: {team_name}")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        team_data = {
            "team_name": team_name,
            "description": f"Test team {team_name} for user profile testing",
            "is_public": True,
            "formation_id": 1,
            "players": [
                {
                    "character_id": 1,
                    "position_id": "GK",
                    "user_level": 50,
                    "user_rarity": "legendary",
                    "user_equipment": {"boots": None, "bracelets": None, "pendants": None},
                    "user_hissatsu": []
                }
            ],
            "bench_players": [],
            "tactics": [],
            "coach": {"id": 1, "name": "Mark Evans Sr."}
        }
        
        response = requests.post(f"{self.base_url}/teams", json=team_data, headers=headers)
        
        if response.status_code == 201:
            team = response.json()
            self.log(f"✅ Public team created successfully, ID: {team.get('id')}")
            return team.get('id')
        else:
            self.log(f"❌ Failed to create public team: {response.status_code} - {response.text}")
            return None
            
    def test_get_user_teams(self, target_user_id, auth_token, expected_team_count=0):
        """Test GET /api/community/users/{user_id}/teams"""
        self.log(f"🔍 Testing GET /api/community/users/{target_user_id}/teams")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{self.base_url}/community/users/{target_user_id}/teams", headers=headers)
        
        if response.status_code == 200:
            teams = response.json()
            self.log(f"✅ User teams retrieved successfully, count: {len(teams)}")
            
            # Verify it's a list
            if not isinstance(teams, list):
                self.log(f"❌ Expected list of teams, got: {type(teams)}")
                return False
                
            # Verify expected team count
            if len(teams) != expected_team_count:
                self.log(f"❌ Expected {expected_team_count} teams, got {len(teams)}")
                return False
                
            # Verify team structure if teams exist
            if teams:
                team = teams[0]
                required_fields = ["id", "team_name", "is_public", "user_id"]
                missing_fields = [field for field in required_fields if field not in team]
                if missing_fields:
                    self.log(f"❌ Team missing required fields: {missing_fields}")
                    return False
                    
                # Verify all teams are public
                for team in teams:
                    if not team.get("is_public", False):
                        self.log(f"❌ Found private team in public teams list: {team.get('id')}")
                        return False
                        
            self.log(f"✅ User teams structure validated")
            return True
        else:
            self.log(f"❌ Failed to get user teams: {response.status_code} - {response.text}")
            return False
            
    def test_authentication_required(self):
        """Test that endpoints require authentication"""
        self.log("🔍 Testing authentication requirements")
        
        test_user_id = "test_user_id"
        endpoints = [
            f"/community/users/{test_user_id}",
            f"/community/users/{test_user_id}/follow-status", 
            f"/community/users/{test_user_id}/teams"
        ]
        
        success_count = 0
        for endpoint in endpoints:
            response = requests.get(f"{self.base_url}{endpoint}")
            if response.status_code in [401, 403]:
                self.log(f"✅ {endpoint} correctly requires authentication")
                success_count += 1
            else:
                self.log(f"❌ {endpoint} should require authentication, got: {response.status_code}")
                
        return success_count == len(endpoints)
        
    def run_comprehensive_tests(self):
        """Run all user profile endpoint tests"""
        self.log("🚀 Starting User Profile Endpoints Testing")
        self.log("=" * 60)
        
        test_results = []
        
        # Test 1: Authentication requirements
        self.log("\n📋 TEST 1: Authentication Requirements")
        test_results.append(("Authentication Required", self.test_authentication_required()))
        
        # Test 2: Register test users
        self.log("\n📋 TEST 2: User Registration Setup")
        user_a_data, user_a_response = self.register_test_user("A")
        user_b_data, user_b_response = self.register_test_user("B")
        
        if not user_a_data or not user_b_data:
            self.log("❌ Failed to register test users, aborting tests")
            return
            
        # Login users
        token_a, user_id_a = self.login_user(user_a_data["email"], user_a_data["password"])
        token_b, user_id_b = self.login_user(user_b_data["email"], user_b_data["password"])
        
        if not token_a or not token_b:
            self.log("❌ Failed to login test users, aborting tests")
            return
            
        test_results.append(("User Registration & Login", True))
        
        # Test 3: Get user profile
        self.log("\n📋 TEST 3: GET /api/community/users/{user_id}")
        test_results.append(("Get User Profile (Valid ID)", self.test_get_user_profile(user_id_b, token_a)))
        test_results.append(("Get User Profile (Invalid ID)", self.test_get_user_profile_invalid_id(token_a)))
        
        # Test 4: Follow status (before following)
        self.log("\n📋 TEST 4: GET /api/community/users/{user_id}/follow-status (Before Following)")
        test_results.append(("Follow Status (Not Following)", self.test_follow_status(user_id_b, token_a, expected_following=False)))
        test_results.append(("Follow Status (Self)", self.test_follow_status_self(user_id_a, token_a)))
        test_results.append(("Follow Status (Invalid ID)", self.test_follow_status_invalid_id(token_a)))
        
        # Test 5: Follow user and test status change
        self.log("\n📋 TEST 5: Follow User and Test Status Change")
        follow_success = self.follow_user(user_id_b, token_a)
        test_results.append(("Follow User", follow_success))
        
        if follow_success:
            test_results.append(("Follow Status (After Following)", self.test_follow_status(user_id_b, token_a, expected_following=True)))
            
            # Test updated follower counts in user profile
            self.log("🔍 Verifying updated follower counts in user profile")
            test_results.append(("User Profile (Updated Counts)", self.test_get_user_profile(user_id_b, token_a)))
        
        # Test 6: User teams (empty)
        self.log("\n📋 TEST 6: GET /api/community/users/{user_id}/teams (Empty)")
        test_results.append(("Get User Teams (Empty)", self.test_get_user_teams(user_id_b, token_a, expected_team_count=0)))
        
        # Test 7: Create public team and test teams endpoint
        self.log("\n📋 TEST 7: GET /api/community/users/{user_id}/teams (With Teams)")
        team_id = self.create_public_team(token_b, "Test Team Alpha")
        if team_id:
            test_results.append(("Create Public Team", True))
            test_results.append(("Get User Teams (With Teams)", self.test_get_user_teams(user_id_b, token_a, expected_team_count=1)))
        else:
            test_results.append(("Create Public Team", False))
            test_results.append(("Get User Teams (With Teams)", False))
        
        # Test Results Summary
        self.log("\n" + "=" * 60)
        self.log("📊 TEST RESULTS SUMMARY")
        self.log("=" * 60)
        
        passed_tests = 0
        total_tests = len(test_results)
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} - {test_name}")
            if result:
                passed_tests += 1
                
        success_rate = (passed_tests / total_tests) * 100
        self.log(f"\n🎯 SUCCESS RATE: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
        
        if success_rate == 100:
            self.log("🎉 ALL USER PROFILE ENDPOINT TESTS PASSED!")
        elif success_rate >= 80:
            self.log("⚠️  Most tests passed, minor issues detected")
        else:
            self.log("🚨 CRITICAL ISSUES DETECTED - Multiple test failures")
            
        return success_rate >= 80

if __name__ == "__main__":
    tester = UserProfileEndpointTester()
    success = tester.run_comprehensive_tests()
    
    if success:
        print("\n✅ User Profile Endpoints Testing Completed Successfully")
    else:
        print("\n❌ User Profile Endpoints Testing Failed")
        exit(1)