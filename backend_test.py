#!/usr/bin/env python3
import requests
import json
import os
import pandas as pd
import io
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

class AuthAndTeamsAPITest(unittest.TestCase):
    """Test suite for Authentication and User Teams API"""
    
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
            "favourite_team": "Raimon",
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
    
    def test_01_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        print("✅ API root endpoint working")
    
    def test_02_register_user(self):
        """Test user registration"""
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("token_type", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_username)
        self.assertEqual(data["user"]["email"], self.test_email)
        
        # Store token for subsequent tests
        self.auth_token = data["access_token"]
        self.user_id = data["user"]["id"]
        print(f"✅ User registration successful with ID: {self.user_id}")
    
    def test_03_register_duplicate_email(self):
        """Test registering with an existing email"""
        # Skip if no user was registered
        if not hasattr(self, 'test_email'):
            self.skipTest("No user registered yet")
        
        # Try to register with the same email
        response = requests.post(f"{API_URL}/auth/register", json=self.user_data)
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("detail", data)
        print("✅ Duplicate email registration properly rejected")
    
    def test_04_login_user(self):
        """Test user login"""
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertIn("token_type", data)
        self.assertIn("user", data)
        self.assertEqual(data["user"]["username"], self.test_username)
        self.assertEqual(data["user"]["email"], self.test_email)
        
        # Update token
        self.auth_token = data["access_token"]
        print("✅ User login successful")
    
    def test_05_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        login_data = {
            "email": self.test_email,
            "password": "WrongPassword123!"
        }
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertIn("detail", data)
        print("✅ Invalid login credentials properly rejected")
    
    def test_06_get_current_user(self):
        """Test getting current user info"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], self.test_username)
        self.assertEqual(data["email"], self.test_email)
        print("✅ Get current user info successful")
    
    def test_07_update_user_profile(self):
        """Test updating user profile"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        update_data = {
            "coach_level": 10,
            "favorite_position": "GK",
            "favorite_element": "Wind"
        }
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.put(f"{API_URL}/auth/me", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["coach_level"], 10)
        self.assertEqual(data["favorite_position"], "GK")
        self.assertEqual(data["favorite_element"], "Wind")
        print("✅ Update user profile successful")
    
    def test_08_create_team(self):
        """Test creating a team"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.post(f"{API_URL}/teams", json=self.team_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.team_data["name"])
        self.assertEqual(data["formation"], self.team_data["formation"])
        
        # Store team ID for subsequent tests
        self.team_id = data["id"]
        print(f"✅ Team creation successful with ID: {self.team_id}")
    
    def test_09_get_user_teams(self):
        """Test getting all teams for the current user"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if len(data) > 0:
            self.assertEqual(data[0]["user_id"], self.user_id)
        print(f"✅ Get user teams successful, found {len(data)} teams")
    
    def test_10_get_team_by_id(self):
        """Test getting a specific team by ID"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.team_id)
        self.assertEqual(data["name"], self.team_data["name"])
        print(f"✅ Get team by ID successful")
    
    def test_11_update_team(self):
        """Test updating a team"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        update_data = {
            "name": f"Updated Team {generate_random_string()}",
            "formation": "2"  # Using another formation ID
        }
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.put(f"{API_URL}/teams/{self.team_id}", json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.team_id)
        self.assertEqual(data["name"], update_data["name"])
        self.assertEqual(data["formation"], update_data["formation"])
        print(f"✅ Update team successful")
    
    def test_12_delete_team(self):
        """Test deleting a team"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.delete(f"{API_URL}/teams/{self.team_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print(f"✅ Delete team successful")
    
    def test_13_unauthorized_access(self):
        """Test accessing protected endpoints without authentication"""
        # Test accessing /api/auth/me without token
        response = requests.get(f"{API_URL}/auth/me")
        self.assertEqual(response.status_code, 403)
        
        # Test accessing /api/teams without token
        response = requests.get(f"{API_URL}/teams")
        self.assertEqual(response.status_code, 403)
        
        print("✅ Unauthorized access properly rejected")
    
    def test_14_enhanced_user_registration_fields(self):
        """Test that enhanced user registration includes new fields"""
        # Skip if no user was registered
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/auth/me", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check enhanced fields are present
        self.assertIn("favourite_team", data)
        self.assertIn("profile_picture", data)
        self.assertIn("bio", data)
        self.assertIn("total_teams", data)
        self.assertIn("total_likes_received", data)
        self.assertIn("followers", data)
        self.assertIn("following", data)
        
        # Check values match what we registered with
        self.assertEqual(data["favourite_team"], self.user_data["favourite_team"])
        self.assertEqual(data["profile_picture"], self.user_data["profile_picture"])
        self.assertEqual(data["bio"], self.user_data["bio"])
        
        print("✅ Enhanced user registration fields working")
    
    def test_15_enhanced_team_creation_fields(self):
        """Test that enhanced team creation includes new fields"""
        # Skip if no team was created
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
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
        
        print("✅ Enhanced team creation fields working")
    
    def test_16_community_teams_endpoint(self):
        """Test GET /api/community/teams endpoint"""
        # Skip if no token
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
    
    def test_17_team_like_functionality(self):
        """Test POST /api/teams/{team_id}/like endpoint"""
        # Skip if no token or team ID
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
    
    def test_18_team_comment_functionality(self):
        """Test POST /api/teams/{team_id}/comment endpoint"""
        # Skip if no token or team ID
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
    
    def test_19_community_featured_endpoint(self):
        """Test GET /api/community/featured endpoint"""
        # Skip if no token
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
    
    def test_20_community_stats_endpoint(self):
        """Test GET /api/community/stats endpoint"""
        # Skip if no token
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
    
    def test_21_follow_unfollow_functionality(self):
        """Test follow/unfollow functionality"""
        # Skip if no token
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
    
    def test_22_user_profile_and_teams_endpoints(self):
        """Test community user profile and teams endpoints"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test get user profile
        response = requests.get(f"{API_URL}/community/users/{self.user_id}", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check public profile structure
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("coach_level", data)
        self.assertIn("favorite_formation", data)
        self.assertIn("profile_picture", data)
        self.assertIn("bio", data)
        self.assertIn("total_teams", data)
        self.assertIn("total_likes_received", data)
        self.assertIn("created_at", data)
        
        # Check that sensitive data is not exposed
        self.assertNotIn("email", data)
        self.assertNotIn("hashed_password", data)
        
        # Test get user's public teams
        response = requests.get(f"{API_URL}/community/users/{self.user_id}/teams", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        
        print("✅ User profile and teams endpoints working")
    
    def test_23_community_leaderboard_endpoint(self):
        """Test GET /api/community/leaderboard endpoint"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/community/leaderboard", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("top_by_likes", data)
        self.assertIn("top_by_teams", data)
        self.assertIn("most_followed", data)
        
        # Check that all are lists
        self.assertIsInstance(data["top_by_likes"], list)
        self.assertIsInstance(data["top_by_teams"], list)
        self.assertIsInstance(data["most_followed"], list)
        
        print("✅ Community leaderboard endpoint working")
    
    def test_24_team_view_endpoint(self):
        """Test GET /api/teams/{team_id}/view endpoint"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Get initial view count
        team_response = requests.get(f"{API_URL}/teams/{self.team_id}", headers=headers)
        initial_views = team_response.json()["views"]
        
        # View the team
        response = requests.get(f"{API_URL}/teams/{self.team_id}/view", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check that view count increased
        self.assertEqual(data["views"], initial_views + 1)
        
        print("✅ Team view endpoint working")
    
    def test_25_save_slots_endpoint(self):
        """Test GET /api/save-slots endpoint"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/save-slots", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("save_slots", data)
        self.assertIsInstance(data["save_slots"], list)
        
        # Check that we have 5 slots
        self.assertEqual(len(data["save_slots"]), 5)
        
        # Check slot structure
        for slot in data["save_slots"]:
            self.assertIn("slot_number", slot)
            self.assertIn("slot_name", slot)
            self.assertIn("is_occupied", slot)
            self.assertIn("team_id", slot)
            self.assertIn("team_name", slot)
        
        print("✅ Save slots endpoint working")
    
    def test_26_team_rating_endpoint(self):
        """Test POST /api/teams/{team_id}/rate endpoint"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        # Create a second user to rate the team (can't rate own team)
        random_suffix2 = generate_random_string()
        user2_data = {
            "username": f"rater_{random_suffix2}",
            "email": f"rater_{random_suffix2}@example.com",
            "password": "Password123!",
            "coach_level": 3,
            "favorite_position": "GK",
            "favorite_element": "Earth"
        }
        
        # Register second user
        response = requests.post(f"{API_URL}/auth/register", json=user2_data)
        self.assertEqual(response.status_code, 200)
        user2_response = response.json()
        user2_token = user2_response["access_token"]
        
        headers = {"Authorization": f"Bearer {user2_token}"}
        
        # Rate the team
        rating_data = {
            "team_id": self.team_id,
            "tension_usage": 4.5,
            "difficulty": 3.8,
            "fun": 4.2,
            "creativity": 4.0,
            "effectiveness": 3.9,
            "balance": 4.1
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/rate", json=rating_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("message", data)
        self.assertIn("rating", data)
        
        rating = data["rating"]
        self.assertIn("tension_usage", rating)
        self.assertIn("difficulty", rating)
        self.assertIn("fun", rating)
        self.assertIn("creativity", rating)
        self.assertIn("effectiveness", rating)
        self.assertIn("balance", rating)
        self.assertIn("total_ratings", rating)
        self.assertIn("average_rating", rating)
        
        # Check that total_ratings is 1
        self.assertEqual(rating["total_ratings"], 1)
        
        print("✅ Team rating endpoint working")
    
    def test_27_team_details_endpoint(self):
        """Test GET /api/teams/{team_id}/details endpoint"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        response = requests.get(f"{API_URL}/teams/{self.team_id}/details", headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response structure
        self.assertIn("team", data)
        self.assertIn("is_liked", data)
        self.assertIn("is_following", data)
        self.assertIn("can_rate", data)
        
        # Check team structure
        team = data["team"]
        self.assertIn("id", team)
        self.assertIn("name", team)
        self.assertIn("formation", team)
        self.assertIn("likes", team)
        self.assertIn("views", team)
        self.assertIn("rating", team)
        
        # Check boolean fields
        self.assertIsInstance(data["is_liked"], bool)
        self.assertIsInstance(data["is_following"], bool)
        self.assertIsInstance(data["can_rate"], bool)
        
        # Owner can't rate their own team
        self.assertFalse(data["can_rate"])
        
        print("✅ Team details endpoint working")
    
    def test_28_save_team_to_slot_endpoint(self):
        """Test POST /api/teams/{team_id}/save-to-slot endpoint"""
        # Skip if no token or team ID
        if not self.auth_token or not self.team_id:
            self.skipTest("No auth token or team ID available")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Save team to slot 1
        slot_data = {
            "slot_number": 1,
            "slot_name": "My First Team",
            "overwrite": True
        }
        
        response = requests.post(f"{API_URL}/teams/{self.team_id}/save-to-slot", json=slot_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check response
        self.assertIn("message", data)
        self.assertEqual(data["message"], "Team saved to slot successfully")
        
        # Verify the team is now in the slot by checking save-slots endpoint
        slots_response = requests.get(f"{API_URL}/save-slots", headers=headers)
        slots_data = slots_response.json()
        
        slot_1 = next((slot for slot in slots_data["save_slots"] if slot["slot_number"] == 1), None)
        self.assertIsNotNone(slot_1)
        self.assertTrue(slot_1["is_occupied"])
        self.assertEqual(slot_1["team_id"], self.team_id)
        
        print("✅ Save team to slot endpoint working")
    
    def test_29_community_follow_endpoint(self):
        """Test POST /api/community/follow endpoint"""
        # Skip if no token
        if not self.auth_token:
            self.skipTest("No auth token available")
        
        # Create a second user to follow
        random_suffix2 = generate_random_string()
        user2_data = {
            "username": f"followme_{random_suffix2}",
            "email": f"followme_{random_suffix2}@example.com",
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
        
        print("✅ Community follow/unfollow endpoint working")

class InazumaElevenAPITest(unittest.TestCase):
    """Test suite for Inazuma Eleven Victory Road API"""
    
    def setUp(self):
        """Set up test data"""
        # Sample character data for testing
        self.sample_character = {
            "name": "Axel Blaze",
            "nickname": "Fire Striker",
            "title": "Ace Striker",
            "base_level": 99,
            "base_rarity": "Legendary",
            "position": "FW",
            "element": "Fire",
            "jersey_number": 10,
            "description": "A legendary striker with powerful fire shots",
            "base_stats": {
                "kick": {"main": 95, "secondary": 100},
                "control": {"main": 85, "secondary": 90},
                "technique": {"main": 90, "secondary": 95},
                "intelligence": {"main": 80, "secondary": 85},
                "pressure": {"main": 75, "secondary": 80},
                "agility": {"main": 85, "secondary": 90},
                "physical": {"main": 80, "secondary": 85}
            },
            "hissatsu": [
                {
                    "name": "Fire Tornado",
                    "description": "A powerful shot that creates a tornado of fire",
                    "type": "Shot"
                },
                {
                    "name": "Flame Dance",
                    "description": "A dribbling technique that leaves a trail of fire",
                    "type": "Dribble"
                }
            ],
            "team_passives": [
                {
                    "name": "Fire Spirit",
                    "description": "Boosts team's fire element attacks"
                },
                {
                    "name": "Striker's Instinct",
                    "description": "Increases shot power for all forwards"
                }
            ]
        }
        
        # Sample team data for testing
        self.sample_team = {
            "name": "Raimon Eleven",
            "formation_id": "1",  # Will be updated after getting formations
            "tactics": [],  # Will be updated after getting tactics
            "coach_id": None,  # Will be updated after getting coaches
            "players": []  # Will be populated after creating characters
        }
        
        # Sample equipment data for testing
        self.sample_equipment = {
            "name": "Lightning Boots",
            "rarity": "Legendary",
            "category": "Boots",
            "stats": {
                "kick": 20,
                "agility": 15
            },
            "description": "Boots that enhance kicking power and agility"
        }
        
        # Store created resources for cleanup
        self.created_resources = {
            "characters": [],
            "teams": [],
            "equipment": []
        }
    
    def test_01_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{API_URL}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        print("✅ API root endpoint working")
    
    def test_02_status_endpoint(self):
        """Test status endpoint"""
        # Create status check
        status_data = {"client_name": "Test Client"}
        response = requests.post(f"{API_URL}/status", json=status_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["client_name"], "Test Client")
        
        # Get status checks
        response = requests.get(f"{API_URL}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print("✅ Status endpoints working")
    
    # Characters API Tests
    
    def test_03_get_characters_empty(self):
        """Test getting characters (initially empty)"""
        response = requests.get(f"{API_URL}/characters/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"✅ GET /characters/ returned {len(data)} characters")
    
    def test_04_create_character(self):
        """Test creating a character"""
        response = requests.post(f"{API_URL}/characters/", json=self.sample_character)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.sample_character["name"])
        self.assertEqual(data["position"], self.sample_character["position"])
        self.assertEqual(data["element"], self.sample_character["element"])
        
        # Store character ID for later tests
        self.created_resources["characters"].append(data["id"])
        self.character_id = data["id"]
        print(f"✅ Created character with ID: {self.character_id}")
    
    def test_05_get_character_by_id(self):
        """Test getting a specific character by ID"""
        if not hasattr(self, 'character_id'):
            self.skipTest("No character created yet")
        
        response = requests.get(f"{API_URL}/characters/{self.character_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.character_id)
        self.assertEqual(data["name"], self.sample_character["name"])
        print(f"✅ GET /characters/{self.character_id} working")
    
    def test_06_get_characters_with_filters(self):
        """Test getting characters with filters"""
        if not hasattr(self, 'character_id'):
            self.skipTest("No character created yet")
        
        # Test position filter
        response = requests.get(f"{API_URL}/characters/?position=FW")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["position"], "FW")
        
        # Test element filter
        response = requests.get(f"{API_URL}/characters/?element=Fire")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["element"], "Fire")
        
        # Test search
        response = requests.get(f"{API_URL}/characters/?search=Blaze")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertIn("Blaze", data[0]["name"])
        
        print("✅ Character filtering working")
    
    def test_07_character_stats_summary(self):
        """Test character statistics summary"""
        response = requests.get(f"{API_URL}/characters/stats/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_characters", data)
        self.assertIn("by_position", data)
        self.assertIn("by_element", data)
        self.assertIn("by_rarity", data)
        print("✅ Character statistics summary working")
    
    def test_08_import_characters_excel(self):
        """Test importing characters from Excel"""
        # Create a simple Excel file with character data
        df = pd.DataFrame([
            {
                "name": "Mark Evans",
                "nickname": "Goalkeeper",
                "title": "Captain",
                "level": 95,
                "rarity": "Legendary",
                "position": "GK",
                "element": "Earth",
                "jersey_number": 1,
                "description": "Legendary goalkeeper and captain",
                "kick": 60,
                "control": 70,
                "technique": 85,
                "intelligence": 90,
                "pressure": 95,
                "agility": 85,
                "physical": 80,
                "hissatsu_1": "God Hand",
                "hissatsu_1_desc": "A powerful goalkeeping technique",
                "hissatsu_2": "Majin The Hand",
                "hissatsu_2_desc": "An even more powerful goalkeeping technique",
                "hissatsu_3": "Fist of Justice",
                "hissatsu_3_desc": "A punch that clears the ball with justice"
            },
            {
                "name": "Jude Sharp",
                "nickname": "Strategist",
                "title": "Playmaker",
                "level": 95,
                "rarity": "Legendary",
                "position": "MF",
                "element": "Wind",
                "jersey_number": 8,
                "description": "Brilliant strategist and playmaker",
                "kick": 80,
                "control": 95,
                "technique": 90,
                "intelligence": 98,
                "pressure": 85,
                "agility": 80,
                "physical": 75,
                "hissatsu_1": "Illusion Ball",
                "hissatsu_1_desc": "Creates illusions of the ball",
                "hissatsu_2": "Emperor Penguin",
                "hissatsu_2_desc": "A powerful shot with penguin spirits",
                "hissatsu_3": "Prime Legend",
                "hissatsu_3_desc": "A legendary passing technique"
            }
        ])
        
        # Save to BytesIO
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        # Upload the Excel file
        files = {'file': ('characters.xlsx', excel_buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
        response = requests.post(f"{API_URL}/characters/import-excel", files=files)
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("imported_count", data)
        self.assertGreaterEqual(data["imported_count"], 1)
        print(f"✅ Imported {data['imported_count']} characters from Excel")
    
    # Teams API Tests
    
    def test_09_get_formations(self):
        """Test getting formations"""
        response = requests.get(f"{API_URL}/teams/formations/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # Store formation ID for team creation
        self.formation_id = data[0]["id"]
        print(f"✅ GET /teams/formations/ returned {len(data)} formations")
    
    def test_10_get_tactics(self):
        """Test getting tactics"""
        response = requests.get(f"{API_URL}/teams/tactics/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # Store tactic IDs for team creation
        self.tactic_ids = [tactic["id"] for tactic in data[:2]]
        print(f"✅ GET /teams/tactics/ returned {len(data)} tactics")
    
    def test_11_get_coaches(self):
        """Test getting coaches"""
        response = requests.get(f"{API_URL}/teams/coaches/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        
        # Store coach ID for team creation
        self.coach_id = data[0]["id"]
        print(f"✅ GET /teams/coaches/ returned {len(data)} coaches")
    
    def test_12_create_team(self):
        """Test creating a team"""
        if not hasattr(self, 'formation_id') or not hasattr(self, 'tactic_ids') or not hasattr(self, 'coach_id'):
            self.skipTest("Missing formation, tactics, or coach data")
        
        # Update sample team with real IDs
        self.sample_team["formation_id"] = self.formation_id
        self.sample_team["tactics"] = self.tactic_ids
        self.sample_team["coach_id"] = self.coach_id
        
        # Add player if we have a character
        if hasattr(self, 'character_id'):
            self.sample_team["players"] = [
                {
                    "character_id": self.character_id,
                    "position_id": "lf",  # Left forward position from formation
                    "user_level": 99,
                    "user_rarity": "Legendary"
                }
            ]
        
        response = requests.post(f"{API_URL}/teams/", json=self.sample_team)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.sample_team["name"])
        
        # Store team ID for later tests
        self.created_resources["teams"].append(data["id"])
        self.team_id = data["id"]
        print(f"✅ Created team with ID: {self.team_id}")
    
    def test_13_get_teams(self):
        """Test getting teams"""
        response = requests.get(f"{API_URL}/teams/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print(f"✅ GET /teams/ returned {len(data)} teams")
    
    def test_14_get_team_by_id(self):
        """Test getting a specific team by ID"""
        if not hasattr(self, 'team_id'):
            self.skipTest("No team created yet")
        
        response = requests.get(f"{API_URL}/teams/{self.team_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.team_id)
        self.assertEqual(data["name"], self.sample_team["name"])
        print(f"✅ GET /teams/{self.team_id} working")
    
    # Equipment API Tests
    
    def test_15_get_equipment(self):
        """Test getting equipment"""
        response = requests.get(f"{API_URL}/equipment/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        print(f"✅ GET /equipment/ returned {len(data)} equipment items")
    
    def test_16_get_equipment_by_category(self):
        """Test getting equipment by category"""
        response = requests.get(f"{API_URL}/equipment/category/Boots")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["category"], "Boots")
        print(f"✅ GET /equipment/category/Boots returned {len(data)} items")
    
    def test_17_create_equipment(self):
        """Test creating equipment"""
        response = requests.post(f"{API_URL}/equipment/", json=self.sample_equipment)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("id", data)
        self.assertEqual(data["name"], self.sample_equipment["name"])
        self.assertEqual(data["category"], self.sample_equipment["category"])
        
        # Store equipment ID for later tests
        self.created_resources["equipment"].append(data["id"])
        self.equipment_id = data["id"]
        print(f"✅ Created equipment with ID: {self.equipment_id}")
    
    def test_18_get_equipment_by_id(self):
        """Test getting a specific equipment by ID"""
        if not hasattr(self, 'equipment_id'):
            self.skipTest("No equipment created yet")
        
        response = requests.get(f"{API_URL}/equipment/{self.equipment_id}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["id"], self.equipment_id)
        self.assertEqual(data["name"], self.sample_equipment["name"])
        print(f"✅ GET /equipment/{self.equipment_id} working")
    
    def test_19_equipment_filtering(self):
        """Test equipment filtering"""
        # Test category filter
        response = requests.get(f"{API_URL}/equipment/?category=Boots")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["category"], "Boots")
        
        # Test rarity filter
        response = requests.get(f"{API_URL}/equipment/?rarity=Legendary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        if data:
            self.assertEqual(data[0]["rarity"], "Legendary")
        
        print("✅ Equipment filtering working")
    
    def tearDown(self):
        """Clean up created resources"""
        # We'll leave the created resources in the database for now
        # In a real test environment, we might want to delete them
        pass

if __name__ == "__main__":
    # Run the tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)