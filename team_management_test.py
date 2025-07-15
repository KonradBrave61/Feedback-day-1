#!/usr/bin/env python3
import requests
import json
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

print(f"Testing Team Management API at: {API_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class TeamManagementTest:
    def __init__(self):
        self.auth_token = None
        self.user_id = None
        self.team_id = None
        self.user2_id = None
        self.user2_token = None
        
    def setup_users(self):
        """Create test users for testing"""
        print("\n=== Setting up test users ===")
        
        # Create first user
        random_suffix = generate_random_string()
        user1_data = {
            "username": f"coach_{random_suffix}",
            "email": f"coach_{random_suffix}@example.com",
            "password": "Password123!",
            "coach_level": 5,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favourite_team": "Raimon Eleven",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Passionate football coach and strategist"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=user1_data)
        if response.status_code == 200:
            data = response.json()
            self.auth_token = data["access_token"]
            self.user_id = data["user"]["id"]
            print(f"✅ User 1 created: {user1_data['username']} (ID: {self.user_id})")
        else:
            print(f"❌ Failed to create user 1: {response.status_code} - {response.text}")
            return False
            
        # Create second user for testing interactions
        random_suffix2 = generate_random_string()
        user2_data = {
            "username": f"player_{random_suffix2}",
            "email": f"player_{random_suffix2}@example.com",
            "password": "Password123!",
            "coach_level": 3,
            "favorite_position": "GK",
            "favorite_element": "Earth",
            "favourite_team": "Zeus Academy"
        }
        
        response = requests.post(f"{API_URL}/auth/register", json=user2_data)
        if response.status_code == 200:
            data = response.json()
            self.user2_token = data["access_token"]
            self.user2_id = data["user"]["id"]
            print(f"✅ User 2 created: {user2_data['username']} (ID: {self.user2_id})")
        else:
            print(f"❌ Failed to create user 2: {response.status_code} - {response.text}")
            return False
            
        return True
    
    def test_team_creation_with_enhanced_fields(self):
        """Test team creation with public/private status, description, etc."""
        print("\n=== Testing Enhanced Team Creation ===")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        team_data = {
            "name": "Lightning Strikers",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": "A dynamic team focused on fast-paced attacking football with lightning-quick counter-attacks",
            "is_public": True,
            "tags": ["attacking", "fast-paced", "counter-attack", "lightning"]
        }
        
        response = requests.post(f"{API_URL}/teams", json=team_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            self.team_id = data["id"]
            print(f"✅ Team created successfully: {data['name']} (ID: {self.team_id})")
            print(f"   - Description: {data['description']}")
            print(f"   - Public: {data['is_public']}")
            print(f"   - Tags: {data['tags']}")
            print(f"   - Likes: {data['likes']}")
            print(f"   - Views: {data['views']}")
            print(f"   - Rating: {data['rating']}")
            return True
        else:
            print(f"❌ Failed to create team: {response.status_code} - {response.text}")
            return False
    
    def test_team_name_editing(self):
        """Test team name editing capabilities"""
        print("\n=== Testing Team Name Editing ===")
        
        if not self.team_id:
            print("❌ No team ID available for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        update_data = {
            "name": "Thunder Bolts United",
            "description": "Updated team description with new strategy focus"
        }
        
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Team updated successfully: {data['name']}")
            print(f"   - New Description: {data['description']}")
            return True
        else:
            print(f"❌ Failed to update team: {response.status_code} - {response.text}")
            return False
    
    def test_team_privacy_toggle(self):
        """Test changing team from public to private"""
        print("\n=== Testing Team Privacy Toggle ===")
        
        if not self.team_id:
            print("❌ No team ID available for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Change to private
        update_data = {"is_public": False}
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Team privacy changed to private: {data['is_public']}")
        else:
            print(f"❌ Failed to change team to private: {response.status_code} - {response.text}")
            return False
            
        # Change back to public for other tests
        update_data = {"is_public": True}
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Team privacy changed back to public: {data['is_public']}")
            return True
        else:
            print(f"❌ Failed to change team back to public: {response.status_code} - {response.text}")
            return False
    
    def test_save_slots_management(self):
        """Test save slots management (create, overwrite, delete)"""
        print("\n=== Testing Save Slots Management ===")
        
        if not self.team_id:
            print("❌ No team ID available for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get current save slots
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved save slots: {len(data['save_slots'])} slots available")
            for slot in data['save_slots'][:3]:  # Show first 3 slots
                print(f"   - Slot {slot['slot_number']}: {slot['slot_name']} (Occupied: {slot['is_occupied']})")
        else:
            print(f"❌ Failed to get save slots: {response.status_code} - {response.text}")
            return False
        
        # Save team to slot 1
        slot_data = {
            "slot_number": 1,
            "slot_name": "My Lightning Team",
            "overwrite": True
        }
        response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
        if response.status_code == 200:
            print(f"✅ Team saved to slot 1 successfully")
        else:
            print(f"❌ Failed to save team to slot: {response.status_code} - {response.text}")
            return False
        
        # Verify slot is occupied
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        if response.status_code == 200:
            data = response.json()
            slot_1 = next((slot for slot in data['save_slots'] if slot['slot_number'] == 1), None)
            if slot_1 and slot_1['is_occupied']:
                print(f"✅ Slot 1 is now occupied: {slot_1['team_name']}")
            else:
                print(f"❌ Slot 1 should be occupied but isn't")
                return False
        
        # Clear the slot
        response = requests.delete(f"{API_URL}/save-slots/1", headers=headers)
        if response.status_code == 200:
            print(f"✅ Slot 1 cleared successfully")
            return True
        else:
            print(f"❌ Failed to clear slot: {response.status_code} - {response.text}")
            return False
    
    def test_team_rating_system(self):
        """Test team rating system with 6 categories"""
        print("\n=== Testing Team Rating System (6 Categories) ===")
        
        if not self.team_id or not self.user2_token:
            print("❌ Missing team ID or second user for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.user2_token}"}
        
        # Submit rating with all 6 categories
        rating_data = {
            "team_id": self.team_id,
            "tension_usage": 4.5,
            "difficulty": 3.8,
            "fun": 4.7,
            "creativity": 4.2,
            "effectiveness": 4.0,
            "balance": 3.9
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/rate", json=rating_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            rating = data["rating"]
            print(f"✅ Team rated successfully:")
            print(f"   - Tension Usage: {rating['tension_usage']:.2f}")
            print(f"   - Difficulty: {rating['difficulty']:.2f}")
            print(f"   - Fun: {rating['fun']:.2f}")
            print(f"   - Creativity: {rating['creativity']:.2f}")
            print(f"   - Effectiveness: {rating['effectiveness']:.2f}")
            print(f"   - Balance: {rating['balance']:.2f}")
            print(f"   - Total Ratings: {rating['total_ratings']}")
            print(f"   - Average Rating: {rating['average_rating']:.2f}")
            return True
        else:
            print(f"❌ Failed to rate team: {response.status_code} - {response.text}")
            return False
    
    def test_team_commenting_system(self):
        """Test team commenting system"""
        print("\n=== Testing Team Commenting System ===")
        
        if not self.team_id or not self.user2_token:
            print("❌ Missing team ID or second user for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.user2_token}"}
        
        # Add a comment
        comment_data = {
            "content": "Amazing team formation! The lightning-fast counter-attacks are brilliant. Great tactical setup!"
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/comment", json=comment_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            comment = data["comment"]
            print(f"✅ Comment added successfully:")
            print(f"   - User: {comment['username']}")
            print(f"   - Content: {comment['content']}")
            print(f"   - Created: {comment['created_at']}")
            return True
        else:
            print(f"❌ Failed to add comment: {response.status_code} - {response.text}")
            return False
    
    def test_team_like_unlike(self):
        """Test like/unlike teams functionality"""
        print("\n=== Testing Team Like/Unlike System ===")
        
        if not self.team_id or not self.user2_token:
            print("❌ Missing team ID or second user for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.user2_token}"}
        
        # Like the team
        response = requests.post(f"{API_URL}/teams/{self.team_id}/like", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Team liked: {data['message']} (Liked: {data['liked']})")
        else:
            print(f"❌ Failed to like team: {response.status_code} - {response.text}")
            return False
        
        # Unlike the team
        response = requests.post(f"{API_URL}/teams/{self.team_id}/like", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Team unliked: {data['message']} (Liked: {data['liked']})")
            return True
        else:
            print(f"❌ Failed to unlike team: {response.status_code} - {response.text}")
            return False
    
    def test_team_details_view(self):
        """Test view team details functionality"""
        print("\n=== Testing Team Details View ===")
        
        if not self.team_id or not self.user2_token:
            print("❌ Missing team ID or second user for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.user2_token}"}
        
        # View team details (increments view count)
        response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
        if response.status_code == 200:
            data = response.json()
            team = data["team"]
            print(f"✅ Team details retrieved:")
            print(f"   - Name: {team['name']}")
            print(f"   - Views: {team['views']}")
            print(f"   - Likes: {team['likes']}")
            print(f"   - Comments: {len(team['comments'])}")
            print(f"   - Is Liked: {data['is_liked']}")
            print(f"   - Is Following: {data['is_following']}")
            print(f"   - Can Rate: {data['can_rate']}")
            return True
        else:
            print(f"❌ Failed to get team details: {response.status_code} - {response.text}")
            return False
    
    def test_follow_unfollow_system(self):
        """Test follow/unfollow users functionality"""
        print("\n=== Testing Follow/Unfollow System ===")
        
        if not self.user2_id or not self.auth_token:
            print("❌ Missing user IDs for testing")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Follow user 2
        follow_data = {"user_id": self.user2_id}
        response = requests.post(f"{API_URL}/community/follow", json=follow_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User followed: {data['message']} (Following: {data['following']})")
        else:
            print(f"❌ Failed to follow user: {response.status_code} - {response.text}")
            return False
        
        # Get followers list
        response = requests.get(f"{API_URL}/community/followers", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Followers retrieved: {len(data['followers'])} followers")
        
        # Get following list
        response = requests.get(f"{API_URL}/community/following", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Following retrieved: {len(data['following'])} following")
        
        # Unfollow user 2
        response = requests.post(f"{API_URL}/community/follow", json=follow_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User unfollowed: {data['message']} (Following: {data['following']})")
            return True
        else:
            print(f"❌ Failed to unfollow user: {response.status_code} - {response.text}")
            return False
    
    def test_user_profile_updates(self):
        """Test user profile updates with favorite team field"""
        print("\n=== Testing User Profile Updates ===")
        
        if not self.auth_token:
            print("❌ No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Update user profile with favorite team
        update_data = {
            "favourite_team": "Thunder Bolts United",
            "coach_level": 8,
            "bio": "Updated bio: Expert in lightning-fast tactical formations and counter-attacks"
        }
        
        response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profile updated successfully:")
            print(f"   - Favorite Team: {data['favourite_team']}")
            print(f"   - Coach Level: {data['coach_level']}")
            print(f"   - Bio: {data['bio']}")
            return True
        else:
            print(f"❌ Failed to update profile: {response.status_code} - {response.text}")
            return False
    
    def test_community_features(self):
        """Test community features like team browsing"""
        print("\n=== Testing Community Features ===")
        
        if not self.auth_token:
            print("❌ No auth token available")
            return False
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get community teams
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Community teams retrieved: {len(data)} teams")
            if data:
                team = data[0]
                print(f"   - Sample team: {team['name']} by {team['username']}")
        
        # Get community stats
        response = requests.get(f"{API_URL}/community/stats", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Community stats retrieved:")
            print(f"   - Total Users: {data['total_users']}")
            print(f"   - Total Teams: {data['total_teams']}")
            print(f"   - Public Teams: {data['total_public_teams']}")
            print(f"   - Total Likes: {data['total_likes']}")
            print(f"   - Total Views: {data['total_views']}")
            return True
        else:
            print(f"❌ Failed to get community stats: {response.status_code} - {response.text}")
            return False
    
    def run_all_tests(self):
        """Run all team management tests"""
        print("🚀 Starting Team Management API Tests")
        print("=" * 50)
        
        results = []
        
        # Setup
        results.append(("User Setup", self.setup_users()))
        
        # Team Management Tests
        results.append(("Team Creation with Enhanced Fields", self.test_team_creation_with_enhanced_fields()))
        results.append(("Team Name Editing", self.test_team_name_editing()))
        results.append(("Team Privacy Toggle", self.test_team_privacy_toggle()))
        results.append(("Save Slots Management", self.test_save_slots_management()))
        
        # Community Features Tests
        results.append(("Team Rating System", self.test_team_rating_system()))
        results.append(("Team Commenting System", self.test_team_commenting_system()))
        results.append(("Team Like/Unlike", self.test_team_like_unlike()))
        results.append(("Team Details View", self.test_team_details_view()))
        
        # Social Features Tests
        results.append(("Follow/Unfollow System", self.test_follow_unfollow_system()))
        results.append(("User Profile Updates", self.test_user_profile_updates()))
        results.append(("Community Features", self.test_community_features()))
        
        # Summary
        print("\n" + "=" * 50)
        print("🏆 TEST RESULTS SUMMARY")
        print("=" * 50)
        
        passed = 0
        failed = 0
        
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal: {len(results)} tests")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(results)*100):.1f}%")
        
        return passed, failed

if __name__ == "__main__":
    test = TeamManagementTest()
    test.run_all_tests()