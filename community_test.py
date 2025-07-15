#!/usr/bin/env python3
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
ROOT_URL = BACKEND_URL

print(f"Testing API at: {API_URL}")
print(f"Testing Root at: {ROOT_URL}")

def generate_random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

class CommunityFeaturesTest(unittest.TestCase):
    """Test suite for Community Features"""
    
    def setUp(self):
        """Set up test data"""
        # Generate unique username and email for testing
        random_suffix = generate_random_string()
        self.test_username = f"testuser_{random_suffix}"
        self.test_email = f"test_{random_suffix}@example.com"
        self.test_password = "Password123!"
        
        # User registration data with enhanced fields
        self.user_data = {
            "username": self.test_username,
            "email": self.test_email,
            "password": self.test_password,
            "coach_level": 5,
            "favorite_position": "FW",
            "favorite_element": "Fire",
            "favorite_formation": "4-3-3",
            "profile_picture": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "bio": "Passionate football coach and strategist"
        }
        
        # Team creation data with enhanced fields
        self.team_data = {
            "name": f"Test Team {random_suffix}",
            "formation": "4-3-3",
            "players": [],
            "bench_players": [],
            "tactics": [],
            "coach": None,
            "description": "A test team created for API testing with enhanced community features",
            "is_public": True,
            "tags": ["test", "api", "community"]
        }
        
        # Store auth token
        self.auth_token = None
        self.user_id = None
        self.team_id = None
    
    def test_01_backend_status(self):
        """Test that backend is running and accessible"""
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["status"], "healthy")
        print("✅ Backend is running and accessible")
    
    def test_02_enhanced_user_registration(self):
        """Test enhanced user registration with new fields"""
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("access_token", data)
        self.assertIn("token_type", data)
        self.assertIn("user", data)
        
        user = data["user"]
        self.assertEqual(user["username"], self.test_username)
        self.assertEqual(user["email"], self.test_email)
        
        # Check enhanced fields are present
        self.assertIn("favorite_formation", user)
        self.assertIn("profile_picture", user)
        self.assertIn("bio", user)
        self.assertIn("total_teams", user)
        self.assertIn("total_likes_received", user)
        self.assertIn("followers", user)
        self.assertIn("following", user)
        
        # Check values match what we registered with
        self.assertEqual(user["favorite_formation"], self.user_data["favorite_formation"])
        self.assertEqual(user["profile_picture"], self.user_data["profile_picture"])
        self.assertEqual(user["bio"], self.user_data["bio"])
        
        # Store token for subsequent tests
        self.auth_token = data["access_token"]
        self.user_id = user["id"]
        print(f"✅ Enhanced user registration successful with ID: {self.user_id}")
    
    def test_03_enhanced_team_creation(self):
        """Test enhanced team creation with new fields"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.post(f"{API_URL}/teams", json=self.team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check enhanced fields are present
        self.assertIn("description", data)
        self.assertIn("is_public", data)
        self.assertIn("tags", data)
        self.assertIn("likes", data)
        self.assertIn("liked_by", data)
        self.assertIn("comments", data)
        self.assertIn("views", data)
        self.assertIn("rating", data)
        self.assertIn("username", data)
        self.assertIn("user_avatar", data)
        
        # Check values match what we created with
        self.assertEqual(data["description"], self.team_data["description"])
        self.assertEqual(data["is_public"], self.team_data["is_public"])
        self.assertEqual(data["tags"], self.team_data["tags"])
        self.assertEqual(data["username"], self.test_username)
        
        # Store team ID for subsequent tests
        self.team_id = data["id"]
        print(f"✅ Enhanced team creation successful with ID: {self.team_id}")
    
    def test_04_community_teams_endpoint(self):
        """Test GET /api/community/teams endpoint with search and filtering"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test basic community teams endpoint
        response = requests.get(f"{API_URL}/community/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Test with search parameter
        response = requests.get(f"{API_URL}/community/teams?search=Test", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Test with formation filter
        response = requests.get(f"{API_URL}/community/teams?formation=4-3-3", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Test with sort_by parameter
        response = requests.get(f"{API_URL}/community/teams?sort_by=likes", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        # Test with limit and offset
        response = requests.get(f"{API_URL}/community/teams?limit=5&offset=0", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertLessEqual(len(data), 5)
        
        print("✅ Community teams endpoint with filtering working")
    
    def test_05_team_like_functionality(self):
        """Test POST /api/teams/{team_id}/like endpoint"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # First like the team
        response = requests.post(f"{API_URL}/teams/{self.team_id}/like", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("liked", data)
        self.assertTrue(data["liked"])
        
        # Check that team likes count increased
        team_response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        team_data = team_response.json()
        self.assertEqual(team_data["likes"], 1)
        self.assertIn(self.user_id, team_data["liked_by"])
        
        # Unlike the team
        response = requests.post(f"{API_URL}/teams/{self.team_id}/like", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("liked", data)
        self.assertFalse(data["liked"])
        
        # Check that team likes count decreased
        team_response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        team_data = team_response.json()
        self.assertEqual(team_data["likes"], 0)
        self.assertNotIn(self.user_id, team_data["liked_by"])
        
        print("✅ Team like/unlike functionality working")
    
    def test_06_team_comment_functionality(self):
        """Test POST /api/teams/{team_id}/comment endpoint"""
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        comment_data = {
            "content": "This is a test comment on the team!"
        }
        
        # Add a comment to the team
        response = requests.post(f"{API_URL}/teams/{self.team_id}/comment", json=comment_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("comment", data)
        
        comment = data["comment"]
        self.assertEqual(comment["user_id"], self.user_id)
        self.assertEqual(comment["username"], self.test_username)
        self.assertEqual(comment["content"], comment_data["content"])
        
        # Check that team has the comment
        team_response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        team_data = team_response.json()
        self.assertEqual(len(team_data["comments"]), 1)
        self.assertEqual(team_data["comments"][0]["content"], comment_data["content"])
        
        print("✅ Team comment functionality working")
    
    def test_07_community_featured_endpoint(self):
        """Test GET /api/community/featured endpoint"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/community/featured", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("teams_of_week", data)
        self.assertIn("popular_formations", data)
        
        # Check teams_of_week is a list
        self.assertIsInstance(data["teams_of_week"], list)
        
        # Check popular_formations is a list
        self.assertIsInstance(data["popular_formations"], list)
        
        # If there are popular formations, check structure
        if data["popular_formations"]:
            formation = data["popular_formations"][0]
            self.assertIn("formation", formation)
            self.assertIn("count", formation)
        
        print("✅ Community featured endpoint working")
    
    def test_08_community_stats_endpoint(self):
        """Test GET /api/community/stats endpoint"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/community/stats", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("total_users", data)
        self.assertIn("total_teams", data)
        self.assertIn("total_public_teams", data)
        self.assertIn("total_likes", data)
        self.assertIn("total_views", data)
        
        # Check that values are numbers
        self.assertIsInstance(data["total_users"], int)
        self.assertIsInstance(data["total_teams"], int)
        self.assertIsInstance(data["total_public_teams"], int)
        self.assertIsInstance(data["total_likes"], int)
        self.assertIsInstance(data["total_views"], int)
        
        # Check that we have at least 1 user and 1 team (from our tests)
        self.assertGreaterEqual(data["total_users"], 1)
        self.assertGreaterEqual(data["total_teams"], 1)
        
        print("✅ Community stats endpoint working")
    
    def test_09_follow_unfollow_functionality(self):
        """Test follow/unfollow functionality"""
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        # Create a second user to follow
        random_suffix2 = generate_random_string()
        user2_data = {
            "username": f"testuser2_{random_suffix2}",
            "email": f"test2_{random_suffix2}@example.com",
            "password": "Password123!",
            "coach_level": 3,
            "favorite_position": "GK",
            "favorite_element": "Earth"
        }
        
        # Register second user
        response = requests.post(f"{API_URL}/auth/register", json=user2_data)
        self.assertEqual(response.status_code, 200)
        user2_data_response = response.json()
        user2_id = user2_data_response["user"]["id"]
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Follow the second user
        follow_data = {"user_id": user2_id}
        response = requests.post(f"{API_URL}/community/follow", json=follow_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("following", data)
        self.assertTrue(data["following"])
        
        # Check that current user is now following user2
        current_user_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        current_user_data = current_user_response.json()
        self.assertIn(user2_id, current_user_data["following"])
        
        # Unfollow the second user
        response = requests.post(f"{API_URL}/community/follow", json=follow_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("following", data)
        self.assertFalse(data["following"])
        
        # Check that current user is no longer following user2
        current_user_response = requests.get(f"{API_URL}/auth/me", headers=headers)
        current_user_data = current_user_response.json()
        self.assertNotIn(user2_id, current_user_data["following"])
        
        print("✅ Follow/unfollow functionality working")

if __name__ == "__main__":
    # Run the tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)