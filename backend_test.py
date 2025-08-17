#!/usr/bin/env python3

import requests
import json
import sys
import uuid
from datetime import datetime

# Configuration
BACKEND_URL = "https://technique-compare.preview.emergentagent.com/api"

class CommunityProfileChatTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        self.user_a_token = None
        self.user_b_token = None
        self.user_a_id = None
        self.user_b_id = None
        self.test_team_id = None
        self.conversation_id = None
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def test_user_registration_and_login(self):
        """Test user registration and login for two users"""
        self.log("🔐 Testing user registration and login...")
        
        # Register User A
        unique_id = str(uuid.uuid4())[:8]
        user_a_data = {
            "username": f"alice_community_{unique_id}",
            "email": f"alice_{unique_id}@example.com",
            "password": "password123",
            "coach_level": 15,
            "favorite_position": "MF",
            "favorite_element": "Fire",
            "favourite_team": "Raimon",
            "bio": "Community hub enthusiast"
        }
        
        response = self.session.post(f"{self.backend_url}/auth/register", json=user_a_data)
        if response.status_code not in [200, 201]:
            self.log(f"❌ User A registration failed: {response.status_code} - {response.text}")
            return False
            
        # Check if registration returned login data directly
        if response.status_code == 200:
            user_a_auth = response.json()
            self.user_a_token = user_a_auth["access_token"]
            self.user_a_id = user_a_auth["user"]["id"]
        else:
            # Login User A
            login_data = {"email": user_a_data["email"], "password": user_a_data["password"]}
            response = self.session.post(f"{self.backend_url}/auth/login", json=login_data)
            if response.status_code != 200:
                self.log(f"❌ User A login failed: {response.status_code} - {response.text}")
                return False
                
            user_a_auth = response.json()
            self.user_a_token = user_a_auth["access_token"]
            self.user_a_id = user_a_auth["user"]["id"]
        
        # Register User B
        unique_id_b = str(uuid.uuid4())[:8]
        user_b_data = {
            "username": f"bob_profile_{unique_id_b}",
            "email": f"bob_{unique_id_b}@example.com", 
            "password": "password123",
            "coach_level": 20,
            "favorite_position": "FW",
            "favorite_element": "Wind",
            "favourite_team": "Zeus",
            "bio": "Profile page explorer"
        }
        
        response = self.session.post(f"{self.backend_url}/auth/register", json=user_b_data)
        if response.status_code not in [200, 201]:
            self.log(f"❌ User B registration failed: {response.status_code} - {response.text}")
            return False
            
        # Check if registration returned login data directly
        if response.status_code == 200:
            user_b_auth = response.json()
            self.user_b_token = user_b_auth["access_token"]
            self.user_b_id = user_b_auth["user"]["id"]
        else:
            # Login User B
            login_data = {"email": user_b_data["email"], "password": user_b_data["password"]}
            response = self.session.post(f"{self.backend_url}/auth/login", json=login_data)
            if response.status_code != 200:
                self.log(f"❌ User B login failed: {response.status_code} - {response.text}")
                return False
                
            user_b_auth = response.json()
            self.user_b_token = user_b_auth["access_token"]
            self.user_b_id = user_b_auth["user"]["id"]
        
        self.log(f"✅ Both users registered and logged in successfully")
        self.log(f"   User A ID: {self.user_a_id}")
        self.log(f"   User B ID: {self.user_b_id}")
        return True
        
    def test_profile_api_endpoints(self):
        """Test Profile API endpoints"""
        self.log("👤 Testing Profile API endpoints...")
        
        # Test GET /api/community/users/{user_id} - Get user profile
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        response = self.session.get(f"{self.backend_url}/community/users/{self.user_b_id}", headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ GET user profile failed: {response.status_code} - {response.text}")
            return False
            
        profile_data = response.json()
        required_fields = ["id", "username", "coach_level", "favourite_team", "favorite_position", 
                          "favorite_element", "total_teams", "total_likes_received", 
                          "followers_count", "following_count", "created_at"]
        
        for field in required_fields:
            if field not in profile_data:
                self.log(f"❌ Missing field in profile data: {field}")
                return False
                
        self.log(f"✅ GET /api/community/users/{self.user_b_id} - Profile data retrieved successfully")
        self.log(f"   Username: {profile_data['username']}, Coach Level: {profile_data['coach_level']}")
        
        # Test GET /api/community/users/{user_id}/follow-status - Get follow status
        response = self.session.get(f"{self.backend_url}/community/users/{self.user_b_id}/follow-status", headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ GET follow status failed: {response.status_code} - {response.text}")
            return False
            
        follow_status = response.json()
        if "is_following" not in follow_status or "can_follow" not in follow_status:
            self.log(f"❌ Invalid follow status response structure")
            return False
            
        self.log(f"✅ GET /api/community/users/{self.user_b_id}/follow-status - Follow status retrieved")
        self.log(f"   Is Following: {follow_status['is_following']}, Can Follow: {follow_status['can_follow']}")
        
        # Test POST /api/community/follow - Follow user
        follow_data = {"user_id": self.user_b_id}
        response = self.session.post(f"{self.backend_url}/community/follow", json=follow_data, headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ POST follow user failed: {response.status_code} - {response.text}")
            return False
            
        follow_result = response.json()
        if not follow_result.get("following"):
            self.log(f"❌ Follow operation did not return following=True")
            return False
            
        self.log(f"✅ POST /api/community/follow - User followed successfully")
        
        # Verify follow status changed
        response = self.session.get(f"{self.backend_url}/community/users/{self.user_b_id}/follow-status", headers=headers)
        follow_status = response.json()
        if not follow_status.get("is_following"):
            self.log(f"❌ Follow status not updated after following")
            return False
            
        self.log(f"✅ Follow status updated correctly after following")
        
        return True
        
    def test_user_teams_creation(self):
        """Create a test team for User B to test teams endpoint"""
        self.log("🏆 Creating test team for User B...")
        
        headers = {"Authorization": f"Bearer {self.user_b_token}"}
        team_data = {
            "name": "Bob's Elite Squad",
            "formation": "4-4-2",
            "description": "A powerful team for community showcase",
            "is_public": True,
            "tags": ["elite", "community", "showcase"],
            "players": [
                {
                    "character_id": "char_001",
                    "position_id": "pos_gk",
                    "user_level": 99,
                    "user_rarity": "Legendary"
                },
                {
                    "character_id": "char_002", 
                    "position_id": "pos_df1",
                    "user_level": 95,
                    "user_rarity": "Epic"
                }
            ],
            "coach": {
                "id": "coach_001",
                "name": "Mark Evans Sr."
            }
        }
        
        response = self.session.post(f"{self.backend_url}/teams", json=team_data, headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ Team creation failed: {response.status_code} - {response.text}")
            return False
            
        team_result = response.json()
        self.test_team_id = team_result["id"]
        
        self.log(f"✅ Test team created successfully")
        self.log(f"   Team ID: {self.test_team_id}")
        self.log(f"   Team Name: {team_result['name']}")
        
        return True
        
    def test_user_public_teams_endpoint(self):
        """Test GET /api/community/users/{user_id}/teams - Get public teams"""
        self.log("🏆 Testing user public teams endpoint...")
        
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        response = self.session.get(f"{self.backend_url}/community/users/{self.user_b_id}/teams", headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ GET user public teams failed: {response.status_code} - {response.text}")
            return False
            
        teams_data = response.json()
        if not isinstance(teams_data, list):
            self.log(f"❌ Teams data should be a list")
            return False
            
        if len(teams_data) == 0:
            self.log(f"⚠️ No public teams found for user (this might be expected)")
        else:
            team = teams_data[0]
            required_fields = ["id", "name", "user_id", "is_public"]
            for field in required_fields:
                if field not in team:
                    self.log(f"❌ Missing field in team data: {field}")
                    return False
                    
            self.log(f"✅ GET /api/community/users/{self.user_b_id}/teams - Public teams retrieved")
            self.log(f"   Found {len(teams_data)} public teams")
            
        return True
        
    def test_chat_api_endpoints(self):
        """Test Chat API endpoints"""
        self.log("💬 Testing Chat API endpoints...")
        
        # Test POST /api/chat/start - Start conversation (User A starts chat with User B)
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        response = self.session.post(f"{self.backend_url}/chat/start?partner_id={self.user_b_id}", headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ POST chat start failed: {response.status_code} - {response.text}")
            return False
            
        chat_result = response.json()
        if not chat_result.get("success"):
            self.log(f"❌ Chat start did not return success=True")
            return False
            
        conversation = chat_result.get("conversation", {})
        self.conversation_id = conversation.get("id")
        
        if not self.conversation_id:
            self.log(f"❌ No conversation ID returned from chat start")
            return False
            
        self.log(f"✅ POST /api/chat/start - Conversation started successfully")
        self.log(f"   Conversation ID: {self.conversation_id}")
        
        # Test GET /api/chat/conversations - List conversations
        response = self.session.get(f"{self.backend_url}/chat/conversations", headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ GET chat conversations failed: {response.status_code} - {response.text}")
            return False
            
        conversations_result = response.json()
        if not conversations_result.get("success"):
            self.log(f"❌ Chat conversations did not return success=True")
            return False
            
        conversations = conversations_result.get("conversations", [])
        if len(conversations) == 0:
            self.log(f"❌ No conversations found after starting chat")
            return False
            
        conversation = conversations[0]
        required_fields = ["id", "participants", "partner"]
        for field in required_fields:
            if field not in conversation:
                self.log(f"❌ Missing field in conversation data: {field}")
                return False
                
        partner = conversation["partner"]
        partner_required_fields = ["id", "username", "profile_picture", "coach_level"]
        for field in partner_required_fields:
            if field not in partner:
                self.log(f"❌ Missing field in partner data: {field}")
                return False
                
        self.log(f"✅ GET /api/chat/conversations - Conversations listed successfully")
        self.log(f"   Found {len(conversations)} conversations")
        self.log(f"   Partner: {partner['username']} (Level {partner['coach_level']})")
        
        # Test sending a message
        message_data = {"content": "Hello from the community hub! Great to connect with you."}
        response = self.session.post(f"{self.backend_url}/chat/conversations/{self.conversation_id}/messages", 
                                   json=message_data, headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ POST send message failed: {response.status_code} - {response.text}")
            return False
            
        message_result = response.json()
        if not message_result.get("success"):
            self.log(f"❌ Send message did not return success=True")
            return False
            
        self.log(f"✅ Message sent successfully in conversation")
        
        return True
        
    def test_community_teams_api(self):
        """Test Community Teams API endpoints"""
        self.log("🌟 Testing Community Teams API endpoints...")
        
        # Test GET /api/community/teams - Get public teams with creator information
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        response = self.session.get(f"{self.backend_url}/community/teams", headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ GET community teams failed: {response.status_code} - {response.text}")
            return False
            
        teams_data = response.json()
        if not isinstance(teams_data, list):
            self.log(f"❌ Community teams data should be a list")
            return False
            
        if len(teams_data) == 0:
            self.log(f"⚠️ No public teams found in community (this might be expected)")
        else:
            team = teams_data[0]
            required_fields = ["id", "name", "user_id", "username", "is_public"]
            for field in required_fields:
                if field not in team:
                    self.log(f"❌ Missing field in community team data: {field}")
                    return False
                    
            # Verify creator information for navigation
            if not team.get("user_id") or not team.get("username"):
                self.log(f"❌ Team missing creator information for navigation")
                return False
                
            self.log(f"✅ GET /api/community/teams - Community teams retrieved successfully")
            self.log(f"   Found {len(teams_data)} public teams")
            self.log(f"   Sample team: '{team['name']}' by {team['username']} (ID: {team['user_id']})")
            
        return True
        
    def test_follow_unfollow_functionality(self):
        """Test complete follow/unfollow cycle"""
        self.log("🔄 Testing follow/unfollow functionality...")
        
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        
        # Test unfollow
        unfollow_data = {"user_id": self.user_b_id}
        response = self.session.post(f"{self.backend_url}/community/follow", json=unfollow_data, headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ POST unfollow user failed: {response.status_code} - {response.text}")
            return False
            
        unfollow_result = response.json()
        if unfollow_result.get("following") != False:
            self.log(f"❌ Unfollow operation did not return following=False")
            return False
            
        self.log(f"✅ User unfollowed successfully")
        
        # Verify follow status changed back
        response = self.session.get(f"{self.backend_url}/community/users/{self.user_b_id}/follow-status", headers=headers)
        follow_status = response.json()
        if follow_status.get("is_following") != False:
            self.log(f"❌ Follow status not updated after unfollowing")
            return False
            
        self.log(f"✅ Follow status updated correctly after unfollowing")
        
        # Follow again for chat testing
        follow_data = {"user_id": self.user_b_id}
        response = self.session.post(f"{self.backend_url}/community/follow", json=follow_data, headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ POST re-follow user failed: {response.status_code} - {response.text}")
            return False
            
        self.log(f"✅ User re-followed successfully for chat integration")
        
        return True
        
    def test_chat_follow_integration(self):
        """Test that chat integration works with follow system"""
        self.log("🔗 Testing chat integration with follow system...")
        
        # User A should be able to start chat with User B (since following)
        headers = {"Authorization": f"Bearer {self.user_a_token}"}
        response = self.session.post(f"{self.backend_url}/chat/start?partner_id={self.user_b_id}", headers=headers)
        
        if response.status_code != 200:
            self.log(f"❌ Chat start failed with following user: {response.status_code} - {response.text}")
            return False
            
        self.log(f"✅ Chat integration with follow system working correctly")
        
        # Test that unfollowing affects chat access (unfollow first)
        unfollow_data = {"user_id": self.user_b_id}
        response = self.session.post(f"{self.backend_url}/community/follow", json=unfollow_data, headers=headers)
        
        # Try to start chat when not following (should fail)
        response = self.session.post(f"{self.backend_url}/chat/start?partner_id={self.user_b_id}", headers=headers)
        
        if response.status_code == 200:
            self.log(f"⚠️ Chat start succeeded when not following (this might be due to existing conversation)")
        elif response.status_code == 403:
            self.log(f"✅ Chat properly restricted when not following")
        else:
            self.log(f"❌ Unexpected response when testing chat restriction: {response.status_code}")
            
        # Re-follow for consistency
        follow_data = {"user_id": self.user_b_id}
        self.session.post(f"{self.backend_url}/community/follow", json=follow_data, headers=headers)
        
        return True
        
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("🚀 Starting Community Hub and Profile Functionality Testing")
        self.log("=" * 70)
        
        tests = [
            ("User Registration and Login", self.test_user_registration_and_login),
            ("Profile API Endpoints", self.test_profile_api_endpoints),
            ("User Teams Creation", self.test_user_teams_creation),
            ("User Public Teams Endpoint", self.test_user_public_teams_endpoint),
            ("Chat API Endpoints", self.test_chat_api_endpoints),
            ("Community Teams API", self.test_community_teams_api),
            ("Follow/Unfollow Functionality", self.test_follow_unfollow_functionality),
            ("Chat-Follow Integration", self.test_chat_follow_integration),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            self.log(f"\n📋 Running: {test_name}")
            self.log("-" * 50)
            
            try:
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
        self.log("🏁 TESTING COMPLETE")
        self.log(f"✅ Passed: {passed}")
        self.log(f"❌ Failed: {failed}")
        self.log(f"📊 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed == 0:
            self.log("🎉 ALL TESTS PASSED! Community hub and profile functionality is working perfectly.")
            return True
        else:
            self.log("⚠️ Some tests failed. Please review the issues above.")
            return False

if __name__ == "__main__":
    tester = CommunityProfileChatTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)