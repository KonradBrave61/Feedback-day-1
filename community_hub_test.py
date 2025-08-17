#!/usr/bin/env python3
"""
Community Hub Backend API Testing Suite
Tests all Community Hub endpoints as requested in review
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration - Use the correct backend URL from frontend/.env
BACKEND_URL = "https://item-compare-fix.preview.emergentagent.com/api"

class CommunityHubAPITester:
    def __init__(self):
        self.user1_token = None
        self.user1_id = None
        self.user2_token = None
        self.user2_id = None
        self.test_team_id = None
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
    
    def register_and_login_user(self, username_suffix):
        """Register and login a test user"""
        register_data = {
            "username": f"community_test_{username_suffix}_{uuid.uuid4().hex[:8]}",
            "email": f"community_test_{username_suffix}_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPassword123!",
            "favourite_team": "Raimon",
            "profile_picture": "https://example.com/avatar.jpg",
            "bio": f"Community test user {username_suffix}"
        }
        
        try:
            response = requests.post(f"{BACKEND_URL}/auth/register", json=register_data)
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                user_id = data.get("user", {}).get("id")
                self.log_result(f"User {username_suffix} Registration", True, f"Token obtained, User ID: {user_id}")
                return token, user_id
            else:
                self.log_result(f"User {username_suffix} Registration", False, f"Status: {response.status_code}, Response: {response.text}")
                return None, None
        except Exception as e:
            self.log_result(f"User {username_suffix} Registration", False, f"Exception: {str(e)}")
            return None, None
    
    def setup_test_users(self):
        """Setup two test users for community testing"""
        print("\n🔐 SETTING UP TEST USERS")
        
        # Register User 1 (team owner)
        self.user1_token, self.user1_id = self.register_and_login_user("owner")
        if not self.user1_token:
            return False
            
        # Register User 2 (community member)
        self.user2_token, self.user2_id = self.register_and_login_user("member")
        if not self.user2_token:
            return False
            
        return True
    
    def get_headers(self, user_token):
        """Get authorization headers for a specific user"""
        return {"Authorization": f"Bearer {user_token}"}
    
    def create_sample_public_team(self):
        """Create a sample public team owned by user1"""
        print("\n🏆 CREATING SAMPLE PUBLIC TEAM")
        
        if not self.user1_token:
            self.log_result("Create Sample Team", False, "No user1 token available")
            return False
        
        try:
            team_data = {
                "name": f"Community Test Team {uuid.uuid4().hex[:8]}",
                "formation": "4-4-2",
                "players": [
                    {
                        "character_id": "test_char_1",
                        "position_id": "GK",
                        "user_level": 50,
                        "user_rarity": "Epic",
                        "user_equipment": {
                            "boots": {"id": "boots_1", "name": "Speed Boots", "stats": {"agility": 10}},
                            "bracelets": {"id": "bracelet_1", "name": "Power Bracelet", "stats": {"kick": 15}},
                            "pendants": {"id": "pendant_1", "name": "Focus Pendant", "stats": {"technique": 12}}
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_1", "name": "Fire Shot", "type": "Shot", "element": "Fire", "power": 120}
                        ]
                    },
                    {
                        "character_id": "test_char_2",
                        "position_id": "DF",
                        "user_level": 45,
                        "user_rarity": "Rare",
                        "user_equipment": {
                            "boots": {"id": "boots_2", "name": "Defense Boots", "stats": {"pressure": 8}},
                            "bracelets": {"id": "bracelet_2", "name": "Guard Bracelet", "stats": {"physical": 10}},
                            "pendants": {"id": "pendant_2", "name": "Shield Pendant", "stats": {"pressure": 7}}
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_2", "name": "Block", "type": "Defense", "element": "Earth", "power": 90}
                        ]
                    }
                ],
                "bench_players": [
                    {
                        "character_id": "bench_char_1",
                        "slot_id": "bench_1",
                        "user_level": 40,
                        "user_rarity": "Common",
                        "user_equipment": {
                            "boots": {"id": "boots_4", "name": "Basic Boots", "stats": {"agility": 5}},
                            "bracelets": None,
                            "pendants": None
                        },
                        "user_hissatsu": [
                            {"id": "hissatsu_4", "name": "Basic Shot", "type": "Shot", "element": "Wind", "power": 70}
                        ]
                    }
                ],
                "tactics": [
                    {"id": "tactic_1", "name": "Offensive", "description": "Focus on attacking", "effect": "+10% attack"}
                ],
                "coach": {
                    "id": "coach_1",
                    "name": "Test Coach",
                    "title": "Master Tactician",
                    "portrait": "coach_portrait.jpg",
                    "bonuses": {"kick": 5, "control": 3, "technique": 4},
                    "specialties": ["Formation", "Motivation"]
                },
                "description": "A public test team for community testing",
                "is_public": True,
                "tags": ["test", "community", "public"],
                "save_slot": 1,
                "save_slot_name": "Community Test Slot"
            }
            
            response = requests.post(f"{BACKEND_URL}/teams", json=team_data, headers=self.get_headers(self.user1_token))
            if response.status_code == 200:
                created_team = response.json()
                self.test_team_id = created_team.get("id")
                self.log_result("Create Sample Public Team", True, f"Team created with ID: {self.test_team_id}")
                return True
            else:
                self.log_result("Create Sample Public Team", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Create Sample Public Team", False, f"Exception: {str(e)}")
            return False
    
    def test_community_stats_endpoint(self):
        """Test GET /api/community/stats endpoint"""
        print("\n📊 TESTING COMMUNITY STATS ENDPOINT")
        
        try:
            response = requests.get(f"{BACKEND_URL}/community/stats", headers=self.get_headers(self.user2_token))
            if response.status_code == 200:
                stats = response.json()
                
                # Check required keys
                required_keys = ["total_users", "total_teams", "total_public_teams", "total_likes", "total_views"]
                missing_keys = [key for key in required_keys if key not in stats]
                
                if not missing_keys:
                    self.log_result("GET /api/community/stats - Required Keys", True, 
                                  f"All required keys present: {list(stats.keys())}")
                    
                    # Verify data types and values
                    valid_data = all(isinstance(stats[key], int) and stats[key] >= 0 for key in required_keys)
                    self.log_result("GET /api/community/stats - Data Validation", valid_data,
                                  f"Stats: {stats}")
                else:
                    self.log_result("GET /api/community/stats - Required Keys", False,
                                  f"Missing keys: {missing_keys}, Got: {list(stats.keys())}")
            else:
                self.log_result("GET /api/community/stats", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Community Stats Test", False, f"Exception: {str(e)}")
    
    def test_community_teams_endpoint(self):
        """Test GET /api/community/teams?sort_by=created_at endpoint"""
        print("\n🏟️ TESTING COMMUNITY TEAMS ENDPOINT")
        
        try:
            response = requests.get(f"{BACKEND_URL}/community/teams?sort_by=created_at", headers=self.get_headers(self.user2_token))
            if response.status_code == 200:
                teams = response.json()
                
                if isinstance(teams, list):
                    self.log_result("GET /api/community/teams?sort_by=created_at", True,
                                  f"Retrieved {len(teams)} public teams")
                    
                    # Verify our test team is in the list
                    if self.test_team_id:
                        test_team_found = any(team.get("id") == self.test_team_id for team in teams)
                        self.log_result("Test Team in Community Teams", test_team_found,
                                      f"Test team {'found' if test_team_found else 'not found'} in community teams")
                    
                    # Verify all teams are public
                    if teams:
                        all_public = all(team.get("is_public", False) for team in teams)
                        self.log_result("All Teams Are Public", all_public,
                                      f"Public teams check: {all_public}")
                else:
                    self.log_result("GET /api/community/teams", False, f"Expected list, got: {type(teams)}")
            else:
                self.log_result("GET /api/community/teams", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Community Teams Test", False, f"Exception: {str(e)}")
    
    def test_team_like_endpoint(self):
        """Test POST /api/teams/{team_id}/like endpoint"""
        print("\n❤️ TESTING TEAM LIKE ENDPOINT")
        
        if not self.test_team_id:
            self.log_result("Team Like Test", False, "No test team ID available")
            return
        
        try:
            # First like - should return liked: true
            response = requests.post(f"{BACKEND_URL}/teams/{self.test_team_id}/like", headers=self.get_headers(self.user2_token))
            if response.status_code == 200:
                like_result = response.json()
                liked_status = like_result.get("liked")
                
                self.log_result("POST /api/teams/{team_id}/like - First Like", liked_status == True,
                              f"Like result: {like_result}")
                
                # Verify like count increased by checking team details
                team_response = requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/details", headers=self.get_headers(self.user2_token))
                if team_response.status_code == 200:
                    team_data = team_response.json()
                    team = team_data.get("team", {})
                    likes_count = team.get("likes", 0)
                    
                    self.log_result("Team Likes Count After Like", likes_count > 0,
                                  f"Team likes count: {likes_count}")
                
                # Second like (unlike) - should return liked: false
                response = requests.post(f"{BACKEND_URL}/teams/{self.test_team_id}/like", headers=self.get_headers(self.user2_token))
                if response.status_code == 200:
                    unlike_result = response.json()
                    unliked_status = unlike_result.get("liked")
                    
                    self.log_result("POST /api/teams/{team_id}/like - Unlike", unliked_status == False,
                                  f"Unlike result: {unlike_result}")
                else:
                    self.log_result("Team Unlike", False, f"Status: {response.status_code}")
            else:
                self.log_result("POST /api/teams/{team_id}/like", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Team Like Test", False, f"Exception: {str(e)}")
    
    def test_team_view_endpoint(self):
        """Test GET /api/teams/{team_id}/view endpoint"""
        print("\n👁️ TESTING TEAM VIEW ENDPOINT")
        
        if not self.test_team_id:
            self.log_result("Team View Test", False, "No test team ID available")
            return
        
        try:
            # Get initial view count
            initial_response = requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/details", headers=self.get_headers(self.user2_token))
            initial_views = 0
            if initial_response.status_code == 200:
                initial_data = initial_response.json()
                initial_team = initial_data.get("team", {})
                initial_views = initial_team.get("views", 0)
            
            # Call view endpoint
            response = requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/view", headers=self.get_headers(self.user2_token))
            if response.status_code == 200:
                team_data = response.json()
                
                # Verify it returns a Team object
                has_team_fields = all(field in team_data for field in ["id", "name", "formation", "players"])
                self.log_result("GET /api/teams/{team_id}/view - Returns Team Object", has_team_fields,
                              f"Team object fields present: {has_team_fields}")
                
                # Verify view count incremented
                new_views = team_data.get("views", 0)
                view_incremented = new_views > initial_views
                self.log_result("Team View Count Incremented", view_incremented,
                              f"Views: {initial_views} -> {new_views}")
            else:
                self.log_result("GET /api/teams/{team_id}/view", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Team View Test", False, f"Exception: {str(e)}")
    
    def test_team_comment_endpoint(self):
        """Test POST /api/teams/{team_id}/comment endpoint"""
        print("\n💬 TESTING TEAM COMMENT ENDPOINT")
        
        if not self.test_team_id:
            self.log_result("Team Comment Test", False, "No test team ID available")
            return
        
        try:
            comment_data = {
                "content": f"Great team! This is a test comment from user2 at {datetime.utcnow().isoformat()}"
            }
            
            # Post comment
            response = requests.post(f"{BACKEND_URL}/teams/{self.test_team_id}/comment", 
                                   json=comment_data, headers=self.get_headers(self.user2_token))
            if response.status_code == 200:
                comment_result = response.json()
                
                self.log_result("POST /api/teams/{team_id}/comment", True,
                              f"Comment posted: {comment_result.get('message')}")
                
                # Verify comment appears in team details
                details_response = requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/details", headers=self.get_headers(self.user2_token))
                if details_response.status_code == 200:
                    details_data = details_response.json()
                    team = details_data.get("team", {})
                    comments = team.get("comments", [])
                    
                    # Find our comment
                    our_comment = next((c for c in comments if c.get("content") == comment_data["content"]), None)
                    comment_found = our_comment is not None
                    
                    self.log_result("Comment in GET /api/teams/{team_id}/details", comment_found,
                                  f"Comment found in team details: {comment_found}")
                    
                    if our_comment:
                        # Verify comment structure
                        has_required_fields = all(field in our_comment for field in ["user_id", "username", "content"])
                        self.log_result("Comment Structure Validation", has_required_fields,
                                      f"Comment fields: {list(our_comment.keys())}")
                else:
                    self.log_result("Verify Comment in Details", False, f"Failed to get team details: {details_response.status_code}")
            else:
                self.log_result("POST /api/teams/{team_id}/comment", False, f"Status: {response.status_code}, Response: {response.text}")
                
        except Exception as e:
            self.log_result("Team Comment Test", False, f"Exception: {str(e)}")
    
    def test_incremental_changes(self):
        """Test incremental changes for likes and views"""
        print("\n📈 TESTING INCREMENTAL CHANGES")
        
        if not self.test_team_id:
            self.log_result("Incremental Changes Test", False, "No test team ID available")
            return
        
        try:
            # Get initial counts
            initial_response = requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/details", headers=self.get_headers(self.user2_token))
            if initial_response.status_code != 200:
                self.log_result("Get Initial Counts", False, "Failed to get initial team details")
                return
            
            initial_data = initial_response.json()
            initial_team = initial_data.get("team", {})
            initial_likes = initial_team.get("likes", 0)
            initial_views = initial_team.get("views", 0)
            
            # Perform multiple likes (like -> unlike -> like)
            requests.post(f"{BACKEND_URL}/teams/{self.test_team_id}/like", headers=self.get_headers(self.user2_token))
            requests.post(f"{BACKEND_URL}/teams/{self.test_team_id}/like", headers=self.get_headers(self.user2_token))
            requests.post(f"{BACKEND_URL}/teams/{self.test_team_id}/like", headers=self.get_headers(self.user2_token))
            
            # Perform multiple views
            requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/view", headers=self.get_headers(self.user2_token))
            requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/view", headers=self.get_headers(self.user2_token))
            
            # Get final counts
            final_response = requests.get(f"{BACKEND_URL}/teams/{self.test_team_id}/details", headers=self.get_headers(self.user2_token))
            if final_response.status_code == 200:
                final_data = final_response.json()
                final_team = final_data.get("team", {})
                final_likes = final_team.get("likes", 0)
                final_views = final_team.get("views", 0)
                
                # Verify incremental changes
                likes_changed = final_likes != initial_likes
                views_increased = final_views > initial_views
                
                self.log_result("Likes Count Changes", likes_changed,
                              f"Likes: {initial_likes} -> {final_likes}")
                self.log_result("Views Count Increases", views_increased,
                              f"Views: {initial_views} -> {final_views}")
            else:
                self.log_result("Get Final Counts", False, "Failed to get final team details")
                
        except Exception as e:
            self.log_result("Incremental Changes Test", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all Community Hub API tests"""
        print("🚀 STARTING COMMUNITY HUB BACKEND API TESTING")
        print("=" * 60)
        
        # Setup test users
        if not self.setup_test_users():
            print("❌ Failed to setup test users. Aborting tests.")
            return
        
        # Create sample public team
        if not self.create_sample_public_team():
            print("❌ Failed to create sample team. Some tests may fail.")
        
        # Run all endpoint tests
        self.test_community_stats_endpoint()
        self.test_community_teams_endpoint()
        self.test_team_like_endpoint()
        self.test_team_view_endpoint()
        self.test_team_comment_endpoint()
        self.test_incremental_changes()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 COMMUNITY HUB TEST RESULTS SUMMARY")
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
        
        print("\n✅ COMMUNITY HUB TESTING COMPLETED")
        return passed, failed, total

if __name__ == "__main__":
    tester = CommunityHubAPITester()
    tester.run_all_tests()