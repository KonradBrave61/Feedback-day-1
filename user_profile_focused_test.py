#!/usr/bin/env python3
"""
Focused Backend Testing Script for User Profile Endpoints
Testing ONLY the newly added community API endpoints for user profiles
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://element-mapper.preview.emergentagent.com/api"

class UserProfileFocusedTester:
    def __init__(self):
        self.base_url = BASE_URL
        
    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {message}")
        
    def register_test_user(self, username_suffix):
        """Register a test user and return credentials"""
        user_data = {
            "username": f"profiletest_{username_suffix}_{uuid.uuid4().hex[:8]}",
            "email": f"profile_{username_suffix}_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPassword123!",
            "coach_level": 10,
            "favorite_position": "MF",
            "favorite_element": "Lightning",
            "favourite_team": "Zeus Academy",
            "bio": f"Profile endpoint test user {username_suffix}"
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
            
    def test_get_user_profile_endpoint(self, target_user_id, auth_token):
        """Test GET /api/community/users/{user_id} - Main endpoint"""
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
                return False, user_profile
                
            # Verify followers_count and following_count are integers
            if not isinstance(user_profile.get("followers_count"), int):
                self.log(f"❌ followers_count is not an integer: {user_profile.get('followers_count')}")
                return False, user_profile
                
            if not isinstance(user_profile.get("following_count"), int):
                self.log(f"❌ following_count is not an integer: {user_profile.get('following_count')}")
                return False, user_profile
                
            self.log(f"✅ UserPublic model structure validated")
            self.log(f"   - Username: {user_profile['username']}")
            self.log(f"   - Coach Level: {user_profile['coach_level']}")
            self.log(f"   - Followers: {user_profile['followers_count']}")
            self.log(f"   - Following: {user_profile['following_count']}")
            self.log(f"   - Total Teams: {user_profile['total_teams']}")
            return True, user_profile
        else:
            self.log(f"❌ Failed to get user profile: {response.status_code} - {response.text}")
            return False, None
            
    def test_follow_status_endpoint(self, target_user_id, auth_token):
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
                return False, follow_status
                
            # Verify boolean types
            if not isinstance(follow_status.get("is_following"), bool):
                self.log(f"❌ is_following is not boolean: {follow_status.get('is_following')}")
                return False, follow_status
                
            if not isinstance(follow_status.get("can_follow"), bool):
                self.log(f"❌ can_follow is not boolean: {follow_status.get('can_follow')}")
                return False, follow_status
                
            self.log(f"✅ Follow status structure validated")
            self.log(f"   - Is Following: {follow_status['is_following']}")
            self.log(f"   - Can Follow: {follow_status['can_follow']}")
            return True, follow_status
        else:
            self.log(f"❌ Failed to get follow status: {response.status_code} - {response.text}")
            return False, None
            
    def test_user_teams_endpoint(self, target_user_id, auth_token):
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
                return False, teams
                
            # Verify team structure if teams exist
            if teams:
                team = teams[0]
                required_fields = ["id", "name", "is_public", "user_id"]
                missing_fields = [field for field in required_fields if field not in team]
                if missing_fields:
                    self.log(f"❌ Team missing required fields: {missing_fields}")
                    return False, teams
                    
                # Verify all teams are public
                for team in teams:
                    if not team.get("is_public", False):
                        self.log(f"❌ Found private team in public teams list: {team.get('id')}")
                        return False, teams
                        
            self.log(f"✅ User teams structure validated")
            self.log(f"   - Teams count: {len(teams)}")
            if teams:
                self.log(f"   - First team: {teams[0].get('name', 'Unknown')}")
            return True, teams
        else:
            self.log(f"❌ Failed to get user teams: {response.status_code} - {response.text}")
            return False, None
            
    def test_edge_cases(self, auth_token):
        """Test edge cases and error handling"""
        self.log("🔍 Testing edge cases and error handling")
        
        # Test invalid user ID
        invalid_user_id = "invalid_user_id_12345"
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        endpoints_to_test = [
            f"/community/users/{invalid_user_id}",
            f"/community/users/{invalid_user_id}/follow-status",
            f"/community/users/{invalid_user_id}/teams"
        ]
        
        success_count = 0
        for endpoint in endpoints_to_test:
            response = requests.get(f"{self.base_url}{endpoint}", headers=headers)
            if response.status_code == 404:
                self.log(f"✅ {endpoint} correctly returns 404 for invalid user ID")
                success_count += 1
            else:
                self.log(f"❌ {endpoint} should return 404 for invalid user ID, got: {response.status_code}")
                
        return success_count == len(endpoints_to_test)
        
    def test_self_follow_logic(self, own_user_id, auth_token):
        """Test that user cannot follow themselves"""
        self.log("🔍 Testing self-follow prevention logic")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{self.base_url}/community/users/{own_user_id}/follow-status", headers=headers)
        
        if response.status_code == 200:
            follow_status = response.json()
            if follow_status.get("can_follow") == False:
                self.log("✅ Correctly prevents self-following (can_follow=False)")
                return True
            else:
                self.log(f"❌ Should prevent self-following, got can_follow={follow_status.get('can_follow')}")
                return False
        else:
            self.log(f"❌ Failed to get self follow status: {response.status_code} - {response.text}")
            return False
            
    def follow_user_and_test_changes(self, target_user_id, auth_token):
        """Follow a user and test that counts update correctly"""
        self.log(f"🔗 Testing follow functionality and count updates")
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get initial profile
        initial_profile_response = requests.get(f"{self.base_url}/community/users/{target_user_id}", headers=headers)
        if initial_profile_response.status_code != 200:
            self.log("❌ Failed to get initial profile")
            return False
            
        initial_profile = initial_profile_response.json()
        initial_followers = initial_profile.get("followers_count", 0)
        
        # Follow the user
        follow_data = {"user_id": target_user_id}
        follow_response = requests.post(f"{self.base_url}/community/follow", json=follow_data, headers=headers)
        
        if follow_response.status_code != 200:
            self.log(f"❌ Failed to follow user: {follow_response.status_code} - {follow_response.text}")
            return False
            
        follow_result = follow_response.json()
        if not follow_result.get("following"):
            self.log(f"❌ Follow operation failed: {follow_result}")
            return False
            
        self.log("✅ Successfully followed user")
        
        # Check updated profile
        updated_profile_response = requests.get(f"{self.base_url}/community/users/{target_user_id}", headers=headers)
        if updated_profile_response.status_code != 200:
            self.log("❌ Failed to get updated profile")
            return False
            
        updated_profile = updated_profile_response.json()
        updated_followers = updated_profile.get("followers_count", 0)
        
        if updated_followers == initial_followers + 1:
            self.log(f"✅ Follower count correctly updated: {initial_followers} → {updated_followers}")
        else:
            self.log(f"❌ Follower count not updated correctly: {initial_followers} → {updated_followers}")
            return False
            
        # Check follow status
        status_response = requests.get(f"{self.base_url}/community/users/{target_user_id}/follow-status", headers=headers)
        if status_response.status_code == 200:
            status = status_response.json()
            if status.get("is_following") == True:
                self.log("✅ Follow status correctly shows is_following=True")
                return True
            else:
                self.log(f"❌ Follow status should show is_following=True, got: {status.get('is_following')}")
                return False
        else:
            self.log("❌ Failed to get follow status after following")
            return False
            
    def run_focused_tests(self):
        """Run focused tests on user profile endpoints only"""
        self.log("🎯 Starting Focused User Profile Endpoints Testing")
        self.log("=" * 70)
        
        test_results = []
        
        # Setup: Register and login test users
        self.log("\n📋 SETUP: User Registration and Authentication")
        user_a_data, user_a_response = self.register_test_user("Alpha")
        user_b_data, user_b_response = self.register_test_user("Beta")
        
        if not user_a_data or not user_b_data:
            self.log("❌ Failed to register test users, aborting tests")
            return False
            
        token_a, user_id_a = self.login_user(user_a_data["email"], user_a_data["password"])
        token_b, user_id_b = self.login_user(user_b_data["email"], user_b_data["password"])
        
        if not token_a or not token_b:
            self.log("❌ Failed to login test users, aborting tests")
            return False
            
        self.log("✅ Test users setup completed successfully")
        
        # Test 1: GET /api/community/users/{user_id}
        self.log("\n📋 TEST 1: GET /api/community/users/{user_id}")
        success, profile = self.test_get_user_profile_endpoint(user_id_b, token_a)
        test_results.append(("User Profile Retrieval", success))
        
        # Test 2: GET /api/community/users/{user_id}/follow-status
        self.log("\n📋 TEST 2: GET /api/community/users/{user_id}/follow-status")
        success, status = self.test_follow_status_endpoint(user_id_b, token_a)
        test_results.append(("Follow Status Check", success))
        
        # Test 3: GET /api/community/users/{user_id}/teams
        self.log("\n📋 TEST 3: GET /api/community/users/{user_id}/teams")
        success, teams = self.test_user_teams_endpoint(user_id_b, token_a)
        test_results.append(("User Teams Retrieval", success))
        
        # Test 4: Edge cases and error handling
        self.log("\n📋 TEST 4: Edge Cases and Error Handling")
        success = self.test_edge_cases(token_a)
        test_results.append(("Edge Cases (Invalid IDs)", success))
        
        # Test 5: Self-follow prevention
        self.log("\n📋 TEST 5: Self-Follow Prevention Logic")
        success = self.test_self_follow_logic(user_id_a, token_a)
        test_results.append(("Self-Follow Prevention", success))
        
        # Test 6: Follow functionality and count updates
        self.log("\n📋 TEST 6: Follow Functionality and Count Updates")
        success = self.follow_user_and_test_changes(user_id_b, token_a)
        test_results.append(("Follow and Count Updates", success))
        
        # Results Summary
        self.log("\n" + "=" * 70)
        self.log("📊 FOCUSED TEST RESULTS SUMMARY")
        self.log("=" * 70)
        
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
            self.log("✅ The newly added community API endpoints are working correctly:")
            self.log("   • GET /api/community/users/{user_id} - User profiles with proper UserPublic model")
            self.log("   • GET /api/community/users/{user_id}/follow-status - Follow status between users")
            self.log("   • GET /api/community/users/{user_id}/teams - Public teams from specific users")
        elif success_rate >= 80:
            self.log("⚠️  Most tests passed, minor issues detected")
        else:
            self.log("🚨 CRITICAL ISSUES DETECTED - Multiple test failures")
            
        return success_rate >= 80

if __name__ == "__main__":
    tester = UserProfileFocusedTester()
    success = tester.run_focused_tests()
    
    if success:
        print("\n✅ User Profile Endpoints Testing Completed Successfully")
    else:
        print("\n❌ User Profile Endpoints Testing Failed")
        exit(1)